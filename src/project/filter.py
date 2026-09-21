from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response, JSONResponse
from PIL import Image
import numpy as np
import io
from scipy.ndimage import convolve, gaussian_filter
import math
from enum import Enum

router = APIRouter(
    prefix="/filter",
    tags=["General Filters"]
)
@router.post("/lowpass")
async def compute_lowpass_filter(request: Request):
    # Returns the max value of the image gradient (used to adjust the threshold input)
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        sigma = float(request.headers.get("sigma"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )

    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)

    img_array = gaussian_filter(img_array, sigma=sigma)   

    res_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/highpass")
async def compute_highpass_filter(request: Request):
    # Returns the max value of the image gradient (used to adjust the threshold input)
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        sigma = float(request.headers.get("sigma"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )

    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)

    highpass =  img_array - gaussian_filter(img_array, sigma=sigma)   

    max_val, min_val = np.max(highpass), np.min(highpass)

    diff = max_val - min_val

    if diff == 0:
        transformed = np.zeros_like(highpass, dtype=np.uint8)
    else:
        transformed = (((highpass - min_val) / diff) * 255.0).astype(np.uint8)

    res_img = Image.fromarray(transformed.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


