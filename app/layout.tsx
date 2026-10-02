import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Sans_Condensed } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex-sans" });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plex-condensed",
});
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: "600",
  variable: "--font-plex-arabic",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "Wusool — arrival, in the right order", template: "%s · Wusool" },
  description:
    "Plan a move to Abu Dhabi as a sequence of dependent steps — company setup, visas, housing, schools and arrival — and see which date really sets yours.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexCondensed.variable} ${plexMono.variable} ${plexArabic.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
