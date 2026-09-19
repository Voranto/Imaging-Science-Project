from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Header
from fastapi.responses import Response, JSONResponse
from PIL import Image
import numpy as np
import io
from scipy.ndimage import convolve, gaussian_filter
import math
from enum import Enum

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
        applyGaussian = request.headers.get("applyGaussian") == "true"
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)

    if (applyGaussian):
        img_array = gaussian_filter(img_array, sigma=1.0)
    
    
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

@router.post("/canny")
async def compute_cannys_edge_detection(request: Request):
    # Returns the max value of the image gradient (used to adjust the threshold input)
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        applyGaussian = request.headers.get("applyGaussian") == "true"
        
        thresholdWeak = float(request.headers.get("thresholdWeak"))
        thresholdStrong = float(request.headers.get("thresholdStrong"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422, 
            detail="Missing or invalid 'x-image-width' / 'x-image-height' headers"
        )

    
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.uint8).reshape((x_image_height, x_image_width))

    img_array = img_array.astype(np.float32)

    if (applyGaussian):
        img_array = gaussian_filter(img_array, sigma=1.0)

    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
    # Use Sobel Operators to compute it
    grad_x = convolve(img_array,sobel_x, mode="nearest")
    grad_y = convolve(img_array,sobel_y, mode="nearest")
    gradient = np.hypot(grad_x, grad_y)

    # Now iterate the image and get the gradient direction of each pixel
    theta_rad = np.arctan2(grad_y, grad_x)
    theta_deg = np.degrees(theta_rad)


    gradient_processed = gradient.copy()
    for x_i in range(x_image_width):
        for y_i in range(x_image_height):
            # Set borders to zero either way
            if y_i == 0 or y_i ==x_image_height -1 or x_i == 0 or x_i == x_image_width-1:
                gradient_processed[y_i][x_i] = 0
                continue

            deg = theta_deg[y_i][x_i]
            direction = getDirection(deg)
            if direction == Direction.HORIZONTAL:
                if gradient[y_i][x_i] < gradient[y_i][x_i + 1]  or gradient[y_i][x_i] < gradient[y_i][x_i-1]:
                    gradient_processed[y_i][x_i] = 0
            if direction == Direction.VERTICAL:
                if gradient[y_i][x_i] < gradient[y_i+1][x_i]  or gradient[y_i][x_i] < gradient[y_i-1][x_i]:
                    gradient_processed[y_i][x_i] = 0

            if direction == Direction.DIAGONAL_NEGATIVE:
                if gradient[y_i][x_i] < gradient[y_i-1][x_i-1]  or gradient[y_i][x_i] < gradient[y_i+1][x_i+1]:
                    gradient_processed[y_i][x_i] = 0
            
            if direction == Direction.DIAGONAL_POSITIVE:
                if gradient[y_i][x_i] < gradient[y_i-1][x_i+1]  or gradient[y_i][x_i] < gradient[y_i+1][x_i-1]:
                    gradient_processed[y_i][x_i] = 0

    # Clasify the remaining edges into weak and strong edges. We convert no edge to a value of 0, weak edges to 1 and strong to a value of 2
    for x_i in range(x_image_width):
        for y_i in range(x_image_height):
            if gradient_processed[y_i][x_i] >= thresholdStrong:
                gradient_processed[y_i][x_i] = 2
            elif gradient_processed[y_i][x_i] >= thresholdWeak:
                gradient_processed[y_i][x_i] = 1
            else:
                gradient_processed[y_i][x_i] = 0

    
    def checkStrongNeighbor(x_i,y_i):
        directions = [(1,1),(-1,-1),(1,0),(0,1),(-1,0),(0,-1),(1,-1),(-1,1)]
        for dx,dy in directions:
            if x_i + dx < 0 or x_i+dx >= x_image_width or y_i+dy < 0 or y_i+dy >= x_image_height:
                continue
            if gradient_processed[y_i+dy][x_i+dx] == 2:
                return True
        return False

    # Keep upgrading weak edges until no change is found
    edgeUpgraded = True
    while edgeUpgraded:
        edgeUpgraded = False
        for x_i in range(x_image_width):
            for y_i in range(x_image_height):
                if gradient_processed[y_i][x_i] == 1 and checkStrongNeighbor(x_i,y_i):
                    gradient_processed[y_i][x_i] = 2
                    edgeUpgraded = True
    
    # Now switch the values to edge -> 0, non-edge -> 255

    gradient_processed[gradient_processed == 0] = np.uint8(255)
    
    gradient_processed[gradient_processed == 1] = np.uint8(255)
    
    gradient_processed[gradient_processed == 2] = np.uint8(0)

    res_img = Image.fromarray(gradient_processed.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")



class Direction(Enum):
    HORIZONTAL = 0
    DIAGONAL_POSITIVE = 1
    VERTICAL = 2
    DIAGONAL_NEGATIVE = 3

def getDirection(degree):
    # Normalize degree to [0, 360) range to handle negative degrees and values >= 360
    degree = degree % 360

    if (degree < 22.5) or (337.5 <= degree) or (157.5 <= degree < 202.5):
        return Direction.HORIZONTAL
    elif (22.5 <= degree < 67.5) or (202.5 <= degree < 247.5):
        return Direction.DIAGONAL_POSITIVE
    elif (67.5 <= degree < 112.5) or (247.5 <= degree < 292.5):
        return Direction.VERTICAL
    elif (112.5 <= degree < 157.5) or (292.5 <= degree < 337.5):
        return Direction.DIAGONAL_NEGATIVE    

