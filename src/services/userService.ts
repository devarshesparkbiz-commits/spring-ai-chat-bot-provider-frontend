import { api } from './api';
import type { User, AdminUserFormData, CompanyUserFormData, DropdownItem } from '../types/user';
import type { PaginatedResponse } from './companyService';

export interface CommonResponse {
  message: string;
}

export const userService = {
  // ── Admin Users ──────────────────────────────────────────────
  getAdminUsersPage: (pageNumber: number, pageSize: number) =>
    api.get<PaginatedResponse<User>>(
      `/admin-user/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  createAdminUser: (data: AdminUserFormData) =>
    api.post<CommonResponse>('/admin-user', data),

  updateAdminUser: (id: number, data: AdminUserFormData) =>
    api.put<CommonResponse>(`/admin-user/${id}`, data),

  softDeleteAdminUser: (id: number) =>
    api.delete<CommonResponse>(`/admin-user/${id}`),

  getAdminUserDropdown: () =>
    api.get<DropdownItem[]>('/admin-user/dropdown'),

  // ── Company Users ────────────────────────────────────────────
  getCompanyUsersPage: (pageNumber: number, pageSize: number, companyId?: number | null) => {
    const base = `/company-user/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const url = companyId != null ? `${base}&companyId=${companyId}` : base;
    return api.get<PaginatedResponse<User>>(url);
  },

  createCompanyUser: (data: CompanyUserFormData) =>
    api.post<CommonResponse>('/company-user', data),

  updateCompanyUser: (id: number, data: CompanyUserFormData) =>
    api.put<CommonResponse>(`/company-user/${id}`, data),

  softDeleteCompanyUser: (id: number) =>
    api.delete<CommonResponse>(`/company-user/${id}`),

  getCompanyUserDropdown: () =>
    api.get<DropdownItem[]>('/company-user/dropdown'),
};
