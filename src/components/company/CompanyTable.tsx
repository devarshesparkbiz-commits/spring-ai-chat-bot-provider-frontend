import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Company } from '../../types/company';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import TableToolbar from '../common/TableToolbar';
import SortIcon from '../common/SortIcon';
import { useTableControls } from '../../hooks/useTableControls';

interface CompanyTableProps {
  companies: Company[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

const SEARCH_KEYS: (keyof Company)[] = [
  'companyName',
  'companyEmail',
  'companyContactNumber',
  'companyAddress',
];

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onView,
  onEdit,
  onDelete,
  pageNumber,
  pageSize,
  totalElements,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const totalPages = Math.ceil(totalElements / pageSize);

  const { search, setSearch, sort, toggleSort, processed } =
    useTableControls(companies as unknown as Record<string, unknown>[], SEARCH_KEYS as string[]);

  const rows = processed as unknown as Company[];

  return (
    <div className="table-wrapper">
      <TableToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search by name, email, contact or address…"
        resultCount={rows.length}
        totalCount={companies.length}
      />

      <table className="data-table">
        <thead>
          <tr>
            <th
              className="th-sortable"
              onClick={() => toggleSort('companyId')}
            >
              ID <SortIcon columnKey="companyId" sort={sort} />
            </th>
            <th
              className="th-sortable"
              onClick={() => toggleSort('companyName')}
            >
              Name <SortIcon columnKey="companyName" sort={sort} />
            </th>
            <th
              className="th-sortable"
              onClick={() => toggleSort('companyEmail')}
            >
              Email <SortIcon columnKey="companyEmail" sort={sort} />
            </th>
            <th>Contact</th>
            <th>Address</th>
            <th
              className="th-sortable"
              onClick={() => toggleSort('active')}
            >
              Status <SortIcon columnKey="active" sort={sort} />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="table-empty">
                {search ? `No results for "${search}"` : 'No companies found.'}
              </td>
            </tr>
          ) : (
            rows.map(company => (
              <tr key={company.companyId}>
                <td>{company.companyId}</td>
                <td>{company.companyName}</td>
                <td>{company.companyEmail}</td>
                <td>{company.companyContactNumber}</td>
                <td>{company.companyAddress}</td>
                <td><Badge active={company.active} /></td>
                <td className="table-actions">
                  <Button size="sm" variant="secondary" onClick={() => onView(company)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => onEdit(company)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/companies/${company.companyId}/faqs`)}
                  >
                    FAQs
                  </Button>
                  {company.active && (
                    <Button size="sm" variant="danger" onClick={() => onDelete(company)}>
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default CompanyTable;
