'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBackendHealth } from '@/lib/api';

export default function SystemHealth() {
  const healthQuery = useQuery({
    queryKey: ['backend-health'],
    queryFn: fetchBackendHealth,
    refetchInterval: 30_000,
  });
  const health = healthQuery.data;
  const uptimeDays = Math.floor((health?.uptimeSeconds ?? 0) / 86_400);
  const uptimeHours = Math.floor(((health?.uptimeSeconds ?? 0) % 86_400) / 3_600);
  const uptimeMinutes = Math.floor(((health?.uptimeSeconds ?? 0) % 3_600) / 60);
  const uptime = uptimeDays > 0
    ? `${uptimeDays}d ${uptimeHours}h`
    : uptimeHours > 0
      ? `${uptimeHours}h ${uptimeMinutes}m`
      : `${uptimeMinutes}m`;
  const metrics = [
    {
      label: 'Uptime',
      value: health ? uptime : '—',
    },
    {
      label: 'Avg Response Time',
      value: health?.averageResponseTimeMs === null
        ? 'Collecting…'
        : health
          ? `${health.averageResponseTimeMs}ms`
          : '—',
    },
    {
      label: 'Active Users',
      value: health?.activeUsers.toLocaleString() ?? '—',
    },
  ];

  return (
    <div className="box-border flex h-auto min-h-[132px] w-full min-w-0 shrink-0 flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-xs min-[1440px]:min-h-[169px] min-[1440px]:gap-4 min-[1440px]:p-5">
      <h3 className="text-[14px] font-bold leading-[19px] text-[#0F172A] min-[1440px]:text-[16px]">
        System Health
      </h3>

      <div className="flex min-h-0 flex-col gap-1 min-[1440px]:gap-[10px]">
        {healthQuery.isError ? (
          <div role="alert" className="flex items-center justify-between gap-2 text-[12px] text-[#B91C1C]">
            <span>Health metrics unavailable.</span>
            <button onClick={() => void healthQuery.refetch()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : metrics.map((metric) => (
          <div key={metric.label} className="flex h-5 flex-row items-center justify-between border-b border-[#E2E8F0] last:border-0 min-[1440px]:h-6">
            <span className="text-[12px] font-normal leading-4 text-[#475569] min-[1440px]:text-[13px]">{metric.label}</span>
            <span className="text-[12px] font-semibold leading-4 text-[#0F172A] min-[1440px]:text-[13px]">
              {healthQuery.isLoading ? 'Loading…' : metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
