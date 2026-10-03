'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  Search,
  Plus,
  Download,
  Calendar,
  Eye,
  Pencil,
  TrendingDown,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { ApiBooking, BookingStatus, createBooking, fetchUsers, fetchBookings, updateBooking } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';

interface BookingRecord {
  id: string;
  reference: string;
  userId: string;
  bookingDate: string;
  customerName: string;
  avatar: string;
  service: string;
  dateTime: string;
  duration: string;
  status: BookingStatus;
  amount: string;
}

const PAGE_SIZE = 8;

const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

export default function BookingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const globalSearchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [localSearch, setLocalSearch] = useState('');
  const [pagination, setPagination] = useState({ filterKey: '', page: 1 });
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [newBookingData, setNewBookingData] = useState<{
    userId: string;
    bookingDate: string;
    status: BookingStatus;
  }>({ userId: '', bookingDate: '', status: 'PENDING' });
  const [mutationError, setMutationError] = useState<string | null>(null);
  const saveBooking = useMutation({
    mutationFn: async () => {
      const bookingDate = new Date(newBookingData.bookingDate).toISOString();
      if (editingBookingId) {
        return updateBooking(editingBookingId, { bookingDate, status: newBookingData.status });
      }
      return createBooking({
        userId: newBookingData.userId,
        bookingDate,
        status: newBookingData.status,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
      ]);
      setEditingBookingId(null);
      setShowNewBookingModal(false);
      setMutationError(null);
    },
    onError: (error) => setMutationError(error instanceof Error ? error.message : 'Could not save booking.'),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: bookings, isLoading, isError, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
  });

  const bookingsList: BookingRecord[] = (bookings ?? []).map((booking: ApiBooking) => {
    const user = users?.find((candidate) => candidate.id === booking.userId);
    return {
      id: booking.id,
      reference: booking.reference,
      userId: booking.userId,
      bookingDate: booking.bookingDate,
      customerName: booking.user?.name ?? user?.name ?? booking.userId,
      avatar: user?.image ?? '',
      service: booking.reference,
      dateTime: new Date(booking.bookingDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      duration: '—',
      status: booking.status,
      amount: '—',
    };
  });

  const searchQuery = localSearch || globalSearchQuery;
  const filterKey = `${searchQuery}|${statusFilter}|${serviceFilter}`;
  const currentPage = pagination.filterKey === filterKey ? pagination.page : 1;
  const setCurrentPage = (page: number) => setPagination({ filterKey, page });

  const filteredBookings = bookingsList.filter((b) => {
    const matchesSearch = !searchQuery.trim() || (
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesService = serviceFilter === 'All' || b.service === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });
  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageBookings = filteredBookings.slice(pageStart, pageStart + PAGE_SIZE);
  const activeBookingCount = bookingsList.filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'PENDING').length;
  const completedBookingCount = bookingsList.filter((booking) => booking.status === 'COMPLETED').length;
  const cancelledBookingCount = bookingsList.filter((booking) => booking.status === 'CANCELLED').length;

  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Customer Name', 'Reference', 'Date & Time', 'Status'];
    const rows = filteredBookings.map(b => [b.reference, b.customerName, b.reference, b.dateTime, b.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bookings_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setMutationError(null);
    saveBooking.mutate();
  };

  const handleEditBooking = (booking: BookingRecord) => {
    setEditingBookingId(booking.id);
    setNewBookingData({
      userId: booking.userId,
      bookingDate: new Date(
        new Date(booking.bookingDate).getTime() - new Date(booking.bookingDate).getTimezoneOffset() * 60000,
      ).toISOString().slice(0, 16),
      status: booking.status,
    });
    setMutationError(null);
    setShowNewBookingModal(true);
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1136px] flex-col gap-4 font-sans min-[1440px]:gap-6">
      {/* API Error State with Retry Button Controls */}
      {isError && (
        <div className="w-full bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#991B1B] text-[13px] shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
            <span className="font-medium">
              API Error: Unable to load bookings from the backend.
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
      {/* 1. BREADCRUMB / HEADER FRAME */}
      <div className="hidden min-h-[50px] w-full min-w-0 shrink-0 items-center justify-between gap-4 md:flex">
        <div className="flex min-w-0 max-w-[367px] flex-1 flex-col items-start gap-1">
          <h1 className="m-0 w-full font-['Inter'] text-[20px] font-bold leading-[26px] text-[#0F172A] min-[1024px]:text-[24px] min-[1024px]:leading-[29px]">
            Bookings Directory
          </h1>
          <p className="m-0 w-full font-['Inter'] text-[12px] font-normal leading-[17px] text-[#64748B] min-[1024px]:text-[14px]">
            Manage all service bookings and consultation meetings
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBookingId(null);
            setNewBookingData({ userId: users?.[0]?.id ?? '', bookingDate: '', status: 'PENDING' });
            setEditingBookingId(null);
            setMutationError(null);
            setShowNewBookingModal(true);
          }}
          className="box-border flex h-[37px] w-[145px] shrink-0 flex-row items-center gap-2 rounded-lg bg-[#4F46E5] px-3 py-2.5 cursor-pointer transition-colors hover:bg-[#4338CA]"
        >
          <div className="flex flex-row justify-center items-center p-0 w-[16px] h-[16px] shrink-0">
            <Plus className="w-[16px] h-[16px] text-white" strokeWidth={2} />
          </div>
          <span className="h-auto w-auto whitespace-nowrap font-semibold text-[14px] leading-[17px] text-white font-['Inter'] shrink-0 text-left">
            New Booking
          </span>
        </button>
      </div>

      {/* 1. BREADCRUMB / HEADER FRAME (Mobile) */}
      <div className="flex min-h-[41px] w-full items-center justify-between gap-4 md:hidden">
        <div className="flex flex-col gap-[4px]">
          <h1 className="text-[18px] font-bold text-[#0F172A] leading-tight">Active Bookings</h1>
          <p className="text-[12px] text-[#64748B] leading-[15px]">Manage and schedule corporate bookings</p>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="flex h-9 w-full gap-2 lg:hidden">
        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-[8px] px-[12px] py-[8px] flex items-center gap-[8px] box-border">
          <Search className="w-[14px] h-[14px] text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full text-[13px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none bg-transparent"
          />
        </div>
        <label className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white" aria-label="Filter bookings by status">
          <TrendingDown className="pointer-events-none h-4 w-4 text-[#475569]" />
          <select
            aria-label="Filter bookings by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            <option value="All">All statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </div>

      {/* 2. KPI SUMMARY ROW (Desktop) */}
      <div className="hidden w-full shrink-0 grid-cols-2 gap-3 lg:grid min-[1440px]:h-[134px] min-[1440px]:grid-cols-4 min-[1440px]:gap-4">
        {/* Card 1 */}
        <div className="box-border flex h-[134px] w-full min-w-0 flex-col items-start gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 min-[1440px]:p-5">
          <div className="flex h-8 w-full min-w-0 shrink-0 items-center justify-between">
            <span className="h-auto w-auto whitespace-nowrap font-medium text-[14px] leading-[17px] text-[#64748B] font-['Inter'] shrink-0">Total Bookings</span>
            <div className="flex flex-row justify-center items-center p-0 w-[32px] h-[32px] bg-[#EEF2FF] rounded-[16px] shrink-0">
              <Calendar className="w-[16px] h-[16px] text-[#4F46E5]" />
            </div>
          </div>
          <div className="flex h-[50px] w-full min-w-0 shrink-0 flex-col items-start gap-1">
            <span className="h-auto w-auto whitespace-nowrap font-bold text-[24px] leading-[29px] text-[#0F172A] font-['Inter'] shrink-0">{bookingsList.length.toLocaleString()}</span>
            <div className="flex flex-row items-center p-0 gap-[4px] w-[127px] h-[17px] shrink-0">
              <div className="flex flex-row items-start px-[6px] py-[2px] w-[53px] h-[17px] bg-[#D1FAE5] rounded-[4px] shrink-0 box-border">
                <span className="w-[41px] h-[13px] whitespace-nowrap font-bold text-[11px] leading-[13px] text-[#065F46] font-['Inter'] shrink-0">↑ 8.4%</span>
              </div>
              <span className="w-[70px] h-[13px] whitespace-nowrap font-normal text-[11px] leading-[13px] text-[#64748B] font-['Inter'] shrink-0">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="box-border flex h-[134px] w-full min-w-0 flex-col items-start gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 min-[1440px]:p-5">
          <div className="flex h-8 w-full min-w-0 shrink-0 items-center justify-between">
            <span className="h-auto w-auto whitespace-nowrap font-medium text-[14px] leading-[17px] text-[#64748B] font-['Inter'] shrink-0">Active Bookings</span>
            <div className="flex flex-row justify-center items-center p-0 w-[32px] h-[32px] bg-[#EEF2FF] rounded-[16px] shrink-0">
              <Calendar className="w-[16px] h-[16px] text-[#4F46E5]" />
            </div>
          </div>
          <div className="flex h-[50px] w-full min-w-0 shrink-0 flex-col items-start gap-1">
            <span className="h-auto w-auto whitespace-nowrap font-bold text-[24px] leading-[29px] text-[#0F172A] font-['Inter'] shrink-0">{activeBookingCount.toLocaleString()}</span>
            <div className="flex flex-row items-center p-0 gap-[4px] w-[124px] h-[17px] shrink-0">
              <div className="flex flex-row items-start px-[6px] py-[2px] w-[50px] h-[17px] bg-[#FEE2E2] rounded-[4px] shrink-0 box-border">
                <span className="w-[38px] h-[13px] whitespace-nowrap font-bold text-[11px] leading-[13px] text-[#991B1B] font-['Inter'] shrink-0">↓ 3.1%</span>
              </div>
              <span className="w-[70px] h-[13px] whitespace-nowrap font-normal text-[11px] leading-[13px] text-[#64748B] font-['Inter'] shrink-0">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="box-border flex h-[134px] w-full min-w-0 flex-col items-start gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 min-[1440px]:p-5">
          <div className="flex h-8 w-full min-w-0 shrink-0 items-center justify-between">
            <span className="h-auto w-auto whitespace-nowrap font-medium text-[14px] leading-[17px] text-[#64748B] font-['Inter'] shrink-0">Completed Bookings</span>
            <div className="flex flex-row justify-center items-center p-0 w-[32px] h-[32px] bg-[#EEF2FF] rounded-[16px] shrink-0">
              <Calendar className="w-[16px] h-[16px] text-[#4F46E5]" />
            </div>
          </div>
          <div className="flex h-[50px] w-full min-w-0 shrink-0 flex-col items-start gap-1">
            <span className="h-auto w-auto whitespace-nowrap font-bold text-[24px] leading-[29px] text-[#0F172A] font-['Inter'] shrink-0">{completedBookingCount.toLocaleString()}</span>
            <div className="flex flex-row items-center p-0 gap-[4px] w-[129px] h-[17px] shrink-0">
              <div className="flex flex-row items-start px-[6px] py-[2px] w-[55px] h-[17px] bg-[#D1FAE5] rounded-[4px] shrink-0 box-border">
                <span className="w-[43px] h-[13px] whitespace-nowrap font-bold text-[11px] leading-[13px] text-[#065F46] font-['Inter'] shrink-0">↑ 12.1%</span>
              </div>
              <span className="w-[70px] h-[13px] whitespace-nowrap font-normal text-[11px] leading-[13px] text-[#64748B] font-['Inter'] shrink-0">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="box-border flex h-[134px] w-full min-w-0 flex-col items-start gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 min-[1440px]:p-5">
          <div className="flex h-8 w-full min-w-0 shrink-0 items-center justify-between">
            <span className="h-auto w-auto whitespace-nowrap font-medium text-[14px] leading-[17px] text-[#64748B] font-['Inter'] shrink-0">Cancelled Bookings</span>
            <div className="flex flex-row justify-center items-center p-0 w-[32px] h-[32px] bg-[#EEF2FF] rounded-[16px] shrink-0">
              <Calendar className="w-[16px] h-[16px] text-[#4F46E5]" />
            </div>
          </div>
          <div className="flex h-[50px] w-full min-w-0 shrink-0 flex-col items-start gap-1">
            <span className="h-auto w-auto whitespace-nowrap font-bold text-[24px] leading-[29px] text-[#0F172A] font-['Inter'] shrink-0">{cancelledBookingCount.toLocaleString()}</span>
            <div className="flex flex-row items-center p-0 gap-[4px] w-[125px] h-[17px] shrink-0">
              <div className="flex flex-row items-start px-[6px] py-[2px] w-[51px] h-[17px] bg-[#D1FAE5] rounded-[4px] shrink-0 box-border">
                <span className="w-[39px] h-[13px] whitespace-nowrap font-bold text-[11px] leading-[13px] text-[#065F46] font-['Inter'] shrink-0">↓ 1.4%</span>
              </div>
              <span className="w-[70px] h-[13px] whitespace-nowrap font-normal text-[11px] leading-[13px] text-[#64748B] font-['Inter'] shrink-0">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI SUMMARY ROW (Mobile) */}
      <div className="grid w-full grid-cols-2 gap-2 lg:hidden">
        {/* Card 1: Total Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col justify-between h-[60px]">
          <span className="text-[11px] font-normal text-[#64748B] leading-[13px]">Total Bookings</span>
          <span className="text-[16px] font-bold text-[#0F172A] leading-[19px]">{bookingsList.length.toLocaleString()}</span>
        </div>
        {/* Card 2: Active Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col justify-between h-[60px]">
          <span className="text-[11px] font-normal text-[#64748B] leading-[13px]">Active Sessions</span>
          <span className="text-[16px] font-bold text-[#4F46E5] leading-[19px]">{activeBookingCount.toLocaleString()}</span>
        </div>
        {/* Card 3: Completed Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col justify-between h-[60px]">
          <span className="text-[11px] font-normal text-[#64748B] leading-[13px]">Completed</span>
          <span className="text-[16px] font-bold text-[#065F46] leading-[19px]">{completedBookingCount.toLocaleString()}</span>
        </div>
        {/* Card 4: Cancelled Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col justify-between h-[60px]">
          <span className="text-[11px] font-normal text-[#64748B] leading-[13px]">Cancelled</span>
          <span className="text-[16px] font-bold text-[#991B1B] leading-[19px]">{cancelledBookingCount.toLocaleString()}</span>
        </div>
      </div>

      {/* New Booking Button (Mobile) */}
      <button
        onClick={() => {
          setEditingBookingId(null);
          setNewBookingData({ userId: users?.[0]?.id ?? '', bookingDate: '', status: 'PENDING' });
          setEditingBookingId(null);
          setMutationError(null);
          setShowNewBookingModal(true);
        }}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#4F46E5] text-[13px] font-semibold text-white cursor-pointer md:hidden"
      >
        <Plus className="w-[14px] h-[14px]" />
        <span>Create New Booking</span>
      </button>

      {/* 3. DESKTOP SEARCH & FILTER FRAME */}
      <div className="box-border hidden min-h-16 w-full shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 lg:flex">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-3 min-[1440px]:w-[735px] min-[1440px]:flex-nowrap">
          <div className="box-border flex h-8 w-full min-w-0 flex-row items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 min-[640px]:w-[240px]">
            <Search className="w-[16px] h-[16px] text-[#94A3B8] shrink-0" />
            <input
              type="text"
              placeholder="Search bookings by ID or client..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-4 w-full min-w-0 bg-transparent font-['Inter'] text-[13px] font-normal leading-4 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none"
            />
          </div>

          <div className="box-border relative flex h-8 w-[calc(50%-6px)] min-w-0 shrink-0 flex-row items-center gap-1.5 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 min-[640px]:w-[204px]">
            <select className="w-full h-full absolute inset-0 opacity-0 cursor-pointer text-[13px] font-['Inter']">
              <option>Date Range: Last 30 Days</option>
              <option>Date Range: Last 7 Days</option>
            </select>
            <span className="pointer-events-none w-[160px] shrink-0 whitespace-nowrap font-['Inter'] text-[13px] font-medium leading-4 text-[#475569]">Date Range: Last 30 Days</span>
            <div className="flex flex-row justify-center items-center p-0 w-[14px] h-[14px] shrink-0 pointer-events-none">
              <TrendingDown className="w-[14px] h-[14px] text-[#64748B]" />
            </div>
          </div>

          <div className="box-border relative flex h-8 w-[calc(50%-6px)] min-w-0 shrink-0 flex-row items-center gap-1.5 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 min-[640px]:w-[107px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-full absolute inset-0 opacity-0 cursor-pointer text-[13px] font-['Inter']"
            >
              <option value="All">Status: All</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="w-[63px] h-[16px] font-medium text-[13px] leading-[16px] text-[#475569] font-['Inter'] shrink-0 pointer-events-none truncate">{statusFilter === 'All' ? 'Status: All' : formatStatus(statusFilter)}</span>
            <div className="flex flex-row justify-center items-center p-0 w-[14px] h-[14px] shrink-0 pointer-events-none">
              <TrendingDown className="w-[14px] h-[14px] text-[#64748B]" />
            </div>
          </div>

          <div className="box-border relative flex h-8 w-[calc(50%-6px)] min-w-0 shrink-0 flex-row items-center gap-1.5 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 min-[640px]:w-[148px]">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full h-full absolute inset-0 opacity-0 cursor-pointer text-[13px] font-['Inter']"
            >
              <option value="All">Service Type: All</option>
              {[...new Set(bookingsList.map((booking) => booking.reference))].map((reference) => (
                <option key={reference} value={reference}>{reference}</option>
              ))}
            </select>
            <span className="w-[104px] h-[16px] font-medium text-[13px] leading-[16px] text-[#475569] font-['Inter'] shrink-0 pointer-events-none truncate">{serviceFilter === 'All' ? 'Service Type: All' : serviceFilter}</span>
            <div className="flex flex-row justify-center items-center p-0 w-[14px] h-[14px] shrink-0 pointer-events-none">
              <TrendingDown className="w-[14px] h-[14px] text-[#64748B]" />
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="box-border flex h-8 w-[111px] shrink-0 flex-row items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
        >
          <div className="flex flex-row justify-center items-center p-0 w-[14px] h-[14px] shrink-0">
            <Download className="w-[14px] h-[14px] text-[#475569]" strokeWidth={2} />
          </div>
          <span className="w-[67px] h-[16px] font-medium text-[13px] leading-[16px] text-[#475569] font-['Inter'] shrink-0 text-left">
            Export List
          </span>
        </button>
      </div>

      {/* 4. BOOKINGS TABLE FRAME */}
      <div className="flex w-full flex-col justify-between bg-transparent lg:hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748B] gap-3">
            <span className="text-xs font-semibold text-[#0F172A]">Fetching bookings directory...</span>
            <SkeletonRows className="mt-2 w-full max-w-[500px]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#64748B] gap-2">
            <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-[15px] font-bold text-[#0F172A]">No matching bookings found</h4>
            <p className="text-[13px] text-[#64748B]">
              No booking records match search query <strong className="text-[#4F46E5]">&quot;{searchQuery}&quot;</strong> or active status filters.
            </p>
            <button
              onClick={() => { setLocalSearch(''); setStatusFilter('All'); setServiceFilter('All'); }}
              className="mt-2 px-3.5 py-1.5 bg-[#4F46E5] text-white rounded-[6px] text-[12px] font-semibold hover:bg-[#4338CA] transition-colors cursor-pointer shadow-2xs"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-[10px]">
            {pageBookings.map((b) => (
              <div key={b.id} className="box-border flex h-[127px] w-full min-w-0 flex-col gap-[10px] rounded-lg border border-[#E2E8F0] bg-white p-3">
                {/* Top Row */}
                <div className="flex h-[19px] w-full min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-bold leading-4 text-[#0F172A]">{b.reference}</span>
                    <div className={`flex items-start px-[8px] py-[3px] rounded-[12px] ${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'bg-[#D1FAE5]' : b.status === 'PENDING' ? 'bg-[#FEF3C7]' : 'bg-[#FEE2E2]'
                    }`}>
                      <span className={`text-[11px] leading-[13px] font-semibold ${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'text-[#065F46]' : b.status === 'PENDING' ? 'text-[#92400E]' : 'text-[#991B1B]'
                      }`}>
                        {formatStatus(b.status)}
                    </span>
                  </div>
                </div>
                {/* Divider */}
                <div className="h-0 w-full border-t border-[#E2E8F0]" />
                {/* Middle Row */}
                <div className="flex h-[30px] w-full min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {b.avatar && <img src={b.avatar} alt={b.customerName} className="h-6 w-6 shrink-0 rounded-full object-cover" />}
                    <div className="flex min-w-0 flex-col gap-px">
                      <span className="truncate text-[13px] font-semibold leading-4 text-[#0F172A]">{b.customerName}</span>
                      <span className="text-[11px] leading-[13px] font-normal text-[#64748B]">{b.service}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[13px] font-bold leading-4 text-[#4F46E5]">{b.amount}</span>
                </div>
                {/* Bottom Row */}
                <div className="mt-1 flex h-6 w-full items-center justify-between gap-2">
                  <span className="truncate text-[10px] font-normal leading-3 text-[#64748B]">{b.dateTime}</span>
                  <button onClick={() => router.push(`/booking-detail?id=${encodeURIComponent(b.id)}`)} className="w-[20px] h-[20px] bg-[#F8FAFC] rounded-[4px] flex items-center justify-center cursor-pointer hover:bg-[#F1F5F9]">
                    <ArrowLeft className="w-[12px] h-[12px] text-[#475569] rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="box-border hidden h-[518px] w-full min-w-0 shrink-0 flex-col items-start gap-4 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white p-5 lg:flex">
        <div className="h-[423px] w-full min-h-0 min-w-0 overflow-x-auto overflow-y-hidden">
          <div className="w-[1096px] min-w-[1096px]">
            <div className="box-border grid h-[39px] w-[1096px] shrink-0 grid-cols-[110px_180px_150px_160px_100px_100px_100px_60px] items-center gap-4 rounded-md bg-[#F8FAFC] p-3">
              <span className="whitespace-nowrap font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">BOOKING ID</span>
              <span className="whitespace-nowrap font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">CUSTOMER</span>
              <span className="whitespace-nowrap font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">SERVICE</span>
              <span className="whitespace-nowrap font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">DATE &amp; TIME</span>
              <span className="whitespace-nowrap font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">DURATION</span>
              <span className="whitespace-nowrap font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">STATUS</span>
              <span className="whitespace-nowrap font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">AMOUNT</span>
              <span className="text-right font-['Inter'] text-[12px] font-semibold leading-[15px] text-[#64748B]">ACTIONS</span>
            </div>

            {pageBookings.map((b) => (
              <div key={b.id} className="box-border grid h-[48px] w-[1096px] shrink-0 grid-cols-[110px_180px_150px_160px_100px_100px_100px_60px] items-center gap-4 border-b border-[#E2E8F0] px-3 hover:bg-[#F8FAFC]">
                <span className="whitespace-nowrap font-['Inter'] text-[13px] font-semibold leading-4 text-[#0F172A]">{b.reference}</span>
                <div className="flex h-6 min-w-0 items-center gap-2">
                  {b.avatar && <img src={b.avatar} alt={b.customerName} className="h-6 w-6 shrink-0 rounded-full object-cover" />}
                  <span className="min-w-0 truncate font-['Inter'] text-[13px] font-medium leading-4 text-[#0F172A]">{b.customerName}</span>
                </div>
                <span className="truncate font-['Inter'] text-[13px] leading-4 text-[#0F172A]" title={b.service}>{b.service}</span>
                <span className="whitespace-nowrap font-['Inter'] text-[13px] leading-4 text-[#475569]">{b.dateTime}</span>
                <span className="whitespace-nowrap font-['Inter'] text-[13px] leading-4 text-[#475569]">{b.duration}</span>
                <div className="flex h-[21px] items-start">
                  <div className={`flex flex-row items-start px-[8px] py-[4px] rounded-[12px] shrink-0 ${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'bg-[#D1FAE5]' : b.status === 'PENDING' ? 'bg-[#FEF3C7]' : 'bg-[#FEE2E2]'}`}>
                    <span className={`h-[13px] font-semibold text-[11px] leading-[13px] font-['Inter'] shrink-0 ${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'text-[#065F46]' : b.status === 'PENDING' ? 'text-[#92400E]' : 'text-[#991B1B]'}`}>{formatStatus(b.status)}</span>
                  </div>
                </div>
                <span className="whitespace-nowrap font-['Inter'] text-[13px] font-semibold leading-4 text-[#0F172A]">{b.amount}</span>
                <div className="flex items-center justify-end gap-3">
                  <button aria-label={`View booking ${b.reference}`} onClick={() => router.push(`/booking-detail?id=${encodeURIComponent(b.id)}`)} className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0">
                    <Eye className="w-[16px] h-[16px] text-[#475569] hover:text-[#0F172A] transition-colors" strokeWidth={2} />
                  </button>
                  <button aria-label={`Edit booking ${b.reference}`} onClick={() => handleEditBooking(b)} className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0">
                    <Pencil className="w-[16px] h-[16px] text-[#475569] hover:text-[#0F172A] transition-colors" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Table Footer / Pagination */}
        <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9] pt-3 text-[12px]">
          <span className="text-[#64748B]">
            Showing <span className="font-semibold text-[#0F172A]">{filteredBookings.length ? `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, filteredBookings.length)}` : '0'}</span> of{' '}
            <span className="font-semibold text-[#0F172A]">{filteredBookings.length}</span> results
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed text-[12px]"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage >= pageCount}
              className="px-3 py-1 bg-white border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[12px]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* NEW BOOKING MODAL */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-2xl w-full max-w-[480px] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[#0F172A]">{editingBookingId ? 'Edit Service Booking' : 'Create New Service Booking'}</h3>
              <button
                onClick={() => setShowNewBookingModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveBooking} className="p-6 flex flex-col gap-4">
              {mutationError && (
                <div role="alert" className="rounded-[6px] bg-[#FEF2F2] p-3 text-[13px] text-[#991B1B]">
                  {mutationError}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#0F172A]">Customer</label>
                <select
                  required
                  value={newBookingData.userId}
                  disabled={Boolean(editingBookingId)}
                  onChange={(e) => setNewBookingData({ ...newBookingData, userId: e.target.value })}
                  className="h-[40px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60"
                >
                  <option value="" disabled>Select a user</option>
                  {(users ?? []).map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#0F172A]">Booking Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newBookingData.bookingDate}
                  onChange={(e) => setNewBookingData({ ...newBookingData, bookingDate: e.target.value })}
                  className="h-[40px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#0F172A]">Status</label>
                <select
                  value={newBookingData.status}
                  onChange={(e) => setNewBookingData({ ...newBookingData, status: e.target.value as BookingStatus })}
                  className="h-[40px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A]"
                >
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9] mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#64748B] rounded-[8px] text-[13px] font-semibold hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveBooking.isPending}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#4338CA] cursor-pointer"
                >
                  {saveBooking.isPending ? 'Saving…' : editingBookingId ? 'Save Changes' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
