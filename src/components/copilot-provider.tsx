"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";
import { cvA2uiCatalog } from "@/components/a2ui/catalog";
import { AccentProvider } from "@/lib/accent";

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      useSingleEndpoint={false}
      a2ui={{ catalog: cvA2uiCatalog }}
    >
      <AccentProvider>{children}</AccentProvider>
    </CopilotKit>
  );
}
