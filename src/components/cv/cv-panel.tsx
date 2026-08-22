"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CvData } from "@/data/types";
import { CvAccentPicker } from "./cv-accent-picker";
import { CvDownloadButton } from "./cv-download-button";
import { CvPageOne } from "./cv-page-one";
import { CvPageTwo } from "./cv-page-two";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export function CvPanel({ cv }: { cv: CvData }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(([entry]) => {
      const next = Math.min(1.18, (entry.contentRect.width - 16) / PAGE_WIDTH);
      setScale(Number.isFinite(next) && next > 0 ? next : 0.85);
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#e5e7eb]">
      <header className="no-print z-20 flex h-14 items-center justify-between gap-3 border-b border-black/40 bg-ink px-4">
        <CvAccentPicker />
        <CvDownloadButton cv={cv} />
      </header>

      <div
        ref={frameRef}
        className="cv-canvas min-h-0 flex-1 overflow-auto px-2 py-4"
      >
        <div
          className="font-body mx-auto flex flex-col items-center gap-6 text-body"
          style={{ width: PAGE_WIDTH * scale }}
        >
          <ScaledPage scale={scale}>
            <CvPageOne cv={cv} />
          </ScaledPage>
          <ScaledPage scale={scale}>
            <CvPageTwo cv={cv} />
          </ScaledPage>
        </div>
      </div>
    </section>
  );
}

function ScaledPage({
  scale,
  children,
}: {
  scale: number;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        width: PAGE_WIDTH * scale,
        height: PAGE_HEIGHT * scale,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
