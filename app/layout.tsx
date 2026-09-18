import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MandiSync — Smart Agricultural Queue & IoT Telemetry',
  description: 'Smart agricultural queue management, dynamic slot allocation, UHF RFID gate authentication, and Arduino/ESP32 weighbridge telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
