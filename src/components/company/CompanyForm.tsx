import React, { useState, useEffect } from 'react';
import type { Company } from '../../types/company';
import Button from '../common/Button';

type CompanyFormData = Omit<Company, 'companyId'>;

interface CompanyFormProps {
  initialData?: Company | null;
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CompanyFormData = {
  companyName: '',
  companyEmail: '',
  companyContactNumber: '',
  companyAddress: '',
  active: true,
};

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      const { companyId: _id, ...rest } = initialData;
      setForm(rest);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData]);

  const set = (field: keyof CompanyFormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="form-group">
        <label htmlFor="companyName">Company Name</label>
        <input
          id="companyName"
          type="text"
          value={form.companyName}
          onChange={e => set('companyName', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="companyEmail">Email</label>
        <input
          id="companyEmail"
          type="email"
          value={form.companyEmail}
          onChange={e => set('companyEmail', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="companyContact">Contact Number</label>
        <input
          id="companyContact"
          type="text"
          value={form.companyContactNumber}
          onChange={e => set('companyContactNumber', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="companyAddress">Address</label>
        <input
          id="companyAddress"
          type="text"
          value={form.companyAddress}
          onChange={e => set('companyAddress', e.target.value)}
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
        <Button type="submit">Save</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
