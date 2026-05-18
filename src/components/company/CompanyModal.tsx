import React from 'react';
import Modal from '../common/Modal';
import CompanyForm from './CompanyForm';
import type { Company } from '../../types/company';

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (company: Omit<Company, 'companyId'>) => void;
  initialData?: Company | null;
}

const CompanyModal: React.FC<CompanyModalProps> = ({ open, onClose, onSave, initialData }) => (
  <Modal
    open={open}
    title={initialData ? 'Edit Company' : 'Add Company'}
    onClose={onClose}
  >
    <CompanyForm initialData={initialData} onSubmit={onSave} onCancel={onClose} />
  </Modal>
);

export default CompanyModal;
