import React, { useState, useEffect } from 'react';
import type { Faq, FaqFormData } from '../../types/faq';
import RichTextEditor from '../common/RichTextEditor';
import Button from '../common/Button';

interface FaqFormProps {
  /** null when used in COMPANY_ADMIN context (companyId resolved server-side) */
  companyId: number | null;
  initialData?: Faq | null;
  onSubmit: (data: FaqFormData) => Promise<void>;
  onCancel: () => void;
}

const emptyForm = (companyId: number | null): FaqFormData => ({
  question: '',
  answer: '',
  active: true,
  companyId: companyId ?? 0,
});

const FaqForm: React.FC<FaqFormProps> = ({ companyId, initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState<FaqFormData>(emptyForm(companyId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        question: initialData.question,
        answer: initialData.answer,
        active: initialData.active,
        companyId: initialData.companyId,
      });
    } else {
      setForm(emptyForm(companyId));
    }
    setError('');
  }, [initialData, companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.answer || form.answer === '<p>&nbsp;</p>') {
      setError('Answer is required');
      return;
    }
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

      <div className="form-group">
        <label htmlFor="faq-question">Question</label>
        <input
          id="faq-question"
          type="text"
          value={form.question}
          onChange={e => setForm(prev => ({ ...prev, question: e.target.value }))}
          placeholder="Enter the FAQ question"
          required
        />
      </div>

      <div className="form-group">
        <label>Answer</label>
        <RichTextEditor
          value={form.answer}
          onChange={val => setForm(prev => ({ ...prev, answer: val }))}
          disabled={submitting}
        />
      </div>

      <div className="form-group form-group-checkbox">
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
          />
          Active
        </label>
      </div>

      <div className="modal-actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Update FAQ' : 'Add FAQ'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default FaqForm;
