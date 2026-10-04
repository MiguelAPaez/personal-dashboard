import { credentials, faq, processSteps, profile, projects, services, stats, testimonials } from "@/content";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { About } from "@/components/sections/About";
import { Credentials } from "@/components/sections/Credentials";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <main>
      <Hero profile={profile} />
      <Projects projects={projects} />
      <TrustStrip stats={stats} />
      <About profile={profile} />
      <Credentials summary={profile.summary} credentials={credentials} />
      <Services services={services} upworkUrl={profile.links.upwork} />
      <Process steps={processSteps} />
      <Testimonials testimonials={testimonials} />
      <Faq items={faq} />
      <FinalCta profile={profile} />
    </main>
  );
}
