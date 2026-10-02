import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PROVIDERS, providerLogo } from "./catalogue";

describe("provider logos", () => {
  const providers = Object.values(PROVIDERS).flat();

  it("has a logo file on disk for every provider in the directories", () => {
    const missing = providers
      .filter((p) => {
        const logo = providerLogo(p.name);
        return !logo || !existsSync(path.join(process.cwd(), "public", logo.src));
      })
      .map((p) => p.name);
    expect(missing).toEqual([]);
  });
});
