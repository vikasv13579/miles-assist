'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { fetchBookings, fetchTransactions, fetchUsers } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';

interface AlertItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  color: string;
}

export default function SystemAlerts() {
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const bookingsQuery = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const transactionsQuery = useQuery({ queryKey: ['carts'], queryFn: fetchTransactions });
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  const pendingBookings = (bookingsQuery.data ?? []).filter((booking) => !booking.completed).length;
  const latestCart = transactionsQuery.data?.[0];
  const allAlerts: AlertItem[] = [
    {
      id: 'bookings',
      title: `${pendingBookings} bookings need review`,
      subtitle: 'Open tasks from the bookings feed',
      time: 'Live from DummyJSON',
      color: pendingBookings > 0 ? '#F59E0B' : '#10B981',
    },
    ...(latestCart ? [{
      id: `cart-${latestCart.id}`,
      title: `Latest cart total: $${latestCart.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${latestCart.totalProducts} products · ${latestCart.totalQuantity} items`,
      time: 'Live from DummyJSON',
      color: '#3B82F6',
    }] : []),
    {
      id: 'users',
      title: `${usersQuery.data?.length ?? 0} user profiles available`,
      subtitle: 'Current directory records',
      time: 'Live from DummyJSON',
      color: '#10B981',
    },
  ];

  const filteredAlerts = allAlerts.filter((alert) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      alert.title.toLowerCase().includes(q) ||
      alert.subtitle.toLowerCase().includes(q) ||
      alert.time.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full lg:w-[360px] h-[217px] lg:h-[243px] bg-white border border-[#E2E8F0] rounded-[8px] p-4 lg:p-[20px] flex flex-col gap-3 lg:gap-[16px] shadow-xs shrink-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] lg:text-[16px] font-bold text-[#0F172A] leading-tight">
          System Alerts
        </h3>
        {searchQuery && (
          <span className="text-[10px] lg:text-[11px] font-semibold text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
            {filteredAlerts.length} match
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:gap-[16px] overflow-y-auto pr-1">
        {bookingsQuery.isLoading || transactionsQuery.isLoading || usersQuery.isLoading ? (
          <SkeletonRows count={3} />
        ) : bookingsQuery.isError || transactionsQuery.isError || usersQuery.isError ? (
          <div className="flex flex-col gap-2 text-[12px] text-[#64748B]">
            <span>Some live dashboard data couldn&apos;t be loaded.</span>
            <button
              onClick={() => { void bookingsQuery.refetch(); void transactionsQuery.refetch(); void usersQuery.refetch(); }}
              className="self-start font-semibold text-[#4F46E5]"
            >
              Try again
            </button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-[12px] text-[#64748B] py-2">
            No alerts matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-2.5 lg:gap-3">
              <span
                className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: alert.color }}
              />
              <div className="flex flex-col">
                <span className="text-[13px] lg:text-[14px] font-semibold text-[#0F172A] leading-tight">
                  {alert.title}
                </span>
                <span className="text-[11px] lg:text-[12px] font-normal text-[#64748B] leading-tight mt-0.5">
                  {alert.subtitle}
                </span>
                <span className="text-[10px] lg:text-[11px] font-normal text-[#94A3B8] leading-tight mt-0.5">
                  {alert.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
