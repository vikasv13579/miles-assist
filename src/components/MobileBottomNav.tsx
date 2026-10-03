'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  User, 
  ArrowRightLeft, 
  CalendarCheck,
  UserCircle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveNav } from '@/lib/store/uiSlice';

const mobileNavItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutGrid },
  { id: 'users', label: 'Users', href: '/users', icon: User },
  { id: 'transactions', label: 'Transaction', href: '/transactions', icon: ArrowRightLeft },
  { id: 'bookings', label: 'Bookings', href: '/bookings', icon: CalendarCheck },
  { id: 'profile', label: 'Profile', href: '/user-profile', icon: UserCircle },
];

export default function MobileBottomNav() {
  const dispatch = useDispatch();
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 box-border min-h-[64px] px-[16px] pt-[8px] flex items-center justify-between border-t border-[#E2E8F0] bg-white shadow-xs"
      style={{
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
      }}
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => dispatch(setActiveNav(item.id))}
            className={`
              flex h-[36px] min-w-0 flex-1 flex-col items-center justify-center gap-[4px] cursor-pointer transition-colors
              ${isActive ? 'text-[#4F46E5] font-semibold' : 'text-[#94A3B8] font-medium'}
            `}
          >
            <Icon 
              className={`h-5 w-5 shrink-0 transition-colors ${
                isActive ? 'text-[#4F46E5] fill-[#4F46E5]/10' : 'text-[#94A3B8]'
              }`} 
            />
            <span className="max-w-full truncate text-[10px] leading-[12px] font-sans tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
