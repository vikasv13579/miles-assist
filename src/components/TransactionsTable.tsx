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
    <div className="w-full lg:w-[752px] min-h-[232px] lg:min-h-[372px] bg-white border border-[#E2E8F0] rounded-[8px] p-4 lg:p-[20px] flex flex-col justify-between shadow-xs">
      {/* Table Header & Filter */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] lg:text-[16px] font-bold text-[#0F172A]">
            Recent Transactions
          </h3>
          {searchQuery && (
            <span className="text-[11px] bg-[#EEF2FF] text-[#4F46E5] font-semibold px-2 py-0.5 rounded-full">
              Filtered: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        {/* Desktop Filter Button */}
        <Button variant="outline" className="hidden lg:flex items-center gap-1.5 h-8 px-3 bg-white border border-[#E2E8F0] rounded-[6px] text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC]">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Filter</span>
        </Button>

        {/* Mobile View All Link */}
        <button className="lg:hidden text-[12px] font-bold text-[#4F46E5] hover:underline cursor-pointer">
          View All
        </button>
      </div>

      {/* Mobile Card Row List View */}
      <div className="lg:hidden flex flex-col gap-2.5">
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

      {/* Desktop Table View */}
      <div className="hidden lg:block w-full overflow-x-auto min-h-[220px]">
        {isLoading && !carts ? (
          <SkeletonRows className="py-4" />
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#64748B] gap-1">
            <span className="text-sm font-semibold text-[#0F172A]">No matching transactions found</span>
            <span className="text-xs">Try searching for &quot;{searchQuery}&quot; in the search bar above</span>
          </div>
        ) : (
          <Table className="w-full text-left border-collapse">
            <TableHeader>
              <TableRow className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase hover:bg-transparent">
                <TableHead className="pb-3 font-bold h-auto">Transaction ID</TableHead>
                <TableHead className="pb-3 font-bold h-auto">User</TableHead>
                <TableHead className="pb-3 font-bold h-auto">Amount</TableHead>
                <TableHead className="pb-3 font-bold h-auto">Status</TableHead>
                <TableHead className="pb-3 font-bold h-auto">Date</TableHead>
                <TableHead className="pb-3 font-bold text-center h-auto">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[13px]">
              {filteredRows.slice(0, 4).map((tx) => (
                <TableRow key={tx.id} className="hover:bg-[#F8FAFC] transition-colors border-[#F1F5F9]">
                  <TableCell className="py-3 font-semibold text-[#0F172A]">{tx.id}</TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={tx.avatar}
                        alt={tx.userName}
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#E2E8F0]"
                      />
                      <span className="font-medium text-[#0F172A] truncate">
                        {tx.userName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 font-semibold text-[#0F172A]">{tx.amount}</TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-semibold hover:opacity-100 ${
                        tx.status === 'Completed'
                          ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5]'
                          : tx.status === 'Pending'
                          ? 'bg-[#FEF3C7] text-[#D97706] hover:bg-[#FEF3C7]'
                          : 'bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FEE2E2]'
                      }`}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-[#64748B]">{tx.date}</TableCell>
                  <TableCell className="py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTxId(tx.rawId)}
                      className="w-8 h-8 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4 mx-auto" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Table Footer / Pagination (Desktop) */}
      <div className="hidden lg:flex items-center justify-between pt-3 border-t border-[#F1F5F9] text-[12px]">
        <span className="text-[#64748B]">
          Showing <span className="font-semibold text-[#0F172A]">1-{Math.min(4, filteredRows.length)}</span> of{' '}
          <span className="font-semibold text-[#0F172A]">{filteredRows.length}</span> results
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="px-3 h-7 bg-white border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:bg-[#F8FAFC]">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="px-3 h-7 bg-white border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:bg-[#F8FAFC]">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
