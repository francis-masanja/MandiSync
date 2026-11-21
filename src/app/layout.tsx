import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/features/system/Providers';

export const metadata: Metadata = {
  title: 'MandiSync — Smart Agricultural Queue & IoT Telemetry',
  description:
    'Smart agricultural queue management, dynamic slot allocation, UHF RFID gate authentication, and Arduino/ESP32 weighbridge telemetry.',
};

const themeScript = `(function(){try{var k='mandisync.theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="clay-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
