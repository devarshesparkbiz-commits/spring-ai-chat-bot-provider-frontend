import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import type { Company } from '../../types/company';

interface CompanyDetailModalProps {
  company: Company | null;
  onClose: () => void;
}

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, onClose }) => (
  <Modal open={!!company} title="Company Details" onClose={onClose}>
    {company && (
      <dl className="detail-list">
        <dt>ID</dt>
        <dd>{company.companyId}</dd>
        <dt>Name</dt>
        <dd>{company.companyName}</dd>
        <dt>Email</dt>
        <dd>{company.companyEmail}</dd>
        <dt>Contact</dt>
        <dd>{company.companyContactNumber}</dd>
        <dt>Address</dt>
        <dd>{company.companyAddress}</dd>
        <dt>Status</dt>
        <dd><Badge active={company.active} /></dd>
      </dl>
    )}
    <div className="modal-actions">
      <Button variant="secondary" onClick={onClose}>Close</Button>
    </div>
  </Modal>
);

export default CompanyDetailModal;
