'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardCharts, type DashboardChartRange } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const chartRanges: { value: DashboardChartRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
];

type RevenuePoint = { date: string; value: number };

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    ...options,
    timeZone: 'UTC',
  });
}

function aggregateRevenue(points: RevenuePoint[], range: DashboardChartRange) {
  const sortedPoints = [...points].sort((a, b) => a.date.localeCompare(b.date));

  if (range === '7d' || range === '1m') {
    return sortedPoints.map((point) => ({
      date: point.date,
      label: formatDate(point.date, { month: 'short', day: 'numeric' }),
      revenue: point.value,
    }));
  }

  if (range === '3m') {
    const weeks: { date: string; revenue: number }[] = [];
    for (let index = 0; index < sortedPoints.length; index += 7) {
      const week = sortedPoints.slice(index, index + 7);
      weeks.push({
        date: week[0].date,
        revenue: week.reduce((total, point) => total + point.value, 0),
      });
    }
    return weeks.map((week) => ({
      ...week,
      label: formatDate(week.date, { month: 'short', day: 'numeric' }),
    }));
  }

  const months = new Map<string, { date: string; revenue: number }>();
  for (const point of sortedPoints) {
    const month = point.date.slice(0, 7);
    const current = months.get(month);
    if (current) {
      current.revenue += point.value;
    } else {
      months.set(month, { date: point.date, revenue: point.value });
    }
  }

  const monthLimit = range === '6m' ? 6 : 12;
  return [...months.values()].slice(-monthLimit).map((month) => ({
    ...month,
    label: formatDate(month.date, { month: 'short' }),
  }));
}

export default function RevenueChart() {
  const [selectedRange, setSelectedRange] = useState<DashboardChartRange>('6m');
  const { data: charts, isFetching, isError, refetch } = useQuery({
    queryKey: ['dashboard-charts', selectedRange],
    queryFn: () => fetchDashboardCharts(selectedRange),
  });

  const data = aggregateRevenue(charts?.revenue ?? [], selectedRange);
  const tickInterval = selectedRange === '7d'
    ? 0
    : selectedRange === '1m'
      ? 4
      : selectedRange === '3m'
        ? 2
        : 0;
  const dateRange = data.length > 0
    ? selectedRange === '6m' || selectedRange === '1y'
      ? `${formatDate(data[0].date, { month: 'short', year: 'numeric' })} – ${formatDate(data[data.length - 1].date, { month: 'short', year: 'numeric' })}`
      : `${formatDate(data[0].date, { month: 'short', day: 'numeric' })} – ${formatDate(data[data.length - 1].date, { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Revenue by date';
  const formatRevenueAxis = (value: number) =>
    value >= 1000
      ? `$${(value / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`
      : `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div className="flex h-[248px] min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-xs sm:h-[270px] sm:p-5 min-[1440px]:h-[303px] min-[1440px]:gap-4">
      {/* Chart Header */}
      <div className="flex w-full min-w-0 shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-bold leading-tight text-[#0F172A] sm:text-[16px]">
            Revenue Overview
          </h3>
          <p className="mt-1 truncate text-[11px] leading-none text-[#64748B] sm:text-[12px]">
            {dateRange}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-md bg-[#F8FAFC] p-0.5 sm:gap-1 sm:p-1">
          {chartRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              disabled={isFetching}
              aria-pressed={selectedRange === range.value}
              className={`
                rounded px-1.5 py-1 text-[9px] font-semibold transition-all cursor-pointer disabled:cursor-wait sm:px-2 sm:text-[11px]
                ${
                  selectedRange === range.value
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isFetching ? (
        <div className="flex min-h-0 flex-1 items-center">
          <SkeletonRows count={3} className="w-full py-3" />
        </div>
      ) : isError ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-[12px] text-[#64748B]">
          <span>Couldn&apos;t load revenue chart data.</span>
          <button onClick={() => refetch()} className="font-semibold text-[#4F46E5]">Try again</button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-[12px] text-[#64748B]">No transaction totals yet.</div>
      ) : (
      <div className="h-0 min-h-[140px] w-full min-w-0 flex-1 text-xs sm:min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={formatRevenueAxis}
              width={44}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value || 0).toLocaleString()}`, 'Revenue']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#0F172A',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '11px',
              }}
              itemStyle={{ color: '#A5B4FC' }}
            />
            <Area
              type="linear"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              dot={{ r: 3, fill: '#FFFFFF', stroke: '#4F46E5', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#4F46E5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
