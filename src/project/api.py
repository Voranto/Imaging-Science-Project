from fastapi import FastAPI, APIRouter
from project.fft import router as fft_router

api_router = APIRouter(prefix="/api")
api_router.include_router(fft_router)


