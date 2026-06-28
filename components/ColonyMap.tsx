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
import { submitReport } from "@/lib/submitReport";
import ColonyClickTooltip, {
  hasSeenColonyClickTooltip,
  markColonyClickTooltipSeen,
} from "@/components/ColonyClickTooltip";
import ColonyInterestModal from "@/components/ColonyInterestModal";

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

type SuggestedColony = {
  id: string;
  latitude: number;
  longitude: number;
  sighting_count: number;
};

type EmergencyReport = {
  id: string;
  type: string;
  // Anon's column grant on `reports` (see 0024/0025/0040) only covers
  // id/type/colony_id/latitude_blurred/longitude_blurred/status/... —
  // exact latitude/longitude and description are only fetched when
  // signed in, so these stay optional rather than breaking the
  // anonymous map view by requesting an ungranted column.
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  latitude_blurred?: number | null;
  longitude_blurred?: number | null;
  created_at?: string;
};

// Anonymous visitors never receive exact report coordinates from the
// database (revoked at the grant level in 0040) — only the blurred
// columns. Signed-in visitors get the exact ones. This mirrors
// resolveColonyPosition below, just for reports instead of colonies.
function resolveReportPosition(report: EmergencyReport): [number, number] | null {
  if (report.latitude != null && report.longitude != null) {
    return [report.latitude, report.longitude];
  }
  if (report.latitude_blurred != null && report.longitude_blurred != null) {
    return [report.latitude_blurred, report.longitude_blurred];
  }
  return null;
}

// Mounts inside MapContainer purely to read the live Leaflet map instance
// and report its visible bounds upward — react-leaflet has no prop for
// "current bounds," only events, so this is the standard way to bridge
// imperative map state into React state.
function BoundsTracker({
  onBoundsChange,
  onCenterChange,
}: {
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onCenterChange?: (lat: number, lon: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
      const center = map.getCenter();
      onCenterChange?.(center.lat, center.lng);
    },
    zoomend: () => onBoundsChange(map.getBounds()),
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
    const center = map.getCenter();
    onCenterChange?.(center.lat, center.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only needs to run once map mounts, bounds/center updates flow through the events above
  }, []);

  return null;
}

type PinType = "colony" | "sighting" | "emergency" | "suggested";

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

