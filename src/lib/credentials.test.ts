import { groupCredentials } from "./credentials";
import type { Credential } from "@/content/schema";

const c = (type: Credential["type"], title: string, start: string): Credential => ({ type, title, org: "Org", start });

describe("groupCredentials", () => {
  it("groups by type and sorts newest first, mixing YYYY and YYYY-MM", () => {
    const groups = groupCredentials([
      c("job", "old", "2018"),
      c("job", "new", "2022-06"),
      c("job", "mid", "2022-01"),
      c("study", "degree", "2015"),
    ]);
    expect(groups.job.map((j) => j.title)).toEqual(["new", "mid", "old"]);
    expect(groups.study).toHaveLength(1);
    expect(groups.certification).toEqual([]);
  });
});
