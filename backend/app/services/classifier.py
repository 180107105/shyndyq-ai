import time
import numpy as np
import torch
import torch.nn as nn
from transformers import BertTokenizer, BertModel
from app.core.preprocessing import preprocess_text
from app.core.config import settings
from app.models.schemas import AnalysisResult, SpanWeight

TABLOID_DOMAINS = {"dailymail.co.uk", "thesun.co.uk", "nypost.com", "infowars.com", "breitbart.com"}
MAINSTREAM_DOMAINS = {"bbc.com", "reuters.com", "apnews.com", "tengrinews.kz", "informburo.kz"}
_PREDICT_SEEDS = [42, 123, 456]


def _source_tier(text: str) -> float:
    for domain in TABLOID_DOMAINS:
        if domain in text:
            return 0.0
    for domain in MAINSTREAM_DOMAINS:
        if domain in text:
            return 1.0
    return 0.5


class BertClassifier(nn.Module):
    def __init__(self, bert: BertModel):
        super().__init__()
        self.bert = bert
        self.classifier = nn.Linear(bert.config.hidden_size + 2, 1)

    def forward(self, input_ids, attention_mask, extra_features):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_emb = outputs.last_hidden_state[:, 0, :]
        combined = torch.cat([cls_emb, extra_features], dim=1)
        return self.classifier(combined)


_model: BertClassifier | None = None
_tokenizer: BertTokenizer | None = None


def load_model():
    global _model, _tokenizer
    path = settings.model_path
    _tokenizer = BertTokenizer.from_pretrained(path)
    bert = BertModel.from_pretrained(path)
    _model = BertClassifier(bert)
    _model.eval()


def _compute_shap_spans(cleaned_text: str, sentiment: float, source_tier: float, n: int = 3) -> list[SpanWeight]:
    import shap

    def _predict_batch(texts: list[str]) -> np.ndarray:
        probs = []
        for t in texts:
            enc = _tokenizer(
                t, max_length=512, truncation=True, padding="max_length", return_tensors="pt"
            )
            extra = torch.tensor([[sentiment, source_tier]], dtype=torch.float)
            with torch.no_grad():
                logit = _model(enc["input_ids"], enc["attention_mask"], extra)
                probs.append(torch.sigmoid(logit).item())
        return np.array(probs)

    masker = shap.maskers.Text(r"\s+")
    explainer = shap.Explainer(_predict_batch, masker)
    shap_values = explainer([cleaned_text], max_evals=64, silent=True)

    words = shap_values.data[0]
    values = shap_values.values[0]
    pairs = sorted(zip(words, values.tolist()), key=lambda x: abs(x[1]), reverse=True)
    return [
        SpanWeight(text=w, weight=round(float(v), 4))
        for w, v in pairs[:n]
        if w.strip()
    ]


def _get_top_spans(tokens: list[str], scores: list[float], n: int = 3) -> list[SpanWeight]:
    """Fallback span extraction when SHAP is unavailable."""
    pairs = sorted(zip(tokens, scores), key=lambda x: abs(x[1]), reverse=True)
    seen, spans = set(), []
    for token, weight in pairs:
        if token.startswith("##") or token in ("[CLS]", "[SEP]", "[PAD]"):
            continue
        if token not in seen:
            seen.add(token)
            spans.append(SpanWeight(text=token, weight=round(float(weight), 4)))
        if len(spans) >= n:
            break
    return spans


def predict(text: str) -> AnalysisResult:
    assert _model is not None and _tokenizer is not None, "Model not loaded"
    start = time.monotonic()

    cleaned = preprocess_text(text)
    sentiment_polarity = 0.0
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        sia = SentimentIntensityAnalyzer()
        sentiment_polarity = float(sia.polarity_scores(cleaned)["compound"])
    except ImportError:
        pass

    source_tier = _source_tier(text)

    encoding = _tokenizer(
        cleaned,
        max_length=512,
        truncation=True,
        padding="max_length",
        return_tensors="pt",
    )
    input_ids = encoding["input_ids"]
    attention_mask = encoding["attention_mask"]
    extra = torch.tensor([[sentiment_polarity, source_tier]], dtype=torch.float)

    probs = []
    for seed in _PREDICT_SEEDS:
        torch.manual_seed(seed)
        with torch.no_grad():
            logits = _model(input_ids, attention_mask, extra)
            probs.append(torch.sigmoid(logits).item())
    prob = sum(probs) / len(probs)

    verdict = "FAKE" if prob > 0.5 else "REAL"

    try:
        spans = _compute_shap_spans(cleaned, sentiment_polarity, source_tier)
    except Exception:
        tokens = _tokenizer.convert_ids_to_tokens(input_ids[0])
        # Gradient-based attribution fallback: use input embedding gradients
        try:
            _model.zero_grad()
            emb = _model.bert.embeddings(input_ids)
            emb.retain_grad()
            logit = _model.classifier(
                torch.cat([
                    _model.bert(inputs_embeds=emb, attention_mask=attention_mask)
                    .last_hidden_state[:, 0, :],
                    extra,
                ], dim=1)
            )
            logit.backward()
            grad_scores = emb.grad[0].norm(dim=-1).tolist()
            spans = _get_top_spans(tokens, grad_scores)
        except Exception:
            spans = _get_top_spans(tokens, [0.0] * len(tokens))

    elapsed_ms = int((time.monotonic() - start) * 1000)
    return AnalysisResult(
        verdict=verdict,
        confidence=round(prob, 3),
        highlighted_spans=spans,
        processing_time_ms=elapsed_ms,
    )