// Colony pins with an active help request get a small corner badge —
// amber for normal urgency, red (pulsing) for urgent. Only three
// possible variants, so these are built once instead of per-colony.
function buildColonyIconWithBadge(urgency: "normal" | "urgent"): L.DivIcon {
  const badgeColor = urgency === "urgent" ? "#C0392B" : "#E8A838";
  const badgeClass = urgency === "urgent" ? "felines-pin-pulse" : "";
  return L.divIcon({
    className: "",
    html: `<span style="position:relative;display:inline-block;width:22px;height:22px;">
      <span class="felines-pin" style="background:#C4704F;width:22px;height:22px;display:flex;align-items:center;justify-content:center;"></span>
      <span class="${badgeClass}" style="position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:${badgeColor};border:1.5px solid white;"></span>
    </span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
const colonyIconWithNormalHelpBadge = buildColonyIconWithBadge("normal");
const colonyIconWithUrgentHelpBadge = buildColonyIconWithBadge("urgent");
const sightingIcon = buildPinIcon("#6B6B6B", 14);
const emergencyIcon = buildPinIcon("#C0392B", 22, true);

// Distinct from buildPinIcon's solid-fill style: a dashed olive circle
// signals "inferred, not confirmed" — this is a guess based on clustered
// sightings, not a colony anyone has actually registered.
const suggestedColonyIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:rgba(107,143,106,0.2);border:3px dashed #6B8F6A;font-size:18px;line-height:1;">❓</span>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

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

// Once a colony has cats individually registered, the live count is
// more trustworthy than the manually-set castration_status field —
// same logic as the colony detail page's resolveCastrationLabel.
function resolveCastrationLabel(
  castrationStatus: CastrationStatus,
  catCounts?: { total: number; castrated: number }
): string {
  if (!catCounts || catCounts.total === 0) return CASTRATION_LABELS[castrationStatus];
  if (catCounts.castrated === 0) return "Nenhum gato castrado ainda";
  if (catCounts.castrated === catCounts.total) return "Todos os gatos castrados";
  return `${catCounts.castrated} de ${catCounts.total} gatos castrados`;
}

const PIN_TYPE_OPTIONS: { value: PinType; label: string; color: string }[] = [
  { value: "colony", label: "Colônias", color: "#C4704F" },
  { value: "sighting", label: "Avistamentos", color: "#6B6B6B" },
  { value: "emergency", label: "Emergências", color: "#C0392B" },
  { value: "suggested", label: "Possíveis colônias", color: "#6B8F6A" },
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

export default function ColonyMap({
  onCenterChange,
  compact = false,
}: {
  // Lets the page hosting the map (the weather banner specifically)
  // know where the visitor is currently looking, instead of always
  // showing the weather for the map's fixed initial center.
  onCenterChange?: (lat: number, lon: number) => void;
  // Used for the small map preview on /impact: hides the activity panel
  // and the "no colonies in view" empty state, both positioned assuming
  // a full-viewport-height map — in a short preview box they overlap
  // each other instead of stacking. Just the pins are the point there.
  compact?: boolean;
}) {
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [visibleBounds, setVisibleBounds] = useState<L.LatLngBounds | null>(null);
  // The activity panel itself is always on screen; this only toggles
  // whether its body (the scrollable list) is expanded or collapsed
  // down to just the header, so it never has to fully disappear.
  const [listExpanded, setListExpanded] = useState(true);
  const [hasLoadedColonies, setHasLoadedColonies] = useState(false);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [sightings, setSightings] = useState<EmergencyReport[]>([]);
  const [suggestedColonies, setSuggestedColonies] = useState<SuggestedColony[]>([]);
  // Most urgent active help request per colony, if any — drives the
  // small badge on colony pins.
  const [helpUrgencyByColonyId, setHelpUrgencyByColonyId] = useState<
    Map<string, "normal" | "urgent">
  >(new Map());

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

  const [showColonyClickTooltip, setShowColonyClickTooltip] = useState(false);
  const [interestColonyId, setInterestColonyId] = useState<string | null>(null);
  // Per-colony castrated/total cat counts, so the popup can show the
  // actual count instead of the manually-set castration_status field
  // once a colony has cats registered (same logic as the colony page).
  const [catCountsByColonyId, setCatCountsByColonyId] = useState<
    Map<string, { total: number; castrated: number }>
  >(new Map());

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

      const { data: suggestedData } = await supabase
        .from("suggested_colonies")
        .select("id, latitude, longitude, sighting_count");
      if (suggestedData) setSuggestedColonies(suggestedData as SuggestedColony[]);

      const { data: helpRequestRows } = await supabase
        .from("help_requests")
        .select("colony_id, urgency")
        .eq("status", "open")
        .gt("expires_at", new Date().toISOString());
      const urgencyMap = new Map<string, "normal" | "urgent">();
      (helpRequestRows ?? []).forEach((row) => {
        const current = urgencyMap.get(row.colony_id);
        if (row.urgency === "urgent" || !current) {
          urgencyMap.set(row.colony_id, row.urgency as "normal" | "urgent");
        }
      });
      setHelpUrgencyByColonyId(urgencyMap);

      // cats is public-readable (cats_select_public), so this is safe
      // to fetch regardless of session — one query for every colony's
      // cats instead of one query per pin.
      const { data: catRows } = await supabase.from("cats").select("colony_id, castrated");
      const counts = new Map<string, { total: number; castrated: number }>();
      (catRows ?? []).forEach((cat) => {
        const current = counts.get(cat.colony_id) ?? { total: 0, castrated: 0 };
        current.total += 1;
        if (cat.castrated) current.castrated += 1;
        counts.set(cat.colony_id, current);
      });
      setCatCountsByColonyId(counts);

      // Fetch every open report with a location, not just sightings and
      // the emergency types — types like missing_cat, new_kitten, and
      // no_food_water have no dedicated pin color, but they still need
      // to show up somewhere instead of silently disappearing from the
      // map just because they were typed elsewhere.
      const reportSelect: string = currentSession
        ? "id, type, description, latitude, longitude, created_at"
        : "id, type, latitude_blurred, longitude_blurred";
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
      (colony) => normalizedSearch === "" || colony.name.toLowerCase().includes(normalizedSearch)
    );
  }, [colonies, searchTerm, visiblePinTypes]);

  const filteredSightings = visiblePinTypes.has("sighting") ? sightings : [];
  const filteredEmergencies = visiblePinTypes.has("emergency") ? emergencies : [];
  const filteredSuggestedColonies = visiblePinTypes.has("suggested") ? suggestedColonies : [];

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
    const position = resolveReportPosition(report);
    if (!visibleBounds || !position) return false;
    return visibleBounds.contains(position);
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
        <BoundsTracker onBoundsChange={setVisibleBounds} onCenterChange={onCenterChange} />
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
                {resolveCastrationLabel(colony.castration_status, catCountsByColonyId.get(colony.id))}
              </p>
              <LocationBlurBadge level={level} />
              {/* The colony page's name and narrative can describe the
                  location in plain language (street names, landmarks),
                  so this is only offered to signed-in visitors —
                  anonymous visitors get the blurred pin and nothing more.
                  The detail page is meant for people who'd realistically
                  look after the colony, so a short interest check comes
                  before the link, instead of going straight there. */}
              {session && (
                // Caretakers/creators already manage this colony, so the
                // "are you interested in becoming a caretaker?" gate
                // would be nonsensical for them — go straight to the page.
                myColonyIds.has(colony.id) ? (
                  <a
                    href={`/colony/${colony.id}`}
                    className="mt-2 block text-xs font-medium text-felines-accent-hover"
                  >
                    Ver colônia →
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInterestColonyId(colony.id)}
                    className="mt-2 block text-xs font-medium text-felines-accent-hover"
                  >
                    Ver colônia →
                  </button>
                )
              )}
            </Popup>
          );

          // Levels 1 and 2 only ever render the uncertainty circle — no
          // marker pin — because a precise-looking pin defeats the blur
          // no matter how big the circle is: it still tells the viewer
          // "the colony is exactly here," which is the one thing blur
          // exists to prevent. Only level 3 (exact location) gets a pin.
          if (level === 3) {
            const helpUrgency = helpUrgencyByColonyId.get(colony.id);
            const icon =
              helpUrgency === "urgent"
                ? colonyIconWithUrgentHelpBadge
                : helpUrgency === "normal"
                  ? colonyIconWithNormalHelpBadge
                  : colonyIcon;
            return (
              <Marker
                key={colony.id}
                position={position}
                icon={icon}
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

        {filteredSightings.map((report) => {
          const position = resolveReportPosition(report);
          if (!position) return null;
          const isExact = report.latitude != null;
          const popupContent = (
            <Popup>
              <strong>{getReportTypeLabel(report.type)}</strong>
              {!isExact && (
                <p className="mt-1 text-xs text-felines-text-secondary">
                  🔒 Localização aproximada
                </p>
              )}
              <a
                href={`/reports#report-${report.id}`}
                className="mt-2 block text-xs font-medium text-felines-accent-hover"
              >
                Ver relato →
              </a>
            </Popup>
          );
          return isExact ? (
            <Marker key={report.id} position={position} icon={sightingIcon}>
              {popupContent}
            </Marker>
          ) : (
            <Circle
              key={report.id}
              center={position}
              radius={BLUR_RADIUS_METERS[1]}
              pathOptions={{ color: "#6B6B6B", fillColor: "#6B6B6B", fillOpacity: 0.18, weight: 1 }}
            >
              {popupContent}
            </Circle>
          );
        })}

        {filteredEmergencies.map((report) => {
          const position = resolveReportPosition(report);
          if (!position) return null;
          const isExact = report.latitude != null;
          const popupContent = (
            <Popup>
              <strong>Alerta: {getReportTypeLabel(report.type)}</strong>
              {!isExact && (
                <p className="mt-1 text-xs text-felines-text-secondary">
                  🔒 Localização aproximada
                </p>
              )}
              <a
                href={`/reports#report-${report.id}`}
                className="mt-2 block text-xs font-medium text-felines-accent-hover"
              >
                Ver relato →
              </a>
            </Popup>
          );
          return isExact ? (
            <Marker key={report.id} position={position} icon={emergencyIcon}>
              {popupContent}
            </Marker>
          ) : (
            <Circle
              key={report.id}
              center={position}
              radius={BLUR_RADIUS_METERS[1]}
              pathOptions={{ color: "#C0392B", fillColor: "#C0392B", fillOpacity: 0.18, weight: 1 }}
            >
              {popupContent}
            </Circle>
          );
        })}

        {filteredSuggestedColonies.map((suggestion) => (
          <Marker
            key={suggestion.id}
            position={[suggestion.latitude, suggestion.longitude]}
            icon={suggestedColonyIcon}
          >
            <SuggestedColonyPopup suggestion={suggestion} />
          </Marker>
        ))}
      </MapContainer>

      {showColonyClickTooltip && (
        <ColonyClickTooltip onDismiss={() => setShowColonyClickTooltip(false)} />
      )}

      {interestColonyId && (
        <ColonyInterestModal
          colonyId={interestColonyId}
          onClose={() => setInterestColonyId(null)}
        />
      )}

      {/* Always on screen — positioned below the weather banner on both
          layouts (it sits lower, full-width, on mobile, and top-right on
          desktop) so the two never overlap. The on/off toggle lives in
          its own footer instead of floating separately, so the panel
          never has to fully disappear. */}
      {!compact && (
      <div
        className={`absolute left-4 right-4 top-[19rem] z-[999] flex flex-col rounded-xl border border-felines-border bg-felines-surface shadow-lg sm:left-auto sm:top-24 sm:w-80 ${
          listExpanded ? "bottom-24" : ""
        }`}
      >
        <div className="border-b border-felines-border p-3">
          <Link
            href="/reports"
            className="text-sm font-bold text-felines-text-primary hover:text-felines-accent-hover"
          >
            Atividade nesta área →
          </Link>
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
                      {resolveCastrationLabel(colony.castration_status, catCountsByColonyId.get(colony.id))}
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
      )}

      {!compact && hasLoadedColonies && visiblePinTypes.has("colony") && filteredColonies.length === 0 && (
        // bottom-24 (not bottom-6) so this never overlaps the floating
        // "+ Cadastrar colônia" button anchored at the bottom-right.
        <div className="absolute bottom-24 left-1/2 z-[1000] w-[90%] max-w-md -translate-x-1/2">
          {panelSightings.length > 0 ? (
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

// Popup content for a suggested-colony pin: explains the inference and
// offers two actions — register it for real (pre-filling the location)
// or add one more sighting confirmation at this exact spot.
function SuggestedColonyPopup({ suggestion }: { suggestion: SuggestedColony }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleConfirmSighting() {
    setConfirming(true);
    const { error } = await submitReport({
      type: "sighting",
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      status: "open",
    });
    setConfirming(false);
    if (!error) setConfirmed(true);
  }

  return (
    <Popup>
      <p className="text-sm font-medium">Vários gatos foram avistados aqui.</p>
      <p className="mt-1 text-xs text-felines-text-secondary">
        Isso pode ser uma colônia ainda não registrada.
      </p>
      <div className="mt-2 flex flex-col gap-1">
        <a
          href={`/colony/new?lat=${suggestion.latitude}&lng=${suggestion.longitude}`}
          className="text-xs font-medium text-felines-accent-hover"
        >
          Cadastrar uma colônia aqui →
        </a>
        {confirmed ? (
          <span className="text-xs text-felines-success">Obrigado por confirmar!</span>
        ) : (
          <button
            type="button"
            onClick={handleConfirmSighting}
            disabled={confirming}
            className="text-left text-xs font-medium text-felines-text-secondary hover:text-felines-accent disabled:opacity-50"
          >
            {confirming ? "Enviando..." : "Também vi gatos aqui"}
          </button>
        )}
      </div>
    </Popup>
  );
}
