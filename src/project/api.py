from fastapi import FastAPI, APIRouter
from project.fft import router as fft_router
from project.edge_detection import router as edge_router


api_router = APIRouter(prefix="/api")
api_router.include_router(fft_router)
api_router.include_router(edge_router)


