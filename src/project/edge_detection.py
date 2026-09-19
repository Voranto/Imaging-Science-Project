from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response, JSONResponse
from PIL import Image
import numpy as np
import io
from scipy.ndimage import convolve
import math
router = APIRouter(
    prefix="/filter/edge",
    tags=["Edge Detection"]
)

@router.post("/simple")
async def compute_simple_edge_detection(request: Request):
    # Returns a PNG image of simple edge detection of the canvas
    
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        threshold = float(request.headers.get("threshold"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)

    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
    # Use Sobel Operators to compute it
    grad_x = convolve(img_array,sobel_x, mode="nearest")
    grad_y = convolve(img_array,sobel_y, mode="nearest")

    gradient = np.hypot(grad_x, grad_y)
    print(gradient)
    binary_edge = np.where(gradient >= threshold, np.uint8(0), np.uint8(255))
    
    
    res_img = Image.fromarray(binary_edge)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    print("success")
    return Response(content=buf.getvalue(), media_type="image/png")


@router.post("/simple/max_value")
async def get_max_value_simple_edge_detection(request: Request):
    # Returns the max value of the image gradient (used to adjust the threshold input)
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)

    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
    # Use Sobel Operators to compute it
    grad_x = convolve(img_array,sobel_x, mode="nearest")
    grad_y = convolve(img_array,sobel_y, mode="nearest")

    gradient = np.hypot(grad_x, grad_y)
    
    return JSONResponse(content={"max_value": float(np.max(gradient))})

    
