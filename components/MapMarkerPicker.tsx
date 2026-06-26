// Interactive map used wherever a visitor needs to mark a location —
// colony registration, lost-cat sightings, general reports — by
// dragging a pin instead of typing an address. Centered on Natal, RN.
// Replaces a free-text address field entirely: typing addresses ran
// into real gaps in OpenStreetMap's house-number coverage for Natal, so
// "drag the pin to the right spot" is both simpler and more reliable.
"use client";

import { useEffect } from "react";
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

// Defaults the pin to the map center as soon as the map mounts, if the
// parent hasn't already set a position — so there's always a visible,
// draggable pin instead of an empty map waiting for a first click.
function DefaultPositionSetter({
  position,
  onPick,
}: {
  position: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}) {
  useEffect(() => {
    if (!position) onPick(NATAL_CENTER[0], NATAL_CENTER[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only ever needs to run once, on mount
  }, []);
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
    <MapContainer center={position ?? NATAL_CENTER} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickListener onPick={onPick} />
      <DefaultPositionSetter position={position} onPick={onPick} />
      {position && (
        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const latlng = event.target.getLatLng();
              onPick(latlng.lat, latlng.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
