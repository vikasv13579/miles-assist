'use client';

import React, { useEffect, useState } from 'react';
import UserDetailPage from '@/components/UserDetailPage';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function UserProfileRoute() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    setUserId(new URLSearchParams(window.location.search).get('id') ?? undefined);
  }, []);

  return (
    <main className="w-full max-w-[1200px] p-4 lg:p-[32px] pb-[96px] lg:pb-[32px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      <UserDetailPage userId={userId} />
      <MobileBottomNav />
    </main>
  );
}
