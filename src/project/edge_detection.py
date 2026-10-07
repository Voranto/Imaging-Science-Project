import io
from enum import Enum

import numpy as np
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from PIL import Image
from scipy.ndimage import convolve, gaussian_filter, generate_binary_structure, label

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

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_array  = img_array * 255
    if (applyGaussian):
        img_array = gaussian_filter(img_array, sigma=1.0)
    
    
    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
    # Use Sobel Operators to compute it
    grad_x = convolve(img_array,sobel_x, mode="nearest")
    grad_y = convolve(img_array,sobel_y, mode="nearest")

    gradient = np.hypot(grad_x, grad_y)
    binary_edge = np.where(gradient >= threshold, np.uint8(0), np.uint8(255))
    
    
    res_img = Image.fromarray(binary_edge)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
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

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))
    img_array = img_array * 255

    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
    # Use Sobel Operators to compute it
    grad_x = convolve(img_array,sobel_x, mode="nearest")
    grad_y = convolve(img_array,sobel_y, mode="nearest")

    gradient = np.hypot(grad_x, grad_y)
    
    return JSONResponse(content={"max_value": float(np.max(gradient))})

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

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255

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


    q_angle = np.zeros_like(theta_deg, dtype=np.uint8)
    q_angle[(theta_deg >= 22.5) & (theta_deg < 67.5)] = 1   # Diagonal /
    q_angle[(theta_deg >= 67.5) & (theta_deg < 112.5)] = 2  # Vertical |
    q_angle[(theta_deg >= 112.5) & (theta_deg < 157.5)] = 3

    # Neighboring pixels
    p = np.zeros_like(gradient)
    r = np.zeros_like(gradient)

    mask = (q_angle == 0)
    p[mask] = np.pad(gradient, ((0,0),(0,1)), mode='constant')[:, 1:][mask]
    r[mask] = np.pad(gradient, ((0,0),(1,0)), mode='constant')[:, :-1][mask]

    mask = (q_angle == 1)
    p[mask] = np.pad(gradient, ((1,0),(0,1)), mode='constant')[:-1, 1:][mask]
    r[mask] = np.pad(gradient, ((0,1),(1,0)), mode='constant')[1:, :-1][mask]

    mask = (q_angle == 2)
    p[mask] = np.pad(gradient, ((1,0),(0,0)), mode='constant')[:-1, :][mask]
    r[mask] = np.pad(gradient, ((0,1),(0,0)), mode='constant')[1:, :][mask]

    mask = (q_angle == 3)
    p[mask] = np.pad(gradient, ((1,0),(1,0)), mode='constant')[:-1, :-1][mask]
    r[mask] = np.pad(gradient, ((0,1),(0,1)), mode='constant')[1:, 1:][mask]

    # Keep only local maxima
    nms_mask = (gradient >= p) & (gradient >= r)
    gradient_processed = np.where(nms_mask, gradient, 0)

    # Zero out edges
    gradient_processed[0, :] = 0
    gradient_processed[-1, :] = 0
    gradient_processed[:, 0] = 0
    gradient_processed[:, -1] = 0

    # Double Thresholding
    strong_mask = gradient_processed >= thresholdStrong
    weak_mask = (gradient_processed >= thresholdWeak) & ~strong_mask


    structure = generate_binary_structure(2, 2)
    labeled_array, _ = label(weak_mask | strong_mask, structure=structure)

    # Find connected component labels that contain at least one strong edge
    strong_labels = np.unique(labeled_array[strong_mask])
    strong_labels = strong_labels[strong_labels != 0] # Remove background label

    # Keep pixels that belong to a valid component containing a strong edge
    final_edges = np.isin(labeled_array, strong_labels)

    # Output formatting: Edge -> 0 (Black), Non-Edge -> 255 (White)
    output_array = np.where(final_edges, 0, 255).astype(np.uint8)

    res_img = Image.fromarray(output_array)
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")
