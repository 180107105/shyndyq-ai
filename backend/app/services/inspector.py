from app.models.schemas import AuthorProfile, CommenterAnalysis, PostContent

GENERIC_PHRASES = [
    "хорошая работа", "отличный контент", "супер", "молодец", "продолжай",
    "так держать", "жақсы жұмыс", "керемет", "өте жақсы", "тамаша",
    "классно", "замечательно", "великолепно", "браво", "умница",
    "отлично", "хорошо", "красиво", "интересно", "спасибо за контент",
    "продолжай в том же духе", "жги", "огонь", "топ", "красота",
    "шикарно", "превосходно", "👍", "🔥", "💯", "❤️", "👏",
    "круто", "не останавливайся", "ждем ещё", "давай ещё",
    "мне нравится", "лайк", "подписался", "подписалась",
    "жалғастыр", "өте керемет", "ойбай керемет", "жарайсың",
    "бәрекелді", "рахмет", "сау бол", "Keep it up", "Amazing",
    "Great content", "Love it", "Awesome", "Nice",
]


def analyse_author(post: PostContent) -> AuthorProfile:
    follower_ratio = post.follower_count / max(post.following_count, 1)
    signals: list[str] = []

    if post.account_age_days < 90:
        signals.append("new_account")
    if follower_ratio > 10.0:
        signals.append("inverted_ratio")
    if post.account_age_days > 0 and post.post_count / max(post.account_age_days, 1) > 5:
        signals.append("high_post_velocity")
    if post.post_count < 5:
        signals.append("low_post_count")

    return AuthorProfile(
        account_age_days=post.account_age_days,
        post_count=post.post_count,
        follower_count=post.follower_count,
        following_count=post.following_count,
        follower_ratio=round(follower_ratio, 3),
        signals_flagged=signals,
    )


async def analyse_author_from_url(url: str) -> AuthorProfile:
    from app.services import scraper
    post = await scraper.fetch(url)
    return analyse_author(post)


def analyse_comments(comments: list[str]) -> CommenterAnalysis:
    normalized = [c.strip().lower() for c in comments]

    generic_hits = sum(
        1 for c in normalized
        if any(phrase in c for phrase in GENERIC_PHRASES)
    )

    exact_dupes = 0
    seen: dict[str, int] = {}
    for c in normalized:
        if c in seen:
            if seen[c] == 1:
                exact_dupes += 1
        seen[c] = seen.get(c, 0) + 1

    n = max(len(comments), 1)
    bot_rate = min((generic_hits + exact_dupes * 2) / n, 1.0)

    return CommenterAnalysis(
        comments_sampled=len(comments),
        generic_phrase_hits=generic_hits,
        exact_duplicate_pairs=exact_dupes,
        bot_rate_estimate=round(bot_rate, 3),
    )


def credibility_score(
    profile: AuthorProfile,
    comments: CommenterAnalysis,
    verdict: str,
) -> int:
    score = 100
    if profile.account_age_days < 30:
        score -= 25
    if profile.follower_ratio > 10.0:
        score -= 20
    if profile.post_count < 5:
        score -= 15
    if comments.generic_phrase_hits > 3:
        score -= 20
    if comments.exact_duplicate_pairs >= 2:
        score -= 20
    if verdict == "FAKE":
        score -= 10
    return max(0, min(100, score))


def credibility_label(score: int) -> str:
    if score <= 40:
        return "LOW"
    if score <= 69:
        return "MEDIUM"
    return "HIGH"
