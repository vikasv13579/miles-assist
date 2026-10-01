'use client';

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: { name: string; email: string; role: 'Admin' | 'Editor' | 'Viewer'; status: 'Active' | 'Inactive' | 'Suspended' }) => void;
}

export default function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide both name and email address.');
      return;
    }
    setError('');
    onAddUser({ name, email, role, status });
    setName('');
    setEmail('');
    setRole('Editor');
    setStatus('Active');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-[12px] shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-[#0F172A]">
            <UserPlus className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="text-[16px] font-bold">Add New User</h3>
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
              <label className="text-[13px] font-semibold text-[#0F172A]">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Editor' | 'Viewer')}
                className="h-[38px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0F172A]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'Suspended')}
                className="h-[38px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] focus:outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
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
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-[13px] font-semibold shadow-xs"
            >
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
