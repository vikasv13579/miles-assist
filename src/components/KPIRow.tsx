'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Users, DollarSign, Calendar, ArrowRightLeft } from 'lucide-react';
import { fetchBookings, fetchUsers, fetchTransactions } from '@/lib/api';
import { Skeleton } from '@/components/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
              flex flex-col justify-between shadow-xs transition-all shrink-0
              ${isHighlighted ? 'border-[#6366F1] ring-1 ring-[#EEF2FF]' : 'hover:border-[#CBD5E1]'}
            `}
          >
            {/* Header: Title & Icon */}
            <CardHeader className="p-[12px] lg:p-[20px] pb-0 lg:pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[12px] lg:text-[14px] font-medium text-[#64748B] leading-none truncate">
                <span className="lg:hidden">{kpi.mobileTitle}</span>
                <span className="hidden lg:inline">{kpi.title}</span>
              </CardTitle>
              <div className="w-[28px] lg:w-[36px] h-[28px] lg:h-[36px] rounded-full bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center shrink-0">
                <Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
              </div>
            </CardHeader>

            {/* Content: Value & Percentage Badge */}
            <CardContent className="p-[12px] lg:p-[20px] pt-[8px] lg:pt-[12px]">
              {kpi.loading ? (
                <div className="animate-pulse flex flex-col gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="text-[18px] lg:text-[24px] font-bold text-[#0F172A] leading-tight tracking-tight truncate">
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] lg:text-[12px] font-medium leading-none">
                    <Badge variant="secondary" className="bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5] px-1.5 py-0.5 text-[10px] lg:text-[11px]">
                      {kpi.change}
                    </Badge>
                    <span className="text-[#94A3B8] text-[10px] lg:text-[11px]">
                      from DummyJSON
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
