'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { 
  Search, 
  Download, 
  Eye, 
  AlertTriangle,
  SlidersHorizontal,
  ArrowDownUp
} from 'lucide-react';
import { fetchTransactionsPage, fetchUsers, type TransactionStatus } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';

interface TransactionRecord {
  id: string;
  rawId: string;
  reference: string;
  userName: string;
  avatar: string;
  amount: number;
  status: string;
  dateTime: string;
}

const DEFAULT_PAGE_SIZE = 8;
const PAGE_SIZE_OPTIONS = [5, 8, 10, 20, 50];

const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

const formatAmount = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function TransactionsPage() {
  const router = useRouter();
  const globalSearchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [localSearch, setLocalSearch] = useState('');
  const [pagination, setPagination] = useState({ filterKey: '', page: 1 });
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [typeFilter, setTypeFilter] = useState<TransactionStatus | 'All'>('All');
  const [amountFilter, setAmountFilter] = useState('All');
  const searchQuery = localSearch || globalSearchQuery;
  const filterKey = `${searchQuery}|${typeFilter}|${amountFilter}`;
  const currentPage = pagination.filterKey === filterKey ? pagination.page : 1;
  const setCurrentPage = (page: number) => setPagination({ filterKey, page });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: transactionsPage, isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions-page', currentPage, pageSize, searchQuery, typeFilter, amountFilter],
    queryFn: () => fetchTransactionsPage({
      page: currentPage,
      limit: pageSize,
      search: searchQuery.trim() || undefined,
      status: typeFilter === 'All' ? undefined : typeFilter,
      minAmount: amountFilter === 'high' ? 500 : undefined,
      maxAmount: amountFilter === 'low' ? 100 : undefined,
    }),
  });

  const transactionsList: TransactionRecord[] = (transactionsPage?.data ?? []).map((transaction) => {
    const user = users?.find((candidate) => candidate.id === transaction.userId);
    return {
      id: transaction.id,
      rawId: transaction.id,
      reference: transaction.reference,
      userName: transaction.user?.name ?? user?.name ?? transaction.userId,
      avatar: user?.image ?? '',
      amount: transaction.amount,
      status: transaction.status,
      dateTime: new Date(transaction.createdAt).toLocaleString(),
    };
  });

  const filteredTransactions = transactionsList;
  const pageCount = Math.max(1, transactionsPage?.meta.totalPages ?? 1);
  const pageStart = (currentPage - 1) * pageSize;
  const pageTransactions = transactionsList;
  const summary = transactionsPage?.meta?.summary;
  const totalTransactions = transactionsPage?.meta.total ?? 0;

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Reference', 'Customer Name', 'Amount', 'Status', 'Date & Time'];
    const rows = filteredTransactions.map(tx => [tx.id, tx.reference, tx.userName, String(tx.amount), tx.status, tx.dateTime]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transactions_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="w-full flex flex-col gap-[16px] lg:gap-[24px] mx-auto font-sans">
      {/* API Error State with Retry Button Controls */}
      {isError && (
        <div className="order-first w-full bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#991B1B] text-[13px] shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
            <span className="font-medium">
              API Error: Could not retrieve financial transactions from the backend.
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3.5 py-1.5 bg-[#EF4444] text-white rounded-[6px] font-semibold text-[12px] hover:bg-[#DC2626] transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            Retry Loading Data
          </button>
        </div>
      )}

      {/* 1. BREADCRUMB / HEADER FRAME */}
      <div className="order-1 flex flex-row justify-between items-center p-0 w-full lg:w-[1136px] h-[50px] shrink-0">
        <div className="flex flex-col items-start p-0 gap-[4px] w-[368px] h-[50px] shrink-0">
          <h1 className="w-[232px] h-[29px] font-bold text-[24px] leading-[29px] text-[#0F172A] font-['Inter'] m-0 shrink-0">
            Transaction History
          </h1>
          <p className="w-[368px] h-[17px] font-normal text-[14px] leading-[17px] text-[#64748B] font-['Inter'] m-0 shrink-0">
            Monitor and manage all corporate financial transactions
          </p>
        </div>

        {/* Export CSV Button */}
        <button 
          onClick={handleExportCSV}
          className="box-border hidden lg:flex flex-row items-center px-[16px] py-[10px] gap-[8px] w-[135px] h-[37px] bg-white border border-[#E2E8F0] rounded-[8px] shrink-0 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
        >
          <div className="flex flex-row justify-center items-center p-0 w-[16px] h-[16px] shrink-0">
            <Download className="w-[16px] h-[16px] text-[#475569]" strokeWidth={2} />
          </div>
          <span className="w-[79px] h-[17px] font-semibold text-[14px] leading-[17px] text-[#475569] font-['Inter'] shrink-0 text-left">
            Export CSV
          </span>
        </button>
      </div>

      {/* 3. SEARCH & FILTER FRAME (Mobile Order 2, Desktop Order 3) */}
      <div className="order-2 lg:order-3 w-full lg:w-[1136px] h-[36px] lg:h-[64px] bg-transparent lg:bg-white border-0 lg:border lg:border-[#E2E8F0] rounded-none lg:rounded-[8px] p-0 lg:p-[16px] flex flex-row items-center gap-[8px] lg:gap-[12px]">
        {/* Search Input */}
        <div className="relative w-full lg:w-[240px] h-[32px] border border-[#E2E8F0] rounded-[8px] bg-white flex-1 lg:flex-none">
          <Search className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] absolute left-[12px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-full pl-[36px] pr-[12px] text-[13px] leading-[16px] font-normal text-[#0F172A] placeholder-[#94A3B8] focus:outline-none bg-transparent"
          />
        </div>

        {/* Filter Icons (Mobile Only) */}
        <div className="flex lg:hidden items-center gap-[8px]">
          <button className="w-[36px] h-[36px] bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center text-[#475569]">
            <SlidersHorizontal className="w-[16px] h-[16px]" />
          </button>
          <button className="w-[36px] h-[36px] bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center text-[#475569]">
            <ArrowDownUp className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* Filter Dropdowns (Desktop Only) */}
        <div className="hidden lg:flex w-full lg:w-auto flex-1 items-center gap-[12px] flex-wrap justify-between lg:justify-start">
          <select className="w-[161px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] leading-[16px] font-normal text-[#475569] focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]">
            <option>Date: Last 30 Days</option>
            <option>Date: Last 7 Days</option>
            <option>Date: This Month</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionStatus | 'All')}
            className="w-[138px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] leading-[16px] font-normal text-[#475569] focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]"
          >
            <option value="All">Status: All</option>
            <option value="PENDING">Status: Pending</option>
            <option value="SUCCESS">Status: Success</option>
            <option value="FAILED">Status: Failed</option>
            <option value="REFUNDED">Status: Refunded</option>
            <option value="CANCELLED">Status: Cancelled</option>
          </select>

          <select
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            className="w-[114px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] leading-[16px] font-normal text-[#475569] focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]"
          >
            <option value="All">Amount: All</option>
            <option value="high">Amount: &gt; $500</option>
            <option value="low">Amount: &lt; $100</option>
          </select>
        </div>
      </div>

      {/* 2. KPI SUMMARY ROW (Mobile Order 3, Desktop Order 2) */}
      <div className="order-3 lg:order-2 w-full lg:w-[1136px] h-[128px] lg:h-[80px] grid grid-cols-2 lg:flex lg:flex-row gap-[8px] lg:gap-[16px]">
        {/* Card 1: Total Transactions */}
        <div className="w-full lg:w-[272px] h-[60px] lg:h-[80px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[16px] flex flex-col gap-[4px] lg:gap-[8px]">
          <span className="hidden lg:inline text-[13px] leading-[16px] font-normal text-[#64748B]">Total Transactions</span>
          <span className="lg:hidden text-[11px] leading-[13px] font-normal text-[#64748B]">Total Txns</span>
          <span className="text-[16px] leading-[19px] lg:text-[20px] lg:leading-[24px] font-bold text-[#0F172A]">
            {totalTransactions.toLocaleString()}
          </span>
        </div>

        {/* Card 2: Total Volume */}
        <div className="w-full lg:w-[272px] h-[60px] lg:h-[80px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[16px] flex flex-col gap-[4px] lg:gap-[8px]">
          <span className="text-[11px] leading-[13px] lg:text-[13px] lg:leading-[16px] font-normal text-[#64748B]">Total Volume</span>
          <span className="text-[16px] leading-[19px] lg:text-[20px] lg:leading-[24px] font-bold text-[#0F172A]">
            {summary
              ? summary.totalVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
              : '—'}
          </span>
        </div>

        {/* Card 3: Avg. Transaction */}
        <div className="w-full lg:w-[272px] h-[60px] lg:h-[80px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[16px] flex flex-col gap-[4px] lg:gap-[8px]">
          <span className="hidden lg:inline text-[13px] leading-[16px] font-normal text-[#64748B]">Avg. Transaction</span>
          <span className="lg:hidden text-[11px] leading-[13px] font-normal text-[#64748B]">Avg. Amount</span>
          <span className="text-[16px] leading-[19px] lg:text-[20px] lg:leading-[24px] font-bold text-[#0F172A]">
            {summary
              ? summary.averageTransaction.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '—'}
          </span>
        </div>

        {/* Card 4: Success Rate */}
        <div className="w-full lg:w-[272px] h-[60px] lg:h-[80px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[16px] flex flex-col lg:flex-row lg:items-center gap-[4px] lg:gap-[12px]">
          <div className="flex flex-col gap-[4px] w-full lg:w-[148px]">
            <span className="text-[11px] leading-[13px] lg:text-[13px] lg:leading-[16px] font-normal text-[#64748B]">
              Success Rate
            </span>
            <span className="text-[16px] leading-[19px] lg:text-[20px] lg:leading-[24px] font-bold text-[#065F46] lg:text-[#10B981]">
              {summary ? `${summary.successRate.toFixed(1)}%` : '—'}
            </span>
          </div>
          {/* Mock visual chart lines (Desktop Only) */}
          <div className="hidden lg:block w-[80px] h-[36px] relative overflow-hidden shrink-0">
            <div className="absolute w-[15px] border-b-2 border-[#10B981] -rotate-45 left-0 top-[17px]" />
            <div className="absolute w-[20px] border-b-2 border-[#10B981] rotate-[20deg] left-[10px] top-[18px]" />
            <div className="absolute w-[15px] border-b-2 border-[#10B981] -rotate-[60deg] left-[28px] top-[12px]" />
            <div className="absolute w-[25px] border-b-2 border-[#10B981] rotate-[10deg] left-[35px] top-[12px]" />
            <div className="absolute w-[22px] border-b-2 border-[#10B981] -rotate-[50deg] left-[59px] top-[-1px]" />
          </div>
        </div>
      </div>

      {/* 4. TRANSACTIONS TABLE FRAME */}
      <div className="order-4 w-full lg:w-[1136px] lg:h-[518px] bg-transparent lg:bg-white border-0 lg:border lg:border-[#E2E8F0] rounded-none lg:rounded-[8px] p-0 lg:p-[20px] flex flex-col gap-[10px] lg:gap-[16px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748B] gap-3">
            <span className="text-[12px] font-semibold text-[#0F172A]">Fetching transaction ledger...</span>
            <SkeletonRows className="mt-2 w-full max-w-[500px]" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] lg:h-full text-center text-[#64748B] gap-2">
            <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-[15px] font-bold text-[#0F172A]">No matching transactions found</h4>
            <button 
              onClick={() => { setLocalSearch(''); setTypeFilter('All'); setAmountFilter('All'); }}
              className="mt-2 px-3.5 py-1.5 bg-[#4F46E5] text-white rounded-[6px] text-[12px] font-semibold"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table Layout */}
            <div className="hidden lg:flex flex-col w-[1096px] h-[423px] min-h-0 overflow-x-auto overflow-y-hidden">
              {/* Header */}
              <div className="w-[1096px] h-[39px] bg-[#F8FAFC] rounded-[6px] p-[12px] flex items-center gap-[16px]">
                <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">TRANSACTION ID</span>
                <span className="w-[200px] text-[12px] leading-[15px] font-semibold text-[#64748B]">USER</span>
                <span className="w-[100px] text-[12px] leading-[15px] font-semibold text-[#64748B]">REFERENCE</span>
                <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">AMOUNT</span>
                <span className="w-[120px] text-[12px] leading-[15px] font-semibold text-[#64748B]">STATUS</span>
                <span className="w-[160px] text-[12px] leading-[15px] font-semibold text-[#64748B]">DATE & TIME</span>
                <span className="w-[60px] text-[12px] leading-[15px] font-semibold text-[#64748B] text-right">ACTIONS</span>
              </div>

              {/* Rows */}
              <div className="w-full min-h-0 flex-1 overflow-y-auto overflow-x-auto">
              {pageTransactions.map((tx) => (
                <div key={tx.id} className="w-[1096px] h-[48px] p-[12px] border-b border-[#E2E8F0] flex items-center gap-[16px] hover:bg-[#F8FAFC]">
                  <span className="w-[110px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">{tx.id}</span>
                  <div className="w-[200px] h-[24px] flex items-center gap-[8px]">
                    {tx.avatar && <img
                      src={tx.avatar}
                      alt={tx.userName}
                      className="w-[24px] h-[24px] rounded-[12px] object-cover shrink-0"
                    />}
                    <span className="text-[13px] leading-[16px] font-medium text-[#0F172A] truncate">
                      {tx.userName}
                    </span>
                  </div>
                  <div className="w-[100px] h-[17px] flex items-center">
                    <span
                      className="h-[17px] flex items-center px-[8px] py-[2px] rounded-[4px] text-[11px] leading-[13px] font-semibold bg-[#DBEAFE] text-[#1E40AF]"
                    >
                      {tx.reference}
                    </span>
                  </div>
                  <span className="w-[110px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">
                    {formatAmount(tx.amount)}
                  </span>
                  <div className="w-[120px] h-[21px] flex items-center">
                    <span
                      className={`h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold ${
                        tx.status === 'SUCCESS'
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : tx.status === 'PENDING'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : tx.status === 'REFUNDED'
                          ? 'bg-[#F8FAFC] text-[#475569]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {formatStatus(tx.status)}
                    </span>
                  </div>
                  <span className="w-[160px] text-[13px] leading-[16px] font-normal text-[#475569]">{tx.dateTime}</span>
                  <div className="w-[60px] h-[16px] flex justify-end items-center">
                    <button 
                      onClick={() => router.push(`/transaction-detail?id=${encodeURIComponent(tx.rawId)}`)}
                      className="w-[16px] h-[16px] text-[#475569] hover:text-[#0F172A] cursor-pointer"
                      title="View detail"
                    >
                      <Eye className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="flex lg:hidden flex-col gap-[10px] w-full">
              {pageTransactions.map(tx => (
                <div key={tx.id} className="w-full h-[134px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col gap-[10px]">
                  {/* Row 1: ID & Status */}
                  <div className="w-full h-[19px] flex justify-between items-center">
                    <span className="text-[13px] leading-[16px] font-bold text-[#0F172A]">{tx.id}</span>
                    <span
                      className={`h-[19px] flex items-center px-[8px] py-[3px] rounded-[12px] text-[11px] leading-[13px] font-semibold ${
                        tx.status === 'SUCCESS'
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : tx.status === 'PENDING'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : tx.status === 'REFUNDED'
                          ? 'bg-[#F8FAFC] text-[#475569]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {formatStatus(tx.status)}
                    </span>
                  </div>

                  {/* Row 2: Divider */}
                  <div className="w-full h-0 border-t border-[#E2E8F0]" />

                  {/* Row 3: User Info & Amount/Type */}
                  <div className="w-full h-[37px] flex justify-between items-center">
                    {/* Left: User */}
                    <div className="h-[24px] flex items-center gap-[8px]">
                      {tx.avatar && <img
                        src={tx.avatar}
                        alt={tx.userName}
                        className="w-[24px] h-[24px] rounded-[12px] object-cover shrink-0"
                      />}
                      <span className="w-[80px] text-[13px] leading-[16px] font-medium text-[#475569] truncate">
                        {tx.userName}
                      </span>
                    </div>

                    {/* Right: Amount & Type */}
                    <div className="h-[37px] flex flex-col items-end gap-[2px]">
                      <span className="text-[13px] leading-[16px] font-bold text-[#0F172A]">
                        {formatAmount(tx.amount)}
                      </span>
                      <span className="h-[19px] flex items-center px-[8px] py-[3px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                        {tx.reference}
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Date & Actions */}
                  <div className="w-full h-[24px] pt-[4px] flex justify-between items-center">
                    <span className="text-[10px] leading-[12px] font-normal text-[#64748B]">
                      {tx.dateTime}
                    </span>
                    <button 
                      onClick={() => router.push(`/transaction-detail?id=${encodeURIComponent(tx.rawId)}`)}
                      className="w-[20px] h-[20px] bg-[#F8FAFC] rounded-[4px] flex justify-center items-center cursor-pointer"
                      title="View detail"
                    >
                      <Eye className="w-[12px] h-[12px] text-[#475569]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Table Footer / Pagination */}
        <div className="w-full mt-auto flex flex-col sm:flex-row items-center justify-between text-[12px] gap-[12px]">
          <span className="text-[#64748B]">
            Showing <span className="font-semibold text-[#0F172A]">{filteredTransactions.length ? `${pageStart + 1}-${pageStart + filteredTransactions.length}` : '0'}</span> of{' '}
            <span className="font-semibold text-[#0F172A]">{totalTransactions}</span> results
          </span>
          <div className="flex items-center gap-[8px]">
            <label className="flex items-center gap-2 text-[#64748B]">
              Rows per page
              <select
                aria-label="Rows per page"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-[6px] border border-[#E2E8F0] bg-white px-2 py-1 text-[#0F172A]"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-[12px] py-[4px] bg-white border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-[#64748B]">Page {currentPage} of {pageCount}</span>
            <button 
              onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage >= pageCount || isLoading}
              className="px-[12px] py-[4px] bg-white border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
