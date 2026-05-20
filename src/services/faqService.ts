import { api } from './api';
import type { Faq, FaqFormData } from '../types/faq';
import type { PaginatedResponse } from './companyService';

export interface CommonResponse {
  message: string;
}

// ── SUPER_ADMIN: company identified by URL param ──────────────────────────────
export const faqService = {
  getByCompanyPaginated: (companyId: number, pageNumber: number, pageSize: number) =>
    api.get<PaginatedResponse<Faq>>(
      `/faq/company/${companyId}/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  getByCompany: (companyId: number) =>
    api.get<Faq[]>(`/faq/company/${companyId}`),

  getById: (faqId: number) =>
    api.get<Faq>(`/faq/${faqId}`),

  create: (data: FaqFormData) =>
    api.post<CommonResponse>('/faq', data),

  update: (faqId: number, data: FaqFormData) =>
    api.put<CommonResponse>(`/faq/${faqId}`, data),

  softDelete: (faqId: number) =>
    api.delete<CommonResponse>(`/faq/${faqId}`),
};

// ── COMPANY_ADMIN: companyId resolved server-side from JWT ────────────────────
export const myCompanyFaqService = {
  getPaginated: (pageNumber: number, pageSize: number) =>
    api.get<PaginatedResponse<Faq>>(
      `/faq/my-company/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  create: (data: Omit<FaqFormData, 'companyId'>) =>
    api.post<CommonResponse>('/faq/my-company', data),

  update: (faqId: number, data: Omit<FaqFormData, 'companyId'>) =>
    api.put<CommonResponse>(`/faq/my-company/${faqId}`, data),
};
