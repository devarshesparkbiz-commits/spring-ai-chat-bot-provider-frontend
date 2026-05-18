import React from 'react';
import type { User } from '../../types/user';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Pagination from '../common/Pagination';

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  /** Show the Company column (for company users) */
  showCompany?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onView,
  onEdit,
  pageNumber,
  pageSize,
  totalElements,
  onPageChange,
  showCompany = false,
}) => {
  const totalPages = Math.ceil(totalElements / pageSize);
  const colSpan = 6 + (showCompany ? 1 : 0);

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            {showCompany && <th>Company</th>}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="table-empty">No users found.</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.mobileNumber}</td>
                {showCompany && <td>{user.companyName ?? '—'}</td>}
                <td><Badge active={user.active} /></td>
                <td className="table-actions">
                  <Button size="sm" variant="secondary" onClick={() => onView(user)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => onEdit(user)}>
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

export default UserTable;
