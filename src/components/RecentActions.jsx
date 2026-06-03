import { C, S, SANS, SERIF } from '../tokens';
import { KIND_META, VERDICT_META } from '../data';

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 7)  return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function RecentActions({ entries, onOpen }) {
  return (
    <section style={{ padding: '60px 0 24px', borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.015em', fontWeight: 400, margin: 0, color: C.ink }}>
            Recent actions
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkFaint, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '8px 0 0' }}>
            {entries.length} {entries.length === 1 ? 'report' : 'reports'} on this device
          </p>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 11, color: C.inkFaint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Newest first
        </span>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="ra-header" style={{
          display: 'grid',
          gridTemplateColumns: '110px 90px minmax(0, 1fr) 170px 130px',
          padding: '12px 22px',
          borderBottom: `1px solid ${C.border}`,
          fontFamily: SANS,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.inkFaint,
          gap: 18,
        }}>
          <span>When</span>
          <span>Kind</span>
          <span>Input</span>
          <span>Verdict</span>
          <span style={{ textAlign: 'right' }}>Report</span>
        </div>

        {entries.map((e, i) => {
          const v = VERDICT_META[e.verdict] || VERDICT_META.uncertain;
          return (
            <button
              key={e.id}
              onClick={() => onOpen(e)}
              className="ra-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 90px minmax(0, 1fr) 170px 130px',
                width: '100%',
                padding: '18px 22px',
                background: 'transparent',
                border: 'none',
                borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
                textAlign: 'left',
                cursor: 'pointer',
                alignItems: 'center',
                gap: 18,
                color: C.ink,
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.inkMute }}>
                {formatRelative(e.ts)}
              </span>
              <span style={{
                fontFamily: SANS,
                fontSize: 10,
                letterSpacing: '0.14em',
                color: C.ink,
                border: `1px solid ${C.borderStrong}`,
                padding: '4px 8px',
                justifySelf: 'start',
              }}>
                {KIND_META[e.kind].short}
              </span>
              <span style={{
                fontFamily: SERIF,
                fontSize: 15.5,
                color: C.ink,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.35,
              }}>
                {e.preview}
                {e.detail && (
                  <span style={{ display: 'block', fontFamily: SANS, fontSize: 11, color: C.inkFaint, marginTop: 4, letterSpacing: '0.02em', whiteSpace: 'normal' }}>
                    {e.detail}
                  </span>
                )}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={S.dot(v.color)} />
                <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, letterSpacing: '0.04em' }}>
                  {v.label}
                  {e.kind === 'deep' && e.score != null && (
                    <span style={{ color: C.inkFaint }}> · {e.score}/100</span>
                  )}
                  {e.kind !== 'deep' && e.confidence != null && (
                    <span style={{ color: C.inkFaint }}> · {e.confidence}%</span>
                  )}
                </span>
              </span>
              <span style={{
                fontFamily: SANS,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: C.ink,
                textAlign: 'right',
                borderBottom: `1px solid ${C.ink}`,
                justifySelf: 'end',
                paddingBottom: 2,
              }}>
                Open report →
              </span>
            </button>
          );
        })}

        {entries.length === 0 && (
          <div style={{ padding: '36px 22px' }}>
            <p style={{ ...S.placeholder, margin: 0 }}>No actions yet. Your past reports will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
