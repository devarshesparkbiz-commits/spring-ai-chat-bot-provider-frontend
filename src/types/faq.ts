export interface Faq {
  faqId: number;
  question: string;
  answer: string;
  active: boolean;
  companyId: number;
  companyName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqFormData {
  question: string;
  answer: string;
  active: boolean;
  companyId: number;
}
