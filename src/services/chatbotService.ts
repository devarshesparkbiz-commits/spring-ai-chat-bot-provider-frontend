import { api } from './api';
import type { Chatbot, ChatbotFormData, RagDocument, RagDocumentFormData, ChatSession, ChatResponse } from '../types/chatbot';
import type { PaginatedResponse } from './companyService';

const API_BASE = 'http://localhost:8080';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface CommonResponse {
  message: string;
}

// ── Chatbot config ─────────────────────────────────────────────────────────────

export const chatbotAdminService = {
  /** SUPER_ADMIN: create chatbot for a company */
  create: (companyId: number, data: ChatbotFormData) =>
    api.post<CommonResponse>(`/chatbot/admin/company/${companyId}`, data),

  /** SUPER_ADMIN: update any chatbot by ID */
  update: (chatbotId: number, data: ChatbotFormData) =>
    api.put<CommonResponse>(`/chatbot/admin/${chatbotId}`, data),

  /** SUPER_ADMIN: list all chatbots */
  getAll: () =>
    api.get<Chatbot[]>('/chatbot/admin/all'),

  /** SUPER_ADMIN: get chatbot for a specific company */
  getByCompany: (companyId: number) =>
    api.get<Chatbot>(`/chatbot/admin/company/${companyId}`),

  /** SUPER_ADMIN: toggle active */
  toggleActive: (chatbotId: number) =>
    api.put<CommonResponse>(`/chatbot/admin/${chatbotId}/toggle`, {}),
};

export const chatbotCompanyService = {
  /** COMPANY_ADMIN: get their chatbot */
  getMy: () =>
    api.get<Chatbot>('/chatbot/my-company'),

  /** COMPANY_ADMIN: update their chatbot settings */
  updateMy: (data: ChatbotFormData) =>
    api.put<CommonResponse>('/chatbot/my-company', data),
};

// ── RAG documents ──────────────────────────────────────────────────────────────

export const ragAdminService = {
  addText: (companyId: number, data: RagDocumentFormData) =>
    api.post<CommonResponse>(`/rag/admin/company/${companyId}/text`, data),

  uploadFile: async (companyId: number, title: string, file: File): Promise<CommonResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
    const res = await fetch(`${API_BASE}/rag/admin/company/${companyId}/file${titleParam}`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
  },

  getByCompany: (companyId: number, pageNumber: number, pageSize: number) =>
    api.get<PaginatedResponse<RagDocument>>(
      `/rag/admin/company/${companyId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),
};

export const ragCompanyService = {
  addText: (data: RagDocumentFormData) =>
    api.post<CommonResponse>('/rag/my-company/text', data),

  uploadFile: async (title: string, file: File): Promise<CommonResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
    const res = await fetch(`${API_BASE}/rag/my-company/file${titleParam}`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
  },

  getMy: (pageNumber: number, pageSize: number) =>
    api.get<PaginatedResponse<RagDocument>>(
      `/rag/my-company?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  update: (documentId: number, data: RagDocumentFormData) =>
    api.put<CommonResponse>(`/rag/${documentId}`, data),

  delete: (documentId: number) =>
    api.delete<CommonResponse>(`/rag/${documentId}`),
};

// ── Chat ───────────────────────────────────────────────────────────────────────

export const chatService = {
  sendMessage: (message: string, sessionId?: number) =>
    api.post<ChatResponse>('/chat/message', { message, sessionId }),

  getSessions: (pageNumber: number, pageSize: number) =>
    api.get<PaginatedResponse<ChatSession>>(
      `/chat/sessions?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  getSession: (sessionId: number) =>
    api.get<ChatSession>(`/chat/sessions/${sessionId}`),

  closeSession: (sessionId: number) =>
    api.delete<CommonResponse>(`/chat/sessions/${sessionId}`),
};
