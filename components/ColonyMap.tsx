// Interactive colony map for Felines, centered on Natal, RN.
// Renders colony pins (terracotta), sighting pins (gray) and emergency
// pins (red, pulsing) using Leaflet. Includes a search box (by colony
// name) and filters for pin type and castration status.
//
// Colony pins use progressive location blur by access level:
// Location blur protects cats from malicious users who could use exact
// coordinates to find and harm animals.
//   Level 1 (anonymous)      -> wide blur (~500m), precomputed at registration
//   Level 2 (signed in)      -> closer blur (~100m), precomputed at registration
//   Level 3 (linked caretaker/creator) -> exact location, via a security
//     definer RPC that validates the caretaker link server-side — exact
//     coordinates are never readable through a direct table select.
"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import LocationBlurBadge, { type LocationAccessLevel } from "@/components/LocationBlurBadge";

// Natal, RN map center and default zoom, per the Felines spec.
const NATAL_CENTER: [number, number] = [-5.7945, -35.211];
const DEFAULT_ZOOM = 13;

type CastrationStatus = "none" | "partial" | "full";

type Colony = {
  id: string;
  name: string;
  narrative: string | null;
  latitude_blurred: number;
  longitude_blurred: number;
  latitude_blurred_near: number | null;
  longitude_blurred_near: number | null;
  castration_status: CastrationStatus;
  created_by: string | null;
};

type EmergencyReport = {
  id: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
};

type PinType = "colony" | "sighting" | "emergency";

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

const CASTRATION_LABELS: Record<CastrationStatus, string> = {
  none: "Nenhum gato castrado",
  partial: "Castração parcial",
  full: "Colônia totalmente castrada",
};

const PIN_TYPE_OPTIONS: { value: PinType; label: string; color: string }[] = [
  { value: "colony", label: "Colônias", color: "#C4704F" },
  { value: "sighting", label: "Avistamentos", color: "#6B6B6B" },
  { value: "emergency", label: "Emergências", color: "#C0392B" },
];

const CASTRATION_FILTER_OPTIONS: { value: CastrationStatus; label: string }[] = [
  { value: "none", label: "Nenhum castrado" },
  { value: "partial", label: "Parcial" },
  { value: "full", label: "Total" },
];

// Uncertainty circle radius (meters) drawn around blurred pins, so the
// approximation is visually obvious even to someone who doesn't know
// the colony's real address — a single precise-looking pin doesn't
// communicate "somewhere around here" on its own. No circle for level 3
// (exact location, no blur applied).
const BLUR_RADIUS_METERS: Record<1 | 2, number> = {
  1: 600,
  2: 150,
};

