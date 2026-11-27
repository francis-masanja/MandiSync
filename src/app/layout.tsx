import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/features/system/Providers';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MandiSync — Mandi queue and weighbridge software',
  description:
    'Mandi queue software for APMC mandis: farmer slot booking, RFID gate checks, two weighbridge weights and one queue ledger for every role.',
  applicationName: 'MandiSync',
  other: {
    'page-type': 'software',
    'site-kind': 'software',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'MandiSync — Mandi queue and weighbridge software',
    description:
      'Farmer slot booking, RFID gate checks, weighbridge records and one queue ledger for every mandi desk.',
    type: 'website',
    siteName: 'MandiSync',
    images: [{ url: '/share.jpg', width: 1200, height: 630, alt: 'MandiSync queue board' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MandiSync — Mandi queue and weighbridge software',
    description:
      'Farmer slot booking, RFID gate checks, weighbridge records and one queue ledger for every mandi desk.',
    images: ['/share.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#efe9df' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
};

const headScript = `(function(){try{var k='mandisync.theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;}catch(e){}document.documentElement.classList.add('m-enter');setTimeout(function(){document.documentElement.classList.add('m-enter-done')},700);})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-type="software"
      data-radius="soft"
      data-buttons="solid"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        <Script
          id="moments-loader"
          src="/assets/moments/moments.js"
          type="module"
          strategy="afterInteractive"
        />
      </head>
      <body className="clay-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
