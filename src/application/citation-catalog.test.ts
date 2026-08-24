import { buildCitationCatalog } from "@/application/citation-catalog";
import { getProfile } from "@/application/profile";
import { parseCitation, resolveCitationKeys } from "@/domain/citation";
import { describe, expect, it } from "vitest";

function keys(raw: string) {
  const citation = parseCitation(raw);
  if (!citation) throw new Error(`cita inválida: ${raw}`);
  return resolveCitationKeys(citation, buildCitationCatalog(getProfile()));
}

describe("buildCitationCatalog", () => {
  it("resuelve citas reales del perfil a bloques del CV", () => {
    expect(keys("(identity)")).toEqual(["identity"]);
    expect(keys("(experience:cerocatorce-techlead)")).toEqual([
      "experience:cerocatorce-techlead",
    ]);
    expect(keys("(project:nuclear-hub)")).toEqual(["project:nuclear-hub"]);
    expect(keys("(skill:Python)")).toEqual(["skill:python"]);
    expect(keys("(company:cerocatorce)")).toEqual([
      "experience:cerocatorce-techlead",
      "experience:cerocatorce-devops",
      "project:incentive-machine",
    ]);
    expect(keys("(competency:leadership)")).toEqual([
      "experience:ebc-techlead",
      "experience:chequemotiva-techlead",
      "experience:cerocatorce-techlead",
    ]);
  });

  it("una tecnología sin barra de habilidad apunta a sus orígenes", () => {
    expect(keys("(skill:Redis)")).toEqual(
      expect.arrayContaining([
        "experience:chequemotiva-techlead",
        "project:nuclear-hub",
      ]),
    );
  });
});
