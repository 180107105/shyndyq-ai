import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import (
    AnalysisResult, PostContent, VerificationResult, AuthorProfile, CommenterAnalysis,
)

_MOCK_ANALYSIS = AnalysisResult(
    verdict="REAL", confidence=0.2, highlighted_spans=[], processing_time_ms=10
)
_MOCK_POST = PostContent(
    caption="Test caption",
    comments=["great post"],
    account_age_days=365,
    follower_count=1000,
    following_count=100,
    post_count=50,
)
_MOCK_AUTHOR = AuthorProfile(
    account_age_days=365,
    post_count=50,
    follower_count=1000,
    following_count=100,
    follower_ratio=10.0,
    signals_flagged=[],
)
_MOCK_COMMENTS = CommenterAnalysis(
    comments_sampled=1, generic_phrase_hits=0, exact_duplicate_pairs=0, bot_rate_estimate=0.0
)
_MOCK_VERIFICATION = VerificationResult(
    sources_checked=0, supporting=0, contradicting=0, unrelated=0,
    verdict="UNCERTAIN", evidence=[], processing_time_ms=5,
)


@pytest.fixture
def client():
    with patch("app.services.classifier.load_model"), \
         patch("app.core.db.create_tables", new_callable=AsyncMock):
        with TestClient(app) as c:
            yield c


# --- /analyze/text ---

def test_analyze_text_empty_input(client):
    resp = client.post("/api/v1/analyze/text", json={"text": ""})
    assert resp.status_code == 422


def test_analyze_text_normal(client):
    with patch("app.services.classifier.predict", return_value=_MOCK_ANALYSIS):
        resp = client.post("/api/v1/analyze/text", json={"text": "Some news article."})
    assert resp.status_code == 200
    assert resp.json()["verdict"] in ("REAL", "FAKE", "UNCERTAIN")


def test_analyze_text_512_tokens(client):
    long_text = "word " * 512
    with patch("app.services.classifier.predict", return_value=_MOCK_ANALYSIS):
        resp = client.post("/api/v1/analyze/text", json={"text": long_text})
    assert resp.status_code == 200


def test_analyze_text_513_tokens_truncated(client):
    # 513 tokens should be silently truncated to 512 by the tokenizer
    long_text = "word " * 513
    with patch("app.services.classifier.predict", return_value=_MOCK_ANALYSIS):
        resp = client.post("/api/v1/analyze/text", json={"text": long_text})
    assert resp.status_code == 200


# --- /analyze/url ---

def test_analyze_url_malformed(client):
    from fastapi import HTTPException
    with patch("app.services.scraper.fetch", new_callable=AsyncMock,
               side_effect=HTTPException(422, "Cannot extract shortcode from URL")):
        resp = client.post("/api/v1/analyze/url", json={"url": "not-a-url"})
    assert resp.status_code == 422


def test_analyze_url_private_account(client):
    from fastapi import HTTPException
    with patch("app.services.scraper.fetch", new_callable=AsyncMock,
               side_effect=HTTPException(422, "Login wall — post not publicly accessible")):
        resp = client.post("/api/v1/analyze/url",
                           json={"url": "https://instagram.com/p/private123/"})
    assert resp.status_code == 422
    assert "Login wall" in resp.json()["detail"]


# --- /verify ---

def test_verify_empty_claim(client):
    resp = client.post("/api/v1/verify", json={"claim": ""})
    assert resp.status_code == 422


def test_verify_returns_result(client):
    with patch("app.services.agent.verify", new_callable=AsyncMock,
               return_value=_MOCK_VERIFICATION):
        resp = client.post("/api/v1/verify", json={"claim": "The government raised taxes."})
    assert resp.status_code == 200
    assert resp.json()["verdict"] in ("SUPPORTED", "CONTRADICTED", "UNCERTAIN")


# --- /deep-inspect ---

def test_deep_inspect_private_account(client):
    from fastapi import HTTPException
    with patch("app.services.scraper.fetch", new_callable=AsyncMock,
               side_effect=HTTPException(422, "Login wall — post not publicly accessible")):
        resp = client.post("/api/v1/deep-inspect",
                           json={"url": "https://instagram.com/p/private123/"})
    assert resp.status_code == 422


def test_deep_inspect_returns_result(client):
    from app.services import inspector as insp
    with patch("app.services.scraper.fetch", new_callable=AsyncMock, return_value=_MOCK_POST), \
         patch("app.services.classifier.predict", return_value=_MOCK_ANALYSIS), \
         patch.object(insp, "analyse_author", return_value=_MOCK_AUTHOR):
        resp = client.post("/api/v1/deep-inspect",
                           json={"url": "https://instagram.com/p/abc123/"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["credibility_label"] in ("LOW", "MEDIUM", "HIGH")
    assert 0 <= data["credibility_score"] <= 100
