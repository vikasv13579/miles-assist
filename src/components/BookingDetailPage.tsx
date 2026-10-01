'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  XCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Video, 
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface BookingDetailPageProps {
  bookingId?: string;
  bookingDateTime?: string;
  onReschedule?: (dateTime: string) => void;
  onBack?: () => void;
}

export default function BookingDetailPage({
  bookingId = '#BKG-2341',
  bookingDateTime = 'Oct 15, 2024 14:00',
  onReschedule,
  onBack
}: BookingDetailPageProps) {
  const [isCancelled, setIsCancelled] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(bookingDateTime);
  const [rescheduleValue, setRescheduleValue] = useState(bookingDateTime);

  const handleReschedule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScheduledAt(rescheduleValue);
    onReschedule?.(rescheduleValue);
    setShowRescheduleForm(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
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
            <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">{bookingId}</span>
            <h2 className="text-[20px] leading-[24px] font-bold text-[#0F172A] text-center w-full">Business Consultation</h2>
            <div className="flex flex-row items-center gap-[8px]">
              {isCancelled ? (
                <div className="flex px-[10px] py-[4px] bg-[#FEE2E2] rounded-[12px]">
                  <span className="text-[11px] leading-[13px] font-bold text-[#991B1B]">Cancelled</span>
                </div>
              ) : (
                <>
                  <div className="flex px-[10px] py-[4px] bg-[#D1FAE5] rounded-[12px]">
                    <span className="text-[11px] leading-[13px] font-bold text-[#065F46]">Active</span>
                  </div>
                  <div className="flex px-[10px] py-[4px] bg-[#EEF2FF] rounded-[12px]">
                    <span className="text-[11px] leading-[13px] font-bold text-[#4F46E5]">Completed</span>
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
                  onClick={() => { setRescheduleValue(scheduledAt); setShowRescheduleForm(true); }} 
                  className="flex-1 h-[41px] bg-[#4F46E5] rounded-[8px] flex items-center justify-center text-[14px] leading-[17px] font-semibold text-white"
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => setIsCancelled(!isCancelled)}
                  className="flex-1 h-[41px] border border-[#991B1B] rounded-[8px] flex items-center justify-center text-[14px] leading-[17px] font-semibold text-[#991B1B] box-border bg-white"
                >
                  {isCancelled ? 'Reactivate' : 'Cancel Booking'}
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
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">Business Consult</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Date</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">{scheduledAt.split(' ')[0] + ' ' + scheduledAt.split(' ')[1] + ' ' + scheduledAt.split(' ')[2]}</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Time</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">2:00 PM - 3:30 PM</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Format</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">Virtual Meeting</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Location</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A] truncate max-w-[175px]">Zoom Link Provided</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Notes</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A] w-[224px] text-right">Need assistance with expanding our payment gateway.</span>
              </div>
            </div>
          </div>

          {/* Customer Overview */}
          <div className="flex flex-col p-[16px] gap-[12px] w-[358px] bg-white border border-[#E2E8F0] rounded-[8px] box-border">
            <h3 className="text-[14px] leading-[17px] font-bold text-[#0F172A]">Customer Overview</h3>
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Name</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Sarah Johnson</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Email</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">sarah.johnson@example.com</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Phone</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">+1 234 567 8900</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Total Bookings</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#4F46E5]">12 Completed Bookings</span>
              </div>
            </div>
          </div>

          {/* Payment Ledger Breakdown */}
          <div className="flex flex-col p-[16px] gap-[12px] w-[358px] bg-white border border-[#E2E8F0] rounded-[8px] box-border">
            <h3 className="text-[14px] leading-[17px] font-bold text-[#0F172A]">Payment Ledger Breakdown</h3>
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Amount</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">$180.00</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Payment Status</span>
                <span className="text-[13px] leading-[16px] font-semibold text-[#065F46]">Paid</span>
              </div>
              <div className="flex justify-between items-center pb-[10px] border-b border-[#E2E8F0]">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Invoice</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#0F172A]">#INV-10294</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] leading-[16px] font-medium text-[#64748B]">Action</span>
                <span className="text-[13px] leading-[16px] font-medium text-[#4F46E5]">View Invoice</span>
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
                  <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Confirmation Sent</span>
                  <span className="text-[12px] leading-[15px] font-normal text-[#64748B]">Outlook invite dispatched</span>
                  <span className="text-[11px] leading-[13px] font-normal text-[#94A3B8]">Oct 12, 10:00</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-row items-start gap-[12px] w-full relative">
                <div className="flex flex-col items-center w-[10px] z-10 pt-[3px]">
                  <div className="w-[10px] h-[10px] bg-[#065F46] rounded-full" />
                </div>
                <div className="flex flex-col gap-[2px] w-[304px]">
                  <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Status Set to Confirmed</span>
                  <span className="text-[12px] leading-[15px] font-normal text-[#64748B]">Consultant assigned automatically</span>
                  <span className="text-[11px] leading-[13px] font-normal text-[#94A3B8]">Oct 12, 09:30</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-row items-start gap-[12px] w-full relative">
                <div className="flex flex-col items-center w-[10px] z-10 pt-[3px]">
                  <div className="w-[10px] h-[10px] bg-[#4F46E5] rounded-full" />
                </div>
                <div className="flex flex-col gap-[2px] w-[304px]">
                  <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">Booking Created</span>
                  <span className="text-[12px] leading-[15px] font-normal text-[#64748B]">Client self-service reservation</span>
                  <span className="text-[11px] leading-[13px] font-normal text-[#94A3B8]">Oct 12, 09:28</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex w-[1136px] flex-col gap-[24px] mx-auto font-sans pt-[32px]">
      {/* 1. BREADCRUMB FRAME (Width: 1136px, Height: 16px) */}
      <div className="w-[1136px] h-[16px] flex items-center gap-[8px]">
        {onBack ? (
          <button 
            onClick={onBack}
            className="w-[58px] h-[16px] flex items-center text-[13px] leading-[16px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            Bookings
          </button>
        ) : (
          <Link 
            href="/bookings"
            className="w-[58px] h-[16px] flex items-center text-[13px] leading-[16px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            Bookings
          </Link>
        )}
        <span className="w-[5px] h-[16px] text-[13px] leading-[16px] font-normal text-[#94A3B8]">/</span>
        <span className="w-[73px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">{bookingId}</span>
      </div>

      {/* 2. BOOKING HERO BANNER CARD */}
      <div className="box-border w-[1136px] h-[98px] bg-white border border-[#E2E8F0] rounded-[8px] p-[24px] flex items-center justify-between">
        <div className="w-[495px] h-[50px] flex items-center gap-[20px]">
          <div className="w-[48px] h-[48px] bg-[#EEF2FF] rounded-[24px] flex items-center justify-center shrink-0">
            <Calendar className="w-[24px] h-[24px] text-[#4F46E5]" />
          </div>
          <div className="w-[427px] h-[50px] flex flex-col gap-[6px]">
            <div className="w-[389px] h-[27px] flex items-center gap-[12px]">
              <h1 className="w-[217px] h-[27px] text-[22px] leading-[27px] font-bold text-[#0F172A]">
                Booking {bookingId}
              </h1>
              {isCancelled ? (
                <div className="w-[75px] h-[21px] flex items-start px-[8px] py-[4px] bg-[#FEE2E2] rounded-[12px]">
                  <span className="w-[59px] h-[13px] text-[11px] leading-[13px] font-semibold text-[#991B1B]">Cancelled</span>
                </div>
              ) : (
                <>
                  <div className="w-[73px] h-[21px] flex items-start px-[8px] py-[4px] bg-[#D1FAE5] rounded-[12px]">
                    <span className="w-[57px] h-[13px] text-[11px] leading-[13px] font-semibold text-[#065F46]">Confirmed</span>
                  </div>
                  <div className="w-[75px] h-[21px] flex items-start px-[8px] py-[4px] bg-[#DBEAFE] rounded-[12px]">
                    <span className="w-[59px] h-[13px] text-[11px] leading-[13px] font-semibold text-[#1E40AF]">Completed</span>
                  </div>
                </>
              )}
            </div>
            <p className="w-[427px] h-[17px] text-[14px] leading-[17px] font-normal text-[#64748B]">
              Virtual Consultation Room • Scheduled for Oct 15, 2024 at 14:00
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-[284px] h-[37px] flex items-start gap-[12px]">
          <button 
            onClick={() => { setRescheduleValue(scheduledAt); setShowRescheduleForm((open) => !open); }} 
            className="box-border w-[134px] h-[37px] flex items-center px-[16px] py-[10px] gap-[8px] border border-[#E2E8F0] rounded-[8px] cursor-pointer hover:bg-[#F8FAFC]"
          >
            <Calendar className="w-[14px] h-[14px] text-[#475569]" />
            <span className="w-[80px] h-[17px] text-[14px] leading-[17px] font-semibold text-[#475569]">Reschedule</span>
          </button>
          <button 
            onClick={() => setIsCancelled(!isCancelled)}
            className="w-[138px] h-[37px] flex items-center px-[16px] py-[10px] gap-[8px] bg-[#FEE2E2] rounded-[8px] cursor-pointer hover:bg-[#FCA5A5]"
          >
            <span className="w-[106px] h-[17px] text-[14px] leading-[17px] font-semibold text-[#991B1B]">{isCancelled ? 'Reactivate' : 'Cancel Booking'}</span>
          </button>
        </div>
      </div>

      {showRescheduleForm && (
        <form onSubmit={handleReschedule} className="w-[1136px] flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-end">
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
                <span className="w-[80px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Service Type</span>
                <span className="w-[141px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">Business Consultation</span>
              </div>
              <div className="box-border w-[672px] h-[24px] border-b border-[#E2E8F0] pb-[8px] flex items-center justify-between">
                <span className="w-[98px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Scheduled Date</span>
                <span className="w-[109px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">October 15, 2024</span>
              </div>
              <div className="box-border w-[672px] h-[24px] border-b border-[#E2E8F0] pb-[8px] flex items-center justify-between">
                <span className="w-[112px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Meeting Time Slot</span>
                <span className="w-[157px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">2:00 PM - 3:30 PM (EST)</span>
              </div>
              <div className="box-border w-[672px] h-[24px] border-b border-[#E2E8F0] pb-[8px] flex items-center justify-between">
                <span className="w-[107px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Meeting Location</span>
                <span className="w-[179px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#4F46E5] text-right">Virtual - Zoom Link Provided</span>
              </div>
              <div className="w-[672px] h-[42px] flex flex-col gap-[4px] pt-[4px]">
                <span className="w-[124px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Client Special Notes</span>
                <p className="w-[672px] h-[18px] text-[13px] leading-[18px] font-normal text-[#475569]">
                  "Need assistance with expanding our payment gateway options and preparing our database backup plans."
                </p>
              </div>
            </div>
          </div>

          {/* Customer Overview */}
          <div className="box-border w-[712px] h-[115px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col gap-[16px]">
            <h2 className="w-[157px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A]">Customer Overview</h2>
            <div className="w-[672px] h-[40px] flex items-center justify-between">
              <div className="w-[204px] h-[40px] flex items-center gap-[12px]">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Sarah Johnson"
                  className="w-[40px] h-[40px] rounded-[20px] object-cover shrink-0"
                />
                <div className="w-[152px] h-[31px] flex flex-col gap-[2px]">
                  <span className="w-[94px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">Sarah Johnson</span>
                  <span className="w-[152px] h-[13px] text-[11px] leading-[13px] font-normal text-[#64748B]">
                    sarah.johnson@example.com
                  </span>
                </div>
              </div>
              <span className="w-[166px] h-[15px] text-[12px] leading-[15px] font-normal text-[#475569]">
                12 Total Bookings Completed
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
                <span className="w-[53px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A] text-right">$180.00</span>
              </div>
              <div className="w-[360px] h-[21px] flex items-center justify-between">
                <span className="w-[97px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Payment Status</span>
                <div className="w-[40px] h-[21px] flex items-start px-[8px] py-[4px] bg-[#D1FAE5] rounded-[12px]">
                  <span className="w-[24px] h-[13px] text-[11px] leading-[13px] font-semibold text-[#065F46]">Paid</span>
                </div>
              </div>
              <div className="w-[360px] h-[16px] flex items-center justify-between">
                <span className="w-[73px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Invoice Link</span>
                <span className="w-[77px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#4F46E5] text-right hover:underline cursor-pointer">
                  #INV-10294
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
                  <span className="w-[106px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#0F172A]">Confirmation Sent</span>
                  <span className="w-[133px] h-[13px] text-[11px] leading-[13px] font-normal text-[#475569]">Outlook invite dispatched</span>
                  <span className="w-[63px] h-[12px] text-[10px] leading-[12px] font-normal text-[#64748B]">Oct 12, 10:00</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="w-[360px] h-[42px] flex items-start gap-[12px]">
                <div className="w-[20px] h-[20px] bg-[#D1FAE5] rounded-[10px] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-[12px] h-[12px] text-[#10B981]" />
                </div>
                <div className="w-[328px] h-[42px] flex flex-col gap-[1px]">
                  <span className="w-[140px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#0F172A]">Status Set to Confirmed</span>
                  <span className="w-[179px] h-[13px] text-[11px] leading-[13px] font-normal text-[#475569]">Consultant assigned automatically</span>
                  <span className="w-[64px] h-[12px] text-[10px] leading-[12px] font-normal text-[#64748B]">Oct 12, 09:30</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="w-[360px] h-[42px] flex items-start gap-[12px]">
                <div className="w-[20px] h-[20px] bg-[#D1FAE5] rounded-[10px] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-[12px] h-[12px] text-[#10B981]" />
                </div>
                <div className="w-[328px] h-[42px] flex flex-col gap-[1px]">
                  <span className="w-[97px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#0F172A]">Booking Created</span>
                  <span className="w-[156px] h-[13px] text-[11px] leading-[13px] font-normal text-[#475569]">Client self-service reservation</span>
                  <span className="w-[64px] h-[12px] text-[10px] leading-[12px] font-normal text-[#64748B]">Oct 12, 09:28</span>
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
