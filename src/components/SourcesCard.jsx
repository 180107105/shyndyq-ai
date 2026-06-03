import { C, S } from '../tokens';
import { SourceIcon } from './Icons';

export default function SourcesCard({ items, title = 'Sources checked' }) {
  return (
    <div style={S.card}>
      <div style={S.cardHead}>{title}</div>
      {items.map((it, i) => (
        <div key={i} style={{
          ...S.source,
          borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
          paddingTop: i === 0 ? 6 : 14,
        }}>
          <div style={{ paddingTop: 4 }}><SourceIcon kind={it.kind} /></div>
          <div>
            <div style={S.sourceName}>{it.name}</div>
            <div style={S.sourceSnippet}>{it.snippet}</div>
          </div>
          <div style={S.sourceLabel(it.color)}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}
