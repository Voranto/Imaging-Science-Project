import io

import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from PIL import Image

router = APIRouter(
    prefix="/filter/morphological",
    tags=["Morphological Filters"]
)

@router.post("/erosion")
async def compute_erosion(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
        circleMask = request.headers.get("circle") == "true"
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255
    mask_width = radius * 2 + 1
    if circleMask:
        y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
        mask = x**2 + y**2 <= radius**2
        kernel = np.zeros((2 * radius + 1, 2 * radius + 1), dtype=np.uint8)
        kernel[mask] = 1.0
    else:
        kernel = np.ones((mask_width, mask_width), np.uint8)
    img_erosion = cv2.erode(img_array, kernel, iterations=1)


    res_img = Image.fromarray(img_erosion.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/dilation")
async def compute_dilation(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
        circleMask = request.headers.get("circle") == "true"
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255
    mask_width = radius * 2 + 1
    if circleMask:
        y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
        mask = x**2 + y**2 <= radius**2
        kernel = np.zeros((2 * radius + 1, 2 * radius + 1), dtype=np.uint8)
        kernel[mask] = 1.0
    else:
        kernel = np.ones((mask_width, mask_width), np.uint8)
    img_dilation = cv2.dilate(img_array, kernel, iterations=1)


    res_img = Image.fromarray(img_dilation.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/opening")
async def compute_opening(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
        circleMask = request.headers.get("circle") == "true"
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255
    mask_width = radius * 2 + 1
    if circleMask:
        y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
        mask = x**2 + y**2 <= radius**2
        kernel = np.zeros((2 * radius + 1, 2 * radius + 1), dtype=np.uint8)
        kernel[mask] = 1.0
    else:
        kernel = np.ones((mask_width, mask_width), np.uint8)
    img_erosion = cv2.erode(img_array, kernel, iterations=1)
    img_opening =cv2.dilate(img_erosion, kernel, iterations=1)

    res_img = Image.fromarray(img_opening.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/closing")
async def compute_closing(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
        circleMask = request.headers.get("circle") == "true"
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255
    mask_width = radius * 2 + 1
    if circleMask:
        y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
        mask = x**2 + y**2 <= radius**2
        kernel = np.zeros((2 * radius + 1, 2 * radius + 1), dtype=np.uint8)
        kernel[mask] = 1.0
    else:
        kernel = np.ones((mask_width, mask_width), np.uint8)
    img_dilation = cv2.dilate(img_array, kernel, iterations=1)
    img_closing =cv2.erode(img_dilation, kernel, iterations=1)

    res_img = Image.fromarray(img_closing.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/whiteTopHat")
async def compute_white_top_hat(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
        circleMask = request.headers.get("circle") == "true"
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255
    mask_width = radius * 2 + 1
    if circleMask:
        y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
        mask = x**2 + y**2 <= radius**2
        kernel = np.zeros((2 * radius + 1, 2 * radius + 1), dtype=np.uint8)
        kernel[mask] = 1.0
    else:
        kernel = np.ones((mask_width, mask_width), np.uint8)
    img_erosion = cv2.erode(img_array, kernel, iterations=1)
    img_opening =cv2.dilate(img_erosion, kernel, iterations=1)
    whiteTopHat = img_array - img_opening

    res_img = Image.fromarray(whiteTopHat.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


@router.post("/blackTopHat")
async def compute_black_top_hat(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
        circleMask = request.headers.get("circle") == "true"
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255
    mask_width = radius * 2 + 1
    if circleMask:
        y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
        mask = x**2 + y**2 <= radius**2
        kernel = np.zeros((2 * radius + 1, 2 * radius + 1), dtype=np.uint8)
        kernel[mask] = 1.0
    else:
        kernel = np.ones((mask_width, mask_width), np.uint8)
    img_dilation= cv2.dilate(img_array, kernel, iterations=1)
    img_closing =cv2.erode(img_dilation, kernel, iterations=1)
    blackTopHat = img_closing - img_array 

    res_img = Image.fromarray(blackTopHat.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/selfdualTopHat")
async def compute_selfdual_top_hat(request: Request):
    try:
        x_image_width = int(request.headers.get("x-image-width"))
        x_image_height = int(request.headers.get("x-image-height"))
        radius = int(request.headers.get("radius"))
        circleMask = request.headers.get("circle") == "true"
    except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, 
                detail="Missing or invalid headers"
            )
    body_bytes = await request.body()

    img_array = np.frombuffer(body_bytes, dtype=np.float32).reshape((x_image_height, x_image_width))

    img_array = img_array * 255
    mask_width = radius * 2 + 1
    if circleMask:
        y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
        mask = x**2 + y**2 <= radius**2
        kernel = np.zeros((2 * radius + 1, 2 * radius + 1), dtype=np.uint8)
        kernel[mask] = 1.0
    else:
        kernel = np.ones((mask_width, mask_width), np.uint8)
    img_dilation= cv2.dilate(img_array, kernel, iterations=1)
    img_closing =cv2.erode(img_dilation, kernel, iterations=1)
    blackTopHat = img_closing - img_array 
    img_erosion = cv2.erode(img_array, kernel, iterations=1)
    img_opening =cv2.dilate(img_erosion, kernel, iterations=1)
    whiteTopHat = img_array - img_opening

    selfdual = whiteTopHat + blackTopHat

    res_img = Image.fromarray(selfdual.astype(np.uint8))
    buf = io.BytesIO()
    res_img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

