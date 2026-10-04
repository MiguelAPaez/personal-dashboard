import { z } from "zod";
import { credentialSchema } from "./schema";

export const credentials = z.array(credentialSchema).parse([
  { type: "job", title: "Software Development Intern", org: "Banco de Bogota", start: "2019-07", end: "2020-01", description: "Cut a 2-week manual data-loading process to 20 minutes by building a web application." },
  { type: "job", title: "Junior Full Stack Developer", org: "Banco de Bogota", start: "2020-09", end: "2021-07", description: "Implemented new features for digital products, including web and mobile applications." },
  { type: "job", title: "Middle Full Stack Developer", org: "Banco de Bogota", start: "2021-08", end: "2022-09", description: "Developed a responsive and inclusive interface for multiple devices and users with diverse abilities." },
  { type: "job", title: "Senior Full Stack Developer & Team Lead", org: "Banco de Bogota", start: "2022-10", end: "present", description: "Lead architecture planning and delivery of key initiatives across Digital Teams." },
  { type: "study", title: "Systems Engineer", org: "Pontificia Universidad Javeriana", start: "2015", end: "2020" },
  { type: "study", title: "M.Sc. Systems Engineer and Computing", org: "Pontificia Universidad Javeriana", start: "2022", end: "2024" },
  { type: "study", title: "M.Sc. Analytics for Business Intelligence", org: "Pontificia Universidad Javeriana", start: "2022", end: "2024" },
  { type: "certification", title: "Placeholder: Certification", org: "Issuer", start: "2023-05", verifyUrl: "https://example.com/verify" },
]);
