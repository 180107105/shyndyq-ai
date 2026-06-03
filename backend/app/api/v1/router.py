import asyncio
import time
from fastapi import APIRouter, Request, HTTPException
import redis.asyncio as aioredis
from app.core.config import settings
from app.models.schemas import (
    TextPayload, URLPayload, ClaimPayload,
    AnalysisResult, VerificationResult, DeepInspectResult,
)
from app.services import classifier, scraper, inspector
from app.services import agent as verification_agent

router = APIRouter(prefix="/api/v1")

_redis: aioredis.Redis | None = None


def _get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def _check_rate_limit(request: Request, endpoint: str):
    ip = request.client.host if request.client else "unknown"
    key = f"rate:{ip}:{endpoint}"
    redis = _get_redis()
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, settings.rate_limit_window)
    if count > settings.rate_limit_max:
        raise HTTPException(429, detail="Rate limit exceeded. Max 20 requests/minute.")


@router.post("/analyze/text", response_model=AnalysisResult)
async def analyze_text(payload: TextPayload):
    if not payload.text.strip():
        raise HTTPException(422, detail="text must not be empty")
    return await asyncio.to_thread(classifier.predict, payload.text)


@router.post("/analyze/url")
async def analyze_url(payload: URLPayload, request: Request):
    await _check_rate_limit(request, "analyze_url")

    post = await scraper.fetch(payload.url)
    combined = post.caption + " " + " ".join(post.comments)
    result = await asyncio.to_thread(classifier.predict, combined)

    return {**post.model_dump(), **result.model_dump()}


@router.post("/verify", response_model=VerificationResult)
async def verify_claim(payload: ClaimPayload):
    if not payload.claim.strip():
        raise HTTPException(422, detail="claim must not be empty")
    return await verification_agent.verify(payload.claim)


@router.post("/deep-inspect", response_model=DeepInspectResult)
async def deep_inspect(payload: URLPayload, request: Request):
    await _check_rate_limit(request, "deep_inspect")
    start = time.monotonic()

    post = await scraper.fetch(payload.url)
    combined = post.caption + " " + " ".join(post.comments)

    # Run classifier (CPU-bound) and author analysis in parallel.
    # Author analysis is derived from the already-fetched post — no second scrape.
    post_verdict, author_profile = await asyncio.gather(
        asyncio.to_thread(classifier.predict, combined),
        asyncio.to_thread(inspector.analyse_author, post),
    )

    comment_analysis = inspector.analyse_comments(post.comments)
    score = inspector.credibility_score(author_profile, comment_analysis, post_verdict.verdict)
    label = inspector.credibility_label(score)

    elapsed_ms = int((time.monotonic() - start) * 1000)
    return DeepInspectResult(
        post_verdict=post_verdict,
        author_analysis=author_profile,
        commenter_analysis=comment_analysis,
        credibility_score=score,
        credibility_label=label,
        processing_time_ms=elapsed_ms,
    )
