"use client";

import { createCatalog, type CatalogRenderers } from "@copilotkit/a2ui-renderer";
import {
  cvA2uiDefinitions,
  type CvA2uiDefinitions,
} from "@/components/a2ui/definitions";
import { RadarChart } from "@/components/a2ui/radar-chart";
import { Timeline } from "@/components/a2ui/timeline";
import { CV_A2UI_CATALOG_ID } from "@/application/a2ui-catalog";

const renderers: CatalogRenderers<CvA2uiDefinitions> = {
  RadarChart: ({ props }) => <RadarChart {...props} />,
  Timeline: ({ props }) => <Timeline {...props} />,
};

export const cvA2uiCatalog = createCatalog(cvA2uiDefinitions, renderers, {
  catalogId: CV_A2UI_CATALOG_ID,
  includeBasicCatalog: true,
});
