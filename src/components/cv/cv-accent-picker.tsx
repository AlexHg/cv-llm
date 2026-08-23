"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ACCENT_SWATCHES, useAccentColor } from "@/lib/accent";

export function CvAccentPicker() {
  const { accent, setAccent, colors } = useAccentColor();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 bg-white px-3 font-head text-sm font-semibold tracking-wider text-ink shadow-sm transition hover:bg-gray-50"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="h-5 w-5 rounded-full border border-black/10"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        Color
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-soft transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute top-[calc(100%+8px)] left-0 z-30 grid w-44 grid-cols-5 gap-2 rounded-2xl border border-ink/20 bg-white p-2.5 shadow-xl"
          role="group"
          aria-label="Color de acento"
        >
          {colors.map((color) => {
            const swatch = ACCENT_SWATCHES.find((item) => item.hex === color);
            return (
              <button
                key={color}
                type="button"
                className={`aspect-square w-full rounded-full border border-black/10 transition hover:scale-105 ${
                  accent === color ? "ring-2 ring-ink ring-offset-2" : ""
                }`}
                style={{ backgroundColor: color }}
                aria-label={swatch?.name ?? color}
                aria-pressed={accent === color}
                onClick={() => {
                  setAccent(color);
                  setOpen(false);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
