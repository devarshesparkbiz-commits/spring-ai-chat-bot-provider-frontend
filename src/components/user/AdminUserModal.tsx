import React from 'react';
import Modal from '../common/Modal';
import AdminUserForm from './AdminUserForm';
import type { AdminUserFormData, User } from '../../types/user';

interface AdminUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AdminUserFormData) => Promise<void>;
  initialData?: User | null;
}

const AdminUserModal: React.FC<AdminUserModalProps> = ({ open, onClose, onSave, initialData }) => (
  <Modal
    open={open}
    title={initialData ? 'Edit Admin User' : 'Add Admin User'}
    onClose={onClose}
  >
    <AdminUserForm initialData={initialData} onSubmit={onSave} onCancel={onClose} />
  </Modal>
);

export default AdminUserModal;
