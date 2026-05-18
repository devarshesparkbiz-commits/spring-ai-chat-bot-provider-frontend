import React from 'react';
import type { Company } from '../../types/company';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Pagination from '../common/Pagination';

interface CompanyTableProps {
  companies: Company[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onView,
  onEdit,
  pageNumber,
  pageSize,
  totalElements,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.length === 0 ? (
            <tr>
              <td colSpan={7} className="table-empty">No companies found.</td>
            </tr>
          ) : (
            companies.map(company => (
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
