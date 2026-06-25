// Interactive map used in /colony/new to let the user place a marker at
// the colony's exact location by clicking the map. Centered on Natal, RN.
"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const NATAL_CENTER: [number, number] = [-5.7945, -35.211];

const markerIcon = L.divIcon({
  className: "",
  html: '<span class="felines-pin" style="background:#C4704F"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Listens for map clicks and reports the clicked coordinates to the parent.
function ClickListener({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapMarkerPicker({
  position,
  onPick,
}: {
  position: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={NATAL_CENTER} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickListener onPick={onPick} />
      {position && <Marker position={position} icon={markerIcon} />}
    </MapContainer>
  );
}
