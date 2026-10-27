import { describe, it, expect } from "vitest";
import { checkTheme, contrastRatio } from "@/lib/contrast";

describe("contrastRatio", () => {
  it("black on white is 21", () => expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1));
  it("#777 on white is just under AA", () => expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2));
  it("is symmetric", () => expect(contrastRatio("#204DC6", "#FFF6E0")).toBeCloseTo(contrastRatio("#FFF6E0", "#204DC6"), 6));
  it("invalid colour gives NaN", () => expect(contrastRatio("blue", "#fff")).toBeNaN());
});

describe("checkTheme", () => {
  it("flags ink that is too close to the wall", () => {
    const rows = checkTheme({ wall: "#204DC6", ink: "#3A60CC", muted: "#C9D4F6", accent: "#FFD23F", btnBg: "#FFD23F", btnInk: "#111111" });
    expect(rows.find((r) => r.pair === "ink/wall")?.ok).toBe(false);
    expect(rows.find((r) => r.pair === "btnInk/btnBg")?.ok).toBe(true);
  });
});
