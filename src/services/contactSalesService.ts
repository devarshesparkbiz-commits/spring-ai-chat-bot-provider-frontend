import { api } from './api';
import type { PaginatedResponse } from './companyService';

export interface ContactSalesRequest {
  fullName: string;
  email: string;
  companyName: string;
  message?: string;
}

export type ContactSalesStatus = 'NEW' | 'COMPLIED' | 'COMPLIED_X2' | 'GHOSTED';

export interface ContactSalesEntry {
  id: number;
  fullName: string;
  email: string;
  companyName: string;
  message?: string;
  read: boolean;
  status: ContactSalesStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ── Status flow definition ────────────────────────────────────────────────────
export const STATUS_FLOW: ContactSalesStatus[] = ['NEW', 'COMPLIED', 'COMPLIED_X2', 'GHOSTED'];

export const STATUS_META: Record<ContactSalesStatus, {
  label: string;
  color: string;
  bg: string;
  next: ContactSalesStatus | null;
  nextLabel: string | null;
}> = {
  NEW: {
    label: 'New',
    color: '#5865f2',
    bg: 'rgba(88,101,242,0.12)',
    next: 'COMPLIED',
    nextLabel: 'Mark Complied →',
  },
  COMPLIED: {
    label: 'Complied',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.12)',
    next: 'COMPLIED_X2',
    nextLabel: 'Mark Complied ×2 →',
  },
  COMPLIED_X2: {
    label: 'Complied ×2',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    next: 'GHOSTED',
    nextLabel: 'Mark Ghosted →',
  },
  GHOSTED: {
    label: 'Ghosted',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
    next: null,
    nextLabel: null,
  },
};

const API_BASE = 'http://localhost:8080';

/** Public — no auth token needed */
export async function submitContactSales(data: ContactSalesRequest): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/contact-sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => 'Submission failed'));
  return res.json();
}

/** SUPER_ADMIN */
export const contactSalesAdminService = {
  list: (pageNumber = 0, pageSize = 20) =>
    api.get<PaginatedResponse<ContactSalesEntry>>(
      `/contact-sales?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  unreadCount: () =>
    api.get<number>('/contact-sales/unread-count'),

  markRead: (id: number) =>
    api.patch<{ message: string }>(`/contact-sales/${id}/read`),

  updateStatus: (id: number, status: ContactSalesStatus) =>
    api.patch<ContactSalesEntry>(`/contact-sales/${id}/status?status=${status}`),
};
