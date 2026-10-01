'use client';

import React from 'react';
import BookingDetailPage from '@/components/BookingDetailPage';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function BookingDetailRoute() {
  return (
    <main className="w-full max-w-[1200px] p-4 lg:p-[32px] pb-[96px] lg:pb-[32px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      <BookingDetailPage bookingId="#BKG-2341" />
      <MobileBottomNav />
    </main>
  );
}
