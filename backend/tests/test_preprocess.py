import pytest
from app.core.preprocessing import preprocess_text


def test_removes_url():
    assert "http" not in preprocess_text("Check https://example.com for details")


def test_removes_html_tags():
    assert "<b>" not in preprocess_text("<b>Bold</b> text")


def test_lowercases():
    result = preprocess_text("BREAKING NEWS")
    assert result == result.lower()


def test_strips_whitespace():
    result = preprocess_text("  hello world  ")
    assert result == result.strip()


def test_empty_string():
    assert preprocess_text("") == ""


def test_url_and_html_combined():
    result = preprocess_text("<a href='https://news.kz'>Click</a>")
    assert "https" not in result
    assert "<a" not in result
    assert "click" in result


def test_plain_text_unchanged_except_case():
    result = preprocess_text("Simple sentence without noise.")
    assert result == "simple sentence without noise."
