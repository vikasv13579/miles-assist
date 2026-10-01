'use client';

import React, { useState } from 'react';
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
import { fetchUsers, fetchTransactions, ApiUser, ApiCart } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';

interface TransactionRecord {
  id: string;
  rawId: number;
  userName: string;
  avatar: string;
  type: 'Payment' | 'Refund' | 'Transfer';
  amount: string;
  isNegative?: boolean;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  dateTime: string;
}

const PAGE_SIZE = 8;

const defaultTransactions: TransactionRecord[] = [
  {
    id: '#TXN-1082',
    rawId: 1082,
    userName: 'Albert Flores',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    type: 'Payment',
    amount: '$150.00',
    status: 'Completed',
    dateTime: 'Oct 1, 2024 14:32',
  },
  {
    id: '#TXN-1081',
    rawId: 1081,
    userName: 'Jenny Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    type: 'Payment',
    amount: '$2,350.00',
    status: 'Pending',
    dateTime: 'Sep 30, 2024 09:12',
  },
  {
    id: '#TXN-1080',
    rawId: 1080,
    userName: 'Kathryn Murphy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    type: 'Refund',
    amount: '-$420.00',
    isNegative: true,
    status: 'Refunded',
    dateTime: 'Sep 29, 2024 16:45',
  },
  {
    id: '#TXN-1079',
    rawId: 1079,
    userName: 'Guy Hawkins',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    type: 'Payment',
    amount: '$85.00',
    status: 'Failed',
    dateTime: 'Sep 28, 2024 11:20',
  },
  {
    id: '#TXN-1078',
    rawId: 1078,
    userName: 'Esther Howard',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    type: 'Transfer',
    amount: '$1,200.00',
    status: 'Completed',
    dateTime: 'Sep 27, 2024 08:30',
  },
  {
    id: '#TXN-1077',
    rawId: 1077,
    userName: 'Cody Fisher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    type: 'Payment',
    amount: '$340.00',
    status: 'Pending',
    dateTime: 'Sep 26, 2024 13:10',
  },
  {
    id: '#TXN-1076',
    rawId: 1076,
    userName: 'Jane Cooper',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    type: 'Payment',
    amount: '$500.00',
    status: 'Completed',
    dateTime: 'Sep 25, 2024 15:24',
  },
  {
    id: '#TXN-1075',
    rawId: 1075,
    userName: 'Wade Warren',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    type: 'Refund',
    amount: '-$95.00',
    isNegative: true,
    status: 'Completed',
    dateTime: 'Sep 25, 2024 10:15',
  },
];

import TransactionDetailPage from './TransactionDetailPage';

