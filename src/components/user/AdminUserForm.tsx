import React, { useState, useEffect } from 'react';
import type { AdminUserFormData, User } from '../../types/user';
import Button from '../common/Button';

interface AdminUserFormProps {
  /** Pass existing user to pre-fill for edit; null/undefined = add mode */
  initialData?: User | null;
  onSubmit: (data: AdminUserFormData) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: AdminUserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  mobileNumber: '',
  active: true,
};

const AdminUserForm: React.FC<AdminUserFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState<AdminUserFormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        password: '',           // never pre-fill password
        mobileNumber: initialData.mobileNumber,
        active: initialData.active,
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [initialData]);

  const set = <K extends keyof AdminUserFormData>(key: K, value: AdminUserFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="au-firstName">First Name</label>
          <input
            id="au-firstName"
            type="text"
            value={form.firstName}
            onChange={e => set('firstName', e.target.value)}
            placeholder="John"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="au-lastName">Last Name</label>
          <input
            id="au-lastName"
            type="text"
            value={form.lastName}
            onChange={e => set('lastName', e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="au-email">Email</label>
        <input
          id="au-email"
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          placeholder="admin@example.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="au-password">
          Password {isEdit && <span className="form-hint">(leave blank to keep current)</span>}
        </label>
        <input
          id="au-password"
          type="password"
          value={form.password}
          onChange={e => set('password', e.target.value)}
          placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
          required={!isEdit}
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="au-mobile">Mobile Number</label>
        <input
          id="au-mobile"
          type="tel"
          value={form.mobileNumber}
          onChange={e => set('mobileNumber', e.target.value)}
          placeholder="+1 555 000 0000"
          required
        />
      </div>

      <div className="form-group form-group-checkbox">
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={e => set('active', e.target.checked)}
          />
          Active
        </label>
      </div>

      <div className="modal-actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Update User' : 'Add User'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AdminUserForm;
