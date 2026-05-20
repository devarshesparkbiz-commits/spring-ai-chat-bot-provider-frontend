import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import type { Faq } from '../../types/faq';

interface FaqDetailModalProps {
  faq: Faq | null;
  onClose: () => void;
}

const FaqDetailModal: React.FC<FaqDetailModalProps> = ({ faq, onClose }) => (
  <Modal open={!!faq} title="FAQ Details" onClose={onClose}>
    {faq && (
      <>
        <div className="faq-detail-question">
          <span className="faq-detail-label">Question</span>
          <p>{faq.question}</p>
        </div>

        <div className="faq-detail-answer">
          <span className="faq-detail-label">Answer</span>
          {/* Render the rich-text HTML safely */}
          <div
            className="ck-content faq-answer-body"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>

        <dl className="detail-list faq-detail-meta">
          <dt>Company</dt>
          <dd>{faq.companyName}</dd>
          <dt>Status</dt>
          <dd><Badge active={faq.active} /></dd>
          {faq.createdAt && (
            <>
              <dt>Created</dt>
              <dd>{new Date(faq.createdAt).toLocaleString()}</dd>
            </>
          )}
          {faq.updatedAt && (
            <>
              <dt>Updated</dt>
              <dd>{new Date(faq.updatedAt).toLocaleString()}</dd>
            </>
          )}
        </dl>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </>
    )}
  </Modal>
);

export default FaqDetailModal;
