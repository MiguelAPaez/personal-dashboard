import { z } from "zod";
import { faqItemSchema } from "./schema";

export const faq = z.array(faqItemSchema).parse([
  { question: "How do we start?", answer: "Send me an invite on Upwork with a short description of the project. I reply within a day with questions and a plan." },
  { question: "What happens after launch?", answer: "I include a 2-week bug-fix window after handoff at no extra cost. After that, changes are scoped and billed separately, hourly or as a fixed quote — whichever you prefer." },
  { question: "Do I own the code?", answer: "Yes. Once the final invoice is paid, you own all the code and assets outright, with no licensing restrictions or ongoing fees." },
]);
