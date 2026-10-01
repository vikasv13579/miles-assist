'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const recordCounts = [5, 10, 15, 20];

export default function RevenueChart() {
  const [selectedCount, setSelectedCount] = useState(10);
  const { data: carts, isLoading, isError, refetch } = useQuery({
    queryKey: ['carts'],
    queryFn: fetchTransactions,
  });
  const data = (carts ?? []).slice(0, selectedCount).map((cart) => ({
    month: `#${cart.id}`,
    revenue: cart.total,
  }));

  return (
    <div className="w-full lg:w-[752px] h-[176px] lg:h-[303px] bg-white border border-[#E2E8F0] rounded-[8px] p-[16px] lg:p-[20px] flex flex-col justify-between shadow-xs">
      {/* Chart Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[14px] lg:text-[16px] font-bold text-[#0F172A] leading-tight">
            Revenue Overview
          </h3>
          <p className="text-[11px] lg:text-[12px] text-[#64748B] leading-none mt-0.5">
            Recent transaction totals
          </p>
        </div>

        {/* Desktop Timeframe Selector Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-0.5">
          {recordCounts.map((count) => (
            <button
              key={count}
              onClick={() => setSelectedCount(count)}
              className={`
                px-2.5 py-1 text-[11px] font-semibold rounded-[4px] transition-all cursor-pointer
                ${
                  selectedCount === count
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }
              `}
            >
              {count}
            </button>
          ))}
        </div>

        {/* Mobile Timeframe Indicator */}
        <span className="lg:hidden text-[11px] font-bold text-[#0F172A]">
          {selectedCount} records
        </span>
      </div>

      {isLoading ? (
        <SkeletonRows count={3} className="py-3" />
      ) : isError ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-[12px] text-[#64748B]">
          <span>Couldn&apos;t load transaction totals.</span>
          <button onClick={() => refetch()} className="font-semibold text-[#4F46E5]">Try again</button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-[12px] text-[#64748B]">No transaction totals yet.</div>
      ) : (
      <>

      {/* Mobile Bar Chart View */}
      <div className="lg:hidden w-full h-[140px] text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(val) => `$${val / 1000}K`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value || 0).toLocaleString()}`, 'Revenue']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '11px',
              }}
            />
            <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Desktop Area Chart View */}
      <div className="hidden lg:block w-full h-[200px] text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(val) => `$${val / 1000}K`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value || 0).toLocaleString()}`, 'Revenue']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#0F172A',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#A5B4FC' }}
            />
            <Area
              type="linear"
              dataKey="revenue"
              stroke="#6366F1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              dot={{ r: 4, fill: '#6366F1', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#4F46E5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      </>
      )}
    </div>
  );
}
