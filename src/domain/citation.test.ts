import {
  parseCitation,
  parseCitationList,
  resolveCitationKeys,
  skillCiteKey,
  splitCitationSegments,
  type CitationCatalog,
} from "@/domain/citation";
import { describe, expect, it } from "vitest";

const catalog: CitationCatalog = {
  experienceIds: ["cerocatorce-techlead", "ebc-techlead"],
  projectIds: ["nuclear-hub", "incentive-machine"],
  skills: {
    python: "skill:python",
    "reactjs next js": "skill:reactjs-next-js",
  },
  technologies: {
    redis: ["experience:chequemotiva-techlead", "project:nuclear-hub"],
  },
  competencies: {
    leadership: ["experience:ebc-techlead", "experience:cerocatorce-techlead"],
  },
  companies: {
    cerocatorce: [
      "experience:cerocatorce-techlead",
      "project:incentive-machine",
    ],
  },
};

describe("parseCitation", () => {
  it("acepta identity y los kinds con id", () => {
    expect(parseCitation("(identity)")).toEqual({
      kind: "identity",
      raw: "identity",
    });
    expect(parseCitation("experience:cerocatorce-techlead")).toEqual({
      kind: "experience",
      value: "cerocatorce-techlead",
      raw: "experience:cerocatorce-techlead",
    });
    expect(parseCitation("(SKILL:ReactJS / Next.js)")).toEqual({
      kind: "skill",
      value: "ReactJS / Next.js",
      raw: "skill:ReactJS / Next.js",
    });
  });

  it("rechaza texto que no es cita", () => {
    expect(parseCitation("foo:bar")).toBeNull();
    expect(parseCitation("skill:")).toBeNull();
    expect(parseCitation("")).toBeNull();
  });
});

describe("splitCitationSegments", () => {
  it("solo enlaza citas entre paréntesis; no la palabra identity suelta", () => {
    const segments = splitCitationSegments(
      "Fortalezas (identity) y un rol (experience:cerocatorce-techlead). Sin identity suelta.",
    );

    expect(segments).toEqual([
      { type: "text", value: "Fortalezas " },
      {
        type: "citation",
        value: "(identity)",
        citation: { kind: "identity", raw: "identity" },
      },
      { type: "text", value: " y un rol " },
      {
        type: "citation",
        value: "(experience:cerocatorce-techlead)",
        citation: {
          kind: "experience",
          value: "cerocatorce-techlead",
          raw: "experience:cerocatorce-techlead",
        },
      },
      { type: "text", value: ". Sin identity suelta." },
    ]);
  });

  it("acepta skill con espacios y no parte el resto del markdown", () => {
    const [first, citation, rest] = splitCitationSegments(
      "Usa **Python** (skill:Python) en FastAPI.",
    );

    expect(first).toEqual({ type: "text", value: "Usa **Python** " });
    expect(citation).toMatchObject({
      type: "citation",
      value: "(skill:Python)",
    });
    expect(rest).toEqual({ type: "text", value: " en FastAPI." });
  });

  it("separa varias citas dentro del mismo paréntesis", () => {
    const segments = splitCitationSegments(
      "liderazgo en proyectos de tecnología (experience:cerocatorce-devops, experience:cerocatorce-techlead).",
    );

    expect(segments).toEqual([
      { type: "text", value: "liderazgo en proyectos de tecnología " },
      { type: "text", value: "(" },
      {
        type: "citation",
        value: "experience:cerocatorce-devops",
        citation: {
          kind: "experience",
          value: "cerocatorce-devops",
          raw: "experience:cerocatorce-devops",
        },
      },
      { type: "text", value: ", " },
      {
        type: "citation",
        value: "experience:cerocatorce-techlead",
        citation: {
          kind: "experience",
          value: "cerocatorce-techlead",
          raw: "experience:cerocatorce-techlead",
        },
      },
      { type: "text", value: ")" },
      { type: "text", value: "." },
    ]);
  });

  it("no trata un paréntesis de duración como cita", () => {
    expect(splitCitationSegments("Permanencia (5 años y 1 mes) en Cerocatorce.")).toEqual([
      {
        type: "text",
        value: "Permanencia (5 años y 1 mes) en Cerocatorce.",
      },
    ]);
  });
});

describe("parseCitationList", () => {
  it("lee una lista separada por coma o por y", () => {
    expect(
      parseCitationList(
        "(experience:cerocatorce-devops, experience:cerocatorce-techlead)",
      ).map((item) => item.raw),
    ).toEqual([
      "experience:cerocatorce-devops",
      "experience:cerocatorce-techlead",
    ]);
    expect(
      parseCitationList("(identity y company:cerocatorce)").map((item) => item.raw),
    ).toEqual(["identity", "company:cerocatorce"]);
  });
});

describe("resolveCitationKeys", () => {
  it("mapea cada kind a las secciones del CV", () => {
    expect(
      resolveCitationKeys({ kind: "identity", raw: "identity" }, catalog),
    ).toEqual(["identity"]);
    expect(
      resolveCitationKeys(
        {
          kind: "experience",
          value: "cerocatorce-techlead",
          raw: "experience:cerocatorce-techlead",
        },
        catalog,
      ),
    ).toEqual(["experience:cerocatorce-techlead"]);
    expect(
      resolveCitationKeys(
        { kind: "company", value: "cerocatorce", raw: "company:cerocatorce" },
        catalog,
      ),
    ).toEqual(["experience:cerocatorce-techlead", "project:incentive-machine"]);
    expect(
      resolveCitationKeys(
        { kind: "competency", value: "leadership", raw: "competency:leadership" },
        catalog,
      ),
    ).toEqual(["experience:ebc-techlead", "experience:cerocatorce-techlead"]);
  });

  it("resuelve skill por barra o, si no hay, por el índice de tecnologías", () => {
    expect(
      resolveCitationKeys(
        { kind: "skill", value: "ReactJS / Next.js", raw: "skill:ReactJS / Next.js" },
        catalog,
      ),
    ).toEqual(["skill:reactjs-next-js"]);
    expect(
      resolveCitationKeys(
        { kind: "skill", value: "Redis", raw: "skill:Redis" },
        catalog,
      ),
    ).toEqual(["experience:chequemotiva-techlead", "project:nuclear-hub"]);
  });

  it("ignora ids inventados", () => {
    expect(
      resolveCitationKeys(
        { kind: "experience", value: "no-existe", raw: "experience:no-existe" },
        catalog,
      ),
    ).toEqual([]);
  });

  it("skillCiteKey es estable frente a mayúsculas y puntuación", () => {
    expect(skillCiteKey("ReactJS / Next.js")).toBe("skill:reactjs-next-js");
    expect(skillCiteKey("Python")).toBe("skill:python");
  });
});
