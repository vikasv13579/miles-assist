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
    <div className="w-full lg:w-[360px] h-[99px] lg:h-[167px] bg-white border border-[#E2E8F0] rounded-[8px] p-4 lg:p-[20px] flex flex-col gap-[16px] shadow-xs shrink-0 overflow-hidden box-border">
      <h3 className="text-[14px] lg:text-[16px] font-bold text-[#0F172A] leading-[19px]">
        System Health
      </h3>

      <div className="flex flex-col gap-[10px]">
        {filteredMetrics.length === 0 ? (
          <div className="text-[11px] lg:text-[12px] text-[#64748B]">
            No metrics matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="flex flex-row justify-between items-center py-[4px] h-[24px] border-b border-[#E2E8F0] last:border-0 box-border"
            >
              <span className="font-normal text-[13px] leading-[16px] text-[#475569]">
                {metric.label}
              </span>
              <span className="font-semibold text-[13px] leading-[16px] text-[#0F172A]">
                {metric.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
