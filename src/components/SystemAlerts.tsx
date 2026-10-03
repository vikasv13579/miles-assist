'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { fetchSystemAlerts } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';

interface AlertItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  color: string;
}

function formatTimeAgo(timestamp: string) {
  const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60_000));
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
}

export default function SystemAlerts() {
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const alertsQuery = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: fetchSystemAlerts,
    refetchInterval: 30_000,
  });
  const allAlerts: AlertItem[] = (alertsQuery.data ?? []).map((alert, index) => ({
    id: `${alert.type}-${alert.createdAt}-${index}`,
    title: alert.message,
    subtitle: alert.subtitle,
    time: formatTimeAgo(alert.createdAt),
    color: alert.type === 'CRITICAL'
      ? '#EF4444'
      : alert.type === 'WARNING'
        ? '#F59E0B'
        : '#3B82F6',
  }));

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
    <div className="box-border flex h-[217px] w-full min-w-0 shrink-0 flex-col gap-2 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-xs min-[1440px]:h-[243px] min-[1440px]:gap-3 min-[1440px]:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold leading-[17px] text-[#0F172A] min-[1440px]:text-[16px] min-[1440px]:leading-[19px]">
          System Alerts
        </h3>
        {searchQuery && (
          <span className="text-[10px] lg:text-[11px] font-semibold text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
            {filteredAlerts.length} match
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {alertsQuery.isLoading ? (
          <SkeletonRows count={3} />
        ) : alertsQuery.isError ? (
          <div className="flex flex-col gap-2 text-[12px] text-[#64748B]">
            <span>System alerts could not be loaded.</span>
            <button
              onClick={() => void alertsQuery.refetch()}
              className="self-start font-semibold text-[#4F46E5]"
            >
              Try again
            </button>
          </div>
        ) : allAlerts.length === 0 ? (
          <div className="text-[12px] text-[#64748B] py-2">No active system alerts.</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-[12px] text-[#64748B] py-2">
            No alerts matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="relative flex min-h-[44px] w-full shrink-0 flex-row isolate min-[1440px]:h-12">
              <div
                className="absolute left-0 top-[6px] w-[8px] h-[8px] rounded-[4px]"
                style={{ backgroundColor: alert.color }}
              />
              <div className="flex w-full min-w-0 flex-col gap-0.5 pl-4">
                <span className="truncate text-[12px] font-semibold leading-4 text-[#0F172A] min-[1440px]:text-[13px]">
                  {alert.title}
                </span>
                <span className="truncate text-[11px] font-normal leading-[15px] text-[#475569] min-[1440px]:text-[12px]">
                  {alert.subtitle}
                </span>
                <span className="text-[10px] font-normal leading-[13px] text-[#94A3B8] min-[1440px]:text-[11px]">
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
