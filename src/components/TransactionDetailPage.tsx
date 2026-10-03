'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Printer,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { fetchTransactionById, updateTransactionStatus } from '@/lib/api';

interface TransactionDetailPageProps {
  transactionId?: string;
  onBack?: () => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export default function TransactionDetailPage({
  transactionId,
  onBack,
}: TransactionDetailPageProps) {
  const queryClient = useQueryClient();
  const {
    data: transaction,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => fetchTransactionById(transactionId!),
    enabled: Boolean(transactionId),
  });
  const refundMutation = useMutation({
    mutationFn: () => updateTransactionStatus(transaction!.id, 'REFUNDED'),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
      ]);
    },
  });

  if (isLoading) {
    return (
      <div className="w-full rounded-lg border border-[#E2E8F0] bg-white p-6 text-[13px] text-[#64748B]">
        Loading transaction…
      </div>
    );
  }

  if (!transactionId || isError || !transaction) {
    return (
      <div
        role="alert"
        className="w-full rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[13px] text-[#991B1B]"
      >
        {isError
          ? error instanceof Error
            ? error.message
            : 'Could not load transaction.'
          : 'Transaction ID is required.'}
        {onBack && (
          <button onClick={onBack} className="ml-3 font-semibold underline">
            Back
          </button>
        )}
      </div>
    );
  }

  const refunded = transaction.status === 'REFUNDED';
  const formattedStatus =
    transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase();
  const formattedAmount = transaction.amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const createdAt = formatDate(transaction.createdAt);
  const updatedAt = formatDate(transaction.updatedAt);
  const customerName = transaction.user?.name ?? transaction.userId;
  const customerEmail = transaction.user?.email ?? '—';
  const statusClasses =
    transaction.status === 'SUCCESS'
      ? 'bg-[#D1FAE5] text-[#065F46]'
      : transaction.status === 'PENDING'
        ? 'bg-[#FEF3C7] text-[#92400E]'
        : transaction.status === 'REFUNDED'
          ? 'bg-[#E0E7FF] text-[#3730A3]'
          : 'bg-[#FEE2E2] text-[#991B1B]';

  const backAction = onBack ? (
    <button
      onClick={onBack}
      aria-label="Back to transactions"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#0F172A] hover:bg-[#F1F5F9]"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  ) : (
    <Link
      href="/transactions"
      aria-label="Back to transactions"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#0F172A] hover:bg-[#F1F5F9]"
    >
      <ArrowLeft className="h-5 w-5" />
    </Link>
  );

  const refundButton = (mobile = false) => (
    <button
      onClick={() => refundMutation.mutate()}
      disabled={
        refunded ||
        transaction.status !== 'SUCCESS' ||
        refundMutation.isPending
      }
      className={`flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-4 text-white transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:bg-[#A5B4FC] ${
        mobile ? 'flex-1' : 'whitespace-nowrap'
      }`}
    >
      <RotateCcw className="h-[14px] w-[14px] shrink-0" />
      <span className="text-[13px] font-semibold sm:text-[14px]">
        {refundMutation.isPending
          ? 'Updating…'
          : refunded
            ? 'Refunded'
            : mobile
              ? 'Refund'
              : 'Refund Transaction'}
      </span>
    </button>
  );

  const printButton = (mobile = false) => (
    <button
      onClick={() => window.print()}
      className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] px-4 text-[#475569] transition-colors hover:bg-[#F8FAFC] ${
        mobile ? 'flex-1' : 'whitespace-nowrap'
      }`}
    >
      <Printer className="h-[14px] w-[14px] shrink-0" />
      <span className="text-[13px] font-semibold sm:text-[14px]">Print Receipt</span>
    </button>
  );

  const detailRows = [
    { label: 'Status', value: formattedStatus },
    { label: 'Reference', value: transaction.reference },
    { label: 'Transaction ID', value: transaction.id, breakValue: true },
    { label: 'Created', value: createdAt },
  ];

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-4 font-sans lg:gap-6">
      <div className="flex min-h-14 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          {backAction}
          <span className="truncate text-base font-bold text-[#0F172A]">
            Transaction Details
          </span>
        </div>
        <button
          onClick={() => window.print()}
          aria-label="Print receipt"
          className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0]"
        >
          <Printer className="h-4 w-4 text-[#475569]" />
        </button>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-4 px-4 pb-4 lg:gap-6 lg:px-0 lg:pb-0">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-2 text-[13px] lg:flex"
        >
          {onBack ? (
            <button
              onClick={onBack}
              className="font-medium text-[#64748B] hover:text-[#0F172A]"
            >
              Transactions
            </button>
          ) : (
            <Link
              href="/transactions"
              className="font-medium text-[#64748B] hover:text-[#0F172A]"
            >
              Transactions
            </Link>
          )}
          <span className="text-[#94A3B8]">/</span>
          <span className="min-w-0 truncate font-semibold text-[#0F172A]">
            {transaction.reference}
          </span>
        </nav>

        <section className="hidden w-full min-w-0 items-center justify-between gap-6 rounded-lg border border-[#E2E8F0] bg-white p-5 lg:flex lg:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5]">
              <ArrowRightLeft className="h-6 w-6 text-[#10B981]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-all text-xl font-bold leading-tight text-[#0F172A] xl:text-[22px]">
                  Transaction {transaction.reference}
                </h1>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses}`}
                >
                  {formattedStatus}
                </span>
              </div>
              <p className="mt-1 break-all text-[13px] text-[#64748B] sm:text-[14px]">
                {transaction.reference} <span aria-hidden="true">•</span> {createdAt}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {printButton()}
            {refundButton()}
          </div>
        </section>

        <section className="flex w-full flex-col items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-5 lg:hidden">
          <span className="max-w-full break-all text-center text-[13px] font-medium text-[#64748B]">
            {transaction.reference}
          </span>
          <span className="max-w-full break-all text-center text-[32px] font-extrabold leading-[39px] text-[#0F172A]">
            {formattedAmount}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusClasses}`}
          >
            {formattedStatus}
          </span>
        </section>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:hidden">
          {refundButton(true)}
          {printButton(true)}
        </div>
        {refundMutation.isError && (
          <p role="alert" className="text-[13px] text-[#B91C1C]">
            {refundMutation.error instanceof Error
              ? refundMutation.error.message
              : 'Could not update the transaction status.'}
          </p>
        )}

        <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.78fr)_minmax(0,1fr)] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
            <section className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5">
              <h2 className="text-sm font-bold text-[#0F172A] lg:text-base">
                Transaction Invoice Details
              </h2>
              <dl className="mt-4 flex flex-col">
                {detailRows.map(({ label, value, breakValue }) => (
                  <div
                    key={label}
                    className="flex min-w-0 items-start justify-between gap-4 border-b border-[#E2E8F0] py-3 last:border-b-0"
                  >
                    <dt className="shrink-0 text-[13px] text-[#64748B]">
                      {label}
                    </dt>
                    <dd
                      className={`min-w-0 text-right text-[13px] font-semibold text-[#0F172A] ${
                        breakValue ? 'break-all' : 'break-words'
                      }`}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 pt-3">
                  <dt className="text-[14px] font-bold text-[#0F172A]">
                    Grand Total
                  </dt>
                  <dd className="text-right text-xl font-bold text-[#4F46E5]">
                    {formattedAmount}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5">
              <h2 className="text-sm font-bold text-[#0F172A] lg:text-base">
                Customer Profile Summary
              </h2>
              <div className="mt-4 flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] font-bold text-[#4338CA]">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#0F172A]">
                    {customerName}
                  </p>
                  <p className="break-all text-[12px] text-[#64748B]">
                    {customerEmail}
                  </p>
                  <p className="break-all text-[11px] text-[#94A3B8]">
                    User ID: {transaction.userId}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold text-[#0F172A] lg:text-base">
              Transaction Timestamps
            </h2>
            <ol className="mt-5 space-y-4">
              <li className="flex gap-3">
                <div className="flex w-6 shrink-0 flex-col items-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D1FAE5]">
                    <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  </span>
                  <span className="mt-1 w-px flex-1 bg-[#E2E8F0]" />
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-[13px] font-semibold text-[#0F172A]">
                    Created
                  </p>
                  <p className="break-all text-[12px] text-[#475569]">
                    {transaction.reference}
                  </p>
                  <time
                    dateTime={transaction.createdAt}
                    className="text-[11px] text-[#64748B]"
                  >
                    {createdAt}
                  </time>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex w-6 shrink-0 flex-col items-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF2FF]">
                    <Check className="h-3.5 w-3.5 text-[#4F46E5]" />
                  </span>
                  <span className="mt-1 w-px flex-1 bg-[#E2E8F0]" />
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-[13px] font-semibold text-[#0F172A]">
                    Last Updated
                  </p>
                  <p className="text-[12px] text-[#475569]">
                    Current status: {formattedStatus}
                  </p>
                  <time
                    dateTime={transaction.updatedAt}
                    className="text-[11px] text-[#64748B]"
                  >
                    {updatedAt}
                  </time>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex w-6 shrink-0 justify-center">
                  <span className="mt-1.5 h-3 w-3 rounded-full bg-[#4F46E5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#0F172A]">
                    Amount
                  </p>
                  <p className="text-[12px] text-[#475569]">{formattedAmount}</p>
                  <p className="break-all text-[11px] text-[#64748B]">
                    {transaction.id}
                  </p>
                </div>
              </li>
            </ol>
          </section>
        </div>

        <section className="hidden w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-5 lg:block">
          <h2 className="text-base font-bold text-[#0F172A]">
            Transaction Record
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-[#F8FAFC] text-[12px] font-semibold text-[#64748B]">
                <tr>
                  <th className="rounded-l-md px-3 py-3">TRANSACTION ID</th>
                  <th className="px-3 py-3">REFERENCE</th>
                  <th className="px-3 py-3">AMOUNT</th>
                  <th className="px-3 py-3">STATUS</th>
                  <th className="rounded-r-md px-3 py-3">CREATED AT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E2E8F0] text-[13px]">
                  <td className="break-all px-3 py-4 font-semibold text-[#0F172A]">
                    {transaction.id}
                  </td>
                  <td className="break-all px-3 py-4 text-[#475569]">
                    {transaction.reference}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#0F172A]">
                    {formattedAmount}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses}`}
                    >
                      {formattedStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[#64748B]">
                    {createdAt}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
