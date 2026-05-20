import React from 'react';
import Modal from '../common/Modal';
import FaqForm from './FaqForm';
import type { Faq, FaqFormData } from '../../types/faq';

interface FaqModalProps {
  open: boolean;
  /** null when used in COMPANY_ADMIN context */
  companyId: number | null;
  onClose: () => void;
  onSave: (data: FaqFormData) => Promise<void>;
  initialData?: Faq | null;
}

const FaqModal: React.FC<FaqModalProps> = ({
  open,
  companyId,
  onClose,
  onSave,
  initialData,
}) => (
  <Modal
    open={open}
    title={initialData ? 'Edit FAQ' : 'Add FAQ'}
    onClose={onClose}
  >
    <FaqForm
      companyId={companyId}
      initialData={initialData}
      onSubmit={onSave}
      onCancel={onClose}
    />
  </Modal>
);

export default FaqModal;
