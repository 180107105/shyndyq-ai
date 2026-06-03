import { S } from '../tokens';

export default function Nav({ page, setPage }) {
  return (
    <nav style={S.nav}>
      <div style={S.navInner}>
        <span style={S.logo} onClick={() => setPage('analyzer')}>
          <span style={S.logoMark}>Ш</span>
          <span style={S.logoWord}>Shyndyq</span>
          <span style={S.logoSub}>AI</span>
        </span>
        <div style={S.navLinks}>
          <span style={S.navLink(page === 'analyzer')} onClick={() => setPage('analyzer')}>Analyzer</span>
          <span style={S.navLink(page === 'about')} onClick={() => setPage('about')}>About</span>
        </div>
      </div>
    </nav>
  );
}
