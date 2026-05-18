import React, { useState, useEffect } from 'react';
import type { CompanyUserFormData, DropdownItem, User } from '../../types/user';
import { companyService } from '../../services/companyService';
import Button from '../common/Button';

interface CompanyUserFormProps {
  initialData?: User | null;
  /** When set, the company field is pre-filled and locked (company admin context) */
  lockedCompanyId?: number | null;
  onSubmit: (data: CompanyUserFormData) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: CompanyUserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  mobileNumber: '',
  companyId: '',
  active: true,
};

const CompanyUserForm: React.FC<CompanyUserFormProps> = ({
  initialData,
  lockedCompanyId,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<CompanyUserFormData>(EMPTY);
  const [companies, setCompanies] = useState<DropdownItem[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [dropdownError, setDropdownError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData;
  const isLocked = lockedCompanyId != null;

  // Load company dropdown only when not locked to a specific company
  useEffect(() => {
    if (isLocked) return;
    setLoadingCompanies(true);
    setDropdownError('');
    companyService
      .getDropdown()
      .then(setCompanies)
      .catch(err =>
        setDropdownError(err instanceof Error ? err.message : 'Failed to load company list')
      )
      .finally(() => setLoadingCompanies(false));
  }, [isLocked]);

  // Sync form when switching between add / edit, or when lockedCompanyId changes
  useEffect(() => {
    if (initialData) {
      setForm({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        password: '',
        mobileNumber: initialData.mobileNumber,
        // Prefer the locked company over whatever is stored on the user
        companyId: lockedCompanyId ?? initialData.companyId ?? '',
        active: initialData.active,
      });
    } else {
      setForm({ ...EMPTY, companyId: lockedCompanyId ?? '' });
    }
    setFormError('');
  }, [initialData, lockedCompanyId]);

  const set = <K extends keyof CompanyUserFormData>(key: K, value: CompanyUserFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const retryDropdown = () => {
    setDropdownError('');
    setLoadingCompanies(true);
    companyService
      .getDropdown()
      .then(setCompanies)
      .catch(err =>
        setDropdownError(err instanceof Error ? err.message : 'Failed to load company list')
      )
      .finally(() => setLoadingCompanies(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.companyId === '') {
      setFormError('Please select a company');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {dropdownError && (
        <div className="form-error">
          {dropdownError}{' '}
          <button type="button" className="form-error-retry" onClick={retryDropdown}>
            Retry
          </button>
        </div>
      )}
      {formError && <div className="form-error">{formError}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cu-firstName">First Name</label>
          <input
            id="cu-firstName"
            type="text"
            value={form.firstName}
            onChange={e => set('firstName', e.target.value)}
            placeholder="Jane"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cu-lastName">Last Name</label>
          <input
            id="cu-lastName"
            type="text"
            value={form.lastName}
            onChange={e => set('lastName', e.target.value)}
            placeholder="Smith"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cu-email">Email</label>
        <input
          id="cu-email"
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          placeholder="user@company.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="cu-password">
          Password{isEdit && <span className="form-hint"> (leave blank to keep current)</span>}
        </label>
        <input
          id="cu-password"
          type="password"
          value={form.password}
          onChange={e => set('password', e.target.value)}
          placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
          required={!isEdit}
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="cu-mobile">Mobile Number</label>
        <input
          id="cu-mobile"
          type="tel"
          value={form.mobileNumber}
          onChange={e => set('mobileNumber', e.target.value)}
          placeholder="+1 555 000 0000"
          required
        />
      </div>

      {/* Company field: hidden when locked, dropdown when super admin */}
      {isLocked ? (
        <input type="hidden" value={form.companyId} />
      ) : (
        <div className="form-group">
          <label htmlFor="cu-company">Company</label>
          <select
            id="cu-company"
            value={form.companyId}
            onChange={e =>
              set('companyId', e.target.value === '' ? '' : Number(e.target.value))
            }
            required
            disabled={loadingCompanies || !!dropdownError}
          >
            <option value="">
              {loadingCompanies ? 'Loading companies…' : '— Select a company —'}
            </option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
        <Button type="submit" disabled={submitting || loadingCompanies || !!dropdownError}>
          {submitting ? 'Saving…' : isEdit ? 'Update User' : 'Add User'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CompanyUserForm;
