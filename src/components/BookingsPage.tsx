'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  Search,
  Plus,
  Download,
  Calendar,
  Eye,
  Pencil,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { fetchUsers, fetchBookings, ApiUser, ApiTodo } from '@/lib/api';
import BookingDetailPage from './BookingDetailPage';
import { SkeletonRows } from '@/components/Skeleton';

interface BookingRecord {
  id: string;
  customerName: string;
  avatar: string;
  service: string;
  dateTime: string;
  duration: string;
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';
  amount: string;
}

const PAGE_SIZE = 10;

const defaultBookings: BookingRecord[] = [
  {
    id: '#BKG-2341',
    customerName: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    service: 'Business Consultation',
    dateTime: 'Oct 15, 2024 14:00',
    duration: '1.5 hrs',
    status: 'Confirmed',
    amount: '$180.00',
  },
  {
    id: '#BKG-2340',
    customerName: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    service: 'Technical Support',
    dateTime: 'Oct 14, 2024 10:00',
    duration: '1.0 hr',
    status: 'Completed',
    amount: '$120.00',
  },
  {
    id: '#BKG-2339',
    customerName: 'Emily Davis',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    service: 'Executive Coaching',
    dateTime: 'Oct 13, 2024 16:30',
    duration: '2.0 hrs',
    status: 'Pending',
    amount: '$250.00',
  },
  {
    id: '#BKG-2338',
    customerName: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    service: 'Strategy Session',
    dateTime: 'Oct 12, 2024 11:30',
    duration: '1.5 hrs',
    status: 'Cancelled',
    amount: '$180.00',
  },
  {
    id: '#BKG-2337',
    customerName: 'Emma Jones',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    service: 'Personal Training',
    dateTime: 'Oct 11, 2024 09:00',
    duration: '1.0 hr',
    status: 'Completed',
    amount: '$95.00',
  },
  {
    id: '#BKG-2336',
    customerName: 'Robert Taylor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    service: 'Business Consultation',
    dateTime: 'Oct 10, 2024 15:00',
    duration: '1.5 hrs',
    status: 'Confirmed',
    amount: '$180.00',
  },
  {
    id: '#BKG-2335',
    customerName: 'Clara Martin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    service: 'Technical Support',
    dateTime: 'Oct 09, 2024 13:00',
    duration: '1.0 hr',
    status: 'Completed',
    amount: '$120.00',
  },
  {
    id: '#BKG-2334',
    customerName: 'Joseph Thomas',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    service: 'Executive Coaching',
    dateTime: 'Oct 08, 2024 10:30',
    duration: '2.0 hrs',
    status: 'Confirmed',
    amount: '$250.00',
  },
];

