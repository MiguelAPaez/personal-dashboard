import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/tokens.css";
import "@/styles/base.css";
import { profile } from "@/content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildPersonJsonLd, serializeJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "optional" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${profile.name} | Web developer`, template: `%s | ${profile.name}` },
  description: profile.headline,
  alternates: { canonical: siteUrl },
  openGraph: { title: profile.name, description: profile.headline, type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${newsreader.variable}`}>
      <body>
        <Header name={profile.name} upworkUrl={profile.links.upwork} />
        {children}
        <Footer profile={profile} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildPersonJsonLd(profile, siteUrl)) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
