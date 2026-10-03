'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { ArrowRight, Eye } from 'lucide-react';
import { fetchUsers, fetchTransactionsPage } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

const PAGE_SIZE_OPTIONS = [4, 8, 12, 20];

const statusClasses = (status: string) => {
  if (status === 'Success') return 'bg-[#D1FAE5] text-[#065F46]';
  if (status === 'Pending') return 'bg-[#FEF3C7] text-[#92400E]';
  if (status === 'Refunded') return 'bg-[#F8FAFC] text-[#475569]';
  return 'bg-[#FEE2E2] text-[#991B1B]';
};

export default function TransactionsTable() {
  const [pagination, setPagination] = useState({ page: 1, limit: 4 });
  const { page: currentPage, limit: pageSize } = pagination;
  const router = useRouter();
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const {
    data: transactionsPage,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-transactions', currentPage, pageSize, searchQuery],
    queryFn: () => fetchTransactionsPage({
      page: currentPage,
      limit: pageSize,
      search: searchQuery.trim() || undefined,
    }),
  });

  const sourceData = (transactionsPage?.data ?? []).map((transaction) => {
    const user = users?.find((candidate) => candidate.id === transaction.userId);
    return {
      id: transaction.reference || transaction.id,
      rawId: transaction.id,
      userName: transaction.user?.name ?? user?.name ?? transaction.userId,
      avatar: user?.image ?? '',
      amount: `$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: formatStatus(transaction.status),
      date: new Date(transaction.createdAt).toLocaleDateString(),
    };
  });

  return (
    <div className="box-border flex min-h-[232px] w-full min-w-0 flex-col rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-xs lg:h-[372px] lg:items-start lg:gap-4 lg:p-5">
      
      {/* Header Frame (Desktop) */}
      <div className="hidden lg:flex w-full lg:w-[712px] h-[27px] flex-row justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[16px] leading-[19px] text-[#0F172A] font-['Inter'] m-0">
            Recent Transactions
          </h3>
          {searchQuery && (
            <span className="text-[11px] bg-[#EEF2FF] text-[#4F46E5] font-semibold px-2 py-0.5 rounded-full">
              Filtered: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>
        
        {/* Filter Button Frame */}
        <button
          onClick={() => router.push('/transactions')}
          className="box-border flex flex-row items-center justify-center p-[6px_12px] gap-[6px] h-[27px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
        >
          <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">View all</span>
          <ArrowRight className="w-[12px] h-[12px] text-[#475569]" />
        </button>
      </div>

      {/* Mobile Header (Legacy) */}
      <div className="flex lg:hidden items-center justify-between mb-3 w-full">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-[#0F172A]">
            Recent Transactions
          </h3>
          {searchQuery && (
            <span className="text-[11px] bg-[#EEF2FF] text-[#4F46E5] font-semibold px-2 py-0.5 rounded-full">
              Filtered: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>
        <button onClick={() => router.push('/transactions')} className="text-[12px] font-bold text-[#4F46E5] hover:underline cursor-pointer">
          View All
        </button>
      </div>

      {/* Mobile Card Row List View */}
      <div className="lg:hidden flex flex-col gap-2.5 w-full">
        {sourceData.map((tx) => (
          <div 
            key={tx.id} 
            className="w-full bg-white border border-[#E2E8F0] rounded-[8px] p-3 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {tx.avatar && <img
                src={tx.avatar}
                alt={tx.userName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E2E8F0]"
              />}
              <div className="flex flex-col truncate">
                <span className="text-[13px] font-bold text-[#0F172A] truncate leading-tight">
                  {tx.userName}
                </span>
                <span className="text-[11px] font-normal text-[#94A3B8] truncate leading-tight mt-0.5">
                  {tx.id} • {tx.date}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 gap-1">
              <span className="text-[13px] font-bold text-[#0F172A] leading-tight">
                {tx.amount}
              </span>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClasses(tx.status)}`}
              >
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Content */}
      <div className="hidden h-[246px] min-h-0 w-full min-w-0 flex-col items-start overflow-x-auto overflow-y-hidden lg:flex">
        {/* Table Header Row */}
        <div className="mb-0 flex h-[54px] w-[712px] shrink-0 flex-row items-start gap-4 rounded-md bg-[#F8FAFC] p-3">
          <div className="flex flex-row items-start w-[101.33px] flex-grow">
            <span className="font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter'] uppercase">TRANSACTION ID</span>
          </div>
          <div className="flex flex-row items-start w-[101.33px] flex-grow">
            <span className="font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter'] uppercase">USER</span>
          </div>
          <div className="flex flex-row items-start w-[101.33px] flex-grow">
            <span className="font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter'] uppercase">AMOUNT</span>
          </div>
          <div className="flex flex-row items-start w-[101.33px] flex-grow">
            <span className="font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter'] uppercase">STATUS</span>
          </div>
          <div className="flex flex-row items-start w-[101.33px] flex-grow">
            <span className="font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter'] uppercase">DATE</span>
          </div>
          <div className="flex flex-row items-start w-[101.33px] flex-grow justify-end">
            <span className="font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter'] text-right uppercase">ACTION</span>
          </div>
        </div>

        <div className="w-[712px] min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {isLoading && !transactionsPage ? (
            <div className="w-full mt-4"><SkeletonRows className="py-4" /></div>
          ) : isError ? (
            <div className="flex w-full items-center justify-between py-8 text-[12px] text-[#64748B]">
              <span>Transactions could not be loaded.</span>
              <button onClick={() => void refetch()} className="font-semibold text-[#4F46E5]">Retry</button>
            </div>
          ) : sourceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#64748B] gap-1 w-full">
              <span className="text-sm font-semibold text-[#0F172A]">No transactions found</span>
              <span className="text-xs">{searchQuery ? `No results for "${searchQuery}"` : 'Transactions will appear here when available.'}</span>
            </div>
          ) : (
            sourceData.map((tx) => (
            <div key={tx.id} className="box-border flex flex-row items-center p-[12px] gap-[16px] w-[712px] h-[48px] border-b border-[#E2E8F0] shrink-0 hover:bg-[#F8FAFC] transition-colors">
              
              {/* TRANSACTION ID */}
              <div className="flex flex-row items-start w-[101.33px] flex-grow">
                <span className="font-semibold text-[13px] leading-[16px] text-[#0F172A] font-['Inter']">{tx.id}</span>
              </div>
              
              {/* USER */}
              <div className="flex flex-row items-center gap-[8px] w-[101.33px] flex-grow">
                <img src={tx.avatar} alt={tx.userName} className="w-[24px] h-[24px] rounded-[12px] object-cover shrink-0" />
                <span className="font-medium text-[13px] leading-[16px] text-[#0F172A] font-['Inter'] truncate">{tx.userName}</span>
              </div>

              {/* AMOUNT */}
              <div className="flex flex-row items-start w-[101.33px] flex-grow">
                <span className="font-semibold text-[13px] leading-[16px] text-[#0F172A] font-['Inter']">{tx.amount}</span>
              </div>

              {/* STATUS */}
              <div className="flex flex-row items-start w-[101.33px] flex-grow">
                <div className={`flex flex-row items-start px-[8px] py-[4px] rounded-[12px] h-[21px] ${statusClasses(tx.status)}`}>
                <span className="font-semibold text-[11px] leading-[13px] font-['Inter']">{tx.status}</span>
                </div>
              </div>

              {/* DATE */}
              <div className="flex flex-row items-start w-[101.33px] flex-grow">
                <span className="font-normal text-[13px] leading-[16px] text-[#475569] font-['Inter']">{tx.date}</span>
              </div>

              {/* ACTION */}
              <div className="flex flex-row justify-end items-start w-[101.33px] flex-grow">
                <button 
                  className="flex flex-row justify-center items-center w-[16px] h-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80"
                  onClick={() => router.push(`/transaction-detail?id=${encodeURIComponent(tx.rawId)}`)}
                  title="View details"
                >
                  <Eye className="w-[16px] h-[16px] text-[#475569]" />
                </button>
              </div>

            </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Frame (Desktop) */}
      <div className="flex flex-row flex-wrap justify-between items-center gap-2 p-0 w-full lg:w-[712px] min-h-[27px] shrink-0 mt-auto">
        <span className="font-normal text-[13px] leading-[16px] text-[#64748B] font-['Inter']">
          {(() => {
            const total = transactionsPage?.meta.total ?? 0;
            const first = total ? (currentPage - 1) * (transactionsPage?.meta.limit ?? 4) + 1 : 0;
            const last = Math.min(currentPage * (transactionsPage?.meta.limit ?? 4), total);
            return `Showing ${first}-${last} of ${total} results`;
          })()}
        </span>
        <div className="flex flex-row flex-wrap items-center gap-[8px]">
          <label className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-[#64748B]">
            Rows
            <select
              aria-label="Recent transactions rows per page"
              value={pageSize}
              onChange={(event) => setPagination({ page: 1, limit: Number(event.target.value) })}
              className="h-[27px] rounded-[6px] border border-[#E2E8F0] bg-white px-1.5 text-[12px] text-[#475569]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => setPagination((value) => ({ ...value, page: Math.max(1, value.page - 1) }))}
            disabled={currentPage <= 1 || isLoading}
            className="box-border flex flex-row items-start px-[12px] py-[6px] bg-white border border-[#E2E8F0] rounded-[6px] h-[27px] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">Previous</span>
          </button>
          <span className="self-center whitespace-nowrap text-[11px] text-[#64748B]">
            Page {currentPage} of {Math.max(1, transactionsPage?.meta.totalPages ?? 1)}
          </span>
          <button
            onClick={() => setPagination((value) => ({ ...value, page: value.page + 1 }))}
            disabled={currentPage >= (transactionsPage?.meta.totalPages ?? 0) || isLoading}
            className="box-border flex flex-row items-start px-[12px] py-[6px] bg-white border border-[#E2E8F0] rounded-[6px] h-[27px] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">Next</span>
          </button>
        </div>
      </div>

    </div>
  );
}
