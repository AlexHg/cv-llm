import { getProfile } from "@/application/profile";
import { toPrintView } from "@/application/print";
import { AgentPanel } from "@/components/agent-panel";
import { CvPanel } from "@/components/cv/cv-panel";

export default function Home() {
  const cv = toPrintView(getProfile());

  return (
    <main className="flex h-dvh min-h-0 flex-col lg:flex-row">
      <CvPanel cv={cv} />
      <AgentPanel />
    </main>
  );
}
