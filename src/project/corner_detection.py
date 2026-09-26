from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response, JSONResponse
from PIL import Image
import numpy as np
import io
from scipy.ndimage import convolve, gaussian_filter, generate_binary_structure, label, maximum_filter, binary_dilation
import math
from enum import Enum
from structure_tensor import structure_tensor_2d, eig_special_2d

router = APIRouter(
    prefix="/filter/corner",
    tags=["Corner Detection"]
)

@router.post("/first/tomasi")
async def compute_corner_first_tomasi(request: Request):
    # Returns a PNG image of tomasis method for corner detection
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        sigma = float(request.headers.get("sigma"))
        rho = float(request.headers.get("rho"))
        T = float(request.headers.get("threshold"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_array  = img_array * 255
    print(img_array.shape)
    S = structure_tensor_2d(img_array,sigma, rho)
    val, vec = eig_special_2d(S)
    print(S.shape, val.shape)
    lambda_2 = np.min(val, axis=0)
    print(lambda_2.shape)
    above_threshold = lambda_2 > T

    local_max = maximum_filter(lambda_2, size=3)
    is_corner = (lambda_2 == local_max) & above_threshold

    dilated_corners = binary_dilation(is_corner, structure=np.ones((9, 9)))
    base_gray = np.clip(img_array, 0, 255).astype(np.uint8)
    rgb_img = np.stack([base_gray, base_gray, base_gray], axis=-1)

    rgb_img[dilated_corners] = [255, 0, 0]
    
    res_img = Image.fromarray(rgb_img)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

