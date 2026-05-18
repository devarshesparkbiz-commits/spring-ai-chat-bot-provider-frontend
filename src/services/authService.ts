import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

// Backend LoginResponse only returns token + message.
// Role is embedded in the JWT claims.
export interface LoginResult {
  token: string;
  message: string;
}

/** Decode the userRole claim from the JWT payload without verifying the signature. */
export function extractRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userRole ?? null;
  } catch {
    return null;
  }
}

/** Decode the companyId claim from the JWT payload. */
export function extractCompanyIdFromToken(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.companyId != null ? Number(decoded.companyId) : null;
  } catch {
    return null;
  }
}

export const authService = {
  login: (payload: LoginPayload) => api.post<LoginResult>('/auth/login', payload),
};
