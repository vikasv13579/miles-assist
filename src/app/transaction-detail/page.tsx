'use client';

import React, { useEffect, useState } from 'react';
import TransactionDetailPage from '@/components/TransactionDetailPage';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function TransactionDetailRoute() {
  const [transactionId, setTransactionId] = useState<string>();

  useEffect(() => {
    setTransactionId(new URLSearchParams(window.location.search).get('id') ?? undefined);
  }, []);

  return (
    <main className="w-full max-w-[1200px] p-0 pb-[96px] lg:p-[32px] lg:pb-[32px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      <TransactionDetailPage transactionId={transactionId} />
      <MobileBottomNav />
    </main>
  );
}
