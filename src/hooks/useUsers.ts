import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User, AdminUserFormData, CompanyUserFormData } from '../types/user';

const PAGE_SIZE = 10;

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAdminUsersPage(page, PAGE_SIZE);
      setUsers(data.data);
      setTotalElements(data.totalElements);
      setPageNumber(data.pageNumber);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(pageNumber);
  }, [fetchPage, pageNumber]);

  const createUser = async (data: AdminUserFormData) => {
    await userService.createAdminUser(data);
    fetchPage(pageNumber);
  };

  const updateUser = async (id: number, data: AdminUserFormData) => {
    await userService.updateAdminUser(id, data);
    fetchPage(pageNumber);
  };

  const softDeleteUser = async (id: number) => {
    await userService.softDeleteAdminUser(id);
    fetchPage(pageNumber);
  };

  return {
    users,
    pageNumber,
    pageSize: PAGE_SIZE,
    totalElements,
    loading,
    error,
    setPageNumber,
    createUser,
    updateUser,
    softDeleteUser,
  };
}

export function useCompanyUsers(scopedCompanyId?: number | null) {
  const [users, setUsers] = useState<User[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getCompanyUsersPage(page, PAGE_SIZE, scopedCompanyId);
      setUsers(data.data);
      setTotalElements(data.totalElements);
      setPageNumber(data.pageNumber);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load company users');
    } finally {
      setLoading(false);
    }
  }, [scopedCompanyId]);

  useEffect(() => {
    fetchPage(pageNumber);
  }, [fetchPage, pageNumber]);

  const createUser = async (data: CompanyUserFormData) => {
    await userService.createCompanyUser(data);
    fetchPage(pageNumber);
  };

  const updateUser = async (id: number, data: CompanyUserFormData) => {
    await userService.updateCompanyUser(id, data);
    fetchPage(pageNumber);
  };

  const softDeleteUser = async (id: number) => {
    await userService.softDeleteCompanyUser(id);
    fetchPage(pageNumber);
  };

  return {
    users,
    pageNumber,
    pageSize: PAGE_SIZE,
    totalElements,
    loading,
    error,
    setPageNumber,
    createUser,
    updateUser,
    softDeleteUser,
  };
}
