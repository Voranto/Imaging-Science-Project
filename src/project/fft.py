import io
import uuid

import numpy as np
from cachetools import Cache
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from PIL import Image

fft_cache = Cache(maxsize=50)

router = APIRouter(
    prefix="/fft",
    tags=["FFT Transforms"]
)

@router.post("/grayscale")
async def compute_fft_grayscale(request: Request):
    # Returns a 2 dimensional array of the FFT
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
    print(img_array)
    fft_shifted = np.fft.fftshift(np.fft.fft2(img_array * 255))

    # Store true FFT matrix
    image_id = str(uuid.uuid4())
    fft_cache[image_id] = (fft_shifted, False)

    magnitude = np.log1p(np.abs(fft_shifted))

    min_val, max_val = magnitude.min(), magnitude.max()
    normalized = (255 * (magnitude - min_val) / (max_val - min_val + 1e-8)).astype(np.uint8)
    res_img = Image.fromarray(normalized)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    # Return the image_id
    return Response(content=buf.getvalue(), media_type="image/png",headers={
            "X-Image-ID": image_id,
            "Access-Control-Expose-Headers": "X-Image-ID",
        },)

@router.post("/inverse/grayscale")
async def compute_inverse_fft_grayscale(image_id : str):
    # Returns a 2 dimensional array of the Image reversing the FFT
    if image_id not in fft_cache:
        raise HTTPException(
            status_code=404,
            detail="Session expired or Image ID not found in cache",
        )
    fft_shifted, filter_applied = fft_cache[image_id]
    image_array = np.fft.ifft2(np.fft.ifftshift(fft_shifted)).real
    
    
    min_val, max_val = image_array.min(), image_array.max()

    # If filter applied, rescale
    if max_val - min_val > 1e-8 and filter_applied:
        
        normalized = 255 * (image_array - min_val) / (max_val - min_val)
        print(np.min(normalized), np.max(normalized))
    else:
        normalized = image_array

    final_bytes = np.clip(normalized,0,255).astype(np.uint8)
    res_img = Image.fromarray(final_bytes)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/filter")
async def apply_frequency_filter(image_id : str, low:float, high: float, cutoff: int):
    if image_id not in fft_cache:
        raise HTTPException(
            status_code=404,
            detail="Session expired or Image ID not found in cache",
        )
    if low == -1:
        low = -float('inf')
    if high == -1:
        high = float('inf')
    fft_shifted, _filter_applied= fft_cache[image_id]
    rows, cols = fft_shifted.shape

    crow, ccol = rows // 2, cols // 2

    y, x = np.ogrid[-crow:rows-crow, -ccol:cols-ccol]
    dist_from_center = np.sqrt(x**2 + y**2)
    if cutoff == 1:

        bandpass_mask = (dist_from_center >= low) & (dist_from_center <= high)

        fft_shifted = fft_shifted * bandpass_mask
    elif cutoff == 2:
        dist_from_center[dist_from_center == 0] = 1e-8

        # Hardcoded butterworth order
        n = 3
        if low > 0:
            high_pass = 1 / (1 + (low / dist_from_center) ** (2 * n))
        else:
            high_pass = np.ones((rows, cols))

        if high < float('inf'):
            low_pass = 1 / (1 + (dist_from_center / high) ** (2 * n))
        else:
            low_pass = np.ones((rows, cols))

        butterworth_mask = high_pass * low_pass
        fft_shifted = fft_shifted * butterworth_mask        
    elif cutoff == 3:
        dist_from_center[dist_from_center == 0] = 1e-8
        if low != -float('inf') and low > 0:
            gaussian_low =  1 - np.exp(-(dist_from_center**2) / (2 * (low**2)))
        else:
            gaussian_low = 1.0

        if high != float('inf') and high > 0:
            gaussian_high = np.exp(-(dist_from_center**2) / (2 * (high**2)))
        else:
            gaussian_high = 1.0

        fft_shifted = fft_shifted * gaussian_low * gaussian_high

    # Update the image_id
    fft_cache[image_id] = (fft_shifted, True)

    magnitude = np.log1p(np.abs(fft_shifted))
    
    min_val, max_val = magnitude.min(), magnitude.max()
    normalized = (255 * (magnitude - min_val) / (max_val - min_val + 1e-8)).astype(np.uint8)
    res_img = Image.fromarray(normalized)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    # Return the image_id
    return Response(content=buf.getvalue(), media_type="image/png",headers={
            "X-Image-ID": image_id,
            "Access-Control-Expose-Headers": "X-Image-ID",
        },)