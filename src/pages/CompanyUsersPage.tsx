import React, { useState } from 'react';
import Layout from '../components/Layout';
import UserTable from '../components/user/UserTable';
import UserDetailModal from '../components/user/UserDetailModal';
import CompanyUserModal from '../components/user/CompanyUserModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import { useCompanyUsers } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import type { CompanyUserFormData, User } from '../types/user';

const CompanyUsersPage: React.FC = () => {
  const { userRole, companyId: authCompanyId } = useAuth();

  // COMPANY_ADMIN sees only their own company's users; SUPER_ADMIN sees all
  const scopedCompanyId = userRole === 'COMPANY_ADMIN' ? authCompanyId : null;

  const {
    users,
    pageNumber,
    pageSize,
    totalElements,
    loading,
    error,
    setPageNumber,
    createUser,
    updateUser,
  } = useCompanyUsers(scopedCompanyId);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const openAdd = () => {
    setEditUser(null);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  const handleSave = async (data: CompanyUserFormData) => {
    if (editUser) {
      await updateUser(editUser.userId, data);
    } else {
      await createUser(data);
    }
    closeModal();
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Company Users</h1>
        <Button onClick={openAdd}>+ Add Company User</Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <UserTable
          users={users}
          onView={setViewUser}
          onEdit={openEdit}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={setPageNumber}
          showCompany={userRole === 'SUPER_ADMIN'}
          showRole
        />
      )}

      <CompanyUserModal
        open={showModal}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editUser}
        lockedCompanyId={scopedCompanyId}
      />

      <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />
    </Layout>
  );
};

export default CompanyUsersPage;
