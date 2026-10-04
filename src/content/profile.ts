import { profileSchema } from "./schema";

export const profile = profileSchema.parse({
  name: "Miguel Paez",
  headline: "I build fast, reliable web apps for startups that need to ship.",
  summary:
    "I build Full Stack web, mobile, and API solutions for fintech, banking, and product teams. I have 6+ years of experience at one of Colombia’s largest banks.",
  bio: [
    "I've lead a Full-Stack team on the company, building web and mobile products used by millions of customers.",
    "Working on both the front-end and the back-end. My customers can expect a collaborative approach with clear communication and timely delivery.",
    "I am committed to delivering high-quality software solutions that meet the needs of my clients and their users.",
  ],
  photo: { src: "/personal-dashboard/images/profile-placeholder.jpeg", alt: "Portrait of Miguel Paez", width: 800, height: 800 },
  location: "Bogota, Colombia",
  timezone: "UTC-5, overlaps US and EU business hours",
  availability: "Available for new projects",
  responseTime: "Replies within 24 hours",
  links: {
    upwork: "https://www.upwork.com/freelancers/~01cd1e14746ee0b279",
    github: "https://github.com/MiguelAPaez",
    linkedin: "https://www.linkedin.com/in/miguelpaezramos",
    email: "miguelangelpaezramos@gmail.com",
  },
});
