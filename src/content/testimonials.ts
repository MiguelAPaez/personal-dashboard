import { z } from "zod";
import { testimonialSchema } from "./schema";

// Add real Upwork reviews here once you have them. The section stays hidden while this is empty.
export const testimonials = z.array(testimonialSchema).parse([]);
