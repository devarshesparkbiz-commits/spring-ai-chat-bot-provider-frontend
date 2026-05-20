import React from 'react';

interface TableToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  search,
  onSearch,
  placeholder = 'Search…',
  resultCount,
  totalCount,
}) => (
  <div className="table-toolbar">
    <div className="table-search-wrap">
      <span className="table-search-icon" aria-hidden="true">⌕</span>
      <input
        className="table-search"
        type="search"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {search && (
        <button
          className="table-search-clear"
          onClick={() => onSearch('')}
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
    {search && resultCount !== undefined && totalCount !== undefined && (
      <span className="table-search-count">
        {resultCount} of {totalCount} shown
      </span>
    )}
  </div>
);

export default TableToolbar;
