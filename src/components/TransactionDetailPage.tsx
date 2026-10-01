'use client';

import React, { useState } from 'react';
import { 
  Printer, 
  RotateCcw, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  ArrowRightLeft,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

interface TransactionDetailPageProps {
  transactionId?: string;
  onBack?: () => void;
}

export default function TransactionDetailPage({
  transactionId = '#TXN-1082',
  onBack
}: TransactionDetailPageProps) {
  const [refunded, setRefunded] = useState(false);

  return (
    <div className="w-full lg:w-[1136px] flex flex-col font-sans mx-auto">
      {/* ---------------- MOBILE TOP NAV ---------------- */}
      <div className="lg:hidden flex items-center justify-between w-[390px] h-[56px] px-[16px] bg-white border-b border-[#E2E8F0] box-border">
        <div className="flex items-center gap-[12px]">
          {onBack ? (
            <button onClick={onBack} className="w-[28px] h-[28px] flex items-center justify-center p-[4px] cursor-pointer text-[#0F172A]">
              <ArrowLeft className="w-[20px] h-[20px]" />
            </button>
          ) : (
            <Link href="/transactions" className="w-[28px] h-[28px] flex items-center justify-center p-[4px] cursor-pointer text-[#0F172A]">
              <ArrowLeft className="w-[20px] h-[20px]" />
            </Link>
          )}
          <span className="w-[143px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A] truncate">Transaction Details</span>
        </div>
        <button 
          onClick={() => window.print()}
          className="w-[28px] h-[28px] rounded-[20px] border border-[#E2E8F0] flex items-center justify-center p-[6px] box-border cursor-pointer"
        >
          <Printer className="w-[16px] h-[16px] text-[#475569]" />
        </button>
      </div>

      {/* ---------------- CONTENT WRAPPER ---------------- */}
      <div className="w-[390px] lg:w-[1136px] flex flex-col gap-[16px] lg:gap-[24px] p-[16px] lg:p-0">
        
        {/* 1. BREADCRUMB FRAME (Desktop Only) */}
        <div className="hidden lg:flex w-[1136px] h-[16px] items-center gap-[8px]">
          {onBack ? (
            <button 
              onClick={onBack}
              className="flex items-center text-[13px] leading-[16px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              Transactions
            </button>
          ) : (
            <Link 
              href="/transactions"
              className="flex items-center text-[13px] leading-[16px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              Transactions
            </Link>
          )}
          <span className="text-[13px] leading-[16px] font-normal text-[#94A3B8]">/</span>
          <span className="text-[13px] leading-[16px] font-semibold text-[#0F172A]">{transactionId}</span>
        </div>

        {/* 2. TRANSACTION HERO BANNER CARD (Desktop Only) */}
        <div className="hidden lg:flex w-[1136px] h-[98px] bg-white border border-[#E2E8F0] rounded-[8px] p-[24px] items-center justify-between">
          <div className="w-[508px] h-[50px] flex items-center gap-[20px]">
            <div className="w-[48px] h-[48px] bg-[#D1FAE5] rounded-[24px] flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-[24px] h-[24px] text-[#10B981]" />
            </div>
            <div className="w-[440px] h-[50px] flex flex-col gap-[6px]">
              <div className="w-[311px] h-[27px] flex items-center gap-[12px]">
                <h1 className="text-[22px] leading-[27px] font-bold text-[#0F172A]">
                  Transaction {transactionId}
                </h1>
                <div className={`w-[40px] h-[21px] flex items-start px-[8px] py-[4px] rounded-[12px] ${
                  refunded ? 'bg-[#FEF3C7]' : 'bg-[#D1FAE5]'
                }`}>
                  <span className={`text-[11px] leading-[13px] font-semibold ${
                    refunded ? 'text-[#92400E]' : 'text-[#065F46]'
                  }`}>
                    {refunded ? 'Refund' : 'Paid'}
                  </span>
                </div>
              </div>
              <p className="w-[440px] h-[17px] text-[14px] leading-[17px] font-normal text-[#64748B]">
                Reference #REF-98342718 • Generated on Sep 27, 2024 11:32 AM
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-[318px] h-[37px] flex items-center gap-[12px]">
            <button 
              onClick={() => window.print()}
              className="w-[141px] h-[37px] flex items-center px-[16px] py-[10px] gap-[8px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <Printer className="w-[14px] h-[14px]" />
              <span className="text-[14px] leading-[17px] font-semibold">Print Receipt</span>
            </button>
            <button 
              onClick={() => setRefunded(!refunded)}
              className="w-[165px] h-[37px] flex items-center px-[16px] py-[10px] gap-[8px] bg-[#4F46E5] text-white rounded-[8px] hover:bg-[#4338CA] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-[14px] h-[14px]" />
              <span className="text-[14px] leading-[17px] font-semibold">{refunded ? 'Undo Refund' : 'Refund Transaction'}</span>
            </button>
          </div>
        </div>

        {/* 2b. MOBILE STATUS HEADER & ACTIONS (Mobile Only) */}
        <div className="flex lg:hidden flex-col gap-[16px] w-[358px]">
          <div className="w-[358px] h-[140px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex flex-col items-center gap-[12px] box-border">
            <span className="w-[150px] h-[16px] text-[13px] leading-[16px] font-medium text-[#64748B] text-center">{transactionId}</span>
            <span className="w-[134px] h-[39px] text-[32px] leading-[39px] font-extrabold text-[#0F172A] text-center">$150.00</span>
            <div className={`w-[80px] h-[21px] flex items-start px-[10px] py-[4px] rounded-[12px] ${
              refunded ? 'bg-[#FEF3C7]' : 'bg-[#D1FAE5]'
            }`}>
              <span className={`w-[60px] h-[13px] text-[11px] leading-[13px] font-bold text-center ${
                refunded ? 'text-[#92400E]' : 'text-[#065F46]'
              }`}>
                {refunded ? 'REFUNDED' : 'PAID'}
              </span>
            </div>
          </div>
          
          <div className="w-[358px] h-[41px] flex items-center gap-[12px]">
            <button 
              onClick={() => setRefunded(!refunded)}
              className="w-[172px] h-[41px] bg-[#4F46E5] rounded-[8px] flex items-center justify-center py-[12px] text-white cursor-pointer flex-1"
            >
              <span className="w-[49px] h-[17px] text-[14px] leading-[17px] font-semibold">{refunded ? 'Undo' : 'Refund'}</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="w-[174px] h-[41px] bg-transparent border border-[#64748B] rounded-[8px] flex items-center justify-center py-[12px] box-border text-[#475569] cursor-pointer flex-1"
            >
              <span className="w-[87px] h-[17px] text-[14px] leading-[17px] font-semibold">Print Receipt</span>
            </button>
          </div>
        </div>

        {/* 3. MAIN GRID (Width: 1136px, Height: 394px on Desktop; stacked on Mobile) */}
        <div className="w-[358px] lg:w-[1136px] flex flex-col lg:flex-row gap-[16px] lg:gap-[24px]">
          {/* LEFT COLUMN */}
          <div className="w-[358px] lg:w-[712px] flex flex-col gap-[16px] lg:gap-[24px]">
            
            {/* Transaction Invoice Details */}
            <div className="w-[358px] lg:w-[712px] h-[229px] lg:h-[247px] bg-white border border-[#E2E8F0] rounded-[8px] p-[16px] lg:p-[20px] flex flex-col gap-[12px] lg:gap-[16px] box-border">
              <h2 className="w-[326px] lg:w-[212px] h-[17px] lg:h-[19px] text-[14px] lg:text-[16px] leading-[17px] lg:leading-[19px] font-bold text-[#0F172A]">
                Transaction Invoice Details
              </h2>
              <div className="w-[326px] lg:w-[672px] h-[168px] lg:h-[172px] flex flex-col gap-[12px]">
                <div className="w-[326px] lg:w-[672px] h-[26px] lg:h-[24px] border-b border-[#E2E8F0] pb-[10px] lg:pb-[8px] flex items-center justify-between box-border">
                  <span className="w-[31px] lg:w-[106px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-normal text-[#64748B]">Type</span>
                  <span className="w-[137px] lg:w-[107px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-semibold text-[#0F172A] lg:text-right">Service Payment</span>
                </div>
                <div className="w-[326px] lg:w-[672px] h-[26px] lg:h-[24px] border-b border-[#E2E8F0] pb-[10px] lg:pb-[8px] flex items-center justify-between box-border">
                  <span className="w-[49px] lg:w-[105px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-normal text-[#64748B]">Method</span>
                  <span className="w-[148px] lg:w-[211px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-semibold text-[#0F172A] lg:text-right">Credit Card (*4582)</span>
                </div>
                <div className="w-[326px] lg:w-[672px] h-[26px] lg:h-[24px] border-b border-[#E2E8F0] pb-[10px] lg:pb-[8px] flex items-center justify-between box-border">
                  <span className="w-[76px] lg:w-[152px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-normal text-[#64748B]">Gateway Fee</span>
                  <span className="w-[113px] lg:w-[38px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-semibold text-[#0F172A] lg:text-right">$4.90</span>
                </div>
                <div className="w-[326px] lg:w-[672px] h-[26px] lg:h-[24px] border-b border-[#E2E8F0] pb-[10px] lg:pb-[8px] flex items-center justify-between box-border">
                  <span className="w-[80px] lg:w-[52px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-normal text-[#64748B]">Subtotal</span>
                  <span className="w-[93px] lg:w-[49px] h-[16px] text-[13px] leading-[16px] font-medium lg:font-semibold text-[#0F172A] lg:text-right">$145.10</span>
                </div>
                <div className="w-[326px] lg:w-[672px] h-[16px] lg:h-[28px] lg:pt-[4px] flex items-center justify-between">
                  <span className="w-[95px] lg:w-[80px] h-[16px] lg:h-[17px] text-[13px] lg:text-[14px] leading-[16px] lg:leading-[17px] font-medium lg:font-bold text-[#64748B] lg:text-[#0F172A]">Grand Total</span>
                  <span className="w-[37px] lg:w-[82px] h-[16px] lg:h-[24px] text-[13px] lg:text-[20px] leading-[16px] lg:leading-[24px] font-medium lg:font-bold text-[#0F172A] lg:text-[#4F46E5] lg:text-right">$150.00</span>
                </div>
              </div>
            </div>

            {/* Customer Profile Summary */}
            <div className="w-[358px] lg:w-[712px] h-[191px] lg:h-[123px] bg-white border border-[#E2E8F0] rounded-[8px] p-[16px] lg:p-[20px] flex flex-col gap-[12px] lg:gap-[16px] box-border">
              <h2 className="w-[326px] lg:w-[211px] h-[17px] lg:h-[19px] text-[14px] lg:text-[16px] leading-[17px] lg:leading-[19px] font-bold text-[#0F172A]">Customer Profile Summary</h2>
              
              {/* Desktop View */}
              <div className="hidden lg:flex w-[672px] h-[48px] items-center gap-[16px]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Albert Flores"
                  className="w-[48px] h-[48px] rounded-[24px] object-cover shrink-0"
                />
                <div className="w-[608px] h-[34px] flex flex-col gap-[2px]">
                  <span className="w-[88px] h-[17px] text-[14px] leading-[17px] font-semibold text-[#0F172A]">Albert Flores</span>
                  <span className="w-[260px] h-[15px] text-[12px] leading-[15px] font-normal text-[#64748B]">
                    sarah.johnson@example.com • ID #USR-4821
                  </span>
                </div>
              </div>

              {/* Mobile View */}
              <div className="flex lg:hidden flex-col gap-[12px] w-[326px] h-[130px]">
                <div className="w-[326px] h-[26px] border-b border-[#E2E8F0] pb-[10px] flex items-center justify-between box-border">
                  <span className="w-[37px] h-[16px] text-[13px] leading-[16px] font-medium text-[#64748B]">Name</span>
                  <span className="w-[82px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">Albert Flores</span>
                </div>
                <div className="w-[326px] h-[26px] border-b border-[#E2E8F0] pb-[10px] flex items-center justify-between box-border">
                  <span className="w-[34px] h-[16px] text-[13px] leading-[16px] font-medium text-[#64748B]">Email</span>
                  <span className="w-[137px] h-[16px] text-[13px] leading-[16px] font-medium text-[#0F172A]">sarah.johnson@example.com</span>
                </div>
                <div className="w-[326px] h-[26px] border-b border-[#E2E8F0] pb-[10px] flex items-center justify-between box-border">
                  <span className="w-[40px] h-[16px] text-[13px] leading-[16px] font-medium text-[#64748B]">User ID</span>
                  <span className="w-[80px] h-[16px] text-[13px] leading-[16px] font-medium text-[#0F172A]">#USR-4821</span>
                </div>
                <div className="w-[326px] h-[16px] flex items-center justify-between">
                  <span className="w-[69px] h-[16px] text-[13px] leading-[16px] font-medium text-[#64748B]">Account</span>
                  <span className="w-[72px] h-[16px] text-[13px] leading-[16px] font-medium text-[#0F172A]">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Processing History */}
          <div className="w-[358px] lg:w-[400px] h-[233px] lg:h-[255px] bg-white border border-[#E2E8F0] rounded-[8px] p-[16px] lg:p-[20px] flex flex-col gap-[12px] lg:gap-[20px] box-border">
            <h2 className="w-[326px] lg:w-[149px] h-[17px] lg:h-[19px] text-[14px] lg:text-[16px] leading-[17px] lg:leading-[19px] font-bold text-[#0F172A]">Processing History</h2>
            
            <div className="w-[326px] lg:w-[360px] h-[172px] lg:h-[176px] flex flex-col gap-[12px] lg:gap-[16px]">
              {/* Step 1 */}
              <div className="w-[326px] lg:w-[360px] h-[50px] lg:h-[48px] flex items-start gap-[12px]">
                <div className="flex flex-col items-center w-[10px] h-[50px] lg:w-[24px] lg:h-[24px]">
                  <div className="w-[10px] h-[10px] bg-[#065F46] lg:bg-transparent lg:w-[24px] lg:h-[24px] rounded-full lg:rounded-[12px] lg:bg-[#D1FAE5] flex items-center justify-center shrink-0">
                    <Check className="hidden lg:block w-[14px] h-[14px] text-[#10B981]" />
                  </div>
                  <div className="lg:hidden w-[40px] h-0 border-2 border-[#E2E8F0] rotate-90 box-border mt-[20px] origin-center" />
                </div>
                <div className="w-[304px] lg:w-[324px] h-[48px] flex flex-col gap-[2px]">
                  <span className="w-[304px] lg:w-[149px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">Completed & Disbursed</span>
                  <span className="w-[304px] lg:w-[192px] h-[15px] text-[12px] leading-[15px] font-normal text-[#64748B] lg:text-[#475569]">Settled in merchant bank account</span>
                  <span className="w-[304px] lg:w-[101px] h-[13px] text-[11px] leading-[13px] font-normal text-[#94A3B8] lg:text-[#64748B]">Sep 27, 2024, 11:32</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="w-[326px] lg:w-[360px] h-[50px] lg:h-[48px] flex items-start gap-[12px]">
                <div className="flex flex-col items-center w-[10px] h-[50px] lg:w-[24px] lg:h-[24px]">
                  <div className="w-[10px] h-[10px] bg-[#4F46E5] lg:bg-transparent lg:w-[24px] lg:h-[24px] rounded-full lg:rounded-[12px] lg:bg-[#EEF2FF] flex items-center justify-center shrink-0">
                    <Check className="hidden lg:block w-[14px] h-[14px] text-[#4F46E5]" />
                  </div>
                  <div className="lg:hidden w-[40px] h-0 border-2 border-[#E2E8F0] rotate-90 box-border mt-[20px] origin-center" />
                </div>
                <div className="w-[304px] lg:w-[324px] h-[48px] flex flex-col gap-[2px]">
                  <span className="w-[304px] lg:w-[155px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">Processing & Authorized</span>
                  <span className="w-[304px] lg:w-[163px] h-[15px] text-[12px] leading-[15px] font-normal text-[#64748B] lg:text-[#475569]">Visa Gateway auth approved</span>
                  <span className="w-[304px] lg:w-[101px] h-[13px] text-[11px] leading-[13px] font-normal text-[#94A3B8] lg:text-[#64748B]">Sep 27, 2024, 11:30</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="w-[326px] lg:w-[360px] h-[48px] flex items-start gap-[12px]">
                <div className="flex flex-col items-center w-[10px] h-[48px] lg:w-[24px] lg:h-[24px]">
                  <div className="w-[10px] h-[10px] bg-[#4F46E5] lg:bg-transparent lg:w-[24px] lg:h-[24px] rounded-full lg:rounded-[12px] lg:bg-[#EEF2FF] flex items-center justify-center shrink-0">
                    <Check className="hidden lg:block w-[14px] h-[14px] text-[#4F46E5]" />
                  </div>
                </div>
                <div className="w-[304px] lg:w-[324px] h-[48px] flex flex-col gap-[2px]">
                  <span className="w-[304px] lg:w-[52px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">Initiated</span>
                  <span className="w-[304px] lg:w-[157px] h-[15px] text-[12px] leading-[15px] font-normal text-[#64748B] lg:text-[#475569]">Checkout session initialized</span>
                  <span className="w-[304px] lg:w-[101px] h-[13px] text-[11px] leading-[13px] font-normal text-[#94A3B8] lg:text-[#64748B]">Sep 27, 2024, 11:28</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM FRAME: Related Customer Ledger Entries (Desktop Only) */}
        <div className="hidden lg:flex w-[1136px] h-[200px] bg-white border border-[#E2E8F0] rounded-[8px] p-[20px] flex-col gap-[12px]">
          <h2 className="w-[259px] h-[19px] text-[16px] leading-[19px] font-bold text-[#0F172A]">Related Customer Ledger Entries</h2>
          
          <div className="w-[1096px] h-[129px] flex flex-col">
            {/* Header Row */}
            <div className="w-[1096px] h-[39px] bg-[#F8FAFC] rounded-[6px] p-[12px] flex items-start gap-[16px]">
              <span className="w-[120px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#64748B]">TRANSACTION ID</span>
              <span className="w-[120px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#64748B]">GATEWAY METHOD</span>
              <span className="w-[100px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#64748B]">AMOUNT</span>
              <span className="w-[120px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#64748B]">STATUS</span>
              <span className="w-[160px] h-[15px] text-[12px] leading-[15px] font-semibold text-[#64748B]">SETTLED AT</span>
            </div>
            
            {/* Row 1 */}
            <div className="w-[1096px] h-[45px] border-b border-[#E2E8F0] p-[12px] flex items-center gap-[16px]">
              <span className="w-[120px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">#TXN-7102</span>
              <span className="w-[120px] h-[16px] text-[13px] leading-[16px] font-normal text-[#475569]">Visa Card (*4582)</span>
              <span className="w-[100px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">$120.00</span>
              <div className="w-[120px] h-[21px] flex items-start">
                <div className="w-[75px] h-[21px] flex items-start px-[8px] py-[4px] bg-[#DBEAFE] rounded-[12px]">
                  <span className="text-[11px] leading-[13px] font-semibold text-[#1E40AF]">Completed</span>
                </div>
              </div>
              <span className="w-[160px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Aug 15, 2024 10:14</span>
            </div>

            {/* Row 2 */}
            <div className="w-[1096px] h-[45px] p-[12px] flex items-center gap-[16px]">
              <span className="w-[120px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">#TXN-5921</span>
              <span className="w-[120px] h-[16px] text-[13px] leading-[16px] font-normal text-[#475569]">Direct PayPal Link</span>
              <span className="w-[100px] h-[16px] text-[13px] leading-[16px] font-semibold text-[#0F172A]">$350.00</span>
              <div className="w-[120px] h-[21px] flex items-start">
                <div className="w-[75px] h-[21px] flex items-start px-[8px] py-[4px] bg-[#DBEAFE] rounded-[12px]">
                  <span className="text-[11px] leading-[13px] font-semibold text-[#1E40AF]">Completed</span>
                </div>
              </div>
              <span className="w-[160px] h-[16px] text-[13px] leading-[16px] font-normal text-[#64748B]">Jul 02, 2024 16:50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
