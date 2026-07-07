// Client-only wrapper that lazy-loads ColonyMap with SSR disabled.
// next/dynamic with ssr: false is only allowed inside a Client Component,
// so this thin wrapper exists to keep the /map page itself a server component.
"use client";

import dynamic from "next/dynamic";

const ColonyMap = dynamic(() => import("@/components/map/ColonyMap"), {
  ssr: false,
  loading: () => (
    <div className="felines-skeleton relative flex h-full w-full items-center justify-center">
      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-felines-text-secondary">
        Carregando mapa...
      </span>
    </div>
  ),
});

export default function MapShell({
  onCenterChange,
  compact,
}: {
  onCenterChange?: (lat: number, lon: number) => void;
  compact?: boolean;
}) {
  return <ColonyMap onCenterChange={onCenterChange} compact={compact} />;
}
