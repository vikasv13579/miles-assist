'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { 
  Search, 
  Plus, 
  Filter, 
  Pencil, 
  Trash2, 
  Check, 
  CheckCircle2,
  Download,
  AlertTriangle
} from 'lucide-react';
import { fetchUsers, ApiUser } from '@/lib/api';
import AddUserModal from '@/components/AddUserModal';
import { SkeletonRows } from '@/components/Skeleton';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Inactive' | 'Suspended';
  joinDate: string;
  lastActive: string;
}

const PAGE_SIZE = 8;

const defaultUsers: UserRecord[] = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    email: 'jane.c@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'Active',
    joinDate: 'Jan 12, 2024',
    lastActive: '2 mins ago',
  },
  {
    id: 2,
    name: 'Wade Warren',
    email: 'wade.w@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    role: 'Editor',
    status: 'Active',
    joinDate: 'Feb 22, 2024',
    lastActive: '1 hour ago',
  },
  {
    id: 3,
    name: 'Cameron Williamson',
    email: 'cameron.w@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    role: 'Viewer',
    status: 'Inactive',
    joinDate: 'Mar 10, 2024',
    lastActive: '3 days ago',
  },
  {
    id: 4,
    name: 'Arlene McCoy',
    email: 'arlene.m@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'Editor',
    status: 'Active',
    joinDate: 'Apr 05, 2024',
    lastActive: 'Just now',
  },
  {
    id: 5,
    name: 'Eleanor Pena',
    email: 'eleanor.p@example.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    role: 'Viewer',
    status: 'Suspended',
    joinDate: 'May 19, 2024',
    lastActive: '1 week ago',
  },
  {
    id: 6,
    name: 'Kristin Watson',
    email: 'kristin.w@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'Active',
    joinDate: 'Jun 01, 2024',
    lastActive: '5 mins ago',
  },
  {
    id: 7,
    name: 'Robert Fox',
    email: 'robert.f@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'Viewer',
    status: 'Active',
    joinDate: 'Jun 14, 2024',
    lastActive: '10 mins ago',
  },
  {
    id: 8,
    name: 'Leslie Alexander',
    email: 'leslie.a@example.com',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    role: 'Editor',
    status: 'Inactive',
    joinDate: 'Jul 29, 2024',
    lastActive: '4 days ago',
  },
];

