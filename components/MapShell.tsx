// Client-only wrapper that lazy-loads ColonyMap with SSR disabled.
// next/dynamic with ssr: false is only allowed inside a Client Component,
// so this thin wrapper exists to keep the /map page itself a server component.
"use client";

import dynamic from "next/dynamic";

const ColonyMap = dynamic(() => import("@/components/ColonyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-felines-text-secondary">
      Carregando mapa...
    </div>
  ),
});

export default function MapShell({
  onCenterChange,
}: {
  onCenterChange?: (lat: number, lon: number) => void;
}) {
  return <ColonyMap onCenterChange={onCenterChange} />;
}
