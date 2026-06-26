// Animated counting number for stat strips, e.g. "10M". Counts up from
// 0 once the element scrolls into view, then stays put — re-triggering
// every time the user scrolls past it would be distracting, not
// impressive. Parses a leading numeric portion of `value` so labels
// like "10M" or "40%" animate the digits while keeping their suffix.
"use client";

import { useEffect, useRef, useState } from "react";

function parseValue(value: string): { number: number; suffix: string; prefix: string } {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (!match) return { number: 0, suffix: "", prefix: value };
  const [, prefix, numberPart, suffix] = match;
  return { number: parseFloat(numberPart), suffix, prefix };
}

export default function CountUpStat({ value }: { value: string }) {
  const { number, suffix, prefix } = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [displayNumber, setDisplayNumber] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const durationMs = 800;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNumber(number * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, number]);

  const decimals = number % 1 !== 0 ? 1 : 0;

  return (
    <span ref={ref}>
      {prefix}
      {displayNumber.toFixed(decimals)}
      {suffix}
    </span>
  );
}
