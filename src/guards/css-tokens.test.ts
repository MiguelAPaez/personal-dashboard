import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const srcDir = path.join(process.cwd(), "src");

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith(".css") ? [full] : [];
  });
}

const tokensPath = path.join(srcDir, "styles", "tokens.css");
const others = () => cssFiles(srcDir).filter((f) => f !== tokensPath);

describe("css tokens", () => {
  it("tokens.css exists and defines custom properties", () => {
    expect(readFileSync(tokensPath, "utf8")).toMatch(/--color-bg\s*:/);
  });

  it("no raw colors outside tokens.css", () => {
    const offenders = others().filter((f) =>
      /#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla)\(/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("every var(--x) used is defined in tokens.css", () => {
    const tokens = readFileSync(tokensPath, "utf8");
    const defined = new Set([...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    const missing: string[] = [];
    for (const file of others()) {
      const css = readFileSync(file, "utf8");
      for (const m of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
        if (!defined.has(m[1])) missing.push(`${path.relative(srcDir, file)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
