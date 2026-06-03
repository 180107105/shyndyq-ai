import { C, SERIF } from '../tokens';

const FAKE_SIGNALS = ['СРОЧНО!!!', 'скрывают', 'микрочипы', 'независимые эксперты', 'массово увольняются', 'Поделитесь, пока не удалили!!!'];
const NEUTRAL = ['Казахстане', 'Министерство здравоохранения', 'Алматы', 'Астане', 'вакцина'];

export default function Highlighted({ text }) {
  const all = [
    ...FAKE_SIGNALS.map(s => ({ s, kind: 'fake' })),
    ...NEUTRAL.map(s => ({ s, kind: 'neutral' })),
  ].sort((a, b) => b.s.length - a.s.length);

  let segments = [{ text, kind: null }];
  for (const { s, kind } of all) {
    const next = [];
    for (const seg of segments) {
      if (seg.kind) { next.push(seg); continue; }
      const parts = seg.text.split(s);
      parts.forEach((p, i) => {
        if (p) next.push({ text: p, kind: null });
        if (i < parts.length - 1) next.push({ text: s, kind });
      });
    }
    segments = next;
  }

  return (
    <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.65, color: C.ink, margin: 0 }}>
      {segments.map((seg, i) => {
        if (seg.kind === 'fake') {
          return (
            <span key={i} style={{ background: C.fakeTint, padding: '1px 3px', borderBottom: `1px solid ${C.fakeTintStrong}` }}>
              {seg.text}
            </span>
          );
        }
        if (seg.kind === 'neutral') {
          return <span key={i} style={{ background: C.blueTint, padding: '1px 3px' }}>{seg.text}</span>;
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </p>
  );
}
