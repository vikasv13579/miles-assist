'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardAnalytics } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const cardClass = 'rounded-[8px] border border-[#E2E8F0] bg-white p-4 lg:p-5 shadow-xs';

export default function DashboardAnalytics() {
  const analyticsQuery = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: fetchDashboardAnalytics,
  });
  const analytics = analyticsQuery.data;

  if (analyticsQuery.isLoading) {
    return <div className={cardClass}><SkeletonRows count={4} /></div>;
  }
  if (analyticsQuery.isError || !analytics) {
    return (
      <div role="alert" className={`${cardClass} text-[13px] text-[#991B1B]`}>
        Analytics could not be loaded from the backend.{' '}
        <button onClick={() => void analyticsQuery.refetch()} className="font-semibold underline">Try again</button>
      </div>
    );
  }

  const metrics = [
    { label: 'Transactions (30 days)', value: analytics.totalTransactions.toLocaleString() },
    { label: 'Successful revenue (30 days)', value: analytics.successfulRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
    { label: 'Success rate', value: `${analytics.successRate.toFixed(1)}%` },
    { label: 'Average transaction', value: analytics.averageTransaction.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
  ];
  const chartData = analytics.daily.map((point) => ({
    ...point,
    dateLabel: new Date(`${point.date}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }),
  }));

  return (
    <section className="flex w-full flex-col gap-4 lg:gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A]">Analytics</h1>
        <p className="mt-1 text-[13px] text-[#64748B]">Transaction and booking performance over the last 30 days, from the backend.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className={cardClass}>
            <p className="text-[12px] text-[#64748B]">{metric.label}</p>
            <p className="mt-2 text-[19px] font-bold text-[#0F172A]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-[15px] font-bold text-[#0F172A]">Daily revenue</h2>
        <div className="h-[280px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [Number(value ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 'Revenue']} />
              <Area dataKey="revenue" type="monotone" stroke="#4F46E5" fill="url(#analyticsRevenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-[15px] font-bold text-[#0F172A]">Bookings by status</h2>
        {analytics.bookingsByStatus.length === 0 ? (
          <p className="text-[13px] text-[#64748B]">No bookings in this period.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {analytics.bookingsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-[6px] bg-[#F8FAFC] px-3 py-2 text-[13px]">
                <span className="text-[#475569]">{item.status}</span>
                <span className="font-semibold text-[#0F172A]">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
