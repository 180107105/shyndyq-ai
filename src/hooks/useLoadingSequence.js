import { useState, useEffect, useRef } from 'react';

export function useLoadingSequence(active, steps, onDone) {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const totalRef = useRef(steps.reduce((a, s) => a + s.t, 0));

  useEffect(() => {
    if (!active) { setStepIndex(0); setElapsed(0); return; }
    totalRef.current = steps.reduce((a, s) => a + s.t, 0);
    let cancelled = false;
    let i = 0;
    setStepIndex(0);
    setElapsed(0);
    const tickStart = Date.now();
    const ticker = setInterval(() => {
      if (!cancelled) setElapsed(Date.now() - tickStart);
    }, 100);
    const next = () => {
      if (cancelled) return;
      if (i >= steps.length) { clearInterval(ticker); onDone && onDone(); return; }
      setStepIndex(i);
      const dur = steps[i].t;
      i += 1;
      setTimeout(next, dur);
    };
    next();
    return () => { cancelled = true; clearInterval(ticker); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const total = totalRef.current;
  const pct = Math.min(100, Math.round((elapsed / total) * 100));
  return { stepIndex, pct, elapsed, total };
}
