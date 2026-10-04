import { z } from "zod";
import { serviceSchema } from "./schema";

export const services = z.array(serviceSchema).parse([
  {
    name: "Landing page",
    forWho: "Founders who need a fast, clear page that converts",
    deliverables: ["Responsive design", "Production-ready code", "SEO basics", "Deployment and handoff"],
    timeline: "1 week",
    priceFrom: 500,
  },
  {
    name: "Web app MVP",
    forWho: "Teams validating a product idea",
    deliverables: ["Scoped feature list", "Working app with auth", "Tests for core flows", "Documentation"],
    timeline: "4 to 6 weeks",
    priceFrom: 3000,
  },
]);
