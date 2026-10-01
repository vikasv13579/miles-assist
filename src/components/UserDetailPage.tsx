'use client';

import React, { useState } from 'react';
import { 
  Pencil, 
  UserX, 
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '@/lib/api';
import TransactionDetailPage from './TransactionDetailPage';
import BookingDetailPage from './BookingDetailPage';

interface UserDetailPageProps {
  userId?: string;
  userName?: string;
  userEmail?: string;
  onBack?: () => void;
}

export default function UserDetailPage({
  userId = '1',
  userName = 'Sarah Jenkins',
  userEmail = 'sarah.johnson@example.com',
  onBack
}: UserDetailPageProps) {
  const [isSuspended, setIsSuspended] = useState(false);
  const [viewTxId, setViewTxId] = useState<string | null>(null);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);

  const { data: userApi, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

  const displayName = userApi ? `${userApi.firstName} ${userApi.lastName}` : userName;
  const displayEmail = userApi ? userApi.email : userEmail;
  const displayAvatar = userApi?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
  const displayPhone = userApi?.phone || '+1 555-0123';
  const displayAddress = userApi?.address ? `${userApi.address.address}, ${userApi.address.city}, ${userApi.address.state}` : '123 Business Rd, Suite 100, New York, NY';

  if (viewTxId) {
    return (
      <TransactionDetailPage 
        transactionId={viewTxId} 
        onBack={() => setViewTxId(null)} 
      />
    );
  }

  if (viewBookingId) {
    return (
      <BookingDetailPage 
        bookingId={viewBookingId} 
        onBack={() => setViewBookingId(null)} 
      />
    );
  }

  return (
    <div className="w-full max-w-[1136px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      {isLoading && (
        <div role="status" className="rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3 text-[13px] text-[#64748B]">
          Loading profile details...
        </div>
      )}
      {isError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#991B1B]">
          <span>Unable to load live profile details. Showing saved profile information.</span>
          <button onClick={() => refetch()} className="shrink-0 font-semibold underline">Retry</button>
        </div>
      )}
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
                isSuspended ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#D1FAE5] text-[#065F46]'
              }`}>
                {isSuspended ? 'Suspended' : 'Active'}
              </span>
              <span className="h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#D1FAE5] text-[#065F46]">
                Confirmed
              </span>
            </div>
            <p className="text-[14px] text-[#64748B] leading-[17px]">
              {displayEmail} • Joined Jan 12, 2024
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-[12px]">
          <button className="w-[128px] h-[37px] flex items-center justify-center gap-[8px] px-[16px] py-[10px] bg-white border border-[#E2E8F0] text-[#475569] rounded-[8px] text-[14px] leading-[17px] font-semibold cursor-pointer">
            <Pencil className="w-[14px] h-[14px]" />
            <span>Edit Profile</span>
          </button>
          <button 
            onClick={() => setIsSuspended(!isSuspended)}
            className={`w-[127px] h-[37px] flex items-center justify-center gap-[8px] px-[16px] py-[10px] rounded-[8px] text-[14px] leading-[17px] font-semibold cursor-pointer ${
              isSuspended
                ? 'bg-[#E2E8F0] text-[#475569]'
                : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}
          >
            <span>{isSuspended ? 'Unsuspend' : 'Suspend User'}</span>
          </button>
        </div>
      </div>

      {/* 3. MIDDLE GRID (Left: Info cards, Right: Recent Activity Log) */}
      <div className="w-full lg:w-[1136px] flex flex-col lg:flex-row items-start gap-[24px]">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-[24px] w-full lg:w-[712px]">
          {/* Personal Information Card */}
          <div className="w-full lg:h-[235px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
            <h2 className="text-[16px] leading-[19px] font-bold text-[#0F172A]">Personal Information</h2>
            <div className="flex flex-col gap-[12px]">
              <div className="pb-[8px] border-b border-[#E2E8F0] flex items-center justify-between h-[24px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Full Name</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">{displayName}</span>
              </div>
              <div className="pb-[8px] border-b border-[#E2E8F0] flex items-center justify-between h-[24px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Email Address</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">{displayEmail}</span>
              </div>
              <div className="pb-[8px] border-b border-[#E2E8F0] flex items-center justify-between h-[24px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Phone Number</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">{displayPhone}</span>
              </div>
              <div className="pb-[8px] border-b border-[#E2E8F0] flex items-center justify-between h-[24px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Date of Birth</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">{userApi?.birthDate || 'March 14, 1992'}</span>
              </div>
              <div className="flex items-center justify-between h-[16px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Mailing Address</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">{displayAddress}</span>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="w-full lg:h-[200px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
            <h2 className="text-[16px] leading-[19px] font-bold text-[#0F172A]">Account Information</h2>
            <div className="flex flex-col gap-[12px]">
              <div className="pb-[8px] border-b border-[#E2E8F0] flex items-center justify-between h-[24px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">User ID</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">#USR-4821</span>
              </div>
              <div className="pb-[8px] border-b border-[#E2E8F0] flex items-center justify-between h-[24px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Joined Date</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">January 12, 2024</span>
              </div>
              <div className="pb-[8px] border-b border-[#E2E8F0] flex items-center justify-between h-[24px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Last Login Activity</span>
                <span className="text-[#0F172A] text-[13px] leading-[16px] font-semibold">Today, 14:24</span>
              </div>
              <div className="flex items-center justify-between h-[17px]">
                <span className="text-[#64748B] text-[13px] leading-[16px]">Two-Factor Security</span>
                <span className="h-[17px] flex items-center px-[6px] py-[2px] rounded-[4px] text-[11px] leading-[13px] font-bold bg-[#D1FAE5] text-[#065F46]">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity Log */}
        <div className="w-full lg:w-[400px] lg:h-[379px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
          <h2 className="text-[16px] leading-[19px] font-bold text-[#0F172A]">Recent Activity Log</h2>
          <div className="flex flex-col gap-[16px] w-full lg:w-[360px] relative">
            <div className="absolute left-[3px] top-[14px] bottom-[14px] w-[2px] bg-[#E2E8F0] z-0 hidden lg:block" />

            {/* Log Item 1 */}
            <div className="relative flex gap-[12px] h-[48px] z-10">
              <span className="hidden lg:block w-[8px] h-[8px] rounded-[4px] bg-[#4F46E5] shrink-0 mt-[6px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Created booking #BKG-2341</span>
                <span className="text-[12px] leading-[15px] text-[#475569]">Strategy development session</span>
                <span className="text-[11px] leading-[13px] text-[#64748B]">2 hours ago</span>
              </div>
            </div>
            {/* Log Item 2 */}
            <div className="relative flex gap-[12px] h-[48px] z-10">
              <span className="hidden lg:block w-[8px] h-[8px] rounded-[4px] bg-[#4F46E5] shrink-0 mt-[6px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Changed user password</span>
                <span className="text-[12px] leading-[15px] text-[#475569]">Initiated self-service reset</span>
                <span className="text-[11px] leading-[13px] text-[#64748B]">Yesterday, 16:21</span>
              </div>
            </div>
            {/* Log Item 3 */}
            <div className="relative flex gap-[12px] h-[48px] z-10">
              <span className="hidden lg:block w-[8px] h-[8px] rounded-[4px] bg-[#4F46E5] shrink-0 mt-[6px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Logged in from new device</span>
                <span className="text-[12px] leading-[15px] text-[#475569]">MacOS Chrome, Brooklyn, NY</span>
                <span className="text-[11px] leading-[13px] text-[#64748B]">Sep 28, 2024</span>
              </div>
            </div>
            {/* Log Item 4 */}
            <div className="relative flex gap-[12px] h-[48px] z-10">
              <span className="hidden lg:block w-[8px] h-[8px] rounded-[4px] bg-[#4F46E5] shrink-0 mt-[6px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Completed transaction #TXN-7823</span>
                <span className="text-[12px] leading-[15px] text-[#475569]">Direct invoice payment received</span>
                <span className="text-[11px] leading-[13px] text-[#64748B]">Sep 27, 2024</span>
              </div>
            </div>
            {/* Log Item 5 */}
            <div className="relative flex gap-[12px] h-[48px] z-10">
              <span className="hidden lg:block w-[8px] h-[8px] rounded-[4px] bg-[#4F46E5] shrink-0 mt-[6px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Updated profile photo</span>
                <span className="text-[12px] leading-[15px] text-[#475569]">Refreshed corporate portrait</span>
                <span className="text-[11px] leading-[13px] text-[#64748B]">Sep 15, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM GRID (Sarah's Recent Transactions & Sarah's Recent Bookings) */}
      <div className="w-full lg:w-[1136px] flex flex-col lg:flex-row items-start gap-[24px]">
        {/* Sarah's Recent Transactions Card */}
        <div className="w-full lg:w-[556px] lg:h-[200px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[12px]">
          <h2 className="text-[16px] leading-[19px] font-bold text-[#0F172A]">Sarah&apos;s Recent Transactions</h2>
          <div className="flex flex-col w-full overflow-x-auto min-w-[380px]">
            <div className="w-full h-[39px] bg-[#F8FAFC] rounded-[6px] p-[12px] flex items-center gap-[16px]">
              <span className="w-[90px] text-[12px] leading-[15px] font-semibold text-[#64748B]">ID</span>
              <span className="w-[90px] text-[12px] leading-[15px] font-semibold text-[#64748B]">AMOUNT</span>
              <span className="w-[100px] text-[12px] leading-[15px] font-semibold text-[#64748B]">STATUS</span>
              <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">DATE</span>
            </div>
            <div 
              onClick={() => setViewTxId('#TXN-7823')}
              className="w-full h-[45px] px-[12px] border-b border-[#E2E8F0] flex items-center gap-[16px] cursor-pointer hover:bg-[#F8FAFC]"
            >
              <span className="w-[90px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">#TXN-7823</span>
              <span className="w-[90px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">$245.00</span>
              <div className="w-[100px] h-[21px] flex items-center">
                <span className="h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#D1FAE5] text-[#065F46]">
                  Paid
                </span>
              </div>
              <span className="w-[110px] text-[13px] leading-[16px] text-[#64748B]">Sep 27, 2024</span>
            </div>
            <div 
              onClick={() => setViewTxId('#TXN-7102')}
              className="w-full h-[45px] px-[12px] flex items-center gap-[16px] cursor-pointer hover:bg-[#F8FAFC]"
            >
              <span className="w-[90px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">#TXN-7102</span>
              <span className="w-[90px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">$120.00</span>
              <div className="w-[100px] h-[21px] flex items-center">
                <span className="h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                  Completed
                </span>
              </div>
              <span className="w-[110px] text-[13px] leading-[16px] text-[#64748B]">Aug 15, 2024</span>
            </div>
          </div>
        </div>

        {/* Sarah's Recent Bookings Card */}
        <div className="w-full lg:w-[556px] lg:h-[200px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[12px]">
          <h2 className="text-[16px] leading-[19px] font-bold text-[#0F172A]">Sarah&apos;s Recent Bookings</h2>
          <div className="flex flex-col w-full overflow-x-auto min-w-[380px]">
            <div className="w-full h-[39px] bg-[#F8FAFC] rounded-[6px] p-[12px] flex items-center gap-[16px]">
              <span className="w-[90px] text-[12px] leading-[15px] font-semibold text-[#64748B]">ID</span>
              <span className="w-[140px] text-[12px] leading-[15px] font-semibold text-[#64748B]">SERVICE</span>
              <span className="w-[100px] text-[12px] leading-[15px] font-semibold text-[#64748B]">STATUS</span>
              <span className="w-[110px] text-[12px] leading-[15px] font-semibold text-[#64748B]">DATE & TIME</span>
            </div>
            <div 
              onClick={() => setViewBookingId('#BKG-2341')}
              className="w-full h-[45px] px-[12px] border-b border-[#E2E8F0] flex items-center gap-[16px] cursor-pointer hover:bg-[#F8FAFC]"
            >
              <span className="w-[90px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">#BKG-2341</span>
              <span className="w-[140px] text-[13px] leading-[16px] text-[#0F172A]">Consultation</span>
              <div className="w-[100px] h-[21px] flex items-center">
                <span className="h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#D1FAE5] text-[#065F46]">
                  Confirmed
                </span>
              </div>
              <span className="w-[110px] text-[13px] leading-[16px] text-[#64748B]">Oct 15, 14:00</span>
            </div>
            <div 
              onClick={() => setViewBookingId('#BKG-1980')}
              className="w-full h-[45px] px-[12px] flex items-center gap-[16px] cursor-pointer hover:bg-[#F8FAFC]"
            >
              <span className="w-[90px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">#BKG-1980</span>
              <span className="w-[140px] text-[13px] leading-[16px] text-[#0F172A]">Executive Coaching</span>
              <div className="w-[100px] h-[21px] flex items-center">
                <span className="h-[21px] flex items-center px-[8px] py-[4px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                  Completed
                </span>
              </div>
              <span className="w-[110px] text-[13px] leading-[16px] text-[#64748B]">Sep 01, 10:30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
