import { S } from '../tokens';

const TABS = [
  { id: 'text',  label: 'Analyze text' },
  { id: 'url',   label: 'Check URL' },
  { id: 'claim', label: 'Verify claim' },
  { id: 'deep',  label: 'Deep inspect' },
];

export default function Tabs({ tab, setTab, onChange }) {
  return (
    <div style={S.tabs} role="tablist">
      {TABS.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          style={S.tab(tab === t.id)}
          onClick={() => { setTab(t.id); onChange && onChange(); }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
