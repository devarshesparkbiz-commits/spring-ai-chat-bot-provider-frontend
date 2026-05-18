import { useState, useEffect, useCallback } from 'react';
import { companyService } from '../services/companyService';
import type { Company } from '../types/company';

const PAGE_SIZE = 10;

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await companyService.getPage(page, PAGE_SIZE);
      setCompanies(data.data);
      setTotalElements(data.totalElements);
      setPageNumber(data.pageNumber);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(pageNumber);
  }, [fetchPage, pageNumber]);

  const createCompany = async (company: Omit<Company, 'companyId'>) => {
    await companyService.create(company);
    fetchPage(pageNumber);
  };

  const updateCompany = async (id: number, company: Omit<Company, 'companyId'>) => {
    await companyService.update(id, company);
    fetchPage(pageNumber);
  };

  return {
    companies,
    pageNumber,
    pageSize: PAGE_SIZE,
    totalElements,
    loading,
    error,
    setPageNumber,
    createCompany,
    updateCompany,
  };
}
