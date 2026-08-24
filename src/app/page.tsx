import { buildCitationCatalog } from "@/application/citation-catalog";
import { getProfile } from "@/application/profile";
import { toPrintView } from "@/application/print";
import { AgentPanel } from "@/components/agent-panel";
import { CitationHighlightProvider } from "@/components/citation/citation-highlight";
import { CvPanel } from "@/components/cv/cv-panel";

export default function Home() {
  const profile = getProfile();

  return (
    <CitationHighlightProvider catalog={buildCitationCatalog(profile)}>
      <main className="flex h-dvh min-h-0 flex-col lg:flex-row">
        <CvPanel cv={toPrintView(profile)} />
        <AgentPanel />
      </main>
    </CitationHighlightProvider>
  );
}
