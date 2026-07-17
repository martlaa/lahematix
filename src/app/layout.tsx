import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LAHEMATIX — LAHEMATE uuringurakendus',
  description: 'Nõusolekute ja uuringuandmete kogumise rakendus LAHEMATE projektile',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="et">
      <body>
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
