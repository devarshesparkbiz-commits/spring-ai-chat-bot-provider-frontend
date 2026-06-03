export type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER';

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  active: boolean;
  userRole?: Role;
  // kept for backward compat — same as userRole
  role?: Role;
  companyId?: number;
  companyName?: string;
  /** Full URL to the user's profile image — null/undefined if not set */
  profileImageUrl?: string;
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
  /** COMPANY_ADMIN = company admin, COMPANY_USER = regular user */
  userRole: 'COMPANY_ADMIN' | 'COMPANY_USER';
  active: boolean;
}

export interface DropdownItem {
  id: number;
  name: string;
}
