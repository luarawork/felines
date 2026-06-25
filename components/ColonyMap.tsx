// Interactive colony map for Felines, centered on Natal, RN.
// Renders colony pins (terracotta), sighting pins (gray) and emergency
// pins (red, pulsing) using Leaflet. Colony pins use the blurred
// coordinates for anonymous users so exact locations stay protected by RLS.
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabaseClient";

// Natal, RN map center and default zoom, per the Felines spec.
const NATAL_CENTER: [number, number] = [-5.7945, -35.211];
const DEFAULT_ZOOM = 13;

type Colony = {
  id: string;
  name: string;
  narrative: string | null;
  latitude_blurred: number;
  longitude_blurred: number;
  castration_status: "none" | "partial" | "full";
};

type EmergencyReport = {
  id: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
};

// Builds a circular Leaflet divIcon with the given color. Emergency pins
// get an extra CSS class that drives a pulsing animation (see globals.css).
function buildPinIcon(color: string, pulsing = false) {
  return L.divIcon({
    className: "",
    html: `<span class="${
      pulsing ? "felines-pin felines-pin-pulse" : "felines-pin"
    }" style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const colonyIcon = buildPinIcon("#C4704F");
const sightingIcon = buildPinIcon("#6B6B6B");
const emergencyIcon = buildPinIcon("#C0392B", true);

const EMERGENCY_REPORT_TYPES = [
  "injured_sick",
  "suspected_poisoning",
  "suspected_abuse",
  "disease_outbreak",
  "threat_to_colony",
];

const CASTRATION_LABELS: Record<Colony["castration_status"], string> = {
  none: "Nenhum gato castrado",
  partial: "Castração parcial",
  full: "Colônia totalmente castrada",
};

export default function ColonyMap() {
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [sightings, setSightings] = useState<EmergencyReport[]>([]);

  // Load colonies (blurred coordinates) and open reports (emergencies and
  // sightings) from Supabase once the map mounts in the browser.
  useEffect(() => {
    async function loadMapData() {
      const { data: colonyData } = await supabase
        .from("colonies")
        .select("id, name, narrative, latitude_blurred, longitude_blurred, castration_status");

      if (colonyData) setColonies(colonyData as Colony[]);

      const { data: reportData } = await supabase
        .from("reports")
        .select("id, type, latitude, longitude")
        .eq("status", "open")
        .in("type", [...EMERGENCY_REPORT_TYPES, "sighting"]);

      if (reportData) {
        setEmergencies(
          (reportData as EmergencyReport[]).filter((r) =>
            EMERGENCY_REPORT_TYPES.includes(r.type)
          )
        );
        setSightings(
          (reportData as EmergencyReport[]).filter((r) => r.type === "sighting")
        );
      }
    }

    loadMapData();
  }, []);

  return (
    <MapContainer
      center={NATAL_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {colonies.map((colony) => (
        <Marker
          key={colony.id}
          position={[colony.latitude_blurred, colony.longitude_blurred]}
          icon={colonyIcon}
        >
          <Popup>
            <strong>{colony.name}</strong>
            <p className="mt-1 text-sm">{colony.narrative}</p>
            <p className="mt-1 text-xs text-felines-text-secondary">
              {CASTRATION_LABELS[colony.castration_status]}
            </p>
            <a
              href={`/colony/${colony.id}`}
              className="mt-2 inline-block text-xs font-medium text-felines-accent"
            >
              Ver colônia →
            </a>
          </Popup>
        </Marker>
      ))}

      {sightings
        .filter((report) => report.latitude != null && report.longitude != null)
        .map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude as number, report.longitude as number]}
            icon={sightingIcon}
          >
            <Popup>
              <strong>Avistamento de gato</strong>
            </Popup>
          </Marker>
        ))}

      {emergencies
        .filter((report) => report.latitude != null && report.longitude != null)
        .map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude as number, report.longitude as number]}
            icon={emergencyIcon}
          >
            <Popup>
              <strong>Alerta: {report.type.replace(/_/g, " ")}</strong>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
