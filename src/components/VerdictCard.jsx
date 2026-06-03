import { C, S, SANS, SERIF } from '../tokens';
import { SAMPLE_TEXT } from '../data';
import Highlighted from './Highlighted';

export default function VerdictCard({ verdict, confidence, sampleText, commentSentiment }) {
  const isFake = verdict === 'fake';
  const color = isFake ? C.fake : C.real;
  const label = isFake ? 'Likely fake' : 'Likely real';

  return (
    <div style={S.card}>
      <div style={S.cardHead}>Verdict</div>
      <h3 style={S.verdictTitle}>
        <span style={S.dot(color)} />
        {label}
      </h3>

      <div style={S.metaRow}>
        <span>Model confidence</span>
        <span style={{ color: C.ink, fontWeight: 600 }}>{confidence}%</span>
      </div>
      <div style={S.barTrack}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${confidence}%`, background: color }} />
      </div>

      {sampleText && (
        <>
          <div style={S.cardHead}>Key phrases</div>
          <Highlighted text={sampleText} />
          <div style={{ display: 'flex', gap: 18, marginTop: 14, fontFamily: SANS, fontSize: 11, color: C.inkFaint, letterSpacing: '0.04em' }}>
            <span>
              <span style={{ display: 'inline-block', width: 10, height: 10, background: C.fakeTint, marginRight: 6, verticalAlign: 'middle' }} />
              Fake-signal language
            </span>
            <span>
              <span style={{ display: 'inline-block', width: 10, height: 10, background: C.blueTint, marginRight: 6, verticalAlign: 'middle' }} />
              Named entities
            </span>
          </div>
        </>
      )}

      {commentSentiment && (
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          <div style={S.cardHead}>Comment sentiment</div>
          <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: C.inkMute, margin: 0 }}>
            {commentSentiment}
          </p>
        </div>
      )}
    </div>
  );
}
