import { useEffect } from 'react';
import { C, S, SANS, SERIF, MONO } from '../tokens';
import { KIND_META, VERDICT_META, SAMPLE_TEXT, SAMPLE_SOURCES, CLAIM_SOURCES, SIGNALS } from '../data';
import { SourceIcon } from './Icons';
import VerdictCard from './VerdictCard';
import SourcesCard from './SourcesCard';

function ReportBody({ entry, verdictMeta }) {
  const v = verdictMeta;

  if (entry.kind === 'text') {
    return (
      <>
        <div style={S.card}>
          <div style={S.cardHead}>Submitted text</div>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.ink, margin: 0 }}>{entry.preview}</p>
        </div>
        <VerdictCard verdict={entry.verdict === 'real' ? 'real' : 'fake'} confidence={entry.confidence ?? 91} sampleText={SAMPLE_TEXT} />
        <SourcesCard items={SAMPLE_SOURCES} />
      </>
    );
  }

  if (entry.kind === 'url') {
    return (
      <>
        <div style={S.card}>
          <div style={S.cardHead}>Source</div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: C.ink, wordBreak: 'break-all' }}>{entry.preview}</div>
        </div>
        <VerdictCard
          verdict={entry.verdict === 'real' ? 'real' : 'fake'}
          confidence={entry.confidence ?? 88}
          sampleText={SAMPLE_TEXT}
          commentSentiment="Comment patterns appear amplified rather than organic. 38% of supporting comments were posted within a 9-minute window by accounts created in the last 60 days."
        />
        <SourcesCard items={SAMPLE_SOURCES} />
      </>
    );
  }

  if (entry.kind === 'claim') {
    return (
      <>
        <div style={S.card}>
          <div style={S.cardHead}>Claim, as parsed</div>
          <p style={{ fontFamily: SERIF, fontSize: 18, fontStyle: 'italic', lineHeight: 1.55, margin: 0, color: C.ink, borderLeft: `2px solid ${C.borderStrong}`, paddingLeft: 16 }}>
            &ldquo;{entry.preview}&rdquo;
          </p>
        </div>
        <div style={S.card}>
          <div style={S.cardHead}>Sources matching this claim</div>
          {CLAIM_SOURCES.map((it, i) => (
            <div key={i} style={{ padding: '18px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                <SourceIcon kind={it.kind} />
                <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.08em', color: C.inkMute, textTransform: 'uppercase' }}>{it.name}</span>
                <span style={{ fontFamily: SANS, fontSize: 11, color: C.inkFaint, marginLeft: 'auto' }}>{it.date}</span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.4, color: C.ink, marginBottom: 6 }}>{it.title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: C.inkMute, lineHeight: 1.55, marginBottom: 8 }}>{it.snippet}</div>
              <div style={S.sourceLabel(it.color)}>{it.label}</div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // deep
  return (
    <>
      <div style={S.card}>
        <div style={S.cardHead}>Inspected URL</div>
        <div style={{ fontFamily: MONO, fontSize: 14, color: C.ink, wordBreak: 'break-all' }}>{entry.preview}</div>
      </div>
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
            <div style={{ fontFamily: SERIF, fontSize: 86, lineHeight: 1, letterSpacing: '-0.03em', color: v.color }}>
              {entry.score ?? 23}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: C.inkFaint, marginTop: 4, letterSpacing: '0.1em' }}>/ 100</div>
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 24, lineHeight: 1.3, color: C.ink, marginBottom: 8, letterSpacing: '-0.01em' }}>
              {v.label} — multiple risk signals detected.
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
    </>
  );
}

export default function ReportModal({ entry, onClose }) {
  useEffect(() => {
    if (!entry) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [entry, onClose]);

  if (!entry) return null;
  const meta = KIND_META[entry.kind];
  const v = VERDICT_META[entry.verdict] || VERDICT_META.uncertain;
  const dt = new Date(entry.ts);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 26, 26, 0.42)',
        zIndex: 50,
        overflowY: 'auto',
        padding: '40px 24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          maxWidth: 880,
          margin: '0 auto',
          border: `1px solid ${C.borderStrong}`,
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        }}
        role="dialog"
        aria-modal="true"
      >
        <div style={{
          padding: '26px 36px 22px',
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: 8 }}>
              Report №{entry.id.replace(/^h-/, '').padStart(4, '0')} · {meta.label}
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.15, letterSpacing: '-0.015em', fontWeight: 400, margin: 0, color: C.ink }}>
              {entry.preview.length > 90 ? entry.preview.slice(0, 90) + '…' : entry.preview}
            </h2>
            <div style={{ fontFamily: SANS, fontSize: 12, color: C.inkMute, marginTop: 10, letterSpacing: '0.02em' }}>
              {dt.toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {entry.detail && <span> · {entry.detail}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              padding: '8px 14px',
              fontFamily: SANS,
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.ink,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
            aria-label="Close report"
          >
            Close ✕
          </button>
        </div>

        <div style={{ padding: '32px 36px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <ReportBody entry={entry} verdictMeta={v} />
        </div>

        <div style={{
          padding: '16px 36px',
          borderTop: `1px solid ${C.border}`,
          background: C.surface,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: SANS,
          fontSize: 11,
          color: C.inkFaint,
          letterSpacing: '0.06em',
        }}>
          <span>Generated by Shyndyq AI · Model v2.4 · Retrieval index 14 May 2026</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