export default function ColonyMap() {
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [sightings, setSightings] = useState<EmergencyReport[]>([]);

  const [session, setSession] = useState<Session | null>(null);
  // Colony ids the current user is a linked caretaker of (or created).
  const [myColonyIds, setMyColonyIds] = useState<Set<string>>(new Set());
  // Exact coordinates fetched via RPC, keyed by colony id — only ever
  // populated for colonies the RPC confirms the user may see exactly.
  const [exactCoordsByColonyId, setExactCoordsByColonyId] = useState<
    Map<string, [number, number]>
  >(new Map());

  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePinTypes, setVisiblePinTypes] = useState<Set<PinType>>(
    new Set(["colony", "sighting", "emergency"])
  );
  const [visibleCastrationStatuses, setVisibleCastrationStatuses] = useState<
    Set<CastrationStatus>
  >(new Set(["none", "partial", "full"]));

  // Load colonies (blurred coordinates only — exact lat/long is not
  // selectable here even for an authenticated session; the database
  // grants block it for every role except via the RPC below) and open
  // reports (emergencies and sightings) from Supabase once the map mounts.
  useEffect(() => {
    async function loadMapData() {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      setSession(currentSession);

      const { data: colonyData } = await supabase
        .from("colonies")
        .select(
          "id, name, narrative, latitude_blurred, longitude_blurred, latitude_blurred_near, longitude_blurred_near, castration_status, created_by"
        );

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

      if (!currentSession || !colonyData) return;

      // Candidate colonies for level 3: the user created them, or has a
      // caretakers row for them. This is only a hint for which colonies
      // to call the RPC for — the RPC itself re-validates server-side
      // and is the only thing that actually returns exact coordinates.
      const { data: caretakerRows } = await supabase
        .from("caretakers")
        .select("colony_id")
        .eq("user_id", currentSession.user.id);

      const candidateColonyIds = new Set<string>(
        (caretakerRows ?? []).map((row) => row.colony_id)
      );
      (colonyData as Colony[]).forEach((colony) => {
        if (colony.created_by === currentSession.user.id) candidateColonyIds.add(colony.id);
      });
      setMyColonyIds(candidateColonyIds);

      const exactCoordsEntries = await Promise.all(
        Array.from(candidateColonyIds).map(async (colonyId) => {
          const { data: exactLocationRows } = await supabase.rpc("get_colony_exact_location", {
            p_colony_id: colonyId,
          });
          const exactLocation = exactLocationRows?.[0];
          if (!exactLocation) return null;
          return [colonyId, [exactLocation.latitude, exactLocation.longitude]] as [
            string,
            [number, number],
          ];
        })
      );

      setExactCoordsByColonyId(
        new Map(exactCoordsEntries.filter((entry): entry is [string, [number, number]] => entry !== null))
      );
    }

    loadMapData();
  }, []);

  function togglePinType(type: PinType) {
    setVisiblePinTypes((previous) => {
      const next = new Set(previous);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function toggleCastrationStatus(status: CastrationStatus) {
    setVisibleCastrationStatuses((previous) => {
      const next = new Set(previous);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  // Resolves which coordinates and access level to show for a colony,
  // based on the current session and whether the RPC confirmed an exact
  // location for it.
  function resolveColonyPosition(colony: Colony): {
    position: [number, number];
    level: LocationAccessLevel;
  } {
    if (session && myColonyIds.has(colony.id)) {
      const exactPosition = exactCoordsByColonyId.get(colony.id);
      if (exactPosition) return { position: exactPosition, level: 3 };
    }

    if (session) {
      const near: [number, number] = [
        colony.latitude_blurred_near ?? colony.latitude_blurred,
        colony.longitude_blurred_near ?? colony.longitude_blurred,
      ];
      return { position: near, level: 2 };
    }

    return { position: [colony.latitude_blurred, colony.longitude_blurred], level: 1 };
  }

  const filteredColonies = useMemo(() => {
    if (!visiblePinTypes.has("colony")) return [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return colonies.filter(
      (colony) =>
        visibleCastrationStatuses.has(colony.castration_status) &&
        (normalizedSearch === "" || colony.name.toLowerCase().includes(normalizedSearch))
    );
  }, [colonies, searchTerm, visiblePinTypes, visibleCastrationStatuses]);

  const filteredSightings = visiblePinTypes.has("sighting") ? sightings : [];
  const filteredEmergencies = visiblePinTypes.has("emergency") ? emergencies : [];

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-[1000] w-64 space-y-2 rounded-xl border border-felines-border bg-felines-surface p-3 shadow-lg">
        <input
          type="text"
          value={searchTerm}
          onChange={(formEvent) => setSearchTerm(formEvent.target.value)}
          placeholder="Buscar colônia pelo nome"
          className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {PIN_TYPE_OPTIONS.map((option) => {
            const isActive = visiblePinTypes.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePinType(option.value)}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-felines-accent text-felines-text-primary"
                    : "border-felines-border text-felines-text-secondary opacity-50"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: option.color }}
                />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {CASTRATION_FILTER_OPTIONS.map((option) => {
            const isActive = visibleCastrationStatuses.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleCastrationStatus(option.value)}
                className={`rounded-full border px-2 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-felines-success text-felines-text-primary"
                    : "border-felines-border text-felines-text-secondary opacity-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <MapContainer
        center={NATAL_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="h-full w-full"
      >
        <ZoomControl position="bottomleft" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredColonies.map((colony) => {
          const { position, level } = resolveColonyPosition(colony);
          const popupContent = (
            <Popup>
              <strong>{colony.name}</strong>
              <p className="mt-1 text-sm">{colony.narrative}</p>
              <p className="mt-1 text-xs text-felines-text-secondary">
                {CASTRATION_LABELS[colony.castration_status]}
              </p>
              <LocationBlurBadge level={level} />
              <a
                href={`/colony/${colony.id}`}
                className="mt-2 block text-xs font-medium text-felines-accent"
              >
                Ver colônia →
              </a>
            </Popup>
          );

          // Levels 1 and 2 only ever render the uncertainty circle — no
          // marker pin — because a precise-looking pin defeats the blur
          // no matter how big the circle is: it still tells the viewer
          // "the colony is exactly here," which is the one thing blur
          // exists to prevent. Only level 3 (exact location) gets a pin.
          if (level === 3) {
            return (
              <Marker key={colony.id} position={position} icon={colonyIcon}>
                {popupContent}
              </Marker>
            );
          }

          return (
            <Circle
              key={colony.id}
              center={position}
              radius={BLUR_RADIUS_METERS[level]}
              pathOptions={{ color: "#E8A838", fillColor: "#E8A838", fillOpacity: 0.18, weight: 1 }}
            >
              {popupContent}
            </Circle>
          );
        })}

        {filteredSightings
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

        {filteredEmergencies
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
    </div>
  );
}
