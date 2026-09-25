import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Luxurious_Script } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import "./globals.css";

const aileron = localFont({
  src: "./fonts/Aileron-Regular.woff",
  variable: "--font-aileron",
  display: "swap",
  preload: true,
});

const luxuriousScript = Luxurious_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-luxurious-script",
  display: "swap",
  preload: true,
});

/* App shell and metadata */
export const metadata: Metadata = {
  metadataBase: new URL("https://sarayu.dev"),
  title: "Sarayu Marri",
  description: "Computer science student, VR researcher, and designer.",
  // the preview card when the link is shared (LinkedIn, iMessage, Discord...).
  // the picture comes from src/app/opengraph-image.jpg automatically.
  openGraph: {
    title: "Sarayu Marri",
    description: "Computer science student, VR researcher, and designer.",
    url: "https://sarayu.dev",
    siteName: "Sarayu Marri",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#212B18", // colors the phone browser bar to match the site
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${aileron.variable} ${luxuriousScript.variable}`}>
        <Nav />
        <SpotifyPlayer />
        {children}
        <Footer />
      </body>
    </html>
  );
}
