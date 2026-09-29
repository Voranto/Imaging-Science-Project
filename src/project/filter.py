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

@router.post("/bilateral")
async def compute_bilateral_filter(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        sigmaSpatial = float(request.headers.get("sigmaSpatial"))
        sigmaTonal = float(request.headers.get("sigmaTonal"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    filter = cv2.bilateralFilter(img_array * 255, -1,sigmaColor=sigmaTonal, sigmaSpace=sigmaSpatial)
    res_img = Image.fromarray(filter.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/NLMeans")
async def compute_NL_means(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        patchRadius = int(request.headers.get("radiusPatch"))
        windowRadius = int(request.headers.get("radiusWindow"))
        filterStrength = float(request.headers.get("filterStrength"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    
    img_array_8bit = (img_array* 255).astype(np.uint8)
    filter = cv2.fastNlMeansDenoising(img_array_8bit,None, filterStrength, 2*patchRadius + 1, 2*windowRadius + 1)
    
    res_img = Image.fromarray(filter.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/diffusion")
async def compute_diffusion_filter(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        iterations = int(request.headers.get("iterations"))
        contrast = float(request.headers.get("contrast"))
        diffusivityOption = int(request.headers.get("diffusivityOption"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_array = img_array * 255
    out = img_array.astype(np.float32, copy=True)

    deltaN = np.zeros_like(out)
    deltaS = np.zeros_like(out)
    deltaE = np.zeros_like(out)
    deltaW = np.zeros_like(out)
    for i in range(iterations):
        deltaN[1:, :]  = out[:-1, :] - out[1:, :] 
        deltaS[:-1, :] = out[1:, :]  - out[:-1, :]
        deltaW[:, 1:]  = out[:, :-1] - out[:, 1:]
        deltaE[:, :-1] = out[:, 1:]  - out[:, :-1]

        # 1 is Perona-Malik
        if diffusivityOption == 1:
            cN = 1.0 / (1.0 + (deltaN / contrast) ** 2)
            cS = 1.0 / (1.0 + (deltaS / contrast) ** 2)
            cE = 1.0 / (1.0 + (deltaE / contrast) ** 2)
            cW = 1.0 / (1.0 + (deltaW / contrast) ** 2)
        # 2 is Charbonnier
        elif diffusivityOption == 2:
            cN = 1.0 / np.sqrt(1.0 + (deltaN / contrast) ** 2)
            cS = 1.0 / np.sqrt(1.0 + (deltaS / contrast) ** 2)
            cE = 1.0 / np.sqrt(1.0 + (deltaE / contrast) ** 2)
            cW = 1.0 / np.sqrt(1.0 + (deltaW / contrast) ** 2)

        else:
            raise ValueError("Option must be 1 (PM-Exp), 2 (PM-Rat), or 3 (Charbonnier).")

        # 3. We force the time step to 0.15, otherwise it is just too many parameters
        out += 0.15 * (cN * deltaN + cS * deltaS + cE * deltaE + cW * deltaW)
    
    res_img = Image.fromarray(out.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/affineGrayscale")
async def compute_affine_grayscale_transformation(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        slope = float(request.headers.get("slope"))
        distance = float(request.headers.get("distance"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_array = img_array * 255
    img_array = slope * img_array + distance
    img_array = np.clip(img_array, 0 , 255)
    res_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/histogramEqualization")
async def compute_histogram_equalization(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    arr_ints = np.round(img_array * 255)

    equalized = cv2.equalizeHist(arr_ints.astype(np.uint8))

    res_img = Image.fromarray(equalized.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")