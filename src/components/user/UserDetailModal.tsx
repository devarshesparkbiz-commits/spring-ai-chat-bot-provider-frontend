import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import type { User } from '../../types/user';

interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => (
  <Modal open={!!user} title="User Details" onClose={onClose}>
    {user && (
      <dl className="detail-list">
        <dt>ID</dt>
        <dd>{user.userId}</dd>
        <dt>Name</dt>
        <dd>{user.firstName} {user.lastName}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Mobile</dt>
        <dd>{user.mobileNumber}</dd>
        <dt>Role</dt>
        <dd>{user.role}</dd>
        {user.companyName && (
          <>
            <dt>Company</dt>
            <dd>{user.companyName}</dd>
          </>
        )}
        <dt>Status</dt>
        <dd><Badge active={user.active} /></dd>
      </dl>
    )}
    <div className="modal-actions">
      <Button variant="secondary" onClick={onClose}>Close</Button>
    </div>
  </Modal>
);

export default UserDetailModal;
