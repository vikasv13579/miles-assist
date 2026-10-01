'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setActiveTab } from '@/lib/store/uiSlice';

const tabs = ['Overview', 'Analytics', 'Reports', 'Settings'];

export default function Tabs() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);

  return (
    <div className="w-full lg:max-w-[1136px] h-[28px] lg:h-[41px] border-b-0 lg:border-b border-[#E2E8F0] flex items-center gap-[8px] pb-1 lg:pb-[0px] overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => dispatch(setActiveTab(tab))}
            className={`
              text-[13px] lg:text-[14px] font-medium leading-[20px] transition-all cursor-pointer shrink-0
              px-[16px] py-[4px] lg:py-[10px] rounded-[8px] lg:rounded-none relative
              ${
                isActive
                  ? 'bg-[#4F46E5] text-white lg:bg-transparent lg:text-[#4F46E5] font-semibold shadow-xs lg:shadow-none'
                  : 'bg-white lg:bg-transparent text-[#64748B] border border-[#E2E8F0] lg:border-none hover:text-[#0F172A]'
              }
            `}
          >
            {tab}
            {isActive && (
              <span className="hidden lg:block absolute bottom-0 left-0 w-full h-[2px] bg-[#4F46E5] rounded-t-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
}
