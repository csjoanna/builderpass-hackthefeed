import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://hack-the-feed.vercel.app";
const SITE_NAME = "Hack the Feed";
const SITE_TITLE = "Hack the Feed — Builder Pass";
const SITE_DESCRIPTION =
  "Generate your builder pass for Hack the Feed — the AI video search hackathon in Paris with Oriane, Lovable, Albert School and Brut. Saturday 7 November 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Hack the Feed",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Hack the Feed",
    "AI video hackathon",
    "AI video search",
    "Paris Creator Week",
    "Oriane",
    "Lovable",
    "Albert School",
    "Brut",
    "builder pass",
    "boarding pass generator",
  ],
  openGraph: {
    title: SITE_TITLE,
    description:
      "The AI video search hackathon. Paris · Sat 7 Nov 2026. Generate your builder boarding pass.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      "The AI video search hackathon. Paris · Sat 7 Nov 2026. Generate your builder boarding pass.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        {children}
      </body>
    </html>
  );
}
