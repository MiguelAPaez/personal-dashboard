import { readFileSync } from "node:fs";
import path from "node:path";

const banned = [
  "tailwindcss", "@tailwindcss", "bootstrap", "@mui", "styled-components",
  "@emotion", "@chakra-ui", "sass", "shadcn", "class-variance-authority",
];

describe("dependencies", () => {
  it("contain no styling library", () => {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const found = names.filter((n) => banned.some((b) => n === b || n.startsWith(`${b}/`)));
    expect(found).toEqual([]);
  });
});
