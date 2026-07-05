// Styled replacement for a bare <input type="file">, used everywhere a
// photo can be attached (colony, cat, profile, report forms). Browsers
// render native file inputs wildly differently and they're easy to miss
// visually — a labeled button with an upload icon makes "you can add a
// photo here" obvious at a glance.
// Validates type (image only) and size (max 5 MB) before handing the
// file to the parent, so errors surface before any network request.
"use client";

import { useId, useState } from "react";
import { useLanguage } from "@/lib/i18n";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function PhotoUploadButton({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputId = useId();
  const { t } = useLanguage();
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleChange(formEvent: React.ChangeEvent<HTMLInputElement>) {
    const selected = formEvent.target.files?.[0] ?? null;
    setValidationError(null);

    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setValidationError(t("photoUpload.invalidType"));
        formEvent.target.value = "";
        onChange(null);
        return;
      }
      if (selected.size > MAX_BYTES) {
        setValidationError(t("photoUpload.tooLarge"));
        formEvent.target.value = "";
        onChange(null);
        return;
      }
    }

    onChange(selected);
  }

  return (
    <div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-felines-border bg-felines-surface px-4 py-2 text-sm font-medium text-felines-text-primary transition-colors hover:border-felines-accent"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {label}
      </label>
      {validationError && (
        <p role="alert" className="mt-1 text-xs text-felines-emergency">{validationError}</p>
      )}
      {!validationError && file && (
        <p className="mt-1 text-xs text-felines-success-hover">
          {t("photoUpload.selected").replace("{name}", file.name)}
        </p>
      )}
    </div>
  );
}
