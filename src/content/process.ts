import { z } from "zod";
import { processStepSchema } from "./schema";

export const processSteps = z.array(processStepSchema).parse([
  { title: "Brief", description: "We agree on goals, scope and what done looks like." },
  { title: "Plan", description: "You get a short plan with milestones and a clear timeline." },
  { title: "Build", description: "I build in small steps and share working previews." },
  { title: "Review", description: "You review, I refine, and we test the important flows." },
  { title: "Handoff", description: "Deployment, documentation and support after launch." },
]);
