// Client-only wrapper that lazy-loads MapMarkerPicker with SSR disabled,
// for the same reason MapShell exists for the read-only colony map.
"use client";

import dynamic from "next/dynamic";

const MapMarkerPicker = dynamic(() => import("@/components/map/MapMarkerPicker"), {
  ssr: false,
  loading: () => (
    <div className="felines-skeleton relative flex h-full w-full items-center justify-center">
      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-felines-text-secondary">
        Carregando mapa...
      </span>
    </div>
  ),
});

export default function MapMarkerPickerShell(props: {
  position: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return <MapMarkerPicker {...props} />;
}
