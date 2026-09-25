from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response, JSONResponse
from PIL import Image
import numpy as np
import io
from scipy.ndimage import convolve, gaussian_filter
import math
from enum import Enum

router = APIRouter(
    prefix="/noise",
    tags=["Noise"]
)
@router.post("/uniform")
async def add_uniform_noise(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        range = float(request.headers.get("range"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    # Normalize
    range /= 255

    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_array = img_array + np.random.uniform(-range, range, size=img_array.shape)
    img_array = np.clip(img_array, 0, 1)
    img_array *= 255
    res_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/gaussian")
async def add_gaussian_noise(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        mean = float(request.headers.get("mean"))
        sigma = float(request.headers.get("sigma"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    # Normalize

    body_bytes = await request.body()
    print(mean,sigma)
    
    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_array = img_array * 255 + np.random.normal(mean, sigma, size=img_array.shape)
    print(img_array)
    img_array = np.clip(img_array, 0, 255)
    res_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/multiplicative/uniform")
async def add_multiplicative_uniform_noise(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        range = float(request.headers.get("range"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()
    
    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array* (1.0+ np.random.uniform(-range, range, size=img_array.shape))
    img_array = np.clip(img_array, 0, 1)
    img_array *= 255
    res_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/multiplicative/gaussian")
async def add_multiplicative_gaussian_noise(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        mean = float(request.headers.get("mean"))
        sigma = float(request.headers.get("sigma"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )

    body_bytes = await request.body()    
    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    print(img_array)
    img_array = img_array * 255
    img_array = img_array* (1.0+ np.random.normal(mean, sigma, size=img_array.shape))
    img_array = np.clip(img_array, 0, 255)
    img_array = np.nan_to_num(img_array, nan=0.0)
    res_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


@router.post("/impulse")
async def add_impulse_noise(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        high = float(request.headers.get("high"))
        low = float(request.headers.get("low"))
        prob = float(request.headers.get("probability"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    prob /= 100
    body_bytes = await request.body()    
    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255

    rand_matrix = np.random.uniform(0.0, 1.0, size=img_array.shape)
    noisy_img = img_array.copy()

    pepper_mask = rand_matrix < (prob / 2.0)
    salt_mask = (rand_matrix >= (prob / 2.0)) & (rand_matrix < prob)
    noisy_img[pepper_mask] = low
    noisy_img[salt_mask] = high

    noisy_img = np.clip(noisy_img, 0, 255)
    res_img = Image.fromarray(noisy_img.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

