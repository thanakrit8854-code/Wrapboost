import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Thai } from 'next/font/google';

import './globals.css';

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-thai',
});

export const metadata: Metadata = {
  title: 'WrapBoost — สั่งล่วงหน้า รับที่เคาน์เตอร์',
  description:
    'แรปสดและเครื่องดื่มฟังก์ชัน สั่งผ่าน QR รับที่เคาน์เตอร์ ท่าอากาศยานแม่ฟ้าหลวง เชียงราย',
};

export const viewport: Viewport = {
  themeColor: '#2d6127',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={plexThai.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
