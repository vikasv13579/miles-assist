'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

function hasActiveSession() {
  const token = localStorage.getItem('admin_token');
  if (!token) return false;

  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const authenticated = hasActiveSession();
    if (pathname === '/login') {
      if (authenticated) {
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    if (!authenticated) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);
  }, [pathname, router]);

  if (!isAuthorized) return null;

  if (pathname === '/login') return <Providers>{children}</Providers>;
  return (
    <Providers>
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        {children}
      </div>
    </Providers>
  );
}