export default function TransactionsPage() {
  const globalSearchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [localSearch, setLocalSearch] = useState('');
  const [pagination, setPagination] = useState({ filterKey: '', page: 1 });
  const [typeFilter, setTypeFilter] = useState('All');
  const [amountFilter, setAmountFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: carts, isLoading, isError, refetch } = useQuery({
    queryKey: ['carts'],
    queryFn: fetchTransactions,
  });

  // Map API carts to TransactionRecord schema or fallback to default Figma dataset
  const transactionsList: TransactionRecord[] = carts && carts.length > 0
    ? carts.map((cart: ApiCart, idx: number) => {
        const user: ApiUser | undefined = users && users[idx % users.length];
        const types: ('Payment' | 'Refund' | 'Transfer')[] = ['Payment', 'Payment', 'Refund', 'Payment', 'Transfer', 'Payment', 'Payment', 'Refund'];
        const statuses: ('Completed' | 'Pending' | 'Failed' | 'Refunded')[] = ['Completed', 'Pending', 'Refunded', 'Failed', 'Completed', 'Pending', 'Completed', 'Completed'];
        const dateTimes = [
          'Oct 1, 2024 14:32',
          'Sep 30, 2024 09:12',
          'Sep 29, 2024 16:45',
          'Sep 28, 2024 11:20',
          'Sep 27, 2024 08:30',
          'Sep 26, 2024 13:10',
          'Sep 25, 2024 15:24',
          'Sep 25, 2024 10:15',
        ];
        const isNeg = types[idx % types.length] === 'Refund';
        const formattedAmount = `${isNeg ? '-' : ''}$${cart.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        return {
          id: `#TXN-${1080 + cart.id}`,
          rawId: cart.id,
          userName: user ? `${user.firstName} ${user.lastName}` : defaultTransactions[idx % defaultTransactions.length].userName,
          avatar: user?.image || defaultTransactions[idx % defaultTransactions.length].avatar,
          type: types[idx % types.length],
          amount: formattedAmount,
          isNegative: isNeg,
          status: statuses[idx % statuses.length],
          dateTime: dateTimes[idx % dateTimes.length],
        };
      })
    : defaultTransactions;

  const searchQuery = localSearch || globalSearchQuery;
  const filterKey = `${searchQuery}|${typeFilter}|${amountFilter}`;
  const currentPage = pagination.filterKey === filterKey ? pagination.page : 1;
  const setCurrentPage = (page: number) => setPagination({ filterKey, page });

  // Filter transactions based on search query and type dropdown
  const filteredTransactions = transactionsList.filter((tx) => {
    const matchesSearch = !searchQuery.trim() || (
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesType = typeFilter === 'All' || tx.type === typeFilter;
    const amount = Number(tx.amount.replace(/[^\d.-]/g, ''));
    const matchesAmount = amountFilter === 'All' ||
      (amountFilter === 'high' && amount > 500) ||
      (amountFilter === 'low' && amount < 100);
    return matchesSearch && matchesType && matchesAmount;
  });
  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageTransactions = filteredTransactions.slice(pageStart, pageStart + PAGE_SIZE);
  const totalVolume = transactionsList.reduce((total, transaction) => total + Math.abs(Number(transaction.amount.replace(/[^\d.-]/g, ''))), 0);
  const averageTransaction = transactionsList.length ? totalVolume / transactionsList.length : 0;
  const productCount = carts?.reduce((total, cart) => total + cart.totalProducts, 0) ?? 0;

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer Name', 'Type', 'Amount', 'Status', 'Date & Time'];
    const rows = filteredTransactions.map(tx => [tx.id, tx.userName, tx.type, tx.amount, tx.status, tx.dateTime]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transactions_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (selectedTx) {
    return (
      <TransactionDetailPage 
        transactionId={selectedTx.id} 
        onBack={() => setSelectedTx(null)} 
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-[16px] lg:gap-[24px] mx-auto font-sans">
      {/* API Error State with Retry Button Controls */}
      {isError && (
        <div className="order-first w-full bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#991B1B] text-[13px] shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
            <span className="font-medium">
              API Error: Failed to retrieve live financial transactions from API. Displaying cached records.
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
      <div className="order-1 w-full lg:w-[1136px] h-[41px] lg:h-[50px] flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[4px] w-full lg:w-[368px] h-full">
          <h1 className="text-[18px] leading-[22px] lg:text-[24px] lg:leading-[29px] font-bold text-[#0F172A]">
            Transactions Ledger
          </h1>
          <p className="text-[12px] leading-[15px] lg:text-[14px] lg:leading-[17px] text-[#64748B]">
            <span className="hidden lg:inline">Monitor and manage all corporate financial transactions</span>
            <span className="lg:hidden">Monitor corporate financial ledger</span>
          </p>
        </div>

        {/* Export CSV Button */}
        <button 
          onClick={handleExportCSV}
          className="hidden lg:flex w-[135px] h-[37px] items-center justify-center gap-[8px] px-[16px] py-[10px] bg-white border border-[#E2E8F0] text-[#475569] rounded-[8px] text-[14px] leading-[17px] font-semibold hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <Download className="w-[16px] h-[16px]" />
          <span>Export CSV</span>
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
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-[138px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] leading-[16px] font-normal text-[#475569] focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]"
          >
            <option value="All">Type: All Types</option>
            <option value="Payment">Type: Payment</option>
            <option value="Refund">Type: Refund</option>
            <option value="Transfer">Type: Transfer</option>
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
            {transactionsList.length.toLocaleString()}
          </span>
        </div>

        {/* Card 2: Total Volume */}
        <div className="w-full lg:w-[272px] h-[60px] lg:h-[80px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[16px] flex flex-col gap-[4px] lg:gap-[8px]">
          <span className="text-[11px] leading-[13px] lg:text-[13px] lg:leading-[16px] font-normal text-[#64748B]">Total Volume</span>
          <span className="text-[16px] leading-[19px] lg:text-[20px] lg:leading-[24px] font-bold text-[#0F172A]">
            {totalVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Card 3: Avg. Transaction */}
        <div className="w-full lg:w-[272px] h-[60px] lg:h-[80px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[16px] flex flex-col gap-[4px] lg:gap-[8px]">
          <span className="hidden lg:inline text-[13px] leading-[16px] font-normal text-[#64748B]">Avg. Transaction</span>
          <span className="lg:hidden text-[11px] leading-[13px] font-normal text-[#64748B]">Avg. Amount</span>
          <span className="text-[16px] leading-[19px] lg:text-[20px] lg:leading-[24px] font-bold text-[#0F172A]">
            {averageTransaction.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Card 4: Success Rate */}
        <div className="w-full lg:w-[272px] h-[60px] lg:h-[80px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[16px] flex flex-col lg:flex-row lg:items-center gap-[4px] lg:gap-[12px]">
          <div className="flex flex-col gap-[4px] w-full lg:w-[148px]">
            <span className="text-[11px] leading-[13px] lg:text-[13px] lg:leading-[16px] font-normal text-[#64748B]">
              Success Rate
            </span>
            <span className="text-[16px] leading-[19px] lg:text-[20px] lg:leading-[24px] font-bold text-[#065F46] lg:text-[#10B981]">
              96.8%
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
            <div className="hidden lg:flex flex-col w-[1096px] overflow-x-auto min-w-[900px]">
              {/* Header */}
              <div className="w-[1096px] h-[39px] bg-[#F8FAFC] rounded-[6px] p-[12px] flex items-center gap-[16px]">
                <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">TRANSACTION ID</span>
                <span className="w-[200px] text-[12px] leading-[15px] font-semibold text-[#64748B]">USER</span>
                <span className="w-[100px] text-[12px] leading-[15px] font-semibold text-[#64748B]">TYPE</span>
                <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">AMOUNT</span>
                <span className="w-[120px] text-[12px] leading-[15px] font-semibold text-[#64748B]">STATUS</span>
                <span className="w-[160px] text-[12px] leading-[15px] font-semibold text-[#64748B]">DATE & TIME</span>
                <span className="w-[60px] text-[12px] leading-[15px] font-semibold text-[#64748B] text-right">ACTIONS</span>
              </div>

              {/* Rows */}
              {pageTransactions.map((tx) => (
                <div key={tx.id} className="w-[1096px] h-[48px] p-[12px] border-b border-[#E2E8F0] flex items-center gap-[16px] hover:bg-[#F8FAFC]">
                  <span className="w-[110px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">{tx.id}</span>
                  <div className="w-[200px] h-[24px] flex items-center gap-[8px]">
                    <img
                      src={tx.avatar}
                      alt={tx.userName}
                      className="w-[24px] h-[24px] rounded-[12px] object-cover shrink-0"
                    />
                    <span className="text-[13px] leading-[16px] font-medium text-[#0F172A] truncate">
                      {tx.userName}
                    </span>
                  </div>
                  <div className="w-[100px] h-[17px] flex items-center">
                    <span
                      className={`h-[17px] flex items-center px-[8px] py-[2px] rounded-[4px] text-[11px] leading-[13px] font-semibold ${
                        tx.type === 'Payment'
                          ? 'bg-[#DBEAFE] text-[#1E40AF]'
                          : tx.type === 'Refund'
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : 'bg-[#DBEAFE] text-[#1E40AF]' // Transfer maps to blue visually in Figma
                      }`}
                    >
                      {tx.type}
                    </span>
                  </div>
                  <span className={`w-[110px] text-[13px] leading-[16px] font-semibold ${tx.isNegative ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>
                    {tx.amount}
                  </span>
                  <div className="w-[120px] h-[21px] flex items-center">
                    <span
                      className={`h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold ${
                        tx.status === 'Completed'
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : tx.status === 'Pending'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : tx.status === 'Refunded'
                          ? 'bg-[#F8FAFC] text-[#475569]'
                          : 'bg-[#FEE2E2] text-[#991B1B]' // Failed
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <span className="w-[160px] text-[13px] leading-[16px] font-normal text-[#475569]">{tx.dateTime}</span>
                  <div className="w-[60px] h-[16px] flex justify-end items-center">
                    <button 
                      onClick={() => setSelectedTx(tx)}
                      className="w-[16px] h-[16px] text-[#475569] hover:text-[#0F172A] cursor-pointer"
                      title="View detail"
                    >
                      <Eye className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                </div>
              ))}
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
                        tx.status === 'Completed'
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : tx.status === 'Pending'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : tx.status === 'Refunded'
                          ? 'bg-[#F8FAFC] text-[#475569]'
                          : 'bg-[#FEE2E2] text-[#991B1B]' // Failed
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  {/* Row 2: Divider */}
                  <div className="w-full h-0 border-t border-[#E2E8F0]" />

                  {/* Row 3: User Info & Amount/Type */}
                  <div className="w-full h-[37px] flex justify-between items-center">
                    {/* Left: User */}
                    <div className="h-[24px] flex items-center gap-[8px]">
                      <img
                        src={tx.avatar}
                        alt={tx.userName}
                        className="w-[24px] h-[24px] rounded-[12px] object-cover shrink-0"
                      />
                      <span className="w-[80px] text-[13px] leading-[16px] font-medium text-[#475569] truncate">
                        {tx.userName}
                      </span>
                    </div>

                    {/* Right: Amount & Type */}
                    <div className="h-[37px] flex flex-col items-end gap-[2px]">
                      <span className={`text-[13px] leading-[16px] font-bold ${tx.isNegative ? 'text-[#991B1B]' : 'text-[#0F172A]'}`}>
                        {tx.amount}
                      </span>
                      <span
                        className={`h-[19px] flex items-center px-[8px] py-[3px] rounded-[12px] text-[11px] leading-[13px] font-semibold ${
                          tx.type === 'Payment'
                            ? 'bg-[#DBEAFE] text-[#1E40AF]'
                            : tx.type === 'Refund'
                            ? 'bg-[#DBEAFE] text-[#1E40AF]' // In mobile figma CSS for Refund it uses text-[#1E40AF] wait no, looking closer "Payment" is blue.
                            : 'bg-[#DBEAFE] text-[#1E40AF]'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Date & Actions */}
                  <div className="w-full h-[24px] pt-[4px] flex justify-between items-center">
                    <span className="text-[10px] leading-[12px] font-normal text-[#64748B]">
                      {tx.dateTime}
                    </span>
                    <button 
                      onClick={() => setSelectedTx(tx)}
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
            Showing <span className="font-semibold text-[#0F172A]">{filteredTransactions.length ? `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredTransactions.length)}` : '0'}</span> of{' '}
            <span className="font-semibold text-[#0F172A]">{filteredTransactions.length}</span> results
          </span>
          <div className="flex items-center gap-[8px]">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-[12px] py-[4px] bg-white border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage >= pageCount}
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
