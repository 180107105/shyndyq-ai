import { useState } from 'react';
import { C, S, SANS } from '../../tokens';
import { SAMPLE_TEXT, SAMPLE_SOURCES } from '../../data';
import LoadingPanel from '../LoadingPanel';
import VerdictCard from '../VerdictCard';
import SourcesCard from '../SourcesCard';
import ResultsPlaceholder from '../ResultsPlaceholder';

export default function TextTab({ analyzed, loading, start, finish }) {
  const [text, setText] = useState(SAMPLE_TEXT);

  return (
    <div style={S.twoCol} className="two-col">
      <div style={S.card}>
        <div style={S.cardHead}>Paste a post, article, or message</div>
        <textarea
          style={S.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste Russian or Kazakh text here — a Telegram message, Instagram caption, news quote..."
          disabled={loading}
        />
        <div style={S.cardFoot}>
          <span style={S.count}>{text.length.toLocaleString()} / 5,000 characters</span>
          <button
            style={{ ...S.btn, opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            onClick={() => start(text.slice(0, 120))}
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      </div>

      <div style={S.sideStack}>
        {loading ? (
          <LoadingPanel tabId="text" title="Analyzing text" onDone={finish} />
        ) : analyzed ? (
          <>
            <VerdictCard verdict="fake" confidence={91} sampleText={text} />
            <SourcesCard items={SAMPLE_SOURCES} />
          </>
        ) : (
          <ResultsPlaceholder note="Paste any text above and press Analyze. The model returns a verdict, confidence score, and a cross-check against three Kazakhstani news outlets." />
        )}
      </div>
    </div>
  );
}
