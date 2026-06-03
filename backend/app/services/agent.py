import time
import httpx
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain import hub
from app.core.config import settings
from app.models.schemas import VerificationResult, EvidenceItem

_TRUSTED_SITES = "site:tengrinews.kz OR site:informburo.kz OR site:orda.kz"


def _search(query: str) -> str:
    full_query = f"{query} ({_TRUSTED_SITES})"
    headers = {"X-API-KEY": settings.serper_api_key, "Content-Type": "application/json"}
    payload = {"q": full_query, "num": 5}
    try:
        resp = httpx.post("https://google.serper.dev/search", json=payload, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for item in data.get("organic", [])[:5]:
            results.append(
                f"Title: {item.get('title', '')}\nURL: {item.get('link', '')}\nSnippet: {item.get('snippet', '')}"
            )
        return "\n---\n".join(results) if results else "No results found."
    except Exception as exc:
        return f"Search error: {exc}"


def _fetch_article(url: str) -> str:
    try:
        resp = httpx.get(url, timeout=10, follow_redirects=True,
                         headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        return text[:3000]
    except Exception as exc:
        return f"Fetch error: {exc}"


def _summarize_to_claim(article_text: str) -> str:
    llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key)
    prompt = f"Extract the single key factual claim from this article in one sentence: {article_text[:2000]}"
    return llm.invoke(prompt).content


_tools = [
    Tool(name="search", func=_search,
         description="Search Kazakh news sites for a query. Input: search query string."),
    Tool(name="fetch_article", func=_fetch_article,
         description="Fetch full article text from a URL. Input: URL string."),
    Tool(name="summarize_to_claim", func=_summarize_to_claim,
         description="Extract the single key factual claim from article text. Input: article text."),
]


def _parse_stance(agent_output: str) -> list[EvidenceItem]:
    evidence = []
    blocks = agent_output.split("---")
    for block in blocks:
        if "URL:" not in block:
            continue
        fields = {
            line.split(":", 1)[0].strip(): line.split(":", 1)[1].strip()
            for line in block.strip().splitlines() if ":" in line
        }
        stance = "UNRELATED"
        block_lower = block.lower()
        if "supports" in block_lower or "подтверждает" in block_lower:
            stance = "SUPPORTS"
        elif "contradicts" in block_lower or "опровергает" in block_lower:
            stance = "CONTRADICTS"
        evidence.append(EvidenceItem(
            source=fields.get("Source", fields.get("Title", "Unknown")),
            url=fields.get("URL", ""),
            headline=fields.get("Title", ""),
            stance=stance,
            date=fields.get("Date", ""),
        ))
    return evidence


async def verify(claim: str) -> VerificationResult:
    start = time.monotonic()

    if not settings.openai_api_key or not settings.serper_api_key:
        return VerificationResult(
            sources_checked=0, supporting=0, contradicting=0, unrelated=0,
            verdict="UNCERTAIN", evidence=[],
            processing_time_ms=int((time.monotonic() - start) * 1000),
        )

    llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key, temperature=0)
    prompt = hub.pull("hwchase17/react")
    agent = create_react_agent(llm, _tools, prompt)
    executor = AgentExecutor(agent=agent, tools=_tools, verbose=False,
                             max_iterations=6, handle_parsing_errors=True)

    react_prompt = (
        f"Verify this claim: '{claim}'\n"
        "1. Search for it on Kazakh news sites.\n"
        "2. Fetch each article and summarize its key claim.\n"
        "3. For each source state: SUPPORTS, CONTRADICTS, or UNRELATED.\n"
        "4. Format each source as:\nTitle: ...\nURL: ...\nDate: ...\nStance: ...\n---"
    )

    try:
        result = await executor.ainvoke({"input": react_prompt})
        output = result.get("output", "")
    except Exception:
        output = ""

    evidence = _parse_stance(output)
    supporting = sum(1 for e in evidence if e.stance == "SUPPORTS")
    contradicting = sum(1 for e in evidence if e.stance == "CONTRADICTS")
    unrelated = len(evidence) - supporting - contradicting

    if not evidence:
        verdict = "UNCERTAIN"
    elif supporting > contradicting:
        verdict = "SUPPORTED"
    elif contradicting > supporting:
        verdict = "CONTRADICTED"
    else:
        verdict = "UNCERTAIN"

    return VerificationResult(
        sources_checked=len(evidence),
        supporting=supporting,
        contradicting=contradicting,
        unrelated=unrelated,
        verdict=verdict,
        evidence=evidence,
        processing_time_ms=int((time.monotonic() - start) * 1000),
    )
