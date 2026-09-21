from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response
from PIL import Image
import numpy as np
import io
from scipy.fftpack import dctn

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

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)
    
    dct = np.log1p(np.abs(dctn(img_array , type=2, norm='ortho')))
    print(dct)
    min_val, max_val =     dct.min(),     dct.max()
    normalized = (255 * (dct - min_val) / (max_val - min_val + 1e-8)).astype(np.uint8)
    res_img = Image.fromarray(normalized)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/inverse/grayscale")
async def compute_inverse_fft_grayscale(request: Request):
    # Returns a 2 dimensional array of the Image reversing the FFT
    
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    fft_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    fft_array = fft_array.astype(np.float32)
    
    image_array = np.fft.ifft2(np.fft.ifftshift(img_array))
    magnitude = np.log1p(np.abs(fft_shifted))

    min_val, max_val = magnitude.min(), magnitude.max()
    normalized = (255 * (magnitude - min_val) / (max_val - min_val + 1e-8)).astype(np.uint8)
    res_img = Image.fromarray(normalized)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")