import "./globals.css";
import type { Metadata, Viewport } from "next";
import Header from "./Header";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Wilhelm Tyskeberge — Turkamerat",
  description: "Bestefar frå Vågå. Sytti år i fjellet. Tusen turar gått.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Wilhelm",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0f1c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="shell">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
