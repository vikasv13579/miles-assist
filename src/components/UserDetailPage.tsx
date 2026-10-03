'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Pencil, 
  UserX, 
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBookings, fetchTransactions, fetchUserById, updateUser } from '@/lib/api';

interface UserDetailPageProps {
  userId?: string;
  userName?: string;
  userEmail?: string;
  onBack?: () => void;
}

export default function UserDetailPage({
  userId,
  onBack
}: UserDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userApi, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => fetchUserById(userId!),
    enabled: !!userId,
  });
  const transactionsQuery = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });
  const bookingsQuery = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const statusMutation = useMutation({
    mutationFn: (status: 'ACTIVE' | 'INACTIVE') => updateUser(userId ?? '', { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-detail', userId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ]);
    },
  });

  const displayName = userApi?.name ?? '';
  const displayEmail = userApi?.email ?? '';
  const displayAvatar = userApi?.image ?? '';
  const displayPhone = userApi?.phone || '—';
  const userTransactions = (transactionsQuery.data ?? []).filter((transaction) => transaction.userId === userId);
  const userBookings = (bookingsQuery.data ?? []).filter((booking) => booking.userId === userId);
  const recentItems = [
    ...userTransactions.map((transaction) => ({
      id: transaction.id,
      title: `Transaction ${transaction.reference}`,
      detail: `Status: ${transaction.status}`,
      date: transaction.createdAt,
    })),
    ...userBookings.map((booking) => ({
      id: booking.id,
      title: `Booking ${booking.reference}`,
      detail: `Status: ${booking.status}`,
      date: booking.bookingDate,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  if (!userId) {
    return <div role="alert" className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 text-[13px] text-[#64748B]">Choose a user from the directory to view their profile.</div>;
  }
  if (isLoading) {
    return <div role="status" className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 text-[13px] text-[#64748B]">Loading profile details…</div>;
  }
  if (isError || !userApi) {
    return (
      <div role="alert" className="flex items-center justify-between gap-3 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#991B1B]">
        <span>Unable to load this user profile from the backend.</span>
        <button onClick={() => void refetch()} className="shrink-0 font-semibold underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1136px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      {/* 1. BREADCRUMB FRAME */}
      <div className="w-full lg:w-[1136px] h-[16px] flex items-center gap-[8px]">
        {onBack ? (
          <button 
            onClick={onBack}
            className="text-[13px] leading-[16px] font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
          >
            Users
          </button>
        ) : (
          <Link 
            href="/users"
            className="text-[13px] leading-[16px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            Users
          </Link>
        )}
        <span className="text-[13px] leading-[16px] text-[#94A3B8]">/</span>
        <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">{displayName}</span>
      </div>

      {/* 2. PROFILE HERO BANNER CARD */}
      <div className="w-full lg:w-[1136px] lg:h-[120px] bg-white border border-[#E2E8F0] rounded-[8px] p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[24px]">
        <div className="flex items-center gap-[20px]">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-[72px] h-[72px] rounded-[36px] object-cover shrink-0"
          />
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-[12px] h-[27px]">
              <h1 className="text-[22px] font-bold text-[#0F172A] leading-[27px]">
                {displayName}
              </h1>
              <span className={`h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold ${
                userApi.status === 'ACTIVE' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'
                }`}>
                  {userApi.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
            </div>
            <p className="text-[14px] text-[#64748B] leading-[17px]">
              {displayEmail} • Joined {new Date(userApi.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-[12px]">
          <button 
            onClick={() => statusMutation.mutate(userApi.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
            disabled={statusMutation.isPending}
            className={`w-[127px] h-[37px] flex items-center justify-center gap-[8px] px-[16px] py-[10px] rounded-[8px] text-[14px] leading-[17px] font-semibold cursor-pointer ${
              userApi.status === 'INACTIVE'
                ? 'bg-[#E2E8F0] text-[#475569]'
                : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}
          >
            <span>{statusMutation.isPending ? 'Updating…' : userApi.status === 'INACTIVE' ? 'Reactivate User' : 'Deactivate User'}</span>
          </button>
        </div>
      </div>

      {/* 3. MIDDLE GRID (Left: Info cards, Right: Recent Activity Log) */}
      <div className="w-full lg:w-[1136px] flex flex-col lg:flex-row items-start gap-[24px]">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-[24px] w-full lg:w-[712px]">
          {/* Personal Information Card */}
          <div className="box-border w-full lg:w-[712px] lg:h-[235px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col items-start gap-[16px]">
            <h2 className="w-[164px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A] m-0 shrink-0">Personal Information</h2>
            <div className="flex flex-col items-start gap-[12px] w-[672px] h-[160px] shrink-0">
              <div className="box-border pb-[8px] border-b border-[#E2E8F0] flex flex-row items-center justify-between w-[672px] h-[24px] shrink-0">
                <span className="w-[61px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Full Name</span>
                <span className="w-[94px] h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">{displayName}</span>
              </div>
              <div className="box-border pb-[8px] border-b border-[#E2E8F0] flex flex-row items-center justify-between w-[672px] h-[24px] shrink-0">
                <span className="w-[87px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Email Address</span>
                <span className="w-[187px] h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">{displayEmail}</span>
              </div>
              <div className="box-border pb-[8px] border-b border-[#E2E8F0] flex flex-row items-center justify-between w-[672px] h-[24px] shrink-0">
                <span className="w-[92px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Phone Number</span>
                <span className="w-[81px] h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">{displayPhone}</span>
              </div>
              <div className="box-border pb-[8px] border-b border-[#E2E8F0] flex flex-row items-center justify-between w-[672px] h-[24px] shrink-0">
                <span className="w-[79px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Date of Birth</span>
                <span className="w-[96px] h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">Not provided</span>
              </div>
              <div className="flex flex-row items-center justify-between w-[672px] h-[16px] shrink-0">
                <span className="w-[99px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Mailing Address</span>
                <span className="w-[261px] h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">Not provided</span>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="box-border w-full lg:w-[712px] lg:h-[200px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col items-start gap-[16px]">
            <h2 className="w-[161px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A] m-0 shrink-0">Account Information</h2>
            <div className="flex flex-col items-start gap-[12px] w-[672px] h-[125px] shrink-0">
              <div className="box-border pb-[8px] border-b border-[#E2E8F0] flex flex-row items-center justify-between w-[672px] h-[24px] shrink-0">
                <span className="w-[46px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">User ID</span>
                <span className="w-[180px] truncate h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">{userApi.id}</span>
              </div>
              <div className="box-border pb-[8px] border-b border-[#E2E8F0] flex flex-row items-center justify-between w-[672px] h-[24px] shrink-0">
                <span className="w-[74px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Joined Date</span>
                <span className="w-[109px] h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">{new Date(userApi.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="box-border pb-[8px] border-b border-[#E2E8F0] flex flex-row items-center justify-between w-[672px] h-[24px] shrink-0">
                <span className="w-[114px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Last Login Activity</span>
                <span className="w-[120px] h-[16px] text-[#0F172A] text-[13px] leading-[16px] font-semibold text-right shrink-0">Not available</span>
              </div>
              <div className="flex flex-row items-center justify-between w-[672px] h-[17px] shrink-0">
                <span className="w-[126px] h-[16px] text-[#64748B] text-[13px] leading-[16px] font-normal shrink-0">Two-Factor Security</span>
                <div className="flex flex-row items-start px-[6px] py-[2px] w-[56px] h-[17px] bg-[#D1FAE5] rounded-[4px] shrink-0 box-border">
                  <span className="w-[44px] h-[13px] text-[11px] leading-[13px] font-bold text-[#065F46] shrink-0">
                    Not provided
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity Log */}
        <div className="box-border w-full lg:w-[400px] lg:h-[379px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col items-start gap-[16px]">
          <h2 className="w-[153px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A] m-0 shrink-0">Recent Records</h2>
          <div className="flex flex-col items-start gap-[16px] w-[360px] h-[304px] shrink-0 relative overflow-y-auto">
            {recentItems.length === 0 ? (
              <p className="text-[13px] text-[#64748B]">No transactions or bookings are available for this user.</p>
            ) : recentItems.map((item) => (
              <div key={item.id} className="relative flex flex-row items-start gap-[12px] w-full h-[48px] isolate shrink-0">
                <div className="absolute w-[8px] h-[8px] left-0 top-[6px] bg-[#4F46E5] rounded-[4px]" />
                <div className="flex flex-col pl-[16px] gap-[2px] w-full">
                  <span className="truncate text-[13px] leading-[16px] font-semibold text-[#0F172A]">{item.title}</span>
                  <span className="text-[12px] leading-[15px] text-[#475569]">{item.detail}</span>
                  <span className="text-[11px] leading-[13px] text-[#64748B]">{new Date(item.date).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM GRID (Sarah's Recent Transactions & Sarah's Recent Bookings) */}
      <div className="w-full lg:w-[1136px] flex flex-col lg:flex-row items-start gap-[24px]">
        {/* Sarah's Recent Transactions Card */}
        <div className="w-full lg:w-[556px] lg:h-[200px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[12px]">
          <h2 className="text-[16px] leading-[19px] font-bold text-[#0F172A]">{displayName}&apos;s Recent Transactions</h2>
          <div className="flex flex-col w-full overflow-x-auto min-w-[380px]">
            <div className="w-full h-[39px] bg-[#F8FAFC] rounded-[6px] p-[12px] flex items-center gap-[16px]">
              <span className="w-[90px] text-[12px] leading-[15px] font-semibold text-[#64748B]">ID</span>
              <span className="w-[90px] text-[12px] leading-[15px] font-semibold text-[#64748B]">AMOUNT</span>
              <span className="w-[100px] text-[12px] leading-[15px] font-semibold text-[#64748B]">STATUS</span>
              <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">DATE</span>
            </div>
            {userTransactions.length === 0 ? (
              <p className="px-3 py-4 text-[13px] text-[#64748B]">No transactions for this user.</p>
            ) : userTransactions.slice(0, 2).map((transaction) => (
              <div key={transaction.id} onClick={() => router.push(`/transaction-detail?id=${encodeURIComponent(transaction.id)}`)} className="w-full h-[45px] px-[12px] border-b border-[#E2E8F0] flex items-center gap-[16px] cursor-pointer hover:bg-[#F8FAFC]">
                <span className="w-[90px] truncate text-[13px] leading-[16px] font-semibold text-[#0F172A]">{transaction.reference}</span>
                <span className="w-[90px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                <span className="w-[100px] text-[11px] font-semibold text-[#475569]">{transaction.status}</span>
                <span className="w-[110px] text-[13px] leading-[16px] text-[#64748B]">{new Date(transaction.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sarah's Recent Bookings Card */}
        <div className="w-full lg:w-[556px] lg:h-[200px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[12px]">
          <h2 className="text-[16px] leading-[19px] font-bold text-[#0F172A]">{displayName}&apos;s Recent Bookings</h2>
          <div className="flex flex-col w-full overflow-x-auto min-w-[380px]">
            <div className="w-full h-[39px] bg-[#F8FAFC] rounded-[6px] p-[12px] flex items-center gap-[16px]">
              <span className="w-[90px] text-[12px] leading-[15px] font-semibold text-[#64748B]">ID</span>
              <span className="w-[140px] text-[12px] leading-[15px] font-semibold text-[#64748B]">SERVICE</span>
              <span className="w-[100px] text-[12px] leading-[15px] font-semibold text-[#64748B]">STATUS</span>
              <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">DATE & TIME</span>
            </div>
            {userBookings.length === 0 ? (
              <p className="px-3 py-4 text-[13px] text-[#64748B]">No bookings for this user.</p>
            ) : userBookings.slice(0, 2).map((booking) => (
              <div key={booking.id} onClick={() => router.push(`/booking-detail?id=${encodeURIComponent(booking.id)}`)} className="w-full h-[45px] px-[12px] border-b border-[#E2E8F0] flex items-center gap-[16px] cursor-pointer hover:bg-[#F8FAFC]">
                <span className="w-[90px] truncate text-[13px] leading-[16px] font-semibold text-[#0F172A]">{booking.reference}</span>
                <span className="w-[140px] text-[13px] leading-[16px] text-[#0F172A]">—</span>
                <span className="w-[100px] text-[11px] font-semibold text-[#475569]">{booking.status}</span>
                <span className="w-[110px] text-[13px] leading-[16px] text-[#64748B]">{new Date(booking.bookingDate).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
