"use client";

import { useState } from "react";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function usePdfDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  async function downloadPDF(filename = "Alejandro-Hernandez-CV.pdf") {
    if (isGenerating) return;

    setIsGenerating(true);

    const host = document.createElement("div");

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const sourcePages = document.querySelectorAll<HTMLElement>(".page");
      if (!sourcePages.length) {
        throw new Error("No se encontraron páginas del CV");
      }

      host.setAttribute("aria-hidden", "true");
      host.style.cssText = [
        "position:fixed",
        "left:-10000px",
        "top:0",
        `width:${PAGE_WIDTH}px`,
        "pointer-events:none",
      ].join(";");

      for (const page of sourcePages) {
        const clone = page.cloneNode(true) as HTMLElement;
        clone.style.transform = "none";
        clone.style.width = `${PAGE_WIDTH}px`;
        clone.style.height = `${PAGE_HEIGHT}px`;
        host.appendChild(clone);
      }

      document.body.appendChild(host);
      await nextFrame();

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pages = host.querySelectorAll<HTMLElement>(".page");

      for (let i = 0; i < pages.length; i++) {
        const el = pages[i];
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: el.offsetWidth,
          height: el.offsetHeight,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
        });

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        const renderHeight = Math.min(imgHeight, pageHeight);

        if (i > 0) pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          0,
          imgWidth,
          renderHeight,
        );
      }

      pdf.save(filename);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("No se pudo generar el PDF. Revisa la consola.");
    } finally {
      host.remove();
      setIsGenerating(false);
    }
  }

  return { isGenerating, downloadPDF };
}
