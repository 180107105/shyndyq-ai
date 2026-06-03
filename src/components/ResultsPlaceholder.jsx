import { C, S, SANS } from '../tokens';

export default function ResultsPlaceholder({ note }) {
  return (
    <div style={{ ...S.card, minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={S.cardHead}>Results</div>
      <p style={S.placeholder}>Results will appear here.</p>
      <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkFaint, marginTop: 10, lineHeight: 1.6 }}>
        {note}
      </p>
    </div>
  );
}
