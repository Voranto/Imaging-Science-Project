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
async def compute_dct_grayscale(request: Request):
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

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)
    
    dwt = pywt.wavedec2(img_array, "haar", level=levels)
    
    # Normalize first, then convert coefficients to array
    cA_3 = dwt[0]
    cA_3_norm = ((cA_3 - np.min(cA_3)) / (np.max(cA_3) - np.min(cA_3) + 1e-5) * 255)
    
    normalized_dwt = [cA_3_norm]
    
    # Loop through each detail level tuple (cH, cV, cD)
    for level_tuples in dwt[1:]:
        norm_tuple = []
        for coeff in level_tuples:
            # Map each individual detail panel safely between 0 and 255
            c_min, c_max = np.min(coeff), np.max(coeff)
            if c_max - c_min > 0:
                norm_coeff = ((coeff - c_min) / (c_max - c_min) * 255)
            else:
                norm_coeff = np.zeros_like(coeff)
            norm_tuple.append(norm_coeff)
        normalized_dwt.append(tuple(norm_tuple))

    arr_coefficients, slices = pywt.coeffs_to_array(normalized_dwt)

    vis_arr = arr_coefficients.astype(np.uint8)


    res_img = Image.fromarray(vis_arr)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")
