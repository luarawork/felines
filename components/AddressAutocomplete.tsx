// Free-text address input with autocomplete suggestions from
// OpenStreetMap's Nominatim search API, anchored to Natal, RN. Uses a
// structured query (street/city/state/country) instead of a single
// free-text string — Nominatim matches house numbers much more
// reliably that way — and flags which suggestions actually resolved to
// a specific house number versus just a street/area match, since OSM's
// address coverage in Natal is incomplete and a street-level match can
// still be off by a fair distance.
"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = {
  label: string;
  lat: number;
  lon: number;
  hasHouseNumber: boolean;
};

export default function AddressAutocomplete({
  value,
  onChange,
  onSelectLocation,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectLocation?: (lat: number, lon: number) => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        // Structured search: passing the typed text as `street` makes
        // Nominatim parse it as "<housenumber> <streetname>" and match
        // house-level points when they exist, instead of treating the
        // whole string as a single fuzzy label.
        const params = new URLSearchParams({
          street: value,
          city: "Natal",
          state: "Rio Grande do Norte",
          country: "Brasil",
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
        );
        if (!response.ok) return;
        const results = await response.json();
        const parsed: Suggestion[] = results.map(
          (result: {
            display_name: string;
            lat: string;
            lon: string;
            address?: { house_number?: string };
          }) => ({
            label: result.display_name,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
            hasHouseNumber: !!result.address?.house_number,
          })
        );
        // House-level matches first — they're the ones worth trusting.
        parsed.sort((a, b) => Number(b.hasHouseNumber) - Number(a.hasHouseNumber));
        setSuggestions(parsed);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function handleSelect(suggestion: Suggestion) {
    onChange(suggestion.label);
    onSelectLocation?.(suggestion.lat, suggestion.lon);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(formEvent) => onChange(formEvent.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Rua, número e bairro"
        maxLength={200}
        className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-felines-border bg-white shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion.label}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="block w-full px-3 py-2 text-left text-sm text-felines-text-primary hover:bg-felines-background"
              >
                {suggestion.label}
                {!suggestion.hasHouseNumber && (
                  <span className="ml-1 text-xs text-felines-warning">
                    (aproximado, sem número exato)
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
