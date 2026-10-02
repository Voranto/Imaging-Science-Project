from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response
from PIL import Image
import numpy as np
import io
from scipy.fftpack import dctn
import pywt
router = APIRouter(
    prefix="/dwt",
    tags=["DWT Transforms"]
)

@router.post("/grayscale")
async def compute_dwt_grayscale(request: Request):
    # Returns a 2 dimensional array of the DWT
    
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        levels = int(request.headers.get("levels"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    dwt = pywt.wavedec2(img_array * 255, "haar", level=levels, mode="symmetric")

    cA_max = np.abs(dwt[0]).max()
    if cA_max > 0:
        dwt[0] /= cA_max
    for detail_level in range(levels):
        normalized_details = []
        for d in dwt[detail_level + 1]:
            d_max = np.abs(d).max()
            normalized_details.append(d / d_max if d_max > 0 else d)
        dwt[detail_level + 1] = normalized_details



    arr, slices = pywt.coeffs_to_array(dwt)
    vis_arr = ((arr - arr.min()) / (arr.max() - arr.min() + 1e-5) * 255)
    vis_arr = np.clip(vis_arr, 0, 255).astype(np.uint8)

    res_img = Image.fromarray(vis_arr)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")
