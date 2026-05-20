import React, { useState } from 'react';
import Layout from '../components/Layout';
import UserTable from '../components/user/UserTable';
import UserDetailModal from '../components/user/UserDetailModal';
import AdminUserModal from '../components/user/AdminUserModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import { useAdminUsers } from '../hooks/useUsers';
import type { AdminUserFormData, User } from '../types/user';

const AdminUsersPage: React.FC = () => {
  const {
    users, pageNumber, pageSize, totalElements,
    loading, error, setPageNumber,
    createUser, updateUser, softDeleteUser,
  } = useAdminUsers();

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setEditUser(null); setShowModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditUser(null); };

  const handleSave = async (data: AdminUserFormData) => {
    if (editUser) await updateUser(editUser.userId, data);
    else await createUser(data);
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await softDeleteUser(deleteTarget.userId);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Admin Users</h1>
        <Button onClick={openAdd}>+ Add Admin User</Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? <LoadingSpinner /> : (
        <UserTable
          users={users}
          onView={setViewUser}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={setPageNumber}
        />
      )}

      <AdminUserModal open={showModal} onClose={closeModal} onSave={handleSave} initialData={editUser} />
      <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deactivate Admin User"
        message={<>Are you sure you want to deactivate <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? They will no longer be able to log in.</>}
        confirmLabel="Deactivate"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Layout>
  );
};

export default AdminUsersPage;
