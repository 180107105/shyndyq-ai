import { useState } from 'react';
import { C, S, SANS, SERIF } from '../../tokens';
import { SAMPLE_TEXT, SAMPLE_SOURCES, tdLabel, tdValue } from '../../tokens';
import { SAMPLE_SOURCES as SS } from '../../data';
import { tdLabel as TDL, tdValue as TDV } from '../../tokens';
import LoadingPanel from '../LoadingPanel';
import VerdictCard from '../VerdictCard';
import SourcesCard from '../SourcesCard';
import ResultsPlaceholder from '../ResultsPlaceholder';

export default function UrlTab({ analyzed, loading, start, finish }) {
  const [url, setUrl] = useState('https://t.me/almaty_news_unofficial/8421');

  return (
    <div style={S.twoCol} className="two-col">
      <div style={S.card}>
        <div style={S.cardHead}>Public post URL</div>
        <div style={S.inputRow}>
          <input
            style={S.urlInput}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://t.me/... or https://www.instagram.com/p/..."
          />
          <button
            style={{ ...S.btn, opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            onClick={() => start(url)}
          >
            {loading ? 'Fetching…' : 'Fetch'}
          </button>
        </div>

        {analyzed ? (
          <div style={{ marginTop: 26 }}>
            <div style={{ ...S.cardHead, marginBottom: 12 }}>
              <span style={{ ...S.dot(C.real), width: 7, height: 7 }} />
              Extracted — public post
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SERIF, fontSize: 15 }}>
              <tbody>
                <tr><td style={TDL}>Account</td><td style={TDV}>@almaty_news_unofficial</td></tr>
                <tr><td style={TDL}>Posted</td><td style={TDV}>14 May 2026, 21:43 GMT+5</td></tr>
                <tr><td style={TDL}>Followers</td><td style={TDV}>12,408</td></tr>
                <tr><td style={TDL}>Comments fetched</td><td style={TDV}>1,247 of 1,247</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: 22 }}>
              <div style={S.cardHead}>Caption preview</div>
              <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, margin: 0, color: C.ink }}>
                «СРОЧНО!!! Власти скрывают: новая вакцина, которую ввели в Казахстане в прошлом месяце, содержит микрочипы — это уже подтвердили независимые эксперты из Европы...»
              </p>
            </div>
          </div>
        ) : (
          <p style={{ ...S.placeholder, marginTop: 28 }}>
            Paste a public Telegram, Instagram, or X URL. Shyndyq will extract the post, caption, and the first few thousand comments.
          </p>
        )}
      </div>

      <div style={S.sideStack}>
        {loading ? (
          <LoadingPanel tabId="url" title="Fetching and analyzing post" onDone={finish} />
        ) : analyzed ? (
          <>
            <VerdictCard
              verdict="fake"
              confidence={88}
              sampleText={SAMPLE_TEXT}
              commentSentiment="Comment patterns appear amplified rather than organic. 38% of supporting comments were posted within a 9-minute window by accounts created in the last 60 days. Sentiment skews strongly emotional (fear, urgency) — a typical signature of coordinated sharing."
            />
            <SourcesCard items={SS} />
          </>
        ) : (
          <ResultsPlaceholder note="Once a post is fetched, you'll see the model verdict, a confidence bar, comment-pattern analysis, and source cross-checks." />
        )}
      </div>
    </div>
  );
}
