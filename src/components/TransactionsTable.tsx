'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Filter, Eye } from 'lucide-react';
import { fetchUsers, fetchTransactions, ApiUser, ApiCart } from '@/lib/api';
import TransactionDetailPage from './TransactionDetailPage';
import { SkeletonRows } from '@/components/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const defaultTransactions = [
  {
    id: '#TXN-1082',
    rawId: 1082,
    userName: 'Albert Flores',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    amount: '$150.00',
    status: 'Completed',
    date: 'Oct 1, 2024',
  },
  {
    id: '#TXN-1081',
    rawId: 1081,
    userName: 'Jenny Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    amount: '$2,350.00',
    status: 'Pending',
    date: 'Sep 30, 2024',
  },
  {
    id: '#TXN-1080',
    rawId: 1080,
    userName: 'Kathryn Murphy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    amount: '$420.00',
    status: 'Completed',
    date: 'Sep 29, 2024',
  },
];

export default function TransactionsTable() {
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: carts, isLoading } = useQuery({
    queryKey: ['carts'],
    queryFn: fetchTransactions,
  });

  // Map API data if available, or fallback to default Figma rows
  const sourceData = carts && carts.length > 0 
    ? carts.slice(0, 8).map((cart: ApiCart, idx: number) => {
        const user: ApiUser | undefined = users && users[idx % users.length];
        const statuses: ('Completed' | 'Pending' | 'Failed')[] = ['Completed', 'Pending', 'Failed', 'Completed'];
        const dates = ['Oct 1, 2024', 'Sep 30, 2024', 'Sep 29, 2024', 'Sep 27, 2024'];
        return {
          id: `#TXN-${1080 + cart.id}`,
          rawId: cart.id,
          userName: user ? `${user.firstName} ${user.lastName}` : defaultTransactions[idx % 3].userName,
          avatar: user?.image || defaultTransactions[idx % 3].avatar,
          amount: `$${cart.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          status: statuses[idx % statuses.length],
          date: dates[idx % dates.length],
        };
      })
    : defaultTransactions;

  // Filter rows based on search query
  const filteredRows = sourceData.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.id.toLowerCase().includes(q) ||
      tx.userName.toLowerCase().includes(q) ||
      tx.amount.toLowerCase().includes(q) ||
      tx.status.toLowerCase().includes(q)
    );
  });

  const selectedTx = filteredRows.find((tx) => tx.rawId === selectedTxId);
  if (selectedTx) {
    return <TransactionDetailPage transactionId={selectedTx.id} onBack={() => setSelectedTxId(null)} />;
  }

  return (
    <div className="w-full lg:w-[752px] min-h-[232px] lg:h-[372px] bg-white border border-[#E2E8F0] rounded-[8px] p-4 lg:p-[20px] flex flex-col lg:items-start lg:gap-[16px] box-border shadow-xs">
      
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
        <button className="box-border flex flex-row items-center justify-center p-[6px_12px] gap-[6px] w-[74px] h-[27px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] cursor-pointer hover:bg-[#F1F5F9] transition-colors">
          <div className="flex flex-row justify-center items-center p-0 w-[14px] h-[14px]">
            <Filter className="w-[12px] h-[12px] text-[#475569]" />
          </div>
          <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">Filter</span>
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
        <button className="text-[12px] font-bold text-[#4F46E5] hover:underline cursor-pointer">
          View All
        </button>
      </div>

      {/* Mobile Card Row List View */}
      <div className="lg:hidden flex flex-col gap-2.5 w-full">
        {filteredRows.slice(0, 3).map((tx) => (
          <div 
            key={tx.id} 
            className="w-full bg-white border border-[#E2E8F0] rounded-[8px] p-3 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={tx.avatar}
                alt={tx.userName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E2E8F0]"
              />
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
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  tx.status === 'Completed'
                    ? 'bg-[#D1FAE5] text-[#10B981]'
                    : tx.status === 'Pending'
                    ? 'bg-[#FEF3C7] text-[#D97706]'
                    : 'bg-[#FEE2E2] text-[#EF4444]'
                }`}
              >
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Content */}
      <div className="hidden lg:flex flex-col items-start p-0 w-[712px] h-[246px] overflow-y-scroll overflow-x-hidden scrollbar-hide">
        {/* Table Header Row */}
        <div className="flex flex-row items-start p-[12px] gap-[16px] w-[712px] h-[54px] bg-[#F8FAFC] rounded-[6px] shrink-0 mb-[0px]">
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

        {isLoading && !carts ? (
          <div className="w-full mt-4"><SkeletonRows className="py-4" /></div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#64748B] gap-1 w-full">
            <span className="text-sm font-semibold text-[#0F172A]">No matching transactions found</span>
            <span className="text-xs">Try searching for &quot;{searchQuery}&quot; in the search bar above</span>
          </div>
        ) : (
          filteredRows.slice(0, 4).map((tx) => (
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
                <div className={`flex flex-row items-start px-[8px] py-[4px] rounded-[12px] h-[21px] ${
                  tx.status === 'Completed' ? 'bg-[#D1FAE5]' : 
                  tx.status === 'Pending' ? 'bg-[#FEF3C7]' : 'bg-[#FEE2E2]'
                }`}>
                  <span className={`font-semibold text-[11px] leading-[13px] font-['Inter'] ${
                    tx.status === 'Completed' ? 'text-[#065F46]' : 
                    tx.status === 'Pending' ? 'text-[#92400E]' : 'text-[#991B1B]'
                  }`}>{tx.status}</span>
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
                  onClick={() => setSelectedTxId(tx.rawId)}
                  title="View details"
                >
                  <Eye className="w-[16px] h-[16px] text-[#475569]" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Pagination Frame (Desktop) */}
      <div className="hidden lg:flex flex-row justify-between items-center p-0 w-[712px] h-[27px] shrink-0 mt-auto">
        <span className="font-normal text-[13px] leading-[16px] text-[#64748B] font-['Inter']">
          Showing 1-{Math.min(6, filteredRows.length)} of {carts ? carts.length : 89} results
        </span>
        <div className="flex flex-row items-start gap-[8px] h-[27px]">
          <button className="box-border flex flex-row items-start px-[12px] py-[6px] bg-white border border-[#E2E8F0] rounded-[6px] h-[27px] hover:bg-[#F8FAFC] cursor-pointer">
            <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">Previous</span>
          </button>
          <button className="box-border flex flex-row items-start px-[12px] py-[6px] bg-white border border-[#E2E8F0] rounded-[6px] h-[27px] hover:bg-[#F8FAFC] cursor-pointer">
            <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">Next</span>
          </button>
        </div>
      </div>

    </div>
  );
}
