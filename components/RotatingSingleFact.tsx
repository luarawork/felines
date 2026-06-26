// Shows one fact at a time from a pool, swapping to the next every few
// seconds with a small fade/slide animation — replaces a static row of
// every fact at once, so the colony page doesn't open with a wall of
// pills competing for attention.
"use client";

import { useEffect, useState } from "react";
import FactChip from "@/components/FactChip";

export default function RotatingSingleFact({ facts }: { facts: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (facts.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((previous) => (previous + 1) % facts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [facts.length]);

  if (facts.length === 0) return null;

  return (
    <div key={index} className="felines-step-in inline-block">
      <FactChip text={facts[index]} />
    </div>
  );
}
