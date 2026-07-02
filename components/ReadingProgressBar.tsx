// Thin fixed progress bar at the top of an article page, tracking how
// far the reader has scrolled through the body. Disappears once the
// article has been scrolled to the end.
"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(100);
        return;
      }
      const percent = (window.scrollY / scrollable) * 100;
      setProgress(Math.min(100, Math.max(0, percent)));
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress >= 100) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
      <div
        className="h-1 bg-felines-accent transition-[width]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
