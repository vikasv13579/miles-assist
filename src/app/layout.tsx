import type { Metadata } from 'next';
import { Geist, Inter } from 'next/font/google';
import { PublicEnvScript } from 'next-runtime-env';
import AppLayout from '@/components/AppLayout';
import './globals.css';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Miles Admin Dashboard',
  description: 'Miles Assist administration dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn('h-full', 'antialiased', inter.variable, 'font-sans', geist.variable)}>
      <head>
        <PublicEnvScript />
      </head>
      <body className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans flex flex-row overflow-x-hidden">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
