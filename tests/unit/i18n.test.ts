import { describe, it, expect } from "vitest";
import { altLangPath, homePath, langOf, t, workPath } from "@/lib/i18n";

describe("i18n", () => {
  it("t picks the language and falls back", () => {
    expect(t({ id: "Halo", en: "Hello" }, "en")).toBe("Hello");
    expect(t({ id: "Halo", en: "" }, "en")).toBe("Halo");
    expect(t(null, "id")).toBe("");
  });
  it("paths", () => {
    expect(homePath("id")).toBe("/");
    expect(workPath("en", "ciri")).toBe("/en/work/ciri");
    expect(workPath("id", "ciri")).toBe("/karya/ciri");
  });
  it("altLangPath maps to the twin page", () => {
    expect(altLangPath("/")).toBe("/en");
    expect(altLangPath("/en")).toBe("/");
    expect(altLangPath("/karya/ciri")).toBe("/en/work/ciri");
    expect(altLangPath("/en/work/ciri/")).toBe("/karya/ciri");
  });
  it("langOf", () => {
    expect(langOf("/en/work/x")).toBe("en");
    expect(langOf("/karya/x")).toBe("id");
    expect(langOf("/english")).toBe("id");
  });
});
