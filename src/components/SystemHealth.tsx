'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

const allMetrics = [
  { label: 'Uptime', value: '99.8%' },
  { label: 'Avg Response Time', value: '142ms' },
  { label: 'Active Sessions', value: '3,241' },
];

export default function SystemHealth() {
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);

  const filteredMetrics = allMetrics.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.label.toLowerCase().includes(q) || m.value.toLowerCase().includes(q);
  });

  return (
    <div className="w-full lg:w-[360px] h-[99px] lg:h-[167px] bg-white border border-[#E2E8F0] rounded-[8px] p-4 lg:p-[20px] flex flex-col justify-between shadow-xs shrink-0 overflow-hidden">
      <h3 className="text-[14px] lg:text-[16px] font-bold text-[#0F172A] leading-tight">
        System Health
      </h3>

      <div className="flex flex-col divide-y divide-[#F1F5F9]">
        {filteredMetrics.length === 0 ? (
          <div className="text-[11px] lg:text-[12px] text-[#64748B]">
            No metrics matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 first:pt-0 last:pb-0"
            >
              <span className="text-[11px] lg:text-[13px] font-medium text-[#64748B]">
                {metric.label}
              </span>
              <span className="text-[12px] lg:text-[14px] font-bold text-[#0F172A]">
                {metric.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
