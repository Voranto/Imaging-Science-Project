from fastapi import FastAPI, APIRouter
from project.fft import router as fft_router
from project.dct import router as dct_router
from project.dwt import router as dwt_router
from project.edge_detection import router as edge_router
from project.corner_detection import router as corner_router

from project.filter import router as filter_router
from project.noise import router as noise_router
from project.morphological_filter import router as morph_router


api_router = APIRouter(prefix="/api")
api_router.include_router(fft_router)
api_router.include_router(dct_router)
api_router.include_router(dwt_router)
api_router.include_router(edge_router)
api_router.include_router(corner_router)

api_router.include_router(filter_router)
api_router.include_router(noise_router)
api_router.include_router(morph_router)



