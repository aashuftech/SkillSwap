import React, { useEffect, useRef, useState } from "react";

/**
 * Animates a number up from 0 once it scrolls into view.
 * Accepts a display value like "10K+" or "4.9/5" — it pulls the
 * leading number out to animate and keeps the rest of the string
 * (suffix, slash-rating, etc.) as static text around it.
 */
const CountUp = ({ value, duration = 1400, className = "" }) => {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState(null);

  const match = String(value).match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : null;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (target === null) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  useEffect(() => {
    if (!started || target === null) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay((target * eased).toFixed(decimals));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration, decimals]);

  if (target === null) {
    // Non-numeric value (shouldn't normally happen) — just render it.
    return <span ref={ref} className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={`jb-counter ${className}`}>
      {display ?? (0).toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default CountUp;
