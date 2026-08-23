import { includesNormalized, normalize, stripHtml } from "@/domain/text";
import { describe, expect, it } from "vitest";

describe("text", () => {
  it("stripHtml aplana marcas y espacios", () => {
    expect(stripHtml("Hola <i>mundo</i>  <b>CV</b>")).toBe("Hola mundo CV");
    expect(stripHtml("sin html")).toBe("sin html");
  });

  it("normalize quita acentos, mayúsculas y puntuación", () => {
    expect(normalize("Anáhuac Puebla!")).toBe("anahuac puebla");
    expect(normalize("CQM-Rewards")).toBe("cqm rewards");
    expect(normalize("  ")).toBe("");
  });

  it("includesNormalized no coincide con needle vacía", () => {
    expect(includesNormalized("AWS ECS", "aws")).toBe(true);
    expect(includesNormalized("Cerocatorce", "CERO")).toBe(true);
    expect(includesNormalized("AWS", "")).toBe(false);
    expect(includesNormalized("Python", "AWS")).toBe(false);
  });
});