export default function BookingsPage() {
  const globalSearchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const [localSearch, setLocalSearch] = useState('');
  const [pagination, setPagination] = useState({ filterKey: '', page: 1 });
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [customBookings, setCustomBookings] = useState<BookingRecord[]>([]);
  const [bookingOverrides, setBookingOverrides] = useState<Record<string, Partial<BookingRecord>>>({});
  const [newBookingData, setNewBookingData] = useState<{
    customerName: string;
    service: string;
    dateTime: string;
    duration: string;
    amount: string;
    status: BookingRecord['status'];
  }>({
    customerName: '',
    service: 'Business Consultation',
    dateTime: 'Oct 16, 2024 10:00',
    duration: '1.5 hrs',
    amount: '$180.00',
    status: 'Confirmed' as const,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: todos, isLoading, isError, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
  });

  const baseBookingsList: BookingRecord[] = todos && todos.length > 0
    ? todos.map((todo: ApiTodo, idx: number) => {
      const user = users?.find((candidate: ApiUser) => candidate.id === todo.userId);
      const services = ['Business Consultation', 'Technical Support', 'Executive Coaching', 'Strategy Session', 'Personal Training'];
      const dates = ['Oct 15, 2024 14:00', 'Oct 14, 2024 10:00', 'Oct 13, 2024 16:30', 'Oct 12, 2024 11:30', 'Oct 11, 2024 09:00', 'Oct 10, 2024 15:00', 'Oct 09, 2024 13:00', 'Oct 08, 2024 10:30'];
      const durations = ['1.5 hrs', '1.0 hr', '2.0 hrs', '1.5 hrs', '1.0 hr', '1.5 hrs', '1.0 hr', '2.0 hrs'];
      const amounts = ['$180.00', '$120.00', '$250.00', '$180.00', '$95.00', '$180.00', '$120.00', '$250.00'];

      return {
        id: `#BKG-${2341 - todo.id}`,
        customerName: user ? `${user.firstName} ${user.lastName}` : `Customer ${todo.userId}`,
        avatar: user?.image || defaultBookings[idx % defaultBookings.length].avatar,
        service: services[idx % services.length],
        dateTime: dates[idx % dates.length],
        duration: durations[idx % durations.length],
        status: todo.completed ? 'Completed' : 'Pending',
        amount: amounts[idx % amounts.length],
      };
    })
    : defaultBookings;

  const bookingsList = [...customBookings, ...baseBookingsList].map((booking) => ({
    ...booking,
    ...bookingOverrides[booking.id],
  }));

  const searchQuery = localSearch || globalSearchQuery;
  const filterKey = `${searchQuery}|${statusFilter}|${serviceFilter}`;
  const currentPage = pagination.filterKey === filterKey ? pagination.page : 1;
  const setCurrentPage = (page: number) => setPagination({ filterKey, page });

  const filteredBookings = bookingsList.filter((b) => {
    const matchesSearch = !searchQuery.trim() || (
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  const activeBookingCount = bookingsList.filter((booking) => booking.status === 'Confirmed' || booking.status === 'Pending').length;
  const completedBookingCount = bookingsList.filter((booking) => booking.status === 'Completed').length;
  const cancelledBookingCount = bookingsList.filter((booking) => booking.status === 'Cancelled').length;

  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Customer Name', 'Service', 'Date & Time', 'Duration', 'Status', 'Amount'];
    const rows = filteredBookings.map(b => [b.id, b.customerName, b.service, b.dateTime, b.duration, b.status, b.amount]);
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
    if (!newBookingData.customerName.trim()) return;

    if (editingBookingId) {
      setBookingOverrides((current) => ({
        ...current,
        [editingBookingId]: { ...current[editingBookingId], ...newBookingData },
      }));
      setEditingBookingId(null);
      setShowNewBookingModal(false);
      return;
    }

    const newRecord: BookingRecord = {
      id: `#BKG-${2342 + customBookings.length}`,
      customerName: newBookingData.customerName,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      service: newBookingData.service,
      dateTime: newBookingData.dateTime,
      duration: newBookingData.duration,
      status: newBookingData.status,
      amount: newBookingData.amount,
    };
    setCustomBookings([newRecord, ...customBookings]);
    setShowNewBookingModal(false);
    setNewBookingData({
      customerName: '',
      service: 'Business Consultation',
      dateTime: 'Oct 16, 2024 10:00',
      duration: '1.5 hrs',
      amount: '$180.00',
      status: 'Confirmed',
    });
  };

  const handleEditBooking = (booking: BookingRecord) => {
    setEditingBookingId(booking.id);
    setNewBookingData({
      customerName: booking.customerName,
      service: booking.service,
      dateTime: booking.dateTime,
      duration: booking.duration,
      amount: booking.amount,
      status: booking.status,
    });
    setShowNewBookingModal(true);
  };

  const handleRescheduleBooking = (bookingId: string, dateTime: string) => {
    setBookingOverrides((current) => ({
      ...current,
      [bookingId]: { ...current[bookingId], dateTime },
    }));
  };

  if (selectedBookingId) {
    const selectedBooking = bookingsList.find((booking) => booking.id === selectedBookingId);
    return (
      <BookingDetailPage
        bookingId={selectedBookingId}
        bookingDateTime={selectedBooking?.dateTime}
        onReschedule={(dateTime) => handleRescheduleBooking(selectedBookingId, dateTime)}
        onBack={() => setSelectedBookingId(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-[1136px] flex flex-col gap-4 lg:gap-[24px] mx-auto font-sans">
      {/* API Error State with Retry Button Controls */}
      {isError && (
        <div className="w-full bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#991B1B] text-[13px] shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
            <span className="font-medium">
              API Error: Unable to sync live bookings directory with remote server. Displaying cached appointments.
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
      <div className="w-[358px] lg:w-[1136px] min-h-[41px] lg:h-[50px] flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[4px]">
          <h1 className="text-[18px] lg:text-[24px] font-bold text-[#0F172A] leading-tight lg:leading-none">
            <span className="lg:hidden">Active Bookings</span>
            <span className="hidden lg:inline">Bookings Directory</span>
          </h1>
          <p className="text-[12px] lg:text-[14px] text-[#64748B] leading-[15px] lg:leading-none">
            <span className="lg:hidden">Manage and schedule corporate bookings</span>
            <span className="hidden lg:inline">Manage all service bookings and consultation meetings</span>
          </p>
        </div>

        {/* New Booking Button (Desktop) */}
        <button
          onClick={() => {
            setEditingBookingId(null);
            setNewBookingData({ customerName: '', service: 'Business Consultation', dateTime: 'Oct 16, 2024 10:00', duration: '1.5 hrs', amount: '$180.00', status: 'Confirmed' });
            setShowNewBookingModal(true);
          }}
          className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-[8px] text-[14px] font-semibold hover:bg-[#4338CA] transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* MOBILE SEARCH */}
      <div className="flex lg:hidden w-[358px] h-[36px] gap-[8px]">
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
        <button className="w-[36px] h-[36px] bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center shrink-0">
          <TrendingUp className="w-[16px] h-[16px] text-[#475569]" />
        </button>
      </div>

      {/* 2. KPI SUMMARY ROW (4 Cards: Total, Active, Completed, Cancelled) */}
      <div className="w-[358px] lg:w-[1136px] grid grid-cols-2 lg:grid-cols-4 gap-[8px] lg:gap-[16px]">
        {/* Card 1: Total Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[20px] flex flex-col lg:justify-between shadow-xs h-[60px] lg:h-[136px] gap-[4px] lg:gap-0 box-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] lg:text-[13px] font-normal lg:font-medium text-[#64748B] leading-[13px] lg:leading-normal">Total Bookings</span>
            <div className="hidden lg:flex w-8 h-8 rounded-full bg-[#EEF2FF] text-[#6366F1] items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[16px] lg:text-[24px] font-bold text-[#0F172A] leading-[19px] lg:leading-tight">{bookingsList.length.toLocaleString()}</span>
            <span className="hidden lg:flex text-[12px] font-semibold text-[#10B981] items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Current API dataset
            </span>
          </div>
        </div>

        {/* Card 2: Active Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[20px] flex flex-col lg:justify-between shadow-xs h-[60px] lg:h-[136px] gap-[4px] lg:gap-0 box-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] lg:text-[13px] font-normal lg:font-medium text-[#64748B] leading-[13px] lg:leading-normal">Active Sessions</span>
            <div className="hidden lg:flex w-8 h-8 rounded-full bg-[#EEF2FF] text-[#6366F1] items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[16px] lg:text-[24px] font-bold text-[#4F46E5] lg:text-[#0F172A] leading-[19px] lg:leading-tight">{activeBookingCount.toLocaleString()}</span>
            <span className="hidden lg:flex text-[12px] font-semibold text-[#EF4444] items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Open or confirmed
            </span>
          </div>
        </div>

        {/* Card 3: Completed Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[20px] flex flex-col lg:justify-between shadow-xs h-[60px] lg:h-[136px] gap-[4px] lg:gap-0 box-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] lg:text-[13px] font-normal lg:font-medium text-[#64748B] leading-[13px] lg:leading-normal">Completed</span>
            <div className="hidden lg:flex w-8 h-8 rounded-full bg-[#EEF2FF] text-[#6366F1] items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[16px] lg:text-[24px] font-bold text-[#065F46] lg:text-[#0F172A] leading-[19px] lg:leading-tight">{completedBookingCount.toLocaleString()}</span>
            <span className="hidden lg:flex text-[12px] font-semibold text-[#10B981] items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Marked complete
            </span>
          </div>
        </div>

        {/* Card 4: Cancelled Bookings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] lg:p-[20px] flex flex-col lg:justify-between shadow-xs h-[60px] lg:h-[136px] gap-[4px] lg:gap-0 box-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] lg:text-[13px] font-normal lg:font-medium text-[#64748B] leading-[13px] lg:leading-normal">Cancelled</span>
            <div className="hidden lg:flex w-8 h-8 rounded-full bg-[#EEF2FF] text-[#6366F1] items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[16px] lg:text-[24px] font-bold text-[#991B1B] lg:text-[#0F172A] leading-[19px] lg:leading-tight">{cancelledBookingCount.toLocaleString()}</span>
            <span className="hidden lg:flex text-[12px] font-semibold text-[#10B981] items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* New Booking Button (Mobile) */}
      <button
        onClick={() => {
          setEditingBookingId(null);
          setNewBookingData({ customerName: '', service: 'Business Consultation', dateTime: 'Oct 16, 2024 10:00', duration: '1.5 hrs', amount: '$180.00', status: 'Confirmed' });
          setShowNewBookingModal(true);
        }}
        className="flex lg:hidden items-center justify-center gap-2 w-[358px] h-[40px] bg-[#4F46E5] text-white rounded-[8px] text-[13px] font-semibold cursor-pointer"
      >
        <Plus className="w-[14px] h-[14px]" />
        <span>Create New Booking</span>
      </button>

      {/* 3. DESKTOP SEARCH & FILTER FRAME */}
      <div className="hidden lg:flex w-[1136px] bg-white border border-[#E2E8F0] rounded-[8px] p-[16px] flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-[260px] h-[36px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search bookings by ID or client..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-[36px] pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] transition-all"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <select className="h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#475569] focus:outline-none cursor-pointer">
              <option>Date Range: Last 30 Days</option>
              <option>Date Range: Last 7 Days</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#475569] focus:outline-none cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#475569] focus:outline-none cursor-pointer"
            >
              <option value="All">Service Type: All</option>
              <option value="Business Consultation">Business Consultation</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Executive Coaching">Executive Coaching</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-[8px] text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-[#64748B]" />
          <span>Export List</span>
        </button>
      </div>

      {/* 4. BOOKINGS TABLE FRAME */}
      <div className="w-[358px] lg:w-[1136px] bg-transparent lg:bg-white lg:border lg:border-[#E2E8F0] lg:rounded-[8px] lg:p-[12px] lg:shadow-xs flex flex-col justify-between">
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
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                    <th className="pb-3 pl-3 font-bold">BOOKING ID</th>
                    <th className="pb-3 font-bold">CUSTOMER</th>
                    <th className="pb-3 font-bold">SERVICE</th>
                    <th className="pb-3 font-bold">DATE & TIME</th>
                    <th className="pb-3 font-bold">DURATION</th>
                    <th className="pb-3 font-bold">STATUS</th>
                    <th className="pb-3 font-bold">AMOUNT</th>
                    <th className="pb-3 font-bold text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
                  {pageBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 pl-3 font-bold text-[#0F172A]">{b.id}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={b.avatar}
                            alt={b.customerName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E2E8F0]"
                          />
                          <span className="font-semibold text-[#0F172A] truncate">
                            {b.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#0F172A] font-medium">{b.service}</td>
                      <td className="py-3.5 text-[#64748B] text-[12px]">{b.dateTime}</td>
                      <td className="py-3.5 text-[#64748B] text-[12px]">{b.duration}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${b.status === 'Confirmed' || b.status === 'Completed'
                              ? 'bg-[#D1FAE5] text-[#10B981]'
                              : b.status === 'Pending'
                                ? 'bg-[#FEF3C7] text-[#D97706]'
                                : 'bg-[#FEE2E2] text-[#EF4444]'
                            }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-[#0F172A]">{b.amount}</td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedBookingId(b.id)}
                            className="p-1 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditBooking(b)} className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition-colors cursor-pointer" title="Edit booking">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="flex lg:hidden flex-col gap-[10px] w-full">
              {pageBookings.map((b) => (
                <div key={b.id} className="box-border w-[358px] h-[127px] bg-white border border-[#E2E8F0] rounded-[8px] p-[12px] flex flex-col gap-[10px]">
                  {/* Top Row */}
                  <div className="w-[334px] h-[19px] flex items-center justify-between">
                    <span className="text-[13px] leading-[16px] font-bold text-[#0F172A]">{b.id}</span>
                    <div className={`flex items-start px-[8px] py-[3px] rounded-[12px] ${b.status === 'Confirmed' || b.status === 'Completed' ? 'bg-[#D1FAE5]' : b.status === 'Pending' ? 'bg-[#FEF3C7]' : 'bg-[#FEE2E2]'
                      }`}>
                      <span className={`text-[11px] leading-[13px] font-semibold ${b.status === 'Confirmed' || b.status === 'Completed' ? 'text-[#065F46]' : b.status === 'Pending' ? 'text-[#92400E]' : 'text-[#991B1B]'
                        }`}>
                        {b.status === 'Confirmed' ? 'Active' : b.status}
                      </span>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="w-[334px] h-0 border-t border-[#E2E8F0]" />
                  {/* Middle Row */}
                  <div className="w-[334px] h-[30px] flex items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <img src={b.avatar} alt={b.customerName} className="w-[24px] h-[24px] rounded-[12px] object-cover" />
                      <div className="flex flex-col gap-[1px]">
                        <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">{b.customerName}</span>
                        <span className="text-[11px] leading-[13px] font-normal text-[#64748B]">{b.service}</span>
                      </div>
                    </div>
                    <span className="text-[13px] leading-[16px] font-bold text-[#4F46E5]">{b.amount}</span>
                  </div>
                  {/* Bottom Row */}
                  <div className="w-[334px] h-[24px] flex items-center justify-between mt-[4px]">
                    <span className="text-[10px] leading-[12px] font-normal text-[#64748B]">{b.dateTime}</span>
                    <button onClick={() => setSelectedBookingId(b.id)} className="w-[20px] h-[20px] bg-[#F8FAFC] rounded-[4px] flex items-center justify-center cursor-pointer hover:bg-[#F1F5F9]">
                      <ArrowLeft className="w-[12px] h-[12px] text-[#475569] rotate-180" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] text-[12px] mt-2">
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
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#0F172A]">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Wright"
                  value={newBookingData.customerName}
                  onChange={(e) => setNewBookingData({ ...newBookingData, customerName: e.target.value })}
                  className="h-[40px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#0F172A]">Service Type</label>
                <select
                  value={newBookingData.service}
                  onChange={(e) => setNewBookingData({ ...newBookingData, service: e.target.value })}
                  className="h-[40px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                >
                  <option>Business Consultation</option>
                  <option>Technical Support</option>
                  <option>Executive Coaching</option>
                  <option>Strategy Session</option>
                  <option>Personal Training</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#0F172A]">Date & Time</label>
                  <input
                    type="text"
                    value={newBookingData.dateTime}
                    onChange={(e) => setNewBookingData({ ...newBookingData, dateTime: e.target.value })}
                    className="h-[40px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#0F172A]">Duration</label>
                  <input
                    type="text"
                    value={newBookingData.duration}
                    onChange={(e) => setNewBookingData({ ...newBookingData, duration: e.target.value })}
                    className="h-[40px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#0F172A]">Amount</label>
                  <input
                    type="text"
                    value={newBookingData.amount}
                    onChange={(e) => setNewBookingData({ ...newBookingData, amount: e.target.value })}
                    className="h-[40px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#0F172A]">Status</label>
                  <select
                    value={newBookingData.status}
                    onChange={(e) => setNewBookingData({ ...newBookingData, status: e.target.value as BookingRecord['status'] })}
                    className="h-[40px] px-3 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A]"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#4338CA] cursor-pointer"
                >
                  {editingBookingId ? 'Save Changes' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
