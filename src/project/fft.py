from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import Response
from PIL import Image
import numpy as np
import io
import uuid
from cachetools import Cache

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
    
    fft_shifted = np.fft.fftshift(np.fft.fft2(img_array * 255))

    # Store true FFT matrix
    image_id = str(uuid.uuid4())
    fft_cache[image_id] = fft_shifted

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
    fft_shifted= fft_cache[image_id]
    image_array = np.fft.ifft2(np.fft.ifftshift(fft_shifted))
    magnitude = np.abs(image_array)
    
    final_bytes = np.clip(magnitude, 0, 255).astype(np.uint8)
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
    fft_shifted= fft_cache[image_id]
    rows, cols = fft_shifted.shape

    crow, ccol = rows // 2, cols // 2

    y, x = np.ogrid[-crow:rows-crow, -ccol:cols-ccol]
    dist_from_center = np.sqrt(x**2 + y**2)

    bandpass_mask = (dist_from_center >= low) & (dist_from_center <= high)

    fft_shifted = fft_shifted * bandpass_mask

    # Update the image_id
    fft_cache[image_id] = fft_shifted

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