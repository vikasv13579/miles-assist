import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Miles Admin Dashboard',
  description: 'Production-ready Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans flex flex-row overflow-x-hidden">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen min-w-0">
            <TopBar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
