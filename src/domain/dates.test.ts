import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatPeriod,
  monthsBetween,
} from "@/domain/dates";

describe("monthsBetween", () => {
  it("calcula tramos mensuales como en el CV", () => {
    expect(
      monthsBetween({ year: 2024, month: 7 }, { year: 2026, month: 3 }),
    ).toBe(20);
    expect(
      monthsBetween({ year: 2019, month: 6 }, { year: 2024, month: 7 }),
    ).toBe(61);
    expect(
      monthsBetween({ year: 2015, month: 1 }, { year: 2019, month: 6 }),
    ).toBe(53);
    expect(
      monthsBetween({ year: 2026, month: 3 }, { year: 2026, month: 6 }),
    ).toBe(3);
  });

  it("cuenta años inclusivos cuando no hay mes", () => {
    expect(monthsBetween({ year: 2021 }, { year: 2021 })).toBe(12);
    expect(monthsBetween({ year: 2023 }, { year: 2025 })).toBe(36);
  });
});

describe("formatDuration / formatPeriod", () => {
  it("formatea duraciones en español", () => {
    expect(formatDuration(20)).toBe("1 año y 8 meses");
    expect(formatDuration(61)).toBe("5 años y 1 mes");
    expect(formatDuration(53)).toBe("4 años y 5 meses");
    expect(formatDuration(12)).toBe("1 año");
    expect(formatDuration(3)).toBe("3 meses");
  });

  it("reproduce los periodos del PDF", () => {
    expect(
      formatPeriod({ year: 2024, month: 7 }, { year: 2026, month: 3 }),
    ).toBe("Jul 2024 – Mar 2026");
    expect(
      formatPeriod({ year: 2015, month: 1 }, { year: 2019, month: 6 }),
    ).toBe("Ene 2015 – Jun 2019");
    expect(formatPeriod({ year: 2014 }, { year: 2019 })).toBe("2014 – 2019");
  });
});
