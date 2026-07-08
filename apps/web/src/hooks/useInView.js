// Scroll-reveal trigger. Uses IntersectionObserver (never a scroll listener - skill 5.D)
// and collapses to "always visible" under prefers-reduced-motion (skill 6.B).
import { useEffect, useRef, useState } from 'react';

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useInView({ amount = 0.18, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold: amount }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [amount, once]);

  return [ref, inView];
}
