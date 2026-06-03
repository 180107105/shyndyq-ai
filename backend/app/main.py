from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1.router import router
from app.core.db import create_tables
from app.services import classifier


@asynccontextmanager
async def lifespan(app: FastAPI):
    classifier.load_model()
    await create_tables()
    yield


app = FastAPI(
    title="Shyndyq AI",
    description="Fake news detection for Kazakh social media",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}
