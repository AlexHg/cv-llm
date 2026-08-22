"use client";

import type { CvData } from "@/data/types";
import { usePdfDownload } from "@/lib/use-pdf-download";

export function CvDownloadButton({ cv }: { cv: CvData }) {
  const { isGenerating, downloadPDF } = usePdfDownload();
  const filename = `Alejandro-Hernandez-Curriculum-${new Date().toISOString().split("T")[0]}.pdf`;

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 font-head text-sm font-semibold tracking-wider whitespace-nowrap text-ink shadow-sm transition hover:bg-mustard disabled:cursor-wait disabled:opacity-80"
      disabled={isGenerating}
      onClick={() => downloadPDF(filename)}
    >
      {!isGenerating && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
          />
        </svg>
      )}
      {isGenerating ? cv.labels.generating : cv.labels.downloadPdf}
    </button>
  );
}
