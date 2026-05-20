import { api } from './api';
import type { CommonResponse } from './chatbotService';

export interface ApiKey {
  keyId: number;
  keyName: string;
  plainKey?: string;   // only present on creation
  keyPrefix: string;
  allowedOrigins?: string;
  active: boolean;
  lastUsedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiKeyRequest {
  keyName: string;
  allowedOrigins?: string;
}

export const apiKeyService = {
  create: (data: ApiKeyRequest) =>
    api.post<ApiKey>('/api-keys', data),

  list: () =>
    api.get<ApiKey[]>('/api-keys'),

  update: (keyId: number, data: ApiKeyRequest) =>
    api.put<CommonResponse>(`/api-keys/${keyId}`, data),

  revoke: (keyId: number) =>
    api.delete<CommonResponse>(`/api-keys/${keyId}`),

  regenerate: (keyId: number) =>
    api.post<ApiKey>(`/api-keys/${keyId}/regenerate`, {}),
};
