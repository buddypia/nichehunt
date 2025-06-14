import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ClientLayout from './ClientLayout';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'NicheNext - ニッチ市場向けビジネスアイデアプラットフォーム',
  description: '革新的なニッチビジネスモデルを発見・共有するためのプラットフォーム',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'ja';
  
  return (
    <html lang={locale} className={`${inter.variable}`}>
      <body className={`${inter.className} font-sans`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
