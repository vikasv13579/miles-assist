'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { fetchDashboardReport } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function DashboardReports() {
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return toDateInput(date);
  });
  const [toDate, setToDate] = useState(() => toDateInput(new Date()));
  const reportQuery = useQuery({
    queryKey: ['dashboard-report', fromDate, toDate],
    queryFn: () => fetchDashboardReport({ fromDate, toDate }),
    enabled: Boolean(fromDate && toDate && fromDate <= toDate),
  });
  const report = reportQuery.data;

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ['Report', 'From', report.fromDate, 'To', report.toDate],
      ['Transactions', 'Count', String(report.transactionCount), 'Volume', String(report.transactionVolume)],
      ['Bookings', 'Count', String(report.bookingCount)],
      [],
      ['Transaction status', 'Count', 'Amount'],
      ...report.transactionsByStatus.map((item) => [item.status, String(item.count), String(item.amount)]),
      [],
      ['Booking status', 'Count'],
      ...report.bookingsByStatus.map((item) => [item.status, String(item.count)]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${fromDate}-to-${toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex w-full flex-col gap-4 lg:gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A]">Reports</h1>
        <p className="mt-1 text-[13px] text-[#64748B]">Choose a date range to retrieve a report from the backend.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
        <label className="flex flex-col gap-1 text-[12px] font-medium text-[#475569]">
          From
          <input type="date" value={fromDate} max={toDate} onChange={(event) => setFromDate(event.target.value)} className="h-9 rounded-[6px] border border-[#CBD5E1] px-2 text-[13px]" />
        </label>
        <label className="flex flex-col gap-1 text-[12px] font-medium text-[#475569]">
          To
          <input type="date" value={toDate} min={fromDate} max={toDateInput(new Date())} onChange={(event) => setToDate(event.target.value)} className="h-9 rounded-[6px] border border-[#CBD5E1] px-2 text-[13px]" />
        </label>
        <button
          onClick={exportCsv}
          disabled={!report}
          className="flex h-9 items-center gap-2 rounded-[6px] bg-[#4F46E5] px-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {fromDate > toDate ? (
        <p role="alert" className="text-[13px] text-[#991B1B]">The start date must be on or before the end date.</p>
      ) : reportQuery.isLoading ? (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4"><SkeletonRows count={3} /></div>
      ) : reportQuery.isError ? (
        <div role="alert" className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[13px] text-[#991B1B]">
          Report could not be loaded. <button onClick={() => void reportQuery.refetch()} className="font-semibold underline">Try again</button>
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['Transactions', report.transactionCount.toLocaleString()],
              ['Transaction volume', report.transactionVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD' })],
              ['Bookings', report.bookingCount.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[8px] border border-[#E2E8F0] bg-white p-4">
                <p className="text-[12px] text-[#64748B]">{label}</p>
                <p className="mt-2 text-[19px] font-bold text-[#0F172A]">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ReportTable title="Transactions by status" headers={['Status', 'Count', 'Amount']} rows={report.transactionsByStatus.map((item) => [item.status, item.count.toLocaleString(), item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })])} />
            <ReportTable title="Bookings by status" headers={['Status', 'Count']} rows={report.bookingsByStatus.map((item) => [item.status, item.count.toLocaleString()])} />
          </div>
        </>
      ) : null}
    </section>
  );
}

function ReportTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white">
      <h2 className="border-b border-[#E2E8F0] px-4 py-3 text-[14px] font-bold text-[#0F172A]">{title}</h2>
      <table className="w-full text-left text-[13px]">
        <thead className="bg-[#F8FAFC] text-[11px] text-[#64748B]">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-2 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row[0]} className="border-t border-[#E2E8F0]">
              {row.map((value, index) => <td key={`${row[0]}-${index}`} className="px-4 py-2 text-[#475569]">{value}</td>)}
            </tr>
          )) : <tr><td colSpan={headers.length} className="px-4 py-4 text-[#64748B]">No records for this period.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
