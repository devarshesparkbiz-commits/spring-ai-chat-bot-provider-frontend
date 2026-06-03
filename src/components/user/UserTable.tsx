import React from 'react';
import type { User } from '../../types/user';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import TableToolbar from '../common/TableToolbar';
import SortIcon from '../common/SortIcon';
import UserAvatar from '../common/UserAvatar';
import { useTableControls } from '../../hooks/useTableControls';

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  showCompany?: boolean;
  showRole?: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  COMPANY_ADMIN: 'Admin',
  COMPANY_USER: 'User',
};

// Flatten user for search/sort — combine firstName+lastName into fullName
function flattenUser(u: User): Record<string, unknown> {
  return {
    ...u,
    fullName: `${u.firstName} ${u.lastName}`,
    // expose userRole as a searchable string
    roleLabel: ROLE_LABEL[u.userRole ?? u.role ?? ''] ?? u.userRole ?? u.role ?? '',
  };
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onView,
  onEdit,
  onDelete,
  pageNumber,
  pageSize,
  totalElements,
  onPageChange,
  showCompany = false,
  showRole = false,
}) => {
  const totalPages = Math.ceil(totalElements / pageSize);

  const searchKeys = [
    'fullName',
    'email',
    'mobileNumber',
    ...(showCompany ? ['companyName'] : []),
    ...(showRole ? ['roleLabel'] : []),
  ];

  const flatUsers = users.map(flattenUser);

  const { search, setSearch, sort, toggleSort, processed } =
    useTableControls(flatUsers, searchKeys);

  // Map processed flat rows back to original User objects by userId
  const userMap = new Map(users.map(u => [u.userId, u]));
  const rows = processed
    .map(f => userMap.get(f.userId as number))
    .filter((u): u is User => u !== undefined);

  const extraCols = (showCompany ? 1 : 0) + (showRole ? 1 : 0);
  const colSpan = 5 + extraCols + 1;

  return (
    <div className="table-wrapper">
      <TableToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search by name, email or mobile…"
        resultCount={rows.length}
        totalCount={users.length}
      />

      <table className="data-table">
        <thead>
          <tr>
            <th className="th-sortable" onClick={() => toggleSort('userId')}>
              ID <SortIcon columnKey="userId" sort={sort} />
            </th>
            <th className="th-sortable" onClick={() => toggleSort('fullName')}>
              Name <SortIcon columnKey="fullName" sort={sort} />
            </th>
            <th className="th-sortable" onClick={() => toggleSort('email')}>
              Email <SortIcon columnKey="email" sort={sort} />
            </th>
            <th>Mobile</th>
            {showCompany && (
              <th className="th-sortable" onClick={() => toggleSort('companyName')}>
                Company <SortIcon columnKey="companyName" sort={sort} />
              </th>
            )}
            {showRole && (
              <th className="th-sortable" onClick={() => toggleSort('roleLabel')}>
                Type <SortIcon columnKey="roleLabel" sort={sort} />
              </th>
            )}
            <th className="th-sortable" onClick={() => toggleSort('active')}>
              Status <SortIcon columnKey="active" sort={sort} />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="table-empty">
                {search ? `No results for "${search}"` : 'No users found.'}
              </td>
            </tr>
          ) : (
            rows.map(user => {
              const role = user.userRole ?? user.role;
              return (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <UserAvatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        profileImageUrl={user.profileImageUrl}
                        size={32}
                      />
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.mobileNumber}</td>
                  {showCompany && <td>{user.companyName ?? '—'}</td>}
                  {showRole && (
                    <td>
                      <span className={`role-badge role-badge--${role?.toLowerCase().replace(/_/g, '-')}`}>
                        {role ? (ROLE_LABEL[role] ?? role) : '—'}
                      </span>
                    </td>
                  )}
                  <td><Badge active={user.active} /></td>
                  <td className="table-actions">
                    <Button size="sm" variant="secondary" onClick={() => onView(user)}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => onEdit(user)}>
                      Edit
                    </Button>
                    {user.active && (
                      <Button size="sm" variant="danger" onClick={() => onDelete(user)}>
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
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
