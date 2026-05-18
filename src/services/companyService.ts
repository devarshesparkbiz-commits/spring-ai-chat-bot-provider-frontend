import { api } from './api';
import type { Company } from '../types/company';
import type { DropdownItem } from '../types/user';

export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

export const companyService = {
  getPage: (pageNumber: number, pageSize: number) =>
    api.get<PaginatedResponse<Company>>(
      `/company/pagination?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  create: (company: Omit<Company, 'companyId'>) =>
    api.post<Company>('/company', company),

  update: (id: number, company: Omit<Company, 'companyId'>) =>
    api.put<Company>(`/company/${id}`, company),

  delete: (id: number) => api.delete<void>(`/company/${id}`),

  getDropdown: () => api.get<DropdownItem[]>('/company/dropdown'),
};
