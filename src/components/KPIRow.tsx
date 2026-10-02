'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Users, DollarSign, Calendar, ArrowRightLeft } from 'lucide-react';
import { fetchBookings, fetchUsers, fetchTransactions } from '@/lib/api';
import { Skeleton } from '@/components/Skeleton';
import { Card } from '@/components/ui/card';

export default function KPIRow() {
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: carts, isLoading: cartsLoading } = useQuery({
    queryKey: ['carts'],
    queryFn: fetchTransactions,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
  });

  const totalUserCount = (users?.length ?? 0).toLocaleString();
  const totalRevenueCalc = `$${(carts?.reduce((total, cart) => total + cart.total, 0) ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const activeBookingCount = bookings?.filter((booking) => !booking.completed).length ?? 0;
  const transactionCount = carts?.length ?? 0;

  const allKpis = [
    {
      title: 'Total Users',
      mobileTitle: 'Total Users',
      value: totalUserCount,
      change: 'Live',
      icon: Users,
      loading: usersLoading,
    },
    {
      title: 'Total Revenue',
      mobileTitle: 'Total Revenue',
      value: totalRevenueCalc,
      change: 'Live',
      icon: DollarSign,
      loading: cartsLoading,
    },
    {
      title: 'Active Bookings',
      mobileTitle: 'Active Bookings',
      value: activeBookingCount.toLocaleString(),
      change: 'Live',
      icon: Calendar,
      loading: bookingsLoading,
    },
    {
      title: 'Transactions',
      mobileTitle: 'Transactions',
      value: transactionCount.toLocaleString(),
      change: 'Live',
      icon: ArrowRightLeft,
      loading: cartsLoading,
    },
  ];

  const filteredKpis = allKpis.filter((kpi) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      kpi.title.toLowerCase().includes(q) ||
      kpi.value.toLowerCase().includes(q) ||
      kpi.change.toLowerCase().includes(q)
    );
  });

  if (filteredKpis.length === 0) {
    return null;
  }

  return (
    <div className="w-full lg:w-[1136px] grid grid-cols-2 lg:grid-cols-4 gap-[12px] lg:gap-[16px]">
      {filteredKpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isHighlighted = Boolean(searchQuery.trim());
        return (
          <Card
            key={idx}
            className={`
              w-full lg:w-[272px] h-[93px] lg:h-[136px] bg-white border border-[#E2E8F0] rounded-[8px]
              p-[12px] lg:p-[20px] flex flex-col justify-between lg:justify-start lg:gap-[12px] shadow-xs transition-all shrink-0
              ${isHighlighted ? 'border-[#6366F1] ring-1 ring-[#EEF2FF]' : 'hover:border-[#CBD5E1]'}
            `}
          >
            {/* Header: Title & Icon */}
            <div className="flex flex-row items-center justify-between w-full lg:h-[32px]">
              <div className="text-[12px] lg:text-[14px] font-medium text-[#64748B] leading-none lg:leading-[17px] truncate">
                <span className="lg:hidden">{kpi.mobileTitle}</span>
                <span className="hidden lg:inline">{kpi.title}</span>
              </div>
              <div className="w-[28px] lg:w-[32px] h-[28px] lg:h-[32px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                <Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-[#4F46E5] stroke-[2px]" />
              </div>
            </div>

            {/* Content: Value & Percentage Badge */}
            <div className="flex flex-col items-start gap-1 lg:gap-[4px] w-full">
              {kpi.loading ? (
                <div className="animate-pulse flex flex-col gap-1 w-full mt-2 lg:mt-0">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-[18px] lg:text-[24px] font-bold text-[#0F172A] leading-tight lg:leading-[29px] truncate">
                    {kpi.value}
                  </div>
                  <div className="flex flex-row items-center gap-[4px]">
                    <div className="flex flex-row items-center px-[6px] py-[2px] gap-[2px] bg-[#D1FAE5] rounded-[4px]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                      <span className="font-bold text-[10px] lg:text-[12px] leading-none lg:leading-[15px] text-[#10B981]">
                        12.5%
                      </span>
                    </div>
                    <span className="font-normal text-[10px] lg:text-[11px] leading-none lg:leading-[13px] text-[#64748B]">
                      vs last month
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
