import './globals.css';

export const metadata = {
  title: 'Wilhelm — Turkamerat',
  description: 'En venn i skogen. Cabin-to-cabin guiding gjennom Finnskogen.',
  manifest: '/manifest.webmanifest',
  themeColor: '#1a1f1a',
  appleWebApp: {
    capable: true,
    title: 'Wilhelm',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1f1a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Caveat:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
