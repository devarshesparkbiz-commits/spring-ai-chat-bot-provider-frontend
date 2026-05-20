import { useState, useEffect, useCallback } from 'react';
import { faqService, myCompanyFaqService } from '../services/faqService';
import type { Faq, FaqFormData } from '../types/faq';

const PAGE_SIZE = 10;

/**
 * SUPER_ADMIN mode: pass a numeric companyId.
 * COMPANY_ADMIN mode: pass null — uses /faq/my-company endpoints (companyId from JWT).
 */
export function useFaqs(companyId: number | null) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMyCompany = companyId === null;

  const fetchPage = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = isMyCompany
          ? await myCompanyFaqService.getPaginated(page, PAGE_SIZE)
          : await faqService.getByCompanyPaginated(companyId!, page, PAGE_SIZE);
        setFaqs(data.data);
        setTotalElements(data.totalElements);
        setPageNumber(data.pageNumber);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    },
    [companyId, isMyCompany]
  );

  useEffect(() => {
    fetchPage(pageNumber);
  }, [fetchPage, pageNumber]);

  const createFaq = async (data: FaqFormData) => {
    if (isMyCompany) {
      const { companyId: _cid, ...rest } = data;
      await myCompanyFaqService.create(rest);
    } else {
      await faqService.create(data);
    }
    fetchPage(pageNumber);
  };

  const updateFaq = async (faqId: number, data: FaqFormData) => {
    if (isMyCompany) {
      const { companyId: _cid, ...rest } = data;
      await myCompanyFaqService.update(faqId, rest);
    } else {
      await faqService.update(faqId, data);
    }
    fetchPage(pageNumber);
  };

  const softDeleteFaq = async (faqId: number) => {
    await faqService.softDelete(faqId);
    fetchPage(pageNumber);
  };

  return {
    faqs,
    pageNumber,
    pageSize: PAGE_SIZE,
    totalElements,
    loading,
    error,
    setPageNumber,
    createFaq,
    updateFaq,
    softDeleteFaq,
  };
}
