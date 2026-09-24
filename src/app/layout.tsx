import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

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
      <head>
        {/* fonts: connect early, then load in parallel with the page instead of after globals.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Luxurious+Script&display=swap" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/aileron" />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
