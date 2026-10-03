'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, ArrowRight, User, CreditCard, Layers, Cpu, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store/store';
import { toggleSidebar, setSearchQuery, setActiveNav } from '@/lib/store/uiSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchBookings, fetchSystemAlerts, fetchTransactions, fetchUsers } from '@/lib/api';

const searchCategories = [
  { id: 'dashboard', title: 'Dashboard Overview', type: 'page', icon: Layers },
  { id: 'users', title: 'Users & Customers', type: 'page', icon: User },
  { id: 'transactions', title: 'Transactions Log', type: 'page', icon: CreditCard },
];

export default function TopBar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const transactionsQuery = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });
  const bookingsQuery = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const alertsQuery = useQuery({ queryKey: ['dashboard-alerts'], queryFn: fetchSystemAlerts });
  const allResults = [
    ...searchCategories,
    ...(usersQuery.data ?? []).map((user) => ({ id: user.id, title: `${user.name} (${user.email})`, type: 'user', icon: User })),
    ...(transactionsQuery.data ?? []).map((transaction) => ({ id: transaction.id, title: `Transaction ${transaction.reference}`, type: 'transaction', icon: CreditCard })),
    ...(bookingsQuery.data ?? []).map((booking) => ({ id: booking.id, title: `Booking ${booking.reference}`, type: 'booking', icon: Calendar })),
  ];
  const filteredResults = allResults.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setAdminEmail(localStorage.getItem('admin_email') ?? '');
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: (typeof allResults)[number]) => {
    if (item.type === 'page') {
      dispatch(setActiveNav(item.id));
    } else if (item.type === 'transaction') {
      router.push(`/transaction-detail?id=${encodeURIComponent(item.id)}`);
    } else if (item.type === 'booking') {
      router.push(`/booking-detail?id=${encodeURIComponent(item.id)}`);
    } else {
      router.push(`/user-profile?id=${encodeURIComponent(item.id)}`);
    }
    setIsOpen(false);
  };

  return (
    <header className="w-full max-w-[1200px] h-[56px] lg:h-[70px] bg-white border-b border-[#E2E8F0] px-[16px] lg:px-[32px] flex items-center justify-between shrink-0 sticky top-0 z-30 mx-auto">
      {/* Mobile & Desktop Header Left */}
      <div className="flex items-center gap-[12px]">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden w-[20px] h-[20px] text-[#0F172A] flex items-center justify-center cursor-pointer"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-[20px] h-[20px]" />
        </button>
        
        {/* Mobile Brand Header */}
        <div className="lg:hidden flex items-center gap-[6px] w-[113px] h-[24px]">
          <Cpu className="w-[18px] h-[18px] text-[#4F46E5]" />
          <span className="font-bold text-[16px] leading-[100%] text-[#0F172A] tracking-tight font-sans">
            AdminHub
          </span>
        </div>

        {/* Desktop Greetings Header */}
        <div className="hidden lg:flex w-[260px] h-auto min-w-0 shrink-0 flex-col justify-between gap-[4px]">
          <h1 className="w-full min-h-[22px] break-words font-bold text-[18px] leading-[22px] text-[#0F172A] font-sans">
            Welcome back{adminEmail ? `, ${adminEmail.split('@')[0]}` : ''}
          </h1>
          <span className="whitespace-nowrap font-normal text-[12px] leading-[15px] text-[#64748B] font-sans flex items-center">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-[12px] lg:gap-[20px]">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-[150px] lg:w-[240px] h-[32px] shrink-0" ref={searchRef}>
          <Search className="w-[16px] h-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            type="text"
            placeholder="Search console..."
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              dispatch(setSearchQuery(e.target.value));
              setIsOpen(true);
            }}
            className="w-full h-[32px] pl-9 pr-8 bg-[#F8FAFC] border-[#E2E8F0] rounded-[8px] text-[13px]"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                dispatch(setSearchQuery(''));
                setIsOpen(false);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] w-6 h-6 p-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Live Search Results Dropdown */}
          {isOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E2E8F0] rounded-[8px] shadow-lg overflow-hidden z-50 py-2">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Console Results ({filteredResults.length})
              </div>
              {filteredResults.length === 0 ? (
                <div className="px-3 py-4 text-[13px] text-[#64748B] text-center">
                  No matching results for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="flex flex-col">
                  {filteredResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer text-[13px]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 text-[#6366F1] shrink-0" />
                          <span className="text-[#0F172A] font-medium truncate">
                            {item.title}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Popover Container */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-[32px] lg:w-[40px] h-[32px] lg:h-[40px] rounded-[16px] lg:rounded-[20px] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-[#475569]" />
            <span className="absolute -top-1 -right-1 lg:top-[2px] lg:right-[2px] min-w-[14px] lg:w-[18px] h-[14px] lg:h-[18px] bg-[#EF4444] text-white text-[9px] lg:text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 lg:px-0">
              {alertsQuery.data?.length ?? 0}
            </span>
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <Card className="absolute right-0 top-full mt-2 w-[300px] sm:w-[340px] shadow-xl z-50 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <span className="text-[13px] font-bold text-[#0F172A]">Notifications</span>
                <Badge variant="secondary" className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#EEF2FF]">{alertsQuery.data?.length ?? 0} New</Badge>
              </div>
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto">
                {alertsQuery.isLoading ? (
                  <span className="text-[12px] text-[#64748B]">Loading alerts…</span>
                ) : alertsQuery.isError ? (
                  <button onClick={() => void alertsQuery.refetch()} className="text-left text-[12px] text-[#991B1B]">Could not load alerts. Try again.</button>
                ) : (alertsQuery.data ?? []).length === 0 ? (
                  <span className="text-[12px] text-[#64748B]">No active alerts.</span>
                ) : (
                  alertsQuery.data?.map((alert, index) => (
                    <div key={`${alert.type}-${index}`} className="p-2 bg-[#F8FAFC] rounded-[6px] flex flex-col gap-0.5 border-l-2 border-[#F59E0B]">
                      <span className="text-[12px] font-bold text-[#0F172A]">{alert.type}</span>
                      <span className="text-[11px] text-[#64748B]">{alert.message}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>

        {/* User Profile Avatar: Mobile 32x32 rounded 16px */}
        <div className="w-[32px] lg:w-[36px] h-[32px] lg:h-[36px] rounded-full bg-[#E0E7FF] text-[#4338CA] border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[11px] font-bold shrink-0" title={adminEmail || 'Admin'}>
          {(adminEmail.split('@')[0].slice(0, 2) || 'AD').toUpperCase()}
        </div>
      </div>
    </header>
  );
}
