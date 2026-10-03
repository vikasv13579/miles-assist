'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  CheckCircle2,
  Download,
  AlertTriangle,
  LoaderCircle
} from 'lucide-react';
import { createUser, deleteUser, fetchUsers, updateUser } from '@/lib/api';
import AddUserModal from '@/components/AddUserModal';
import { SkeletonRows } from '@/components/Skeleton';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string | null;
  status: 'Active' | 'Inactive';
  joinDate: string;
  updatedAt: string;
  createdAt: string;
}

const PAGE_SIZE = 8;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const globalSearchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [localSearch, setLocalSearch] = useState('');
  const [pagination, setPagination] = useState({ filterKey: '', page: 1 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const { data: apiUsers, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const usersList: UserRecord[] = (apiUsers ?? []).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.image,
    phone: user.phone,
    status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
    joinDate: new Date(user.createdAt).toLocaleDateString(),
    updatedAt: new Date(user.updatedAt).toLocaleDateString(),
    createdAt: user.createdAt,
  }));
  const joinedThisMonth = usersList.filter((user) => {
    const joined = new Date(user.createdAt);
    const now = new Date();
    return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
  }).length;
  const searchQuery = localSearch || globalSearchQuery;
  const filterKey = `${searchQuery}|${statusFilter}`;
  const currentPage = pagination.filterKey === filterKey ? pagination.page : 1;
  const setCurrentPage = (page: number) => setPagination({ filterKey, page });

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch = !searchQuery.trim() || (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);

  const handleSaveUser = async (newUser: { name: string; email: string; phone?: string; status: 'ACTIVE' | 'INACTIVE' }) => {
    if (editingUser) {
      await updateUser(editingUser.id, newUser);
    } else {
      await createUser(newUser);
    }
    await queryClient.invalidateQueries({ queryKey: ['users'] });
    setSuccessToast(`User "${newUser.name}" ${editingUser ? 'updated' : 'created'} successfully.`);
    setEditingUser(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const toggleSelectUser = (id: string) => {
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

  const selectedUsers = usersList.filter((user) => selectedIds.includes(user.id));
  const shouldReactivate = selectedUsers.length > 0 && selectedUsers.every((user) => user.status === 'Inactive');

  const handleBulkStatusChange = async () => {
    try {
      const status = shouldReactivate ? 'ACTIVE' : 'INACTIVE';
      await Promise.all(selectedIds.map((id) => updateUser(id, { status })));
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedIds([]);
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update selected users.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    setDeletingUserId(id);
    setActionError(null);
    try {
      await deleteUser(id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions-page'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['user-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] }),
      ]);
      setSelectedIds((ids) => ids.filter((selectedId) => selectedId !== id));
      setSuccessToast('User and linked bookings and transactions deleted.');
      setActionError(null);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Status', 'Joined Date'];
    const rows = filteredUsers.map(u => [u.id, u.name, u.email, u.phone ?? '', u.status, u.joinDate]);
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
      {actionError && (
        <div role="alert" className="w-full rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-[13px] text-[#991B1B]">
          {actionError}
        </div>
      )}

      {/* API Error State with Retry Button Controls */}
      {isError && (
        <div className="w-full bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#991B1B] text-[13px] shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
            <span className="font-medium">
              API Error: Unable to load the user directory from the backend.
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
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
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
            <span className="lg:hidden">Joined This Mo</span>
            <span className="hidden lg:inline">Joined This Month</span>
          </span>
          <span className="text-[14px] lg:text-[20px] font-bold text-[#0F172A] leading-[17px] lg:leading-[24px]">
            {joinedThisMonth.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Mobile Add New User Button */}
      <button 
        onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
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

          <select
            aria-label="Filter users by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="lg:hidden h-[36px] bg-white border border-[#E2E8F0] rounded-[8px] px-2 text-[12px] text-[#475569] shrink-0"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="hidden lg:flex items-center gap-[12px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[131px] h-[32px] px-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#475569] focus:outline-none cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
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
            <button
              onClick={() => void handleBulkStatusChange()}
              className="w-[134px] h-[27px] px-[12px] bg-white border border-[#E2E8F0] rounded-[6px] text-[12px] font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              {shouldReactivate ? 'Reactivate Accounts' : 'Deactivate Accounts'}
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
            className="relative w-full h-[103px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col gap-[12px]"
          >
            {deletingUserId === user.id && (
              <div role="status" className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-[8px] bg-white/85 text-[13px] font-semibold text-[#475569]">
                <LoaderCircle className="h-4 w-4 animate-spin text-[#4F46E5]" />
                Deleting user and linked records…
              </div>
            )}
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
                <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="w-[24px] h-[24px] flex items-center justify-center border border-[#E2E8F0] rounded-[12px] text-[#475569]">
                  <Pencil className="w-[12px] h-[12px]" />
                </button>
                <button
                  onClick={() => void handleDeleteUser(user.id)}
                  disabled={deletingUserId !== null}
                  aria-label={`Permanently delete ${user.name}`}
                  className="w-[24px] h-[24px] flex items-center justify-center border border-[#E2E8F0] rounded-[12px] text-[#991B1B] disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-[12px] h-[12px]" />
                </button>
              </div>
            </div>

            <div className="w-full h-[0px] border-t border-[#E2E8F0]"></div>

            <div className="flex items-center justify-between h-[19px]">
              <div className="flex items-center gap-[6px]">
                <span className="px-[8px] py-[3px] rounded-[12px] text-[11px] leading-[13px] font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                  {user.phone ?? 'No phone'}
                </span>
                <span
                  className={`px-[8px] py-[3px] rounded-[12px] text-[11px] leading-[13px] font-semibold ${
                    user.status === 'Active'
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <span className="text-[#64748B] text-[10px] leading-[12px]">
                Joined {user.joinDate}
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
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">PHONE</div>
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">STATUS</div>
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">JOIN DATE</div>
            <div className="w-[110px] shrink-0 font-semibold text-[12px] leading-[15px] text-[#64748B] font-['Inter']">UPDATED</div>
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
                No user records match search query <strong className="text-[#4F46E5]">&quot;{searchQuery}&quot;</strong> or the selected status filter.
              </p>
              <button 
                onClick={() => { setLocalSearch(''); setStatusFilter('All'); }}
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
                    className={`relative box-border flex flex-row items-center p-[12px] gap-[16px] w-[1096px] h-[56px] border-b border-[#E2E8F0] shrink-0 transition-colors ${
                      isChecked ? 'bg-[#EEF2FF]/60 border-l-2 border-l-[#4F46E5]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {deletingUserId === user.id && (
                      <div role="status" className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/85 text-[13px] font-semibold text-[#475569]">
                        <LoaderCircle className="h-4 w-4 animate-spin text-[#4F46E5]" />
                        Deleting user and linked records…
                      </div>
                    )}
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
                      <span className="truncate font-normal text-[12px] text-[#475569]">{user.phone ?? '—'}</span>
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
                        {user.updatedAt}
                      </span>
                    </div>
                    <div className="w-[80px] shrink-0 flex flex-row justify-end items-center gap-[12px]">
                      <button onClick={() => { setEditingUser(user); setIsModalOpen(true); setActionError(null); }} className="flex items-center justify-center w-[16px] h-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80">
                        <Pencil className="w-[16px] h-[16px] text-[#475569]" />
                      </button>
                      <button
                        onClick={() => void handleDeleteUser(user.id)}
                        disabled={deletingUserId !== null}
                        aria-label={`Permanently delete ${user.name}`}
                        className="flex items-center justify-center w-[16px] h-[16px] p-0 border-none bg-transparent cursor-pointer hover:opacity-80 disabled:cursor-not-allowed"
                      >
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
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onAddUser={handleSaveUser}
        initialUser={editingUser}
      />
    </div>
  );
}
