from typing import Literal
from pydantic import BaseModel


class TextPayload(BaseModel):
    text: str


class URLPayload(BaseModel):
    url: str


class ClaimPayload(BaseModel):
    claim: str


class SpanWeight(BaseModel):
    text: str
    weight: float


class AnalysisResult(BaseModel):
    verdict: Literal["REAL", "FAKE", "UNCERTAIN"]
    confidence: float
    highlighted_spans: list[SpanWeight]
    processing_time_ms: int


class EvidenceItem(BaseModel):
    source: str
    url: str
    headline: str
    stance: str
    date: str


class VerificationResult(BaseModel):
    sources_checked: int
    supporting: int
    contradicting: int
    unrelated: int
    verdict: Literal["SUPPORTED", "CONTRADICTED", "UNCERTAIN"]
    evidence: list[EvidenceItem]
    processing_time_ms: int


class AuthorProfile(BaseModel):
    account_age_days: int
    post_count: int
    follower_count: int
    following_count: int
    follower_ratio: float
    signals_flagged: list[str]


class CommenterAnalysis(BaseModel):
    comments_sampled: int
    generic_phrase_hits: int
    exact_duplicate_pairs: int
    bot_rate_estimate: float


class DeepInspectResult(BaseModel):
    post_verdict: AnalysisResult
    author_analysis: AuthorProfile
    commenter_analysis: CommenterAnalysis
    credibility_score: int
    credibility_label: Literal["LOW", "MEDIUM", "HIGH"]
    processing_time_ms: int


class PostContent(BaseModel):
    caption: str
    comments: list[str]
    account_age_days: int
    follower_count: int
    following_count: int
    post_count: int
