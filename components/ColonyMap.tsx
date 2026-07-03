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
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import LocationBlurBadge, { type LocationAccessLevel } from "@/components/LocationBlurBadge";
import EmptyState from "@/components/EmptyState";
import { getReportTypeLabel } from "@/lib/reportTypes";
import { useLanguage } from "@/lib/i18n";
import { submitReport } from "@/lib/submitReport";
import ReportFalsePinButton from "@/components/ReportFalsePinButton";
import { FALSE_PIN_REASONS } from "@/lib/falsePinReasons";
import ColonyClickTooltip, {
  hasSeenColonyClickTooltip,
  markColonyClickTooltipSeen,
} from "@/components/ColonyClickTooltip";
import ColonyInterestModal from "@/components/ColonyInterestModal";
import RotatingSingleFact from "@/components/RotatingSingleFact";

// Natal, RN map center and default zoom, per the Felines spec.
const NATAL_CENTER: [number, number] = [-5.7945, -35.211];
const DEFAULT_ZOOM = 13;

type CastrationStatus = "none" | "partial" | "full";

type Colony = {
  id: string;
  name: string;
  narrative: string | null;
  cover_photo_url: string | null;
  latitude_blurred: number;
  longitude_blurred: number;
  latitude_blurred_near: number | null;
  longitude_blurred_near: number | null;
  castration_status: CastrationStatus;
  created_by: string | null;
  verified_status: "unverified" | "community_verified";
  health_status: "thriving" | "stable" | "needs_attention" | "at_risk";
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

// MapContainer only forwards className/id/style to its DOM node — any
// other prop (including aria-label) is silently swallowed into
// Leaflet's map options instead. Setting it imperatively on the actual
// container element is the only way it reaches assistive tech.
function MapAriaLabel({ label }: { label: string }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.getContainer().setAttribute("aria-label", label);
    map.getContainer().setAttribute("role", "application");
  }, [map, label]);
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

const colonyIcon = buildPinIcon("#B66119", 22);

// Help requests, neutering requests, and false-pin flags used to show as
// small badges layered on top of the pin itself ("bolinha em cima do
// pin") — removed in favor of surfacing the same information as status
// chips inside the popup, so the pin shape stays clean at every zoom
// level and the information is still one click away.
//
// Unverified colonies still get a dashed (instead of solid) border —
// a whole-pin treatment, not a corner badge, so it's kept.
const unverifiedColonyIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:rgba(182,97,25,0.55);border:2px dashed #B66119;"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// "Mostrar saúde da colônia" overlay — a colored ring instead of the
// usual badge system, swapped in entirely when the toggle is on rather
// than combined with help/neutering/verification badges, to keep the
// two visual languages from competing on the same pin.
const HEALTH_RING_COLORS: Record<string, string> = {
  thriving: "#6B8F6A",
  stable: "#DA8433",
  needs_attention: "#B66119",
  at_risk: "#C0392B",
};

