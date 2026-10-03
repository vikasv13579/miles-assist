'use client';

import React, { useEffect, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: { name: string; email: string; phone?: string; status: 'ACTIVE' | 'INACTIVE' }) => Promise<void>;
  initialUser?: { name: string; email: string; phone: string | null; status: 'Active' | 'Inactive' } | null;
}

export default function AddUserModal({ isOpen, onClose, onAddUser, initialUser }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialUser?.name ?? '');
    setEmail(initialUser?.email ?? '');
    setPhone(initialUser?.phone ?? '');
    setStatus(initialUser?.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE');
    setError('');
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide both name and email address.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onAddUser({ name, email, phone: phone.trim() || undefined, status });
      setName('');
      setEmail('');
      setPhone('');
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save user.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-[12px] shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-[#0F172A]">
            <UserPlus className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="text-[16px] font-bold">{initialUser ? 'Edit User' : 'Add New User'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-[6px] text-[13px] text-[#EF4444]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0F172A]">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Jane Cooper"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[38px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0F172A]">Email Address</label>
            <input
              type="email"
              placeholder="e.g. jane.c@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[38px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0F172A]">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-[38px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0F172A]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="h-[38px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold text-[#475569]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-[13px] font-semibold shadow-xs"
            >
              {isSaving ? 'Saving…' : initialUser ? 'Save Changes' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
