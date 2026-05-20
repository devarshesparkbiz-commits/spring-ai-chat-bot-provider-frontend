import React from 'react';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Deactivate',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal confirm-dialog">
        <div className="confirm-dialog-icon" aria-hidden="true">⚠</div>
        <h2 id="confirm-title">{title}</h2>
        <p className="confirm-dialog-message">{message}</p>
        <div className="modal-actions">
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing…' : confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
