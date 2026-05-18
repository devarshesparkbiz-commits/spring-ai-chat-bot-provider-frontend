export type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER';

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  active: boolean;
  role?: Role;
  companyId?: number;
  companyName?: string;
}

// Matches backend AdminUserRequest
export interface AdminUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  active: boolean;
}

// Matches backend CompanyUserRequest
export interface CompanyUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  companyId: number | '';
  active: boolean;
}

export interface DropdownItem {
  id: number;
  name: string;
}
