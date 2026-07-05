// Smart "back" link used across the app (articles, plants, contacts,
// and anywhere else a page needs a way back) — instead of always
// pointing at a single hardcoded destination, it returns the visitor to
// wherever they actually came from within the app (e.g. /profile, if
// that's where they clicked in from), falling back to a sensible
// default only when there's no in-app history to go back to (a direct
// visit, a shared link opened in a new tab, etc.).
"use client";

import { useRouter } from "next/navigation";

export default function BackLink({
  fallbackHref,
  className,
  children,
}: {
  fallbackHref: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (open in new tab, etc.) behave like a normal link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <a href={fallbackHref} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
