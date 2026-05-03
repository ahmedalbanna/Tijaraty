import type {Metadata} from 'next';
import './globals.css';
import { Cairo } from 'next/font/google';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'تجارتي (Tijaraty) - POS',
  description: 'نظام نقاط بيع متكامل (POS) السحابي المحلي',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body suppressHydrationWarning className="font-sans antialiased text-[#1F2937] bg-[#F3F4F6] overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
