// Clickable timeline photo thumbnail that opens a full-size lightbox on
// click, closeable with the × button, Escape, or clicking the backdrop.
"use client";

import { useState } from "react";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

export default function TimelinePhoto({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  useEscapeToClose(open, () => setOpen(false));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-2 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-24 w-24 rounded-lg object-cover transition-opacity hover:opacity-90"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white hover:bg-white/20"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
