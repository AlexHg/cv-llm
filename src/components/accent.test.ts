import {
  isAccentColor,
  listAccentNames,
  resolveAccent,
} from "@/components/accent";
import { describe, expect, it } from "vitest";

describe("resolveAccent", () => {
  it("resuelve nombre, alias y hex", () => {
    expect(resolveAccent("mostaza")).toEqual({ hex: "#f5b81c", name: "mostaza" });
    expect(resolveAccent("mustard")).toEqual({ hex: "#f5b81c", name: "mostaza" });
    expect(resolveAccent("#f5b81c")).toEqual({ hex: "#f5b81c", name: "mostaza" });
    expect(resolveAccent("f5b81c")).toEqual({ hex: "#f5b81c", name: "mostaza" });
    expect(resolveAccent("índigo")).toEqual({ hex: "#6366f1", name: "índigo" });
  });

  it("distingue naranja de naranja oscuro y rechaza ambiguos", () => {
    expect(resolveAccent("naranja")).toEqual({ hex: "#f97316", name: "naranja" });
    expect(resolveAccent("naranja oscuro")).toEqual({
      hex: "#ea580c",
      name: "naranja oscuro",
    });
    expect(resolveAccent("naran")).toBeNull();
    expect(resolveAccent("")).toBeNull();
    expect(resolveAccent("chartreuse")).toBeNull();
  });

  it("valida la paleta", () => {
    expect(isAccentColor("#f5b81c")).toBe(true);
    expect(isAccentColor("#000000")).toBe(false);
    expect(isAccentColor(null)).toBe(false);
    expect(listAccentNames().some((item) => item.startsWith("mostaza"))).toBe(true);
  });
});
