import { useState } from 'react';
import { C, S, SANS, SERIF } from '../../tokens';
import { SIGNALS } from '../../data';
import LoadingPanel from '../LoadingPanel';

export default function DeepTab({ analyzed, loading, start, finish }) {
  const [url, setUrl] = useState('https://t.me/almaty_news_unofficial/8421');

  return (
    <div style={{ padding: '32px 0 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={S.card}>
        <div style={S.cardHead}>Deep inspect a public account or post</div>
        <div style={S.inputRow}>
          <input
            style={S.urlInput}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://t.me/... or https://www.instagram.com/..."
          />
          <button
            style={{ ...S.btn, opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            onClick={() => start(url)}
          >
            {loading ? 'Inspecting…' : 'Inspect'}
          </button>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkFaint, marginTop: 12 }}>
          Deep inspect runs nine behavioural signals against the account behind a post — typically takes 30–45 seconds.
        </p>
      </div>

      {loading ? (
        <LoadingPanel tabId="deep" title="Running deep inspection" onDone={finish} />
      ) : analyzed ? (
        <>
          <div style={{ ...S.card, padding: 0 }}>
            <div style={{
              padding: '28px 24px 22px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 28,
              alignItems: 'center',
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div>
                <div style={{ ...S.cardHead, marginBottom: 6 }}>Credibility score</div>
                <div style={{ fontFamily: SERIF, fontSize: 86, lineHeight: 1, letterSpacing: '-0.03em', color: C.fake }}>23</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: C.inkFaint, marginTop: 4, letterSpacing: '0.1em' }}>/ 100</div>
              </div>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 24, lineHeight: 1.3, color: C.ink, marginBottom: 8, letterSpacing: '-0.01em' }}>
                  Low — multiple risk signals detected.
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: C.inkMute, lineHeight: 1.6, maxWidth: 540 }}>
                  This account exhibits four out of six high-risk patterns commonly associated with low-credibility distribution networks operating on Kazakh-language Telegram.
                </div>
              </div>
            </div>

            {SIGNALS.map((sig, i) => (
              <div key={i} style={{ ...S.signalRow, background: i % 2 === 1 ? C.rowAlt : 'transparent' }}>
                <div>
                  <div style={S.signalName}>{sig.name}</div>
                  <div style={{ ...S.signalDetail, marginTop: 4 }}>{sig.detail}</div>
                </div>
                <div />
                <div style={S.signalValue(sig.color)}>{sig.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ ...S.card, maxWidth: 520, background: C.rowAlt }}>
              <div style={S.cardHead}>Summary</div>
              <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: C.ink, margin: 0 }}>
                The account behind this post was created two months ago, posts across unrelated topics at an unusually high frequency, and is amplified by a commenter base of which more than a third shows automation patterns. Treat content from this account as low-credibility unless independently corroborated by a verified outlet.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div style={{ ...S.card, minHeight: 220 }}>
          <div style={S.cardHead}>Inspection report</div>
          <p style={S.placeholder}>The deep inspection report will appear here once a URL is submitted.</p>
        </div>
      )}
    </div>
  );
}
