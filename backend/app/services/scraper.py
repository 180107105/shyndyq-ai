import json
import instaloader
import redis.asyncio as aioredis
from fastapi import HTTPException
from app.core.config import settings
from app.models.schemas import PostContent

_redis: aioredis.Redis | None = None
_SESSION_REQUEST_COUNT = 0
_SESSION_LIMIT = 50


def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


def _shortcode_from_url(url: str) -> str:
    parts = url.rstrip("/").split("/")
    try:
        p_idx = parts.index("p")
        return parts[p_idx + 1]
    except (ValueError, IndexError):
        pass
    for part in reversed(parts):
        if part:
            return part
    raise HTTPException(422, "Cannot extract shortcode from URL")


async def fetch(url: str) -> PostContent:
    global _SESSION_REQUEST_COUNT

    redis = get_redis()
    cache_key = f"scrape:{url}"
    cached = await redis.get(cache_key)
    if cached:
        return PostContent(**json.loads(cached))

    if _SESSION_REQUEST_COUNT >= _SESSION_LIMIT:
        raise HTTPException(429, "Instagram session rate limit reached — try again later")

    shortcode = _shortcode_from_url(url)
    loader = instaloader.Instaloader(download_pictures=False, download_videos=False, quiet=True)

    try:
        _SESSION_REQUEST_COUNT += 1
        post = instaloader.Post.from_shortcode(loader.context, shortcode)
    except instaloader.exceptions.LoginRequiredException:
        raise HTTPException(422, "Login wall — post not publicly accessible")
    except instaloader.exceptions.ConnectionException as exc:
        raise HTTPException(503, f"Instagram connection error: {exc}")
    except Exception as exc:
        raise HTTPException(422, f"Could not fetch post: {exc}")

    profile = post.owner_profile

    comments: list[str] = []
    try:
        for comment in post.get_comments():
            comments.append(comment.text)
            if len(comments) >= 100:
                break
    except Exception:
        pass

    age = _age_days(profile)
    content = PostContent(
        caption=post.caption or "",
        comments=comments,
        account_age_days=age,
        follower_count=profile.followers,
        following_count=profile.followees,
        post_count=profile.mediacount,
    )

    await redis.setex(cache_key, 600, content.model_dump_json())
    return content


def _age_days(profile: instaloader.Profile) -> int:
    # instaloader does not expose account creation date; use a conservative default
    return 365
