import { api } from './api';

export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  userRole: string;
  companyName?: string;
  profileImagePath?: string;
  profileImageUrl?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  mobileNumber?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const API_BASE = 'http://localhost:8080';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const profileService = {
  get: () =>
    api.get<UserProfile>('/profile'),

  update: (data: UpdateProfilePayload) =>
    api.put<UserProfile>('/profile', data),

  changePassword: (data: ChangePasswordPayload) =>
    api.put<{ message: string }>('/profile/password', data),

  uploadImage: async (file: File): Promise<UserProfile> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/profile/image`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) throw new Error(await res.text().catch(() => 'Upload failed'));
    return res.json();
  },

  removeImage: () =>
    api.delete<UserProfile>('/profile/image'),
};
