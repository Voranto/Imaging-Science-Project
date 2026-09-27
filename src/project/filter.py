from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response, JSONResponse
from PIL import Image
import numpy as np
import io
from scipy.ndimage import convolve, gaussian_filter
import math
from enum import Enum
from scipy.signal import medfilt2d
import cv2
import pywt


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

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255

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

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    
    img_array = img_array * 255

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

@router.post("/gamma")
async def compute_gamma_correction(request: Request):
        try:
            x_image_width = int(request.headers.get("x-image-width"))
            x_image_height = int(request.headers.get("x-image-height"))
            gamma = float(request.headers.get("gamma"))
        except (TypeError, ValueError):
                raise HTTPException(
                    status_code=422, 
                    detail="Missing or invalid headers"
                )
    
        body_bytes = await request.body()
    
        img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
        
        img_array = img_array * 255
    
        gamma_corrected = 255.0 * (img_array / 255.0) ** gamma

        gamma_corrected = np.clip(np.round(gamma_corrected), 0, 255).astype('uint8')
     
        res_img = Image.fromarray(gamma_corrected.astype(np.uint8))
        buf = io.BytesIO()
        res_img.save(buf, format="PNG")
        return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/median")
async def compute_median_filter(request: Request):
    # Returns the max value of the image gradient (used to adjust the threshold input)
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )

    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_uint8 = np.clip(img_array * 255.0, 0, 255).astype(np.uint8)

    kernel_width = 2*radius + 1
    median_filtered = cv2.medianBlur(img_uint8, kernel_width)
    
    res_img = Image.fromarray(median_filtered.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


@router.post("/wavelet")
async def compute_wavelet_shrinkage(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        shrinkageType = request.headers.get("type")
        t_1 = float(request.headers.get("threshold"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    print(shrinkageType)
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    dwt = pywt.wavedec2(img_array * 255, "haar", mode="symmetric")
    cA = dwt[0]
    details = dwt[1:]
    thresholded_details = []
    for cH, cV, cD in details:
        cH_t = pywt.threshold(cH, t_1, mode=shrinkageType)
        cV_t = pywt.threshold(cV, t_1, mode=shrinkageType)
        cD_t = pywt.threshold(cD, t_1, mode=shrinkageType)
        thresholded_details.append((cH_t, cV_t, cD_t))
    dwt_thresholded = [cA] + thresholded_details
    img_array = pywt.waverec2(dwt_thresholded, "haar", mode="symmetric")

    res_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