function buildHealthRingIcon(status: string): L.DivIcon {
  const color = HEALTH_RING_COLORS[status] ?? HEALTH_RING_COLORS.stable;
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#B66119;border:3px solid ${color};"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
const healthRingIcons: Record<string, L.DivIcon> = {
  thriving: buildHealthRingIcon("thriving"),
  stable: buildHealthRingIcon("stable"),
  needs_attention: buildHealthRingIcon("needs_attention"),
  at_risk: buildHealthRingIcon("at_risk"),
};

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

// "Did you know" facts shown while no colonies are visible in the
// current map viewport — keeps the empty state from feeling like a
// dead end, and gives first-time visitors some grounding context.
const MAP_EMPTY_STATE_FACTS = [
  "📊 Existem cerca de 480 milhões de gatos de rua no mundo",
  "📊 TNR é o único método com eficácia comprovada para estabilizar colônias",
  "📊 Gatos castrados marcam território até 90% menos e brigam muito menos",
  "📊 Uma fêmea não castrada pode gerar até 3 ninhadas por ano",
  "📊 Colônias com alimentação regular têm menor taxa de doenças infecciosas",
  "📊 Território esvaziado atrai um grupo novo em poucos meses — o efeito vácuo",
];

const EMERGENCY_REPORT_TYPES = [
  "injured_sick",
  "suspected_poisoning",
  "suspected_abuse",
  "disease_outbreak",
  "threat_to_colony",
];

// Once a colony has cats individually registered, the live count is
// more trustworthy than the manually-set castration_status field —
// same logic as the colony detail page's resolveCastrationLabel.
function resolveCastrationLabel(
  t: (key: string) => string,
  castrationStatus: CastrationStatus,
  catCounts?: { total: number; castrated: number }
): string {
  if (!catCounts || catCounts.total === 0) {
    if (castrationStatus === "partial") return t("map.castrationPartial");
    if (castrationStatus === "full") return t("map.castrationFull");
    return t("map.castrationNone");
  }
  if (catCounts.castrated === 0) return t("map.castrationNoneYet");
  if (catCounts.castrated === catCounts.total) return t("map.castrationAll");
  return t("map.castrationXOfY")
    .replace("{castrated}", String(catCounts.castrated))
    .replace("{total}", String(catCounts.total));
}

function PIN_TYPE_OPTIONS(
  t: (key: string) => string
): { value: PinType; label: string; color: string }[] {
  return [
    { value: "colony", label: t("map.pinTypeColonies"), color: "#B66119" },
    { value: "sighting", label: t("map.pinTypeSightings"), color: "#6B6B6B" },
    { value: "emergency", label: t("map.pinTypeEmergencies"), color: "#C0392B" },
  ];
}

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
  const { t } = useLanguage();
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
  // Colony ids with an open or in-progress neutering request.
  const [neuteringColonyIds, setNeuteringColonyIds] = useState<Set<string>>(new Set());
  // Colony ids with 3+ false-pin flags — shown with top priority over
  // every other badge, since "this pin might be wrong" matters more
  // than what kind of help it's asking for.
  const [flaggedColonyIds, setFlaggedColonyIds] = useState<Set<string>>(new Set());

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
  const [showColonyHealth, setShowColonyHealth] = useState(false);

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

      // All independent reads fire in parallel — one round-trip instead
      // of the previous 8 sequential awaits.
      const reportSelect: string = currentSession
        ? "id, type, description, latitude, longitude, created_at"
        : "id, type, latitude_blurred, longitude_blurred";
      const falsePinReasonValues = FALSE_PIN_REASONS.map((reason) => reason.value);

      const [
        { data: colonyData },
        { data: suggestedData },
        { data: helpRequestRows },
        { data: neuteringRows },
        { data: flagRows },
        { data: catRows },
        { data: reportData },
        { data: caretakerRows },
      ] = await Promise.all([
        supabase
          .from("colonies")
          .select(
            "id, name, narrative, cover_photo_url, latitude_blurred, longitude_blurred, latitude_blurred_near, longitude_blurred_near, castration_status, created_by, verified_status, health_status"
          ),
        supabase
          .from("suggested_colonies")
          .select("id, latitude, longitude, sighting_count"),
        supabase
          .from("help_requests")
          .select("colony_id, urgency")
          .eq("status", "open")
          .gt("expires_at", new Date().toISOString()),
        supabase
          .from("neutering_requests")
          .select("colony_id")
          .neq("status", "completed"),
        supabase
          .from("flags")
          .select("target_id")
          .eq("target_type", "colony")
          .in("reason", falsePinReasonValues),
        // cats is public-readable (cats_select_public) — one query for
        // every colony's cats instead of one query per pin.
        supabase.from("cats").select("colony_id, castrated"),
        // Fetch every open report with a location, not just sightings and
        // the emergency types — types like missing_cat, new_kitten, and
        // no_food_water still need to show up somewhere.
        supabase.from("reports").select(reportSelect).eq("status", "open"),
        // Candidate colonies for level 3 (exact coordinates via RPC):
        // caretakers row tells us which ones to call the RPC for.
        currentSession
          ? supabase
              .from("caretakers")
              .select("colony_id")
              .eq("user_id", currentSession.user.id)
          : Promise.resolve({ data: null }),
      ]);

      if (colonyData) setColonies(colonyData as Colony[]);
      setHasLoadedColonies(true);

      if (suggestedData) setSuggestedColonies(suggestedData as SuggestedColony[]);

      const urgencyMap = new Map<string, "normal" | "urgent">();
      (helpRequestRows ?? []).forEach((row) => {
        const current = urgencyMap.get(row.colony_id);
        if (row.urgency === "urgent" || !current) {
          urgencyMap.set(row.colony_id, row.urgency as "normal" | "urgent");
        }
      });
      setHelpUrgencyByColonyId(urgencyMap);

      setNeuteringColonyIds(new Set((neuteringRows ?? []).map((row) => row.colony_id)));

      const flagCounts = new Map<string, number>();
      (flagRows ?? []).forEach((row) => {
        flagCounts.set(row.target_id, (flagCounts.get(row.target_id) ?? 0) + 1);
      });
      setFlaggedColonyIds(
        new Set(Array.from(flagCounts.entries()).filter(([, count]) => count >= 3).map(([id]) => id))
      );

      const counts = new Map<string, { total: number; castrated: number }>();
      (catRows ?? []).forEach((cat) => {
        const current = counts.get(cat.colony_id) ?? { total: 0, castrated: 0 };
        current.total += 1;
        if (cat.castrated) current.castrated += 1;
        counts.set(cat.colony_id, current);
      });
      setCatCountsByColonyId(counts);

      if (reportData) {
        const typedReportData = reportData as unknown as EmergencyReport[];
        setEmergencies(typedReportData.filter((r) => EMERGENCY_REPORT_TYPES.includes(r.type)));
        setSightings(typedReportData.filter((r) => !EMERGENCY_REPORT_TYPES.includes(r.type)));
      }

      if (!currentSession || !colonyData) return;

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

  // Lets the floating cat assistant (mounted globally in the root
  // layout, with no visibility into this component's own state) know
  // the map finished loading with nothing to show — it decides on its
  // own whether it's actually appropriate to appear right now.
  useEffect(() => {
    if (compact || !hasLoadedColonies || !visiblePinTypes.has("colony") || filteredColonies.length !== 0) return;
    window.dispatchEvent(new CustomEvent("felines:map-empty"));
  }, [compact, hasLoadedColonies, visiblePinTypes, filteredColonies]);

  function isInBounds(report: EmergencyReport) {
    const position = resolveReportPosition(report);
    if (!visibleBounds || !position) return false;
    return visibleBounds.contains(position);
  }

  const panelEmergencies = filteredEmergencies.filter(isInBounds);
  const panelSightings = filteredSightings.filter(isInBounds);

  // Shared by both the blur-circle (levels 1/2) and exact-location marker
  // (level 3) rendering paths below, so the two never drift into two
  // different designs again like they did before this was extracted.
  function renderColonyPopup(colony: Colony, level: 1 | 2 | 3) {
    const helpUrgency = helpUrgencyByColonyId.get(colony.id);
    const isFlagged = flaggedColonyIds.has(colony.id);
    const needsNeutering = neuteringColonyIds.has(colony.id);
    const chips: { label: string; className: string }[] = [];
    if (isFlagged) {
      chips.push({
        label: t("map.flaggedPin"),
        className: "border-felines-emergency bg-felines-emergency/10 text-felines-emergency",
      });
    }
    if (helpUrgency === "urgent") {
      chips.push({
        label: t("map.urgentHelp"),
        className: "border-felines-emergency bg-felines-emergency/10 text-felines-emergency",
      });
    } else if (helpUrgency === "normal") {
      chips.push({
        label: t("map.needsHelp"),
        className: "border-felines-warning bg-felines-warning/10 text-felines-warning-hover",
      });
    }
    if (needsNeutering) {
      chips.push({
        label: t("map.castrationPending"),
        className: "border-felines-border bg-felines-surface text-felines-text-secondary",
      });
    }
    if (colony.verified_status === "unverified") {
      chips.push({
        label: t("map.unverified"),
        className: "border-felines-border bg-felines-surface text-felines-text-secondary",
      });
    }

    const castrationLabel = resolveCastrationLabel(
      t,
      colony.castration_status,
      catCountsByColonyId.get(colony.id)
    );

    return (
      <Popup minWidth={264} maxWidth={264} className="felines-colony-popup">
        <div>
          {/* Header strip: always present so every popup has the
              same visual anchor, whether or not the colony has a
              cover photo — a plain title floating with no header
              at all was part of what made this feel unfinished. */}
          {colony.cover_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={colony.cover_photo_url}
              alt={colony.name}
              loading="lazy"
              className="h-20 w-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-full items-center justify-center bg-felines-accent-light">
              <span className="text-3xl" aria-hidden="true">🐾</span>
            </div>
          )}

          <div className="p-3.5">
            <strong className="block text-sm font-bold leading-snug text-felines-text-primary">
              {colony.name}
            </strong>

            {chips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {chips.map((chip) => (
                  <span
                    key={chip.label}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold leading-none ${chip.className}`}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            )}

            {colony.narrative && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-felines-text-secondary">
                {colony.narrative}
              </p>
            )}

            <div className="mt-3 space-y-1.5 border-t border-felines-border pt-2.5">
              <p className="text-[11px] font-medium text-felines-text-secondary">{castrationLabel}</p>
              {level !== 3 && <LocationBlurBadge level={level} />}
            </div>

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
                  className="felines-popup-cta mt-3 block rounded-full bg-felines-accent py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-felines-accent-hover"
                >
                  {t("map.viewColonyCta")}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setInterestColonyId(colony.id)}
                  className="mt-3 block w-full rounded-full bg-felines-accent py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-felines-accent-hover"
                >
                  {t("map.viewColonyCta")}
                </button>
              )
            )}

            <div className="mt-2 flex justify-end">
              <ReportFalsePinButton colonyId={colony.id} />
            </div>
          </div>
        </div>
      </Popup>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-[1000] w-64 space-y-2 rounded-xl border border-felines-border bg-felines-surface p-3 shadow-lg">
        <input
          type="text"
          aria-label={t("map.searchColonyLabel")}
          value={searchTerm}
          onChange={(formEvent) => setSearchTerm(formEvent.target.value)}
          placeholder={t("map.searchColonyPlaceholder")}
          className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {PIN_TYPE_OPTIONS(t).map((option) => {
            const isActive = visiblePinTypes.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePinType(option.value)}
                aria-pressed={isActive}
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
              aria-pressed={heatMapOn}
              className={`w-full rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                heatMapOn
                  ? "border-felines-emergency bg-felines-emergency text-white"
                  : "border-felines-border text-felines-text-secondary"
              }`}
            >
              {heatMapOn ? t("map.hideAttentionColonies") : t("map.showAttentionColonies")}
            </button>
            {heatMapOn && (
              <p className="mt-1 text-xs text-felines-text-secondary">
                {t("map.heatMapLegend")}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowColonyHealth((previous) => !previous)}
              aria-pressed={showColonyHealth}
              className={`mt-2 w-full rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                showColonyHealth
                  ? "border-felines-accent bg-felines-accent text-white"
                  : "border-felines-border text-felines-text-secondary"
              }`}
            >
              {showColonyHealth ? t("map.hideColonyHealth") : t("map.showColonyHealth")}
            </button>
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
        <MapAriaLabel label={t("map.interactiveMapAria")} />
        <ZoomControl position="bottomleft" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredColonies.map((colony) => {
          const { position, level } = resolveColonyPosition(colony);
          const popupContent = renderColonyPopup(colony, level);

          // Levels 1 and 2 only ever render the uncertainty circle — no
          // marker pin — because a precise-looking pin defeats the blur
          // no matter how big the circle is: it still tells the viewer
          // "the colony is exactly here," which is the one thing blur
          // exists to prevent. Only level 3 (exact location) gets a pin,
          // and those are rendered separately below inside a cluster
          // group, so they're skipped here.
          if (level === 3) return null;

          return (
            <Circle
              key={colony.id}
              center={position}
              radius={BLUR_RADIUS_METERS[level]}
              pathOptions={{ color: "#DA8433", fillColor: "#DA8433", fillOpacity: 0.18, weight: 1 }}
              eventHandlers={{ click: handleColonyPinClick }}
            >
              <Tooltip direction="top" opacity={1}>
                🔒 {level === 1 ? t("locationBlur.signIn") : t("locationBlur.becomeCaretaker")}
              </Tooltip>
              {popupContent}
            </Circle>
          );
        })}

        {/* Exact-location (level 3) colony pins, grouped via clustering
            so nearby pins merge into a single number bubble at lower
            zoom levels instead of overlapping each other. */}
        <MarkerClusterGroup
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={70}
          zoomToBoundsOnClick
        >
          {filteredColonies.map((colony) => {
            const { position, level } = resolveColonyPosition(colony);
            if (level !== 3) return null;

            const icon = showColonyHealth
              ? healthRingIcons[colony.health_status] ?? colonyIcon
              : colony.verified_status === "unverified"
                ? unverifiedColonyIcon
                : colonyIcon;

            return (
              <Marker
                key={colony.id}
                position={position}
                icon={icon}
                eventHandlers={{ click: handleColonyPinClick }}
              >
                {renderColonyPopup(colony, level)}
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {heatMapOn &&
          filteredColonies.map((colony) => {
            const needScore = colonyNeedScores.get(colony.id);
            if (!needScore) return null;
            const { position } = resolveColonyPosition(colony);
            const color = needScore >= 2 ? "#C0392B" : "#DA8433";
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
              <strong>{getReportTypeLabel(report.type, t)}</strong>
              {!isExact && (
                <p className="mt-1 text-xs text-felines-text-secondary">
                  🔒 Localização aproximada
                </p>
              )}
              <a
                href={`/reports#report-${report.id}`}
                className="mt-2 block text-xs font-medium text-felines-accent-hover"
              >
                Ver relato
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
              <strong>Alerta: {getReportTypeLabel(report.type, t)}</strong>
              {!isExact && (
                <p className="mt-1 text-xs text-felines-text-secondary">
                  🔒 Localização aproximada
                </p>
              )}
              <a
                href={`/reports#report-${report.id}`}
                className="mt-2 block text-xs font-medium text-felines-accent-hover"
              >
                Ver relato
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
            {t("map.activityInArea")}
          </Link>
          <p className="text-xs text-felines-text-secondary">
            {t("map.moveToUpdateList")}
          </p>
        </div>
        {listExpanded && (
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {panelColonies.length === 0 && panelEmergencies.length === 0 && panelSightings.length === 0 ? (
              <p className="text-sm text-felines-text-secondary">
                {t("map.noneVisibleInArea")}
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
                      ⚠ {getReportTypeLabel(report.type, t)}
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
                      {resolveCastrationLabel(t, colony.castration_status, catCountsByColonyId.get(colony.id))}
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
                      {getReportTypeLabel(report.type, t)}
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
            aria-label={listExpanded ? t("map.hideActivityListAria") : t("map.showActivityListAria")}
            className="flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-felines-text-secondary transition-colors hover:text-felines-accent-hover"
          >
            <span>{listExpanded ? t("map.hideList") : t("map.showList")}</span>
            <span aria-hidden="true">{listExpanded ? "▲" : "▼"}</span>
          </button>
        </div>
      </div>
      )}

      {!compact && hasLoadedColonies && visiblePinTypes.has("colony") && filteredColonies.length === 0 && (
        // bottom-24 (not bottom-6) so this never overlaps the floating
        // "+ Cadastrar colônia" button anchored at the bottom-right.
        <div className="absolute bottom-24 left-1/2 z-[1000] w-[90%] max-w-md -translate-x-1/2 space-y-3">
          {panelSightings.length > 0 ? (
            <EmptyState
              main={t("map.unmappedSightingMain")}
              ctas={[{ label: t("map.registerColonyCta"), href: "/colony/new" }]}
            />
          ) : (
            <EmptyState
              main={t("map.noColonyMappedMain")}
              ctas={[
                { label: t("map.beFirstToMap"), href: "/colony/new" },
                {
                  label: t("map.learnWhatToLookFor"),
                  href: "/learn/what-is-a-cat-colony",
                },
              ]}
            />
          )}
          <div className="flex justify-center">
            <RotatingSingleFact facts={MAP_EMPTY_STATE_FACTS} />
          </div>
        </div>
      )}
    </div>
  );
}

// Popup content for a suggested-colony pin: explains the inference and
// offers two actions — register it for real (pre-filling the location)
// or add one more sighting confirmation at this exact spot.
function SuggestedColonyPopup({ suggestion }: { suggestion: SuggestedColony }) {
  const { t } = useLanguage();
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
      <p className="text-sm font-medium">{t("map.manyCatsSeenHere")}</p>
      <p className="mt-1 text-xs text-felines-text-secondary">
        {t("map.unregisteredColonyHint")}
      </p>
      <div className="mt-2 flex flex-col gap-1">
        <a
          href={`/colony/new?lat=${suggestion.latitude}&lng=${suggestion.longitude}`}
          className="text-xs font-medium text-felines-accent-hover"
        >
          {t("map.registerColonyHereCta")}
        </a>
        {confirmed ? (
          <span className="text-xs text-felines-success-hover">{t("map.thanksForConfirming")}</span>
        ) : (
          <button
            type="button"
            onClick={handleConfirmSighting}
            disabled={confirming}
            className="text-left text-xs font-medium text-felines-text-secondary hover:text-felines-accent disabled:opacity-50"
          >
            {confirming ? t("map.sending") : t("map.alsoSawCatsHere")}
          </button>
        )}
      </div>
    </Popup>
  );
}
