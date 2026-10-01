'use client';

import React from 'react';
import TransactionDetailPage from '@/components/TransactionDetailPage';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function TransactionDetailRoute() {
  return (
    <main className="w-full max-w-[1200px] p-4 lg:p-[32px] pb-[96px] lg:pb-[32px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      <TransactionDetailPage transactionId="#TXN-1082" />
      <MobileBottomNav />
    </main>
  );
}
