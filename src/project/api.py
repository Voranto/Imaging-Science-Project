from fastapi import FastAPI, APIRouter
from project.fft import router as fft_router
from project.dct import router as dct_router
from project.edge_detection import router as edge_router
from project.filter import router as filter_router


api_router = APIRouter(prefix="/api")
api_router.include_router(fft_router)
api_router.include_router(dct_router)
api_router.include_router(edge_router)
api_router.include_router(filter_router)


