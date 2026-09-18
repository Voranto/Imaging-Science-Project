from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import Response
from PIL import Image
import numpy as np
import io

router = APIRouter(
    prefix="/fft",
    tags=["FFT Transforms"]
)

@router.post("/compute_color")
async def compute_fft_color(image : UploadFile = File(...)):
    # Returns a 3 dimensional array of the FFT of each of the channels
    if image.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await image.read()

    image = Image.open(io.BytesIO(contents)).convert("RGB")

    img_array = np.array(image)

    fft = np.fft.fft2(img_array,axes=(0,1))
    shifted_fft = np.fft.fftshift(fft,axes=(0,1))

    magnitude_spectrum = np.abs(shifted_fft)
    log_spectrum = np.log(1 + magnitude_spectrum)

    # Move to 0-255 range
    min_val, max_val = log_spectrum.min(), log_spectrum.max()
    normalized = (255 * (log_spectrum - min_val) / (max_val - min_val)).astype(np.uint8)

    res_img = Image.fromarray(normalized)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")

    return Response(content=buf.getvalue(), media_type="image/png")
