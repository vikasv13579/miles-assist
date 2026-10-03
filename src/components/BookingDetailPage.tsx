'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  XCircle, 
  ArrowLeft, 
  CheckCircle2, 
} from 'lucide-react';
import Link from 'next/link';
import { fetchBookingById, updateBooking } from '@/lib/api';

interface BookingDetailPageProps {
  bookingId?: string;
  bookingDateTime?: string;
  onBack?: () => void;
}

export default function BookingDetailPage({
  bookingId,
  bookingDateTime,
  onBack
}: BookingDetailPageProps) {
  const queryClient = useQueryClient();
  const { data: booking, isLoading, isError, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBookingById(bookingId ?? ''),
    enabled: Boolean(bookingId),
  });
  const [bookingDateValue, setBookingDateValue] = useState('');
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleValue, setRescheduleValue] = useState('');
  const rescheduleMutation = useMutation({
    mutationFn: (date: string) => updateBooking(booking!.id, { bookingDate: new Date(date).toISOString() }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['booking', bookingId] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
      ]);
      setShowRescheduleForm(false);
    },
  });
  const statusMutation = useMutation({
    mutationFn: (status: 'CANCELLED' | 'CONFIRMED') => updateBooking(booking!.id, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['booking', bookingId] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      ]);
    },
  });

  useEffect(() => {
    const value = bookingDateTime ?? booking?.bookingDate;
    if (!value) return;
    const date = new Date(value);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setBookingDateValue(localDate);
    setRescheduleValue(localDate);
  }, [booking?.bookingDate, bookingDateTime]);

  const handleReschedule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    rescheduleMutation.mutate(rescheduleValue);
  };

  if (isLoading) return <div className="w-full rounded-[8px] border border-[#E2E8F0] bg-white p-6 text-[13px] text-[#64748B]">Loading booking…</div>;
  if (!bookingId || isError || !booking) {
    return <div role="alert" className="w-full rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[13px] text-[#991B1B]">{isError ? (error instanceof Error ? error.message : 'Could not load booking.') : 'Booking ID is required.'}{onBack && <button onClick={onBack} className="ml-3 font-semibold underline">Back</button>}</div>;
  }

  const isCancelled = booking.status === 'CANCELLED';
  const displayId = booking.reference;
  const customerName = booking.user?.name ?? booking.userId;
  const customerEmail = booking.user?.email ?? '—';
  const customerInitials = customerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  const formattedStatus = booking.status.charAt(0) + booking.status.slice(1).toLowerCase();
  const formattedDate = new Date(booking.bookingDate).toLocaleString();
  const formattedTime = new Date(booking.bookingDate).toLocaleTimeString();

  return (
    <div className="w-full flex flex-col items-center">
      {(statusMutation.isError || rescheduleMutation.isError) && (
        <div role="alert" className="mb-3 w-full rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-[13px] text-[#991B1B]">
          {(statusMutation.error ?? rescheduleMutation.error) instanceof Error
            ? (statusMutation.error ?? rescheduleMutation.error)?.message
            : 'Could not update booking.'}
        </div>
      )}
      {/* MOBILE VIEW */}
      <div className="flex lg:hidden flex-col w-[390px] mx-auto bg-[#F8FAFC] min-h-[844px] pb-[64px] font-sans">
        {/* top-nav */}
        <div className="flex flex-row justify-between items-center px-[16px] py-[8px] w-full h-[56px] bg-white border border-[#E2E8F0] box-border">
          <div className="flex flex-row items-center gap-[12px]">
            <button onClick={onBack} className="flex justify-center items-center p-[4px] w-[28px] h-[28px] cursor-pointer">
              <ArrowLeft className="w-[20px] h-[20px] text-[#0F172A]" />
            </button>
            <span className="text-[16px] leading-[19px] font-bold text-[#0F172A]">Booking Detail</span>
          </div>
          <button className="flex items-center justify-center p-[6px] w-[28px] h-[28px] border border-[#E2E8F0] rounded-[20px] box-border bg-white cursor-pointer">
            <div className="flex gap-[2px]">
              <div className="w-1 h-1 bg-[#475569] rounded-full"></div>
              <div className="w-1 h-1 bg-[#475569] rounded-full"></div>
              <div className="w-1 h-1 bg-[#475569] rounded-full"></div>
            </div>
          </button>
        </div>

        {/* main-scroll */}
        <div className="flex flex-col p-[16px] gap-[16px] w-[390px] box-border">
          {/* status-header-card */}
          <div className="flex flex-col items-center p-[20px] gap-[12px] w-[358px] bg-white border border-[#E2E8F0] rounded-[8px] box-border">
            <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">{displayId}</span>
            <h2 className="text-[20px] leading-[24px] font-bold text-[#0F172A] text-center w-full">{displayId}</h2>
            <div className="flex flex-row items-center gap-[8px]">
              {isCancelled ? (
                <div className="flex px-[10px] py-[4px] bg-[#FEE2E2] rounded-[12px]">
                  <span className="text-[11px] leading-[13px] font-bold text-[#991B1B]">Cancelled</span>
                </div>
              ) : (
                <>
                  <div className="flex px-[10px] py-[4px] bg-[#EEF2FF] rounded-[12px]">
                    <span className="text-[11px] leading-[13px] font-bold text-[#4F46E5]">{formattedStatus}</span>
                  </div>
                </>
              )}
            </div>
            
            {showRescheduleForm ? (
              <form onSubmit={handleReschedule} className="flex flex-col gap-3 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-3">
                <label className="flex flex-col gap-1 text-[12px] font-semibold text-[#475569]">
                  New date and time
                  <input
                    required
                    value={rescheduleValue}
                    onChange={(event) => setRescheduleValue(event.target.value)}
                    className="h-10 rounded-[6px] border border-[#CBD5E1] px-3 text-[13px] font-normal text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
                  />
                </label>
                <div className="flex gap-2 w-full">
                  <button type="button" onClick={() => setShowRescheduleForm(false)} className="flex-1 h-[36px] bg-white border border-[#E2E8F0] rounded-[6px] text-[13px] font-semibold text-[#64748B]">Cancel</button>
                  <button type="submit" className="flex-1 h-[36px] bg-[#4F46E5] rounded-[6px] text-[13px] font-semibold text-white">Save</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-row gap-[12px] w-[318px] box-border">
                <button 
                  onClick={() => { setRescheduleValue(bookingDateValue); setShowRescheduleForm(true); }}
                  className="flex-1 h-[41px] bg-[#4F46E5] rounded-[8px] flex items-center justify-center text-[14px] leading-[17px] font-semibold text-white"
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => statusMutation.mutate('CANCELLED')}
                  disabled={statusMutation.isPending || isCancelled}
                  className="flex-1 h-[41px] border border-[#991B1B] rounded-[8px] flex items-center justify-center text-[14px] leading-[17px] font-semibold text-[#991B1B] box-border bg-white"
                >
                  {isCancelled ? 'Cancelled' : 'Cancel Booking'}
                </button>
              </div>
            )}
          </div>

          {/* Booking Meeting Logistics */}
          <div className="flex flex-col p-[16px] gap-[12px] w-[358px] bg-white border border-[#E2E8F0] rounded-[8px] box-border">
            <h3 className="text-[14px] leading-[17px] font-bold text-[#0F172A]">Booking Meeting Logistics</h3>
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Service</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">—</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Date</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">{new Date(booking.bookingDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Time</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">{formattedTime}</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Format</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">—</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Location</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A] truncate max-w-[175px]">—</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Reference</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A] w-[224px] text-right">{booking.reference}</span>
              </div>
            </div>
          </div>

          {/* Customer Overview */}
          <div className="flex flex-col p-[16px] gap-[12px] w-[358px] bg-white border border-[#E2E8F0] rounded-[8px] box-border">
            <h3 className="text-[14px] leading-[17px] font-bold text-[#0F172A]">Customer Overview</h3>
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Name</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">{customerName}</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Email</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">{customerEmail}</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Phone</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Total Bookings</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#4F46E5]">—</span>
              </div>
            </div>
          </div>

          {/* Payment Ledger Breakdown */}
          <div className="flex flex-col p-[16px] gap-[12px] w-[358px] bg-white border border-[#E2E8F0] rounded-[8px] box-border">
            <h3 className="text-[14px] leading-[17px] font-bold text-[#0F172A]">Payment Ledger Breakdown</h3>
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Amount</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">—</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Payment Status</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#64748B]">—</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Invoice</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Action</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">—</span>
              </div>
            </div>
          </div>

          {/* Booking Lifecycle Logs */}
          <div className="flex flex-col p-[16px] gap-[12px] w-[358px] bg-white border border-[#E2E8F0] rounded-[8px] box-border">
            <h3 className="text-[14px] leading-[17px] font-bold text-[#0F172A]">Booking Lifecycle Logs</h3>
            <div className="flex flex-col gap-[12px] w-[326px] relative">
              {/* Vertical line connecting dots */}
              <div className="absolute left-[4px] top-[10px] bottom-[10px] w-[2px] bg-[#E2E8F0]" />
              
              {/* Step 1 */}
              <div className="flex flex-row items-start gap-[12px] w-full relative">
                <div className="flex flex-col items-center w-[10px] z-10 pt-[3px]">
                  <div className="w-[10px] h-[10px] bg-[#4F46E5] rounded-full" />
                </div>
                <div className="flex flex-col gap-[2px] w-[304px]">
                  <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Booking created</span>
                  <span className="text-[12px] leading-[15px] font-normal text-[#64748B]">Created in the backend</span>
                  <span className="text-[11px] leading-[13px] font-normal text-[#94A3B8]">{new Date(booking.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-row items-start gap-[12px] w-full relative">
                <div className="flex flex-col items-center w-[10px] z-10 pt-[3px]">
                  <div className="w-[10px] h-[10px] bg-[#065F46] rounded-full" />
                </div>
                <div className="flex flex-col gap-[2px] w-[304px]">
                  <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Last updated</span>
                  <span className="text-[12px] leading-[15px] font-normal text-[#64748B]">Current status: {formattedStatus}</span>
                  <span className="text-[11px] leading-[13px] font-normal text-[#94A3B8]">{new Date(booking.updatedAt).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex w-full min-w-0 flex-col gap-[24px] mx-auto font-sans">
      {/* 1. BREADCRUMB FRAME (Width: 1136px, Height: 16px) */}
      <div className="flex min-h-[16px] w-full min-w-0 flex-wrap items-center gap-2">
        {onBack ? (
          <button 
            onClick={onBack}
            className="flex h-4 shrink-0 items-center whitespace-nowrap text-[13px] leading-4 font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            Bookings
          </button>
        ) : (
          <Link 
            href="/bookings"
            className="flex h-4 shrink-0 items-center whitespace-nowrap text-[13px] leading-4 font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            Bookings
          </Link>
        )}
        <span className="h-4 shrink-0 text-[13px] leading-4 font-normal text-[#94A3B8]">/</span>
        <span className="shrink-0 whitespace-nowrap text-[13px] leading-4 font-semibold text-[#0F172A]">{displayId}</span>
      </div>

      {/* 2. BOOKING HERO BANNER CARD */}
      <div className="box-border flex min-h-[98px] w-full min-w-0 flex-wrap items-center justify-between gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-4 sm:p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF]">
            <Calendar className="w-[24px] h-[24px] text-[#4F46E5]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h1 className="min-w-0 break-words text-[20px] leading-[26px] font-bold text-[#0F172A] sm:text-[22px] sm:leading-[27px]">
                Booking {displayId}
              </h1>
              <span className={`shrink-0 rounded-xl px-2 py-1 text-[11px] leading-[13px] font-semibold ${
                isCancelled
                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                  : booking.status === 'COMPLETED'
                    ? 'bg-[#DBEAFE] text-[#1E40AF]'
                    : booking.status === 'PENDING'
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#D1FAE5] text-[#065F46]'
              }`}>
                {formattedStatus}
              </span>
            </div>
            <p className="m-0 break-words text-[14px] leading-[17px] font-normal text-[#64748B]">
              Scheduled for {formattedDate}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">
          <button 
            onClick={() => { setRescheduleValue(bookingDateValue); setShowRescheduleForm((open) => !open); }}
            className="box-border flex h-[37px] shrink-0 items-center gap-2 rounded-[8px] border border-[#E2E8F0] px-4 py-2.5 cursor-pointer hover:bg-[#F8FAFC]"
          >
            <Calendar className="h-[14px] w-[14px] shrink-0 text-[#475569]" />
            <span className="whitespace-nowrap text-[14px] leading-[17px] font-semibold text-[#475569]">Reschedule</span>
          </button>
          <button 
            onClick={() => statusMutation.mutate(isCancelled ? 'CONFIRMED' : 'CANCELLED')}
            disabled={statusMutation.isPending}
            className="flex h-[37px] shrink-0 items-center rounded-[8px] bg-[#FEE2E2] px-4 py-2.5 cursor-pointer hover:bg-[#FCA5A5] disabled:cursor-wait disabled:opacity-60"
          >
            <span className="whitespace-nowrap text-[14px] leading-[17px] font-semibold text-[#991B1B]">{isCancelled ? 'Reactivate' : 'Cancel Booking'}</span>
          </button>
        </div>
      </div>

      {showRescheduleForm && (
        <form onSubmit={handleReschedule} className="flex w-full min-w-0 flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-[12px] font-semibold text-[#475569]">
            New date and time
            <input
              required
              value={rescheduleValue}
              onChange={(event) => setRescheduleValue(event.target.value)}
              className="h-10 rounded-[6px] border border-[#CBD5E1] px-3 text-[13px] font-normal text-[#0F172A] focus:border-[#4F46E5] focus:outline-none"
            />
          </label>
          <button type="submit" className="h-10 rounded-[6px] bg-[#4F46E5] px-4 text-[13px] font-semibold text-white hover:bg-[#4338CA]">
            Save New Time
          </button>
        </form>
      )}

      {/* 3. MAIN GRID (Width: 1136px, Height: 409px) */}
      <div className="w-[1136px] h-[409px] flex flex-row items-start gap-[24px]">
        {/* LEFT COLUMN */}
        <div className="w-[712px] h-[400px] flex flex-col gap-[24px]">
          {/* Booking Meeting Logistics */}
          <div className="box-border w-[712px] h-[261px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
            <h2 className="w-[208px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A]">Booking Meeting Logistics</h2>
            <div className="w-[672px] h-[186px] flex flex-col gap-[12px]">
              <div className="box-border w-[672px] h-[24px] border-b border-[#E2E8F0] pb-[8px] flex items-center justify-between">
                <span className="w-[80px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Reference</span>
                <span className="w-[141px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">{displayId}</span>
              </div>
              <div className="box-border w-[672px] h-[24px] border-b border-[#E2E8F0] pb-[8px] flex items-center justify-between">
                <span className="w-[98px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Scheduled Date</span>
                <span className="w-[109px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">{new Date(booking.bookingDate).toLocaleDateString()}</span>
              </div>
              <div className="box-border w-[672px] h-[24px] border-b border-[#E2E8F0] pb-[8px] flex items-center justify-between">
                <span className="w-[112px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Meeting Time Slot</span>
                <span className="w-[157px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">{formattedTime}</span>
              </div>
              <div className="box-border w-[672px] h-[24px] border-b border-[#E2E8F0] pb-[8px] flex items-center justify-between">
                <span className="w-[107px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Meeting Location</span>
                <span className="w-[179px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#4F46E5] text-right">—</span>
              </div>
              <div className="w-[672px] h-[42px] flex flex-col gap-[4px] pt-[4px]">
                <span className="w-[124px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Client Special Notes</span>
                <p className="w-[672px] h-[18px] text-[13px] leading-[18px] font-normal text-[#475569]">—</p>
              </div>
            </div>
          </div>

          {/* Customer Overview */}
          <div className="box-border w-[712px] h-[115px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
            <h2 className="w-[157px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A]">Customer Overview</h2>
            <div className="w-[672px] h-[40px] flex items-center justify-between">
              <div className="w-[204px] h-[40px] flex items-center gap-[12px]">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[13px] font-semibold text-[#4338CA]">
                  {customerInitials}
                </div>
                <div className="w-[152px] h-[31px] flex flex-col gap-[2px]">
                  <span className="w-[180px] truncate h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">{customerName}</span>
                  <span className="w-[152px] h-[13px] text-[11px] leading-[13px] font-normal text-[#64748B]">
                    {customerEmail}
                  </span>
                </div>
              </div>
              <span className="w-[166px] h-[15px] text-[12px] leading-[15px] font-normal text-[#475569]">
                {customerEmail}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-[400px] h-[409px] flex flex-col gap-[24px]">
          {/* Payment Ledger Breakdown */}
          <div className="box-border w-[400px] h-[152px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
            <h2 className="w-[220px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A]">Payment Ledger Breakdown</h2>
            <div className="w-[360px] h-[77px] flex flex-col gap-[12px]">
              <div className="w-[360px] h-[16px] flex items-center justify-between">
                <span className="w-[88px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Billing Amount</span>
                <span className="w-[53px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">—</span>
              </div>
              <div className="w-[360px] h-[21px] flex items-center justify-between">
                <span className="w-[97px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Payment Status</span>
                <div className="w-[40px] h-[21px] flex items-start px-[8px] py-[4px] bg-[#F1F5F9] rounded-[12px]">
                  <span className="w-[24px] h-[13px] text-[11px] leading-[13px] font-semibold text-[#64748B]">—</span>
                </div>
              </div>
              <div className="w-[360px] h-[16px] flex items-center justify-between">
                <span className="w-[73px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Invoice Link</span>
                <span className="w-[77px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#4F46E5] text-right hover:underline cursor-pointer">
                  —
                </span>
              </div>
            </div>
          </div>

          {/* Booking Lifecycle Logs */}
          <div className="box-border w-[400px] h-[233px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
            <h2 className="w-[181px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A]">Booking Lifecycle Logs</h2>
            <div className="w-[360px] h-[158px] flex flex-col gap-[16px]">
              {/* Step 1 */}
              <div className="w-[360px] h-[42px] flex items-start gap-[12px]">
                <div className="w-[20px] h-[20px] bg-[#D1FAE5] rounded-[10px] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-[12px] h-[12px] text-[#10B981]" />
                </div>
                <div className="w-[328px] h-[42px] flex flex-col gap-[1px]">
                  <span className="w-[106px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#0F172A]">Booking created</span>
                  <span className="w-[133px] h-[13px] text-[11px] leading-[13px] font-normal text-[#475569]">Created in the backend</span>
                  <span className="w-[63px] h-[12px] text-[10px] leading-[12px] font-normal text-[#64748B]">{new Date(booking.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="w-[360px] h-[42px] flex items-start gap-[12px]">
                <div className="w-[20px] h-[20px] bg-[#D1FAE5] rounded-[10px] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-[12px] h-[12px] text-[#10B981]" />
                </div>
                <div className="w-[328px] h-[42px] flex flex-col gap-[1px]">
                  <span className="w-[140px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#0F172A]">Last updated</span>
                  <span className="w-[179px] h-[13px] text-[11px] leading-[13px] font-normal text-[#475569]">Current status: {formattedStatus}</span>
                  <span className="w-[64px] h-[12px] text-[10px] leading-[12px] font-normal text-[#64748B]">{new Date(booking.updatedAt).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
