import { useState } from 'react';
import { C, S, SANS, SERIF } from '../../tokens';
import { CLAIM_SOURCES } from '../../data';
import { SourceIcon } from '../Icons';
import LoadingPanel from '../LoadingPanel';
import ResultsPlaceholder from '../ResultsPlaceholder';

export default function ClaimTab({ analyzed, loading, start, finish }) {
  const [claim, setClaim] = useState('Новая вакцина в Казахстане содержит микрочипы, и врачи в Алматы массово увольняются.');

  return (
    <div style={S.twoCol} className="two-col">
      <div style={S.card}>
        <div style={S.cardHead}>State a single claim</div>
        <textarea
          style={{ ...S.textarea, minHeight: 220 }}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Enter a specific claim to check against Kazakh news sources..."
        />
        <div style={S.cardFoot}>
          <span style={S.count}>One claim at a time produces the best results.</span>
          <button
            style={{ ...S.btn, opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            onClick={() => start(claim.slice(0, 120))}
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </div>

        {analyzed && (
          <div style={{ marginTop: 28 }}>
            <div style={S.cardHead}>The claim, as parsed</div>
            <p style={{
              fontFamily: SERIF,
              fontSize: 18,
              fontStyle: 'italic',
              lineHeight: 1.55,
              margin: 0,
              color: C.ink,
              borderLeft: `2px solid ${C.borderStrong}`,
              paddingLeft: 16,
            }}>
              &ldquo;{claim}&rdquo;
            </p>
          </div>
        )}
      </div>

      <div style={S.sideStack}>
        {loading ? (
          <LoadingPanel tabId="claim" title="Verifying claim against sources" onDone={finish} />
        ) : analyzed ? (
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
        ) : (
          <ResultsPlaceholder note="Enter a specific factual claim. Shyndyq will find related coverage in Kazakhstani news outlets and label each article as Supports, Contradicts, or Unrelated." />
        )}
      </div>
    </div>
  );
}
