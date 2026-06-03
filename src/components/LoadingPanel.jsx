import { useState, useEffect } from 'react';
import { C, S, SANS, SERIF, MONO } from '../tokens';
import { LOADING_STEPS } from '../data';
import { useLoadingSequence } from '../hooks/useLoadingSequence';
import { IconCheck, IconDash } from './Icons';

function BlinkDot() {
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8,
      background: C.ink,
      borderRadius: '50%',
      animation: 'sh-blink 900ms steps(2, end) infinite',
      transform: 'translateY(-1px)',
    }} />
  );
}

function Ellipsis() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN(v => (v % 3) + 1), 380);
    return () => clearInterval(id);
  }, []);
  return <span style={{ display: 'inline-block', width: 18, textAlign: 'left' }}>{'.'.repeat(n)}</span>;
}

export default function LoadingPanel({ tabId, title, onDone, compact }) {
  const steps = LOADING_STEPS[tabId] || LOADING_STEPS.text;
  const { stepIndex, pct, elapsed, total } = useLoadingSequence(true, steps, onDone);

  return (
    <div style={{ ...S.card, padding: compact ? 24 : 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={S.cardHead}>{title || 'Analyzing'}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint, letterSpacing: '0.04em' }}>
          {(elapsed / 1000).toFixed(1)}s / ~{(total / 1000).toFixed(0)}s
        </div>
      </div>

      <div style={{ height: 2, background: '#EEEAE0', position: 'relative', marginBottom: 22 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: C.ink, transition: 'width 120ms linear' }} />
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {steps.map((s, i) => {
          const status = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending';
          return (
            <li key={i} style={{
              display: 'grid',
              gridTemplateColumns: '22px 1fr',
              gap: 12,
              alignItems: 'baseline',
              padding: '9px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
              opacity: status === 'pending' ? 0.45 : 1,
            }}>
              <span style={{ paddingTop: 2 }}>
                {status === 'done'    && <IconCheck color={C.ink} />}
                {status === 'active'  && <BlinkDot />}
                {status === 'pending' && <IconDash color={C.inkFaint} />}
              </span>
              <span>
                <span style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  color: status === 'pending' ? C.inkFaint : C.ink,
                  fontWeight: status === 'active' ? 600 : 400,
                  letterSpacing: '0.01em',
                }}>
                  {s.label}{status === 'active' ? <Ellipsis /> : ''}
                </span>
                {(status === 'active' || status === 'done') && (
                  <span style={{
                    display: 'block',
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: C.inkMute,
                    marginTop: 3,
                    lineHeight: 1.45,
                  }}>{s.detail}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p style={{ fontFamily: SANS, fontSize: 11, color: C.inkFaint, marginTop: 18, marginBottom: 0, letterSpacing: '0.04em' }}>
        Please don&apos;t close this tab while analysis is running.
      </p>
    </div>
  );
}
