// Free-text address input with autocomplete suggestions from
// OpenStreetMap's Nominatim search API, biased to the Natal, RN area.
// Helps people type a real, findable address instead of a vague
// description, while still allowing free text if nothing matches.
"use client";

import { useEffect, useRef, useState } from "react";

// Rough bounding box around Natal, RN, used to bias (not strictly
// limit) suggestions toward the region this app actually covers.
const NATAL_VIEWBOX = "-35.35,-5.70,-35.05,-5.95";

type Suggestion = {
  label: string;
  lat: number;
  lon: number;
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
        const params = new URLSearchParams({
          q: value,
          format: "json",
          limit: "5",
          viewbox: NATAL_VIEWBOX,
          bounded: "0",
          countrycodes: "br",
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
        );
        if (!response.ok) return;
        const results = await response.json();
        setSuggestions(
          results.map((result: { display_name: string; lat: string; lon: string }) => ({
            label: result.display_name,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
          }))
        );
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
        placeholder="Bairro ou rua (opcional)"
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
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
