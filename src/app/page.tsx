import { AgentPanel } from "@/components/agent-panel";
import { CvPanel } from "@/components/cv/cv-panel";
import { resolveCv } from "@/data/resolve-cv";

export default function Home() {
  const cv = resolveCv("cloud");

  return (
    <main className="flex h-dvh min-h-0 flex-col lg:flex-row">
      <CvPanel cv={cv} />
      <AgentPanel />
    </main>
  );
}