export default function UsersPage() {
  const globalSearchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [localSearch, setLocalSearch] = useState('');
  const [pagination, setPagination] = useState({ filterKey: '', page: 1 });
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedUsers, setAddedUsers] = useState<UserRecord[]>([]);
  const [userOverrides, setUserOverrides] = useState<Record<number, Partial<Pick<UserRecord, 'role' | 'status'>>>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { data: apiUsers, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const baseUsersList: UserRecord[] = apiUsers && apiUsers.length > 0
    ? apiUsers.map((u: ApiUser, idx: number) => {
        const roles: ('Admin' | 'Editor' | 'Viewer')[] = ['Admin', 'Editor', 'Viewer', 'Editor', 'Viewer', 'Admin', 'Viewer', 'Editor'];
        const statuses: ('Active' | 'Inactive' | 'Suspended')[] = ['Active', 'Active', 'Inactive', 'Active', 'Suspended', 'Active', 'Active', 'Inactive'];
        const dates = ['Jan 12, 2024', 'Feb 22, 2024', 'Mar 10, 2024', 'Apr 05, 2024', 'May 19, 2024', 'Jun 01, 2024', 'Jun 14, 2024', 'Jul 29, 2024'];
        const actives = ['2 mins ago', '1 hour ago', '3 days ago', 'Just now', '1 week ago', '5 mins ago', '10 mins ago', '4 days ago'];
        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email.toLowerCase(),
          avatar: u.image,
          role: roles[idx % roles.length],
          status: statuses[idx % statuses.length],
          joinDate: dates[idx % dates.length],
          lastActive: actives[idx % actives.length],
        };
      })
    : defaultUsers;

  const usersList = [...addedUsers, ...baseUsersList].map((user) => ({
    ...user,
    ...userOverrides[user.id],
  }));
  const searchQuery = localSearch || globalSearchQuery;
  const filterKey = `${searchQuery}|${roleFilter}|${statusFilter}`;
  const currentPage = pagination.filterKey === filterKey ? pagination.page : 1;
  const setCurrentPage = (page: number) => setPagination({ filterKey, page });

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch = !searchQuery.trim() || (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);

  const handleAddUser = (newUser: { name: string; email: string; role: 'Admin' | 'Editor' | 'Viewer'; status: 'Active' | 'Inactive' | 'Suspended' }) => {
    const createdRecord: UserRecord = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: newUser.role,
      status: newUser.status,
      joinDate: 'Oct 01, 2024',
      lastActive: 'Just now',
    };
    setAddedUsers((prev) => [createdRecord, ...prev]);
    setSuccessToast(`User "${newUser.name}" created successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const toggleSelectUser = (id: number) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleBulkRoleChange = (role: UserRecord['role']) => {
    setUserOverrides((current) => {
      const next = { ...current };
      selectedIds.forEach((id) => {
        next[id] = { ...next[id], role };
      });
      return next;
    });
  };

  const selectedUsers = usersList.filter((user) => selectedIds.includes(user.id));
  const shouldReactivate = selectedUsers.length > 0 && selectedUsers.every((user) => user.status === 'Suspended');

  const handleBulkStatusChange = () => {
    const status: UserRecord['status'] = shouldReactivate ? 'Active' : 'Suspended';
    setUserOverrides((current) => {
      const next = { ...current };
      selectedIds.forEach((id) => {
        next[id] = { ...next[id], status };
      });
      return next;
    });
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date', 'Last Active'];
    const rows = filteredUsers.map(u => [u.id, u.name, u.email, u.role, u.status, u.joinDate, u.lastActive]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Users_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="w-full max-w-[1136px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      {/* Success Notification Toast */}
      {successToast && (
        <div className="w-full bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] rounded-[8px] p-3 flex items-center justify-between text-[13px] font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-[#065F46] hover:text-[#047857]">
            Dismiss
          </button>
        </div>
      )}

      {/* API Error State with Retry Button Controls */}
      {isError && (
        <div className="w-full bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#991B1B] text-[13px] shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
            <span className="font-medium">
              API Error: Unable to sync live user directory with remote server. Showing fallback data.
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3.5 py-1.5 bg-[#EF4444] text-white rounded-[6px] font-semibold text-[12px] hover:bg-[#DC2626] transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            Retry Loading Data
          </button>
        </div>
      )}

      {/* 1. BREADCRUMB / HEADER FRAME (Width: 1136px, Height: 50px) */}
      <div className="w-full lg:w-[1136px] min-h-[41px] lg:h-[50px] flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[2px] lg:gap-[4px]">
          <h1 className="text-[18px] lg:text-[24px] font-bold text-[#0F172A] leading-tight">
            <span className="lg:hidden">User Management</span>
            <span className="hidden lg:inline">Users Directory</span>
          </h1>
          <p className="text-[12px] lg:text-[14px] text-[#64748B] leading-none">
            <span className="lg:hidden">Manage registered application users</span>
            <span className="hidden lg:inline">Manage all registered users in your application</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-[8px] text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span>Export CSV</span>
          </button>
          {/* Desktop Add User Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-[8px] text-[14px] font-semibold hover:bg-[#4338CA] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* 2. KPI ROW SUMMARY (Width: 1136px, Height: 80px, Gap: 16px) */}
      <div className="w-full lg:w-[1136px] h-[53px] lg:h-[80px] grid grid-cols-3 gap-[8px] lg:gap-[16px]">
        {/* Card 1: Total Users */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] lg:rounded-[8px] p-[10px] lg:p-[16px] flex flex-col justify-center gap-[4px] lg:gap-[8px] shadow-xs">
          <span className="text-[10px] lg:text-[13px] font-medium text-[#64748B]">
            Total Users
          </span>
          <span className="text-[14px] lg:text-[20px] font-bold text-[#0F172A] leading-[17px] lg:leading-[24px]">
            {usersList.length.toLocaleString()}
          </span>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] lg:rounded-[8px] p-[10px] lg:p-[16px] flex flex-col justify-center gap-[4px] lg:gap-[8px] shadow-xs">
          <span className="text-[10px] lg:text-[13px] font-medium text-[#64748B]">
            Active <span className="hidden lg:inline">Users</span>
          </span>
          <span className="text-[14px] lg:text-[20px] font-bold text-[#0F172A] leading-[17px] lg:leading-[24px]">
            {usersList.filter((user) => user.status === 'Active').length.toLocaleString()}
          </span>
        </div>

        {/* Card 3: New This Month */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] lg:rounded-[8px] p-[10px] lg:p-[16px] flex flex-col justify-center gap-[4px] lg:gap-[8px] shadow-xs">
          <span className="text-[10px] lg:text-[13px] font-medium text-[#64748B]">
            <span className="lg:hidden">New This Mo</span>
            <span className="hidden lg:inline">Added This Session</span>
          </span>
          <span className="text-[14px] lg:text-[20px] font-bold text-[#0F172A] leading-[17px] lg:leading-[24px]">
            {addedUsers.length.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Mobile Add New User Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="lg:hidden w-full h-[40px] bg-[#4F46E5] text-white rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-[8px] cursor-pointer shadow-xs"
      >
        <Plus className="w-[14px] h-[14px]" />
        <span>Add New User</span>
      </button>

      {/* 3. SEARCH & FILTER FRAME */}
      <div className="w-full lg:w-[1136px] lg:h-[64px] bg-transparent lg:bg-white lg:border lg:border-[#E2E8F0] lg:rounded-[8px] p-0 lg:p-[16px] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-none lg:shadow-xs">
        <div className="w-full sm:w-[529px] flex items-center gap-[8px] lg:gap-[12px] flex-wrap">
          <div className="relative flex-1 lg:w-[280px] h-[32px] bg-white border border-[#E2E8F0] rounded-[8px] flex items-center">
            <Search className="w-[14px] h-[14px] absolute left-[12px] text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search users..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-[32px] pl-[36px] pr-3 bg-transparent text-[13px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none"
            />
          </div>

          <button className="lg:hidden w-[36px] h-[36px] flex items-center justify-center bg-white border border-[#E2E8F0] rounded-[8px] text-[#475569] shrink-0">
            <Filter className="w-[16px] h-[16px]" />
          </button>

          <div className="hidden lg:flex items-center gap-[12px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-[94px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#475569] focus:outline-none cursor-pointer"
            >
              <option value="All">Role: All</option>
              <option value="Admin">Role: Admin</option>
              <option value="Editor">Role: Editor</option>
              <option value="Viewer">Role: Viewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[131px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#475569] focus:outline-none cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
              <option value="Suspended">Status: Suspended</option>
            </select>
          </div>
        </div>

        <div className="hidden lg:flex w-full sm:w-[176px] items-center justify-between sm:justify-end gap-[8px]">
          <div className="hidden sm:flex items-center gap-2 text-[13px]">
            <span className="text-[#64748B]">Sort by:</span>
            <select className="w-[119px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#0F172A] focus:outline-none cursor-pointer">
              <option>Date Joined</option>
              <option>Name A-Z</option>
              <option>Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. USERS SELECTED ACTION BANNER */}
      {selectedIds.length > 0 && (
        <div className="w-full lg:w-[1136px] h-[51px] bg-[#EEF2FF] border border-[#4F46E5] rounded-[8px] p-[12px] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-[8px] text-[13px] font-semibold text-[#4F46E5]">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{selectedIds.length} users selected</span>
          </div>

          <div className="flex items-center gap-[12px]">
            <select
              value=""
              aria-label="Change role for selected users"
              onChange={(event) => handleBulkRoleChange(event.target.value as UserRecord['role'])}
              className="w-[98px] h-[27px] px-[12px] bg-white border border-[#E2E8F0] rounded-[6px] text-[12px] font-semibold text-[#0F172A] cursor-pointer"
            >
              <option value="" disabled>Change Role</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button
              onClick={handleBulkStatusChange}
              className="w-[134px] h-[27px] px-[12px] bg-white border border-[#E2E8F0] rounded-[6px] text-[12px] font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              {shouldReactivate ? 'Reactivate Accounts' : 'Suspend Accounts'}
            </button>
          </div>
        </div>
      )}

      {/* 5. MOBILE USERS CARDS LIST */}
      <div className="lg:hidden flex flex-col gap-[10px]">
        {isLoading ? (
          <SkeletonRows count={2} className="py-3" />
        ) : pageUsers.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[#64748B]">No matching users found.</div>
        ) : pageUsers.map((user) => (
          <div 
            key={user.id}
            className="w-full h-[103px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col gap-[12px]"
          >
            <div className="flex items-center justify-between h-[36px]">
              <div className="flex items-center gap-[10px]">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-[36px] h-[36px] rounded-[18px] object-cover"
                />
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">
                    {user.name}
                  </span>
                  <span className="text-[11px] leading-[13px] text-[#64748B]">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-[8px]">
                <button className="w-[24px] h-[24px] flex items-center justify-center border border-[#E2E8F0] rounded-[12px] text-[#475569]">
                  <Pencil className="w-[12px] h-[12px]" />
                </button>
                <button className="w-[24px] h-[24px] flex items-center justify-center border border-[#E2E8F0] rounded-[12px] text-[#991B1B]">
                  <Trash2 className="w-[12px] h-[12px]" />
                </button>
              </div>
            </div>

            <div className="w-full h-[0px] border-t border-[#E2E8F0]"></div>

            <div className="flex items-center justify-between h-[19px]">
              <div className="flex items-center gap-[6px]">
                <span className="px-[8px] py-[3px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                  {user.role}
                </span>
                <span
                  className={`px-[8px] py-[3px] rounded-[12px] text-[11px] leading-[13px] font-semibold ${
                    user.status === 'Active'
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : user.status === 'Inactive'
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#FEE2E2] text-[#991B1B]'
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <span className="text-[#64748B] text-[10px] leading-[12px]">
                Active {user.lastActive}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:hidden flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-[12px]">
        <span className="text-[#64748B]">
          Showing {filteredUsers.length ? `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredUsers.length)}` : '0'} of {filteredUsers.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-[6px] border border-[#E2E8F0] px-3 py-1 text-[#64748B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage >= pageCount}
            className="rounded-[6px] border border-[#E2E8F0] px-3 py-1 text-[#64748B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* 6. DESKTOP USERS TABLE FRAME */}
      <div className="hidden lg:flex flex-col w-full lg:w-[1136px] h-[583px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] gap-[16px] box-border shadow-xs overflow-hidden shrink-0">
        
        {/* Table Content Frame */}
        <div className="flex flex-col items-start p-0 w-[1096px] h-[488px]">
          {/* Header Row */}
          <div className="flex flex-row items-center p-[12px] gap-[16px] w-[1096px] h-[40px] bg-[#F8FAFC] rounded-[6px] shrink-0">
            <div className="w-[32px] flex justify-center shrink-0">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={toggleSelectAll}
                className="w-[16px] h-[16px] rounded-[4px] border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer m-0"
              />
            </div>
            <div className="w-[220px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">USER</div>
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">ROLE</div>
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">STATUS</div>
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">JOIN DATE</div>
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">LAST ACTIVE</div>
            <div className="w-[80px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter'] text-right">ACTIONS</div>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#64748B] gap-3 w-full h-full">
              <span className="text-[12px] font-semibold text-[#0F172A]">Fetching user directory records...</span>
              <SkeletonRows className="mt-2 w-full max-w-[500px]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#64748B] gap-2 w-full h-full">
              <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-[15px] font-bold text-[#0F172A]">No matching users found</h4>
              <p className="text-[13px] text-[#64748B]">
                No user records match search query <strong className="text-[#4F46E5]">&quot;{searchQuery}&quot;</strong> or active role/status filters.
              </p>
              <button 
                onClick={() => { setLocalSearch(''); setRoleFilter('All'); setStatusFilter('All'); }}
                className="mt-2 px-3.5 py-1.5 bg-[#4F46E5] text-white rounded-[6px] text-[12px] font-semibold hover:bg-[#4338CA] transition-colors cursor-pointer shadow-2xs"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col w-[1096px] flex-1 overflow-y-auto">
              {pageUsers.map((user) => {
                const isChecked = selectedIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    className={`box-border flex flex-row items-center p-[12px] gap-[16px] w-[1096px] h-[56px] border-b border-[#E2E8F0] shrink-0 transition-colors ${
                      isChecked ? 'bg-[#EEF2FF]/60 border-l-2 border-l-[#4F46E5]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="w-[32px] flex justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-[16px] h-[16px] rounded-[4px] border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer m-0"
                      />
                    </div>
                    <div className="w-[220px] h-[32px] flex flex-row items-center gap-[12px] shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-[32px] h-[32px] rounded-[16px] object-cover shrink-0 border border-[#E2E8F0]"
                      />
                      <div className="w-[176px] flex flex-col gap-[2px]">
                        <span className="font-semibold text-[13px] leading-[16px] text-[#0F172A] font-['Inter'] truncate">
                          {user.name}
                        </span>
                        <span className="font-normal text-[11px] leading-[13px] text-[#64748B] font-['Inter'] truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="w-[110px] flex items-center shrink-0">
                      <div className={`flex flex-row items-start px-[8px] py-[2px] rounded-[4px] ${
                        user.role === 'Admin' ? 'bg-[#EEF2FF]' :
                        user.role === 'Editor' ? 'bg-[#DBEAFE]' : 'bg-[#F8FAFC]'
                      }`}>
                        <span className={`font-semibold text-[11px] leading-[13px] font-['Inter'] ${
                          user.role === 'Admin' ? 'text-[#4F46E5]' :
                          user.role === 'Editor' ? 'text-[#1E40AF]' : 'text-[#475569]'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="w-[110px] flex items-center shrink-0">
                      <div className={`flex flex-row items-start px-[8px] py-[4px] rounded-[12px] ${
                        user.status === 'Active' ? 'bg-[#D1FAE5]' :
                        user.status === 'Inactive' ? 'bg-[#FEF3C7]' : 'bg-[#FEE2E2]'
                      }`}>
                        <span className={`font-semibold text-[11px] leading-[13px] font-['Inter'] ${
                          user.status === 'Active' ? 'text-[#065F46]' :
                          user.status === 'Inactive' ? 'text-[#92400E]' : 'text-[#991B1B]'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-[110px] shrink-0 flex items-center">
                      <span className="font-normal text-[13px] leading-[16px] text-[#475569] font-['Inter']">
                        {user.joinDate}
                      </span>
                    </div>
                    <div className="w-[110px] shrink-0 flex items-center">
                      <span className="font-normal text-[13px] leading-[16px] text-[#475569] font-['Inter']">
                        {user.lastActive}
                      </span>
                    </div>
                    <div className="w-[80px] shrink-0 flex flex-row justify-end items-center gap-[12px]">
                      <button className="flex items-center justify-center w-[16px] h-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80">
                        <Pencil className="w-[16px] h-[16px] text-[#475569]" />
                      </button>
                      <button className="flex items-center justify-center w-[16px] h-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80">
                        <Trash2 className="w-[16px] h-[16px] text-[#EF4444]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-row justify-between items-center p-0 w-[1096px] h-[27px] mt-auto shrink-0">
          <span className="font-normal text-[13px] leading-[16px] text-[#64748B] font-['Inter']">
            Showing {filteredUsers.length ? `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredUsers.length)}` : '0'} of {filteredUsers.length} results
          </span>
          <div className="flex flex-row items-start gap-[8px] h-[27px]">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="box-border flex flex-row items-center px-[12px] py-[6px] bg-white border border-[#E2E8F0] rounded-[6px] h-[27px] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">Previous</span>
            </button>
            <button 
              onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage >= pageCount}
              className="box-border flex flex-row items-center px-[12px] py-[6px] bg-white border border-[#E2E8F0] rounded-[6px] h-[27px] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="font-semibold text-[12px] leading-[15px] text-[#475569] font-['Inter']">Next</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add User Interactive Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </div>
  );
}
