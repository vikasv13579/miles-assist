'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Users, DollarSign, Calendar, ArrowRightLeft } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/api';
import { Skeleton } from '@/components/Skeleton';
import { Card } from '@/components/ui/card';

export default function KPIRow() {
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const allKpis = [
    {
      title: 'Total Users',
      mobileTitle: 'Total Users',
      value: (stats?.totalUsers ?? 0).toLocaleString(),
      change: 'Live',
      icon: Users,
      loading: isLoading,
    },
    {
      title: 'Total Revenue',
      mobileTitle: 'Total Revenue',
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: 'Live',
      icon: DollarSign,
      loading: isLoading,
    },
    {
      title: 'Total Bookings',
      mobileTitle: 'Bookings',
      value: (stats?.totalBookings ?? 0).toLocaleString(),
      change: 'Live',
      icon: Calendar,
      loading: isLoading,
    },
    {
      title: 'Transactions',
      mobileTitle: 'Transactions',
      value: (stats?.totalTransactions ?? 0).toLocaleString(),
      change: 'Live',
      icon: ArrowRightLeft,
      loading: isLoading,
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

  if (isError) {
    return (
      <div className="w-full max-w-[1136px] rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[13px] text-[#991B1B]">
        Dashboard metrics could not be loaded.{' '}
        <button onClick={() => void refetch()} className="font-semibold underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-3 min-[1440px]:grid-cols-4 min-[1440px]:gap-4">
      {filteredKpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isHighlighted = Boolean(searchQuery.trim());
        return (
          <Card
            key={idx}
            className={`
              w-full min-w-0 min-h-[93px] min-[1440px]:h-[136px] bg-white border border-[#E2E8F0] rounded-[8px]
              p-3 min-[1440px]:p-5 flex flex-col justify-start gap-2 min-[1440px]:gap-3 shadow-xs transition-all
              ${isHighlighted ? 'border-[#6366F1] ring-1 ring-[#EEF2FF]' : 'hover:border-[#CBD5E1]'}
            `}
          >
            {/* Header: Title & Icon */}
            <div className="flex w-full items-center justify-between min-[1440px]:h-8">
              <div className="truncate text-[12px] font-medium leading-none text-[#64748B] min-[1440px]:text-[14px] min-[1440px]:leading-[17px]">
                <span className="min-[1440px]:hidden">{kpi.mobileTitle}</span>
                <span className="hidden min-[1440px]:inline">{kpi.title}</span>
              </div>
              <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] min-[1440px]:flex">
                <Icon className="h-4 w-4 text-[#4F46E5] stroke-[2px]" />
              </div>
            </div>

            {/* Content: Value & Percentage Badge */}
            <div className="flex flex-col items-start gap-1 lg:gap-[4px] w-full">
              {kpi.loading ? (
                <div className="mt-2 flex w-full animate-pulse flex-col gap-1 min-[1440px]:mt-0">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="truncate text-[18px] font-bold leading-tight text-[#0F172A] min-[1440px]:text-[24px] min-[1440px]:leading-[29px]">
                    {kpi.value}
                  </div>
                  <div className="flex flex-row items-center gap-[4px]">
                    <div className="flex flex-row items-center px-[6px] py-[2px] gap-[2px] bg-[#D1FAE5] rounded-[4px]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                      <span className="font-bold text-[10px] leading-none text-[#10B981] min-[1440px]:text-[12px] min-[1440px]:leading-[15px]">
                        Live
                      </span>
                    </div>
                    <span className="font-normal text-[10px] leading-none text-[#64748B] min-[1440px]:text-[11px] min-[1440px]:leading-[13px]">
                      from backend
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
