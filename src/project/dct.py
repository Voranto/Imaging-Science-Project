import io
import uuid

import numpy as np
from cachetools import Cache
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from PIL import Image
from scipy.fftpack import dctn, idctn

dct_cache = Cache(maxsize=50)
router = APIRouter(
    prefix="/dct",
    tags=["DCT Transforms"]
)

@router.post("/grayscale")
async def compute_dct_grayscale(request: Request):
    # Returns a 2 dimensional array of the DCT
    
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    
    dct = dctn(img_array * 255 - 127.5, type=2, norm='ortho')
    # Store true DCT matrix
    image_id = str(uuid.uuid4())
    dct_cache[image_id] = dct

    dct = np.log1p(np.abs(dct))

    min_val, max_val =     dct.min(),     dct.max()
    diff = max_val - min_val
    if diff < 1e-8:
        normalized = np.zeros_like(dct, dtype=np.uint8)
    else:
        normalized = (255 * (dct - min_val) / diff).astype(np.uint8)
    res_img = Image.fromarray(normalized)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png",headers={
            "X-Image-ID": image_id,
            "Access-Control-Expose-Headers": "X-Image-ID",
        },)


@router.post("/inverse/grayscale")
async def compute_inverse_dct_grayscale(image_id : str):
    # Returns a 2 dimensional array of the Image reversing the DCT
    print(image_id, dct_cache)
    if image_id not in dct_cache:
        raise HTTPException(
            status_code=404,
            detail="Session expired or Image ID not found in cache",
        )
    dct = dct_cache[image_id]
    
    image_array = idctn(dct, type=2, norm="ortho")


    final_bytes = np.clip(image_array, 0, 255).astype(np.uint8)
    res_img = Image.fromarray(final_bytes)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")