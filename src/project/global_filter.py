import io

import numpy as np
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from PIL import Image
from scipy.ndimage import convolve

router = APIRouter(
    prefix="/filter/global",
    tags=["Global Filters"]
)


# Define max tolerance for convergence 
tolerance = 0.1
max_iterations = 500
@router.post("/variational")
async def compute_variational_filter(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        regularisation = int(request.headers.get("regularisation"))
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )

    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255

    mask = np.array([[0, 1, 0],
                     [1, 0, 1],
                     [0, 1, 0]], dtype=np.float32)
    
    u_prev = img_array
    u_next = np.zeros(img_array.shape)

    h, w = img_array.shape
    neighbour_count = np.full((h, w), 4, dtype=np.float32)
    # 4 for inner points, 3 for border, 2 for corner
    neighbour_count[0, :] = 3
    neighbour_count[h - 1, :] = 3
    neighbour_count[:, 0] = 3
    neighbour_count[:, w - 1] = 3
    
    neighbour_count[0, 0] = 2
    neighbour_count[h - 1, 0] = 2
    neighbour_count[0, w - 1] = 2
    neighbour_count[h - 1, w - 1] = 2
    for _ in range(max_iterations):
        neighborhood = convolve(u_prev, mask, mode="constant", cval=0.0)
        u_next = (img_array + regularisation * neighborhood) / ( 1 + regularisation * neighbour_count )     
        
        if np.linalg.norm(u_next - u_prev) < tolerance:
            break
        u_prev = u_next
    
    res_img = Image.fromarray(u_next.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")