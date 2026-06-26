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
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Circle,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import LocationBlurBadge, { BADGE_TEXT, type LocationAccessLevel } from "@/components/LocationBlurBadge";
import EmptyState from "@/components/EmptyState";
import { getReportTypeLabel } from "@/lib/reportTypes";
import ColonyClickTooltip, {
  hasSeenColonyClickTooltip,
  markColonyClickTooltipSeen,
} from "@/components/ColonyClickTooltip";

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
  // Anon's column grant on `reports` only covers id/type/colony_id/lat/long/status
  // (see 0024_public_report_pins.sql) — description and created_at are
  // only fetched when signed in, so these stay optional rather than
  // breaking the anonymous map view by requesting an ungranted column.
  description?: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
};

// Mounts inside MapContainer purely to read the live Leaflet map instance
// and report its visible bounds upward — react-leaflet has no prop for
// "current bounds," only events, so this is the standard way to bridge
// imperative map state into React state.
function BoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only needs to run once map mounts, bounds updates flow through the events above
  }, []);

  return null;
}

type PinType = "colony" | "sighting" | "emergency";

// Builds a circular Leaflet divIcon with the given color and size.
// Emergency pins get an extra CSS class that drives a pulsing animation
// (see globals.css). An optional centered icon (e.g. a paw print)
// distinguishes colony pins from the otherwise-identical-shaped sighting
// pin at a glance, beyond just color.
function buildPinIcon(color: string, size: number, pulsing = false, icon = "") {
  return L.divIcon({
    className: "",
    html: `<span class="${
      pulsing ? "felines-pin felines-pin-pulse" : "felines-pin"
    }" style="background:${color};width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${Math.round(
      size * 0.55
    )}px;line-height:1;">${icon}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const colonyIcon = buildPinIcon("#C4704F", 22);
const sightingIcon = buildPinIcon("#6B6B6B", 14);
const emergencyIcon = buildPinIcon("#C0392B", 22, true);

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
// (exact location, no blur applied). Levels 1 and 2 use the same visual
// radius — the privacy protection comes from the blurred center point,
// not from the circle looking bigger or smaller.
const BLUR_RADIUS_METERS: Record<1 | 2, number> = {
  1: 600,
  2: 600,
};

export default function ColonyMap() {
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [visibleBounds, setVisibleBounds] = useState<L.LatLngBounds | null>(null);
  // The activity panel itself is always on screen; this only toggles
  // whether its body (the scrollable list) is expanded or collapsed
  // down to just the header, so it never has to fully disappear.
  const [listExpanded, setListExpanded] = useState(true);
  const [hasLoadedColonies, setHasLoadedColonies] = useState(false);
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

  const [showColonyClickTooltip, setShowColonyClickTooltip] = useState(false);

  // Heat map: highlights colonies that likely need attention (open
  // reports and/or no recent feeding check-in). Needs `reports` and
  // `feedings` data, both of which RLS restricts to authenticated users,
  // so the toggle is only offered once signed in.
  const [heatMapOn, setHeatMapOn] = useState(false);
  const [colonyNeedScores, setColonyNeedScores] = useState<Map<string, number>>(new Map());

  function handleColonyPinClick() {
    if (!hasSeenColonyClickTooltip()) {
      setShowColonyClickTooltip(true);
      markColonyClickTooltipSeen();
    }
  }

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
      setHasLoadedColonies(true);

      // Fetch every open report with a location, not just sightings and
      // the emergency types — types like missing_cat, new_kitten, and
      // no_food_water have no dedicated pin color, but they still need
      // to show up somewhere instead of silently disappearing from the
      // map just because they were typed elsewhere.
      const reportSelect: string = currentSession
        ? "id, type, description, latitude, longitude, created_at"
        : "id, type, latitude, longitude";
      const { data: reportData } = await supabase
        .from("reports")
        .select(reportSelect)
        .eq("status", "open");

      if (reportData) {
        const typedReportData = reportData as unknown as EmergencyReport[];
        setEmergencies(
          typedReportData.filter((r) =>
            EMERGENCY_REPORT_TYPES.includes(r.type)
          )
        );
        setSightings(
          typedReportData.filter(
            (r) => !EMERGENCY_REPORT_TYPES.includes(r.type)
          )
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

      // Need score per colony: +1 per open report tied to it, +1 if no
      // feeding check-in in the last 7 days. Both queries require
      // authentication (reports/feedings RLS), which is fine since the
      // heat map toggle itself is only shown once signed in.
      const [{ data: openReportRows }, { data: feedingRows }] = await Promise.all([
        supabase.from("reports").select("colony_id").eq("status", "open").not("colony_id", "is", null),
        supabase.from("feedings").select("colony_id, created_at"),
      ]);

      const openReportCounts = new Map<string, number>();
      (openReportRows ?? []).forEach((row) => {
        const colonyId = row.colony_id as string;
        openReportCounts.set(colonyId, (openReportCounts.get(colonyId) ?? 0) + 1);
      });

      const lastFeedingByColony = new Map<string, number>();
      (feedingRows ?? []).forEach((row) => {
        const timestamp = new Date(row.created_at).getTime();
        const current = lastFeedingByColony.get(row.colony_id);
        if (!current || timestamp > current) lastFeedingByColony.set(row.colony_id, timestamp);
      });

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const needScores = new Map<string, number>();
      (colonyData as Colony[]).forEach((colony) => {
        let score = openReportCounts.get(colony.id) ?? 0;
        const lastFeeding = lastFeedingByColony.get(colony.id);
        if (!lastFeeding || lastFeeding < sevenDaysAgo) score += 1;
        if (score > 0) needScores.set(colony.id, score);
      });
      setColonyNeedScores(needScores);
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

  // What the activity panel shows: only items whose pin currently falls
  // within the visible map area, so the list always matches what's on
  // screen instead of dumping every report/colony in the whole city.
  const panelColonies = useMemo(() => {
    if (!visibleBounds) return [];
    return filteredColonies.filter((colony) =>
      visibleBounds.contains(resolveColonyPosition(colony).position)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolveColonyPosition depends on session/myColonyIds/exactCoordsByColonyId, already covered by filteredColonies recomputation
  }, [visibleBounds, filteredColonies]);

  function isInBounds(report: EmergencyReport) {
    if (!visibleBounds || report.latitude == null || report.longitude == null) return false;
    return visibleBounds.contains([report.latitude, report.longitude]);
  }

  const panelEmergencies = filteredEmergencies.filter(isInBounds);
  const panelSightings = filteredSightings.filter(isInBounds);

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-[1000] w-64 space-y-2 rounded-xl border border-felines-border bg-felines-surface p-3 shadow-lg">
        <input
          type="text"
          aria-label="Buscar colônia pelo nome"
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

        {session && (
          <div>
            <button
              type="button"
              onClick={() => setHeatMapOn((previous) => !previous)}
              className={`w-full rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                heatMapOn
                  ? "border-felines-emergency bg-felines-emergency text-white"
                  : "border-felines-border text-felines-text-secondary"
              }`}
            >
              {heatMapOn ? "Ocultar" : "Mostrar"} colônias que precisam de atenção
            </button>
            {heatMapOn && (
              <p className="mt-1 text-xs text-felines-text-secondary">
                🟠 com relato aberto ou sem alimentação há 7+ dias · 🔴 os dois ao mesmo tempo
              </p>
            )}
          </div>
        )}
      </div>

      <MapContainer
        center={NATAL_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="h-full w-full"
      >
        <BoundsTracker onBoundsChange={setVisibleBounds} />
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
              {/* The colony page's name and narrative can describe the
                  location in plain language (street names, landmarks),
                  so this link is only shown to signed-in visitors —
                  anonymous visitors get the blurred pin and nothing more. */}
              {session && (
                <a
                  href={`/colony/${colony.id}`}
                  className="mt-2 block text-xs font-medium text-felines-accent-hover"
                >
                  Ver colônia →
                </a>
              )}
            </Popup>
          );

          // Levels 1 and 2 only ever render the uncertainty circle — no
          // marker pin — because a precise-looking pin defeats the blur
          // no matter how big the circle is: it still tells the viewer
          // "the colony is exactly here," which is the one thing blur
          // exists to prevent. Only level 3 (exact location) gets a pin.
          if (level === 3) {
            return (
              <Marker
                key={colony.id}
                position={position}
                icon={colonyIcon}
                eventHandlers={{ click: handleColonyPinClick }}
              >
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
              eventHandlers={{ click: handleColonyPinClick }}
            >
              <Tooltip direction="top" opacity={1}>
                🔒 {BADGE_TEXT[level]}
              </Tooltip>
              {popupContent}
            </Circle>
          );
        })}

        {heatMapOn &&
          filteredColonies.map((colony) => {
            const needScore = colonyNeedScores.get(colony.id);
            if (!needScore) return null;
            const { position } = resolveColonyPosition(colony);
            const color = needScore >= 2 ? "#C0392B" : "#E8A838";
            return (
              <Circle
                key={`heat-${colony.id}`}
                center={position}
                radius={400}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 0 }}
              />
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
                <strong>{getReportTypeLabel(report.type)}</strong>
                <a
                  href={`/reports#report-${report.id}`}
                  className="mt-2 block text-xs font-medium text-felines-accent-hover"
                >
                  Ver relato →
                </a>
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
                <a
                  href={`/reports#report-${report.id}`}
                  className="mt-2 block text-xs font-medium text-felines-accent-hover"
                >
                  Ver relato →
                </a>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {showColonyClickTooltip && (
        <ColonyClickTooltip onDismiss={() => setShowColonyClickTooltip(false)} />
      )}

      {/* Always on screen — positioned below the weather banner on both
          layouts (it sits lower, full-width, on mobile, and top-right on
          desktop) so the two never overlap. The on/off toggle lives in
          its own footer instead of floating separately, so the panel
          never has to fully disappear. */}
      <div
        className={`absolute left-4 right-4 top-[19rem] z-[999] flex flex-col rounded-xl border border-felines-border bg-felines-surface shadow-lg sm:left-auto sm:top-24 sm:w-80 ${
          listExpanded ? "bottom-24" : ""
        }`}
      >
        <div className="border-b border-felines-border p-3">
          <h2 className="text-sm font-bold text-felines-text-primary">Atividade nesta área</h2>
          <p className="text-xs text-felines-text-secondary">
            Mova ou dê zoom no mapa para atualizar a lista.
          </p>
        </div>
        {listExpanded && (
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {panelColonies.length === 0 && panelEmergencies.length === 0 && panelSightings.length === 0 ? (
              <p className="text-sm text-felines-text-secondary">
                Nenhuma colônia ou relato visível nesta área do mapa.
              </p>
            ) : (
              <>
                {panelEmergencies.map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports#report-${report.id}`}
                    className="block rounded-md border border-felines-emergency/40 bg-felines-emergency/5 px-3 py-2 text-sm transition-colors hover:border-felines-emergency"
                  >
                    <span className="font-medium text-felines-text-primary">
                      ⚠ {getReportTypeLabel(report.type)}
                    </span>
                    {report.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-felines-text-secondary">
                        {report.description}
                      </p>
                    )}
                  </Link>
                ))}
                {panelColonies.map((colony) => (
                  <Link
                    key={colony.id}
                    href={`/colony/${colony.id}`}
                    className="block rounded-md border border-felines-border px-3 py-2 text-sm transition-colors hover:border-felines-accent"
                  >
                    <span className="font-medium text-felines-text-primary">{colony.name}</span>
                    <p className="mt-1 text-xs text-felines-text-secondary">
                      {CASTRATION_LABELS[colony.castration_status]}
                    </p>
                  </Link>
                ))}
                {panelSightings.map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports#report-${report.id}`}
                    className="block rounded-md border border-felines-border px-3 py-2 text-sm transition-colors hover:border-felines-accent"
                  >
                    <span className="font-medium text-felines-text-primary">
                      {getReportTypeLabel(report.type)}
                    </span>
                    {report.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-felines-text-secondary">
                        {report.description}
                      </p>
                    )}
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
        <div className="border-t border-felines-border p-2">
          <button
            onClick={() => setListExpanded((previous) => !previous)}
            aria-expanded={listExpanded}
            aria-label={listExpanded ? "Ocultar lista de atividades" : "Mostrar lista de atividades"}
            className="flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-felines-text-secondary transition-colors hover:text-felines-accent-hover"
          >
            <span>{listExpanded ? "Ocultar lista" : "Mostrar lista"}</span>
            <span aria-hidden="true">{listExpanded ? "▲" : "▼"}</span>
          </button>
        </div>
      </div>

      {hasLoadedColonies && visiblePinTypes.has("colony") && filteredColonies.length === 0 && (
        // bottom-24 (not bottom-6) so this never overlaps the floating
        // "+ Cadastrar colônia" button anchored at the bottom-right.
        <div className="absolute bottom-24 left-1/2 z-[1000] w-[90%] max-w-md -translate-x-1/2">
          {sightings.length > 0 ? (
            <EmptyState
              main="Pessoas avistaram gatos aqui, mas ninguém mapeou uma colônia ainda. Será que você pode ser essa pessoa?"
              ctas={[{ label: "Cadastrar uma colônia →", href: "/colony/new" }]}
            />
          ) : (
            <EmptyState
              main="Nenhuma colônia mapeada aqui ainda — mas isso não significa que não existam."
              ctas={[
                { label: "Viu gatos por aqui? Seja o primeiro a mapear →", href: "/colony/new" },
                {
                  label: "Não tem certeza? Aprenda o que procurar primeiro →",
                  href: "/learn/what-is-a-cat-colony",
                },
              ]}
            />
          )}
        </div>
      )}
    </div>
  );
}
