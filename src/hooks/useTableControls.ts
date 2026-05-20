import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortState {
  key: string;
  dir: SortDir;
}

/**
 * Generic client-side search + sort over a page of data.
 *
 * @param rows        - The current page of data from the server
 * @param searchKeys  - Which string fields to search across
 */
export function useTableControls<T extends Record<string, unknown>>(
  rows: T[],
  searchKeys: (keyof T)[]
) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);

  const toggleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'asc' };
    });
  };

  const processed = useMemo(() => {
    let result = rows;

    // ── Search ────────────────────────────────────────────────
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(row =>
        searchKeys.some(key => {
          const val = row[key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // ── Sort ──────────────────────────────────────────────────
    if (sort) {
      result = [...result].sort((a, b) => {
        const av = a[sort.key as keyof T];
        const bv = b[sort.key as keyof T];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [rows, search, sort, searchKeys]);

  return { search, setSearch, sort, toggleSort, processed };
}
