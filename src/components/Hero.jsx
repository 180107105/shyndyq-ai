import { S } from '../tokens';

export default function Hero() {
  return (
    <header style={S.hero}>
      <h1 style={S.heroTitle}>Is this real?<br />Let&apos;s check.</h1>
      <p style={S.heroSub}>
        Shyndyq AI evaluates posts, articles, and claims circulating on Kazakh social media —
        cross-referencing them against trusted Kazakhstani news sources and a trained language model.
      </p>
    </header>
  );
}
