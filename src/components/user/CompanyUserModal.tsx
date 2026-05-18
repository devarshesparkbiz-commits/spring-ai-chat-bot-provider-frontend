import React from 'react';
import Modal from '../common/Modal';
import CompanyUserForm from './CompanyUserForm';
import type { CompanyUserFormData, User } from '../../types/user';

interface CompanyUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CompanyUserFormData) => Promise<void>;
  initialData?: User | null;
  /** Lock the company field to this id (company admin context) */
  lockedCompanyId?: number | null;
}

const CompanyUserModal: React.FC<CompanyUserModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  lockedCompanyId,
}) => (
  <Modal
    open={open}
    title={initialData ? 'Edit Company User' : 'Add Company User'}
    onClose={onClose}
  >
    <CompanyUserForm
      initialData={initialData}
      lockedCompanyId={lockedCompanyId}
      onSubmit={onSave}
      onCancel={onClose}
    />
  </Modal>
);

export default CompanyUserModal;
