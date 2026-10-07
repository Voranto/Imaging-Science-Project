import io

import numpy as np
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from PIL import Image
from scipy.ndimage import binary_dilation, maximum_filter
from structure_tensor import eig_special_2d, structure_tensor_2d

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
    val, _vec = eig_special_2d(S)
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


@router.post("/first/rohr")
async def compute_corner_first_rohr(request: Request):
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
    val, _vec = eig_special_2d(S)
    print(S.shape, val.shape)
    lambda_2 = np.min(val, axis=0)
    lambda_1 = np.max(val, axis=0)

    det = lambda_1 * lambda_2

    print(lambda_2.shape)
    above_threshold = det > T

    local_max = maximum_filter(det, size=3)
    is_corner = (det == local_max) & above_threshold

    dilated_corners = binary_dilation(is_corner, structure=np.ones((9, 9)))
    base_gray = np.clip(img_array, 0, 255).astype(np.uint8)
    rgb_img = np.stack([base_gray, base_gray, base_gray], axis=-1)

    rgb_img[dilated_corners] = [255, 0, 0]
    
    res_img = Image.fromarray(rgb_img)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


@router.post("/first/harris")
async def compute_corner_first_harris(request: Request):
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
    val, _vec = eig_special_2d(S)
    print(S.shape, val.shape)
    lambda_2 = np.min(val, axis=0)
    lambda_1 = np.max(val, axis=0)

    det = lambda_1 * lambda_2
    tr = lambda_1 + lambda_2
    response = np.divide(det, tr, out=np.zeros_like(det), where=tr != 0)

    above_threshold = tr > T

    local_max = maximum_filter(response, size=3)
    is_corner = (response == local_max) & above_threshold & (response > 0)

    dilated_corners = binary_dilation(is_corner, structure=np.ones((9, 9)))
    base_gray = np.clip(img_array, 0, 255).astype(np.uint8)
    rgb_img = np.stack([base_gray, base_gray, base_gray], axis=-1)

    rgb_img[dilated_corners] = [255, 0, 0]
    
    res_img = Image.fromarray(rgb_img)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")