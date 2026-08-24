import { buildProfile } from "@/application/profile";
import {
  buildCountryCoverage,
  buildTechnologyIndex,
  groupTechnologyFamilies,
} from "@/domain/tech-index";
import { describe, expect, it } from "vitest";

const profile = buildProfile();
const index = buildTechnologyIndex(profile);

function entry(name: string) {
  const found = index.find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );
  if (!found) throw new Error(`sin entrada para ${name}`);
  return found;
}

function citations(name: string) {
  return entry(name).sources.map((source) => source.citation);
}

describe("índice de tecnologías", () => {
  it("cruza una tecnología que vive en empleos y en proyectos", () => {
    expect(citations("Redis")).toEqual(
      expect.arrayContaining([
        "experience:chequemotiva-techlead",
        "project:nuclear-hub",
        "project:joifilabs",
      ]),
    );
  });

  it("recoge las nubes que solo constan en palabras clave de proyecto", () => {
    expect(citations("Azure")).toContain("project:anahuac");
    expect(citations("GCP")).toContain("project:issste");
    expect(citations("BigQuery")).toContain("project:issste");
  });

  it("recoge la mensajería dispersa por el perfil", () => {
    expect(citations("MQTT")).toContain("project:joifilabs");
    expect(citations("SQS")).toEqual(
      expect.arrayContaining(["project:dti-cloud", "project:incentive-machine"]),
    );
    expect(citations("Twilio")).toContain("experience:cerocatorce-devops");
  });

  it("encuentra términos del vocabulario en el texto libre de otro bloque", () => {
    // OCR solo está declarado en las tecnologías de Chequemotiva; en
    // BillProTech vive en la arquitectura y la descripción.
    expect(citations("OCR")).toEqual(
      expect.arrayContaining([
        "experience:chequemotiva-techlead",
        "project:billprotech",
      ]),
    );
  });

  it("no inventa términos a partir de la prosa", () => {
    const names = index.map((item) => item.name.toLowerCase());
    expect(names).not.toContain("autoescalado y bases rds gestionadas");
    expect(names.every((name) => name.length < 40)).toBe(true);
  });

  it("unifica las variantes de nombre de un mismo framework", () => {
    const names = index.map((item) => item.name);
    expect(names).toContain("NestJS");
    expect(names).toContain("Vue");
    expect(names).not.toContain("Nestjs");
    expect(names).not.toContain("VueJS");
  });

  it("arrastra el nivel de la habilidad a sus componentes", () => {
    expect(entry("AWS").level).toBe(5);
    expect(entry("Python").level).toBe(4);
    expect(entry("Symfony").level).toBe(4);
    expect(entry("Redis").level).toBeUndefined();
  });

  it("deja sin fuentes la habilidad declarada sin evidencia", () => {
    expect(entry("Linux").sources).toEqual([]);
    expect(entry("PHP").sources).toEqual([]);
  });

  it("no registra tecnologías ausentes del perfil", () => {
    const names = index.map((item) => item.name.toLowerCase());
    for (const absent of ["kubernetes", "kafka", "langchain", "java"]) {
      expect(names).not.toContain(absent);
    }
  });
});

describe("familias tecnológicas", () => {
  it("cierra el inventario de bases de datos y caché", () => {
    const family = groupTechnologyFamilies(index).find(
      (item) => item.name === "Bases de datos y caché",
    );
    const names = family?.members.map((item) => item.name.toLowerCase()) ?? [];
    for (const required of [
      "mongodb",
      "postgresql",
      "aurora",
      "redis",
      "memcache",
      "cosmosdb",
      "bigquery",
    ]) {
      expect(names.some((name) => name.includes(required))).toBe(true);
    }
  });

  it("no mete nubes en la familia de bases de datos", () => {
    const family = groupTechnologyFamilies(index).find(
      (item) => item.name === "Bases de datos y caché",
    );
    const names = family?.members.map((item) => item.name.toLowerCase()) ?? [];
    expect(names).not.toContain("aws");
    expect(names).not.toContain("azure");
  });
});

describe("cobertura geográfica", () => {
  const coverage = buildCountryCoverage(profile);

  it("cubre los tres países del perfil", () => {
    expect(coverage.map((item) => item.country)).toEqual([
      "México",
      "España",
      "Canadá",
    ]);
  });

  it("reparte una empresa con país compuesto", () => {
    const spain = coverage.find((item) => item.country === "España");
    const mexico = coverage.find((item) => item.country === "México");
    expect(spain?.companies).toContain("Chequemotiva");
    expect(mexico?.companies).toContain("Chequemotiva");
  });
});
