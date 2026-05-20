// ── Chatbot config ────────────────────────────────────────────────────────────

export interface Chatbot {
  chatbotId: number;
  chatbotName: string;
  modelName: string;
  temperature: number;
  topK: number;
  topP: number;
  systemPrompt?: string;
  active: boolean;
  companyId: number;
  companyName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatbotFormData {
  chatbotName: string;
  modelName?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  systemPrompt?: string;
  active?: boolean;
}

// ── RAG documents ─────────────────────────────────────────────────────────────

export type RagDocumentType = 'TEXT' | 'FILE';

export interface RagDocument {
  documentId: number;
  documentTitle: string;
  content: string;
  documentType: RagDocumentType;
  active: boolean;
  companyId: number;
  companyName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RagDocumentFormData {
  documentTitle: string;
  content: string;
  active?: boolean;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface ChatMessage {
  messageId: number;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

export interface ChatSession {
  sessionId: number;
  sessionTitle: string;
  active: boolean;
  chatbotId: number;
  chatbotName: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
  messages?: ChatMessage[];
}

export interface ChatResponse {
  sessionId: number;
  sessionTitle: string;
  reply: string;
}
