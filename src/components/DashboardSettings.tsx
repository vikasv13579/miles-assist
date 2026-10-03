'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDashboardSettings, updateDashboardSettings } from '@/lib/api';
import { SkeletonRows } from '@/components/Skeleton';

function toDateTimeInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function DashboardSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ['dashboard-settings'], queryFn: fetchDashboardSettings });
  const [maintenanceAt, setMaintenanceAt] = useState('');
  const [memoryThreshold, setMemoryThreshold] = useState('90');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!settingsQuery.data) return;
    setMaintenanceAt(toDateTimeInput(settingsQuery.data.maintenanceScheduledAt));
    setMemoryThreshold(String(settingsQuery.data.runtimeMemoryAlertThreshold));
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => updateDashboardSettings({
      maintenanceScheduledAt: maintenanceAt ? new Date(maintenanceAt).toISOString() : null,
      runtimeMemoryAlertThreshold: Number(memoryThreshold),
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] }),
      ]);
      setFeedback('Settings saved to the backend.');
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : 'Could not save settings.'),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    saveMutation.mutate();
  };

  return (
    <section className="flex w-full flex-col gap-4 lg:gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A]">Settings</h1>
        <p className="mt-1 text-[13px] text-[#64748B]">Manage dashboard alert settings stored by the backend.</p>
      </div>

      {settingsQuery.isLoading ? (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4"><SkeletonRows count={3} /></div>
      ) : settingsQuery.isError ? (
        <div role="alert" className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[13px] text-[#991B1B]">
          Settings could not be loaded. <button onClick={() => void settingsQuery.refetch()} className="font-semibold underline">Try again</button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex max-w-[720px] flex-col gap-5 rounded-[8px] border border-[#E2E8F0] bg-white p-4 lg:p-6">
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-[#334155]">
            Scheduled maintenance
            <input
              type="datetime-local"
              value={maintenanceAt}
              onChange={(event) => setMaintenanceAt(event.target.value)}
              className="h-10 rounded-[6px] border border-[#CBD5E1] px-3 font-normal"
            />
            <span className="text-[12px] font-normal text-[#64748B]">Leave blank to remove the scheduled maintenance alert.</span>
          </label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-[#334155]">
            Runtime memory alert threshold
            <div className="flex items-center gap-2">
              <input
                required
                type="number"
                min={50}
                max={99}
                value={memoryThreshold}
                onChange={(event) => setMemoryThreshold(event.target.value)}
                className="h-10 w-28 rounded-[6px] border border-[#CBD5E1] px-3 font-normal"
              />
              <span className="font-normal text-[#64748B]">%</span>
            </div>
            <span className="text-[12px] font-normal text-[#64748B]">Alert when backend runtime heap use reaches this level (50–99%).</span>
          </label>
          {feedback && <p role={saveMutation.isError ? 'alert' : 'status'} className={`text-[13px] ${saveMutation.isError ? 'text-[#991B1B]' : 'text-[#065F46]'}`}>{feedback}</p>}
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="self-start rounded-[6px] bg-[#4F46E5] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      )}
    </section>
  );
}
