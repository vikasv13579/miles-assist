'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setSearchQuery } from '@/lib/store/uiSlice';
import { Search, X } from 'lucide-react';
import Tabs from '@/components/Tabs';
import KPIRow from '@/components/KPIRow';
import RevenueChart from '@/components/RevenueChart';
import TransactionsTable from '@/components/TransactionsTable';
import SystemAlerts from '@/components/SystemAlerts';
import SystemHealth from '@/components/SystemHealth';
import MobileBottomNav from '@/components/MobileBottomNav';
import UsersPage from '@/components/UsersPage';
import TransactionsPage from '@/components/TransactionsPage';
import BookingsPage from '@/components/BookingsPage';
import UserDetailPage from '@/components/UserDetailPage';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import DashboardReports from '@/components/DashboardReports';
import DashboardSettings from '@/components/DashboardSettings';

export default function Home() {
  const dispatch = useDispatch();
  const activeNav = useSelector((state: RootState) => state.ui.activeNav);
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    setAdminEmail(localStorage.getItem('admin_email') ?? '');
  }, []);

  return (
    <main className="w-full max-w-[1200px] p-4 lg:p-[32px] pb-[96px] lg:pb-[32px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      {/* Global Search Active Banner */}
      {searchQuery.trim() && (
        <div className="w-full max-w-[1136px] bg-[#EEF2FF] border border-[#C7D2FE] rounded-[8px] px-4 py-3 flex items-center justify-between shadow-xs mx-auto">
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-[14px] font-medium text-[#312E81]">
              Filtering view for: <strong className="font-bold text-[#4F46E5]">&quot;{searchQuery}&quot;</strong>
            </span>
          </div>
          <button
            onClick={() => dispatch(setSearchQuery(''))}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] hover:text-[#312E81] bg-white px-2.5 py-1 rounded-[6px] border border-[#C7D2FE] shadow-2xs transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear search</span>
          </button>
        </div>
      )}

      {/* Render Active View */}
      {activeNav === 'users' ? (
        <UsersPage />
      ) : activeNav === 'transactions' ? (
        <TransactionsPage />
      ) : activeNav === 'bookings' ? (
        <BookingsPage />
      ) : activeNav === 'profile' ? (
        <UserDetailPage />
      ) : (
        <div className="w-full min-w-0 max-w-[1136px] flex flex-col gap-4 lg:gap-[24px] mx-auto">
          {/* Mobile Greetings Header (Mobile width 358px, height 39px) */}
          <div className="lg:hidden w-full max-w-[358px] flex flex-col justify-center gap-[2px]">
            <h1 className="max-w-full break-words text-[18px] font-bold leading-[100%] text-[#0F172A] font-sans">
              Welcome back{adminEmail ? `, ${adminEmail.split('@')[0]}` : ''}
            </h1>
            <span className="text-[12px] font-normal leading-[100%] text-[#64748B] font-sans">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Navigation Tabs */}
          <Tabs />

          {activeTab === 'Analytics' ? (
            <DashboardAnalytics />
          ) : activeTab === 'Reports' ? (
            <DashboardReports />
          ) : activeTab === 'Settings' ? (
            <DashboardSettings />
          ) : (
            <>
              {/* KPI Cards Row Frame */}
              <KPIRow />

              {/* Main Layout Grid Frame */}
              <div className="w-full min-w-0 flex flex-col gap-4 min-[1440px]:flex-row min-[1440px]:gap-[24px]">
                {/* LEFT COLUMN */}
                <div className="flex w-full min-w-0 flex-col gap-4 min-[1440px]:w-[752px] min-[1440px]:gap-[24px]">
                  <RevenueChart />
                  <TransactionsTable />
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex w-full min-w-0 flex-col gap-4 min-[1440px]:w-[360px] min-[1440px]:shrink-0 min-[1440px]:gap-[24px]">
                  <SystemAlerts />
                  <SystemHealth />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Width: 390px, Height: 64px) */}
      <MobileBottomNav />
    </main>
  );
}
