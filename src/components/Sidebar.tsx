'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  Calendar, 
  Cpu,
  LogOut
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setActiveNav, setSidebarOpen } from '@/lib/store/uiSlice';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { id: 'users', label: 'Users', href: '/users', icon: Users },
  { id: 'transactions', label: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { id: 'bookings', label: 'Bookings', href: '/bookings', icon: Calendar },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    setAdminEmail(localStorage.getItem('admin_email') ?? '');
  }, []);

  useEffect(() => {
    if (!sidebarOpen || !window.matchMedia('(max-width: 1023px)').matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  function handleLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    window.location.replace('/login');
  }

  return (
    <>
      {/* Mobile Drawer Dark Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => dispatch(setSidebarOpen(false))}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-50 bg-[#1E293B] text-white
          w-[min(240px,88vw)] h-dvh min-h-dvh px-[16px] py-[24px]
          flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto overscroll-contain shadow-xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* BRAND GROUP */}
        <div className="w-full flex shrink-0 flex-col gap-[24px]">
          {/* Brand Header */}
          <Link 
            href="/"
            className="flex h-[32px] w-full items-center gap-[10px] cursor-pointer"
          >
            <div className="w-[32px] h-[32px] bg-[#4F46E5] rounded-[8px] flex items-center justify-center shrink-0">
              <Cpu className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="w-[94px] h-[22px] font-bold text-[18px] leading-[100%] text-white tracking-tight flex items-center font-sans">
              AdminHub
            </span>
          </Link>

          {/* Navigation List */}
          <nav className="flex w-full flex-col gap-[4px]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    dispatch(setActiveNav(item.id));
                    dispatch(setSidebarOpen(false));
                  }}
                  className={`
                    w-full h-[38px] flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px]
                    text-[14px] leading-[17px] transition-all cursor-pointer
                    ${
                      isActive
                        ? 'bg-[#334155] text-white font-semibold'
                        : 'text-[#94A3B8] hover:bg-[#2A3749] hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR PROFILE */}
        <div className="w-full shrink-0">
          <div className="flex min-h-[52px] w-full items-center gap-[12px] border-t border-[#334155] pt-[16px]">
            <div className="w-[36px] h-[36px] rounded-[18px] bg-[#334155] text-white font-semibold text-[13px] flex items-center justify-center shrink-0 overflow-hidden">
              <span>{(adminEmail.split('@')[0].slice(0, 2) || 'AD').toUpperCase()}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span className="h-[17px] w-full text-[14px] font-bold leading-[100%] text-white truncate flex items-center font-sans">
                {adminEmail || 'Administrator'}
              </span>
              <span className="h-[15px] w-full text-[12px] font-medium leading-[100%] text-[#94A3B8] truncate flex items-center font-sans">
                Administrator
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[#2A3749] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
