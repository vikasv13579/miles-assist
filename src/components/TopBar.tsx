'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, ArrowRight, User, CreditCard, Layers, Cpu } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { toggleSidebar, setSearchQuery, setActiveNav } from '@/lib/store/uiSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const searchCategories = [
  { id: 'dashboard', title: 'Dashboard Overview', type: 'page', icon: Layers },
  { id: 'users', title: 'Users & Customers', type: 'page', icon: User },
  { id: 'transactions', title: 'Transactions Log', type: 'page', icon: CreditCard },
  { id: 'txn-1082', title: 'Transaction #TXN-1082 - Albert Flores ($150.00)', type: 'transaction', icon: CreditCard },
  { id: 'txn-1081', title: 'Transaction #TXN-1081 - Jenny Wilson ($2,350.00)', type: 'transaction', icon: CreditCard },
  { id: 'sarah', title: 'Sarah Jenkins (Super Admin Profile)', type: 'user', icon: User },
];

export default function TopBar() {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const filteredResults = searchCategories.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleSelectResult = (item: typeof searchCategories[0]) => {
    if (item.type === 'page') {
      dispatch(setActiveNav(item.id));
    } else if (item.id.startsWith('txn-')) {
      dispatch(setActiveNav('transactions'));
    } else if (item.id === 'sarah') {
      dispatch(setActiveNav('profile'));
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
        <div className="hidden lg:flex w-[190px] h-[41px] flex-col justify-between gap-[4px]">
          <h1 className="w-[190px] h-[22px] font-bold text-[18px] leading-[100%] text-[#0F172A] font-sans flex items-center">
            Welcome back, Sarah
          </h1>
          <span className="w-[145px] h-[15px] font-normal text-[12px] leading-[100%] text-[#64748B] font-sans flex items-center">
            Tuesday, October 1, 2024
          </span>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-[12px] lg:gap-[20px]">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-[calc(100vw-278px)] min-w-[70px] max-w-[150px] sm:w-[240px] h-[36px] lg:h-[40px]" ref={searchRef}>
          <Search className="w-[14px] lg:w-[16px] h-[14px] lg:h-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            type="text"
            placeholder="Search console..."
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              dispatch(setSearchQuery(e.target.value));
              setIsOpen(true);
            }}
            className="w-full h-[36px] lg:h-[40px] pl-8 lg:pl-9 pr-6 lg:pr-8 bg-[#F8FAFC] border-[#E2E8F0] rounded-[8px] text-[12px] lg:text-[13px]"
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
            <Bell className="w-4 h-4 text-[#64748B]" />
            <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
              3
            </span>
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <Card className="absolute right-0 top-full mt-2 w-[300px] sm:w-[340px] shadow-xl z-50 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <span className="text-[13px] font-bold text-[#0F172A]">Notifications</span>
                <Badge variant="secondary" className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#EEF2FF]">3 New</Badge>
              </div>
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto">
                <div className="p-2 bg-[#F8FAFC] rounded-[6px] flex flex-col gap-0.5 border-l-2 border-[#EF4444]">
                  <span className="text-[12px] font-bold text-[#0F172A]">API Gateway Timeout</span>
                  <span className="text-[11px] text-[#64748B]">Stripe payment webhook delayed by 1.2s</span>
                  <span className="text-[10px] text-[#94A3B8]">5 mins ago</span>
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-[6px] flex flex-col gap-0.5 border-l-2 border-[#F59E0B]">
                  <span className="text-[12px] font-bold text-[#0F172A]">Database CPU Usage Spike</span>
                  <span className="text-[11px] text-[#64748B]">PostgreSQL cluster hit 88% load limit</span>
                  <span className="text-[10px] text-[#94A3B8]">18 mins ago</span>
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-[6px] flex flex-col gap-0.5 border-l-2 border-[#10B981]">
                  <span className="text-[12px] font-bold text-[#0F172A]">New Booking Confirmed</span>
                  <span className="text-[11px] text-[#64748B]">Sarah Johnson booked Business Consultation</span>
                  <span className="text-[10px] text-[#94A3B8]">1 hour ago</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* User Profile Avatar: Mobile 32x32 rounded 16px */}
        <div 
          onClick={() => dispatch(setActiveNav('profile'))}
          className="w-[32px] lg:w-[36px] h-[32px] lg:h-[36px] rounded-[16px] lg:rounded-[18px] overflow-hidden border border-[#E2E8F0] shadow-sm cursor-pointer hover:ring-2 hover:ring-[#4F46E5] transition-all shrink-0"
          title="View Super Admin Profile"
        >
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" 
            alt="Sarah Jenkins" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
