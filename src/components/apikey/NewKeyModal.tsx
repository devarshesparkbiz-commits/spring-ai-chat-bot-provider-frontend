import React, { useState } from 'react';
import { apiKeyService, type ApiKey } from '../../services/apiKeyService';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (key: ApiKey) => void;
}

const NewKeyModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [keyName, setKeyName] = useState('');
  const [allowedOrigins, setAllowedOrigins] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const key = await apiKeyService.create({ keyName, allowedOrigins: allowedOrigins || undefined });
      setKeyName('');
      setAllowedOrigins('');
      onCreated(key);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Generate API Key</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="key-name">Key Name</label>
            <input
              id="key-name"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              required
              className="form-control"
              placeholder="e.g. Production Website, Mobile App"
            />
          </div>

          <div className="form-group">
            <label htmlFor="allowed-origins">
              Allowed Origins&nbsp;
              <span className="hint">(optional — leave blank to allow all)</span>
            </label>
            <input
              id="allowed-origins"
              value={allowedOrigins}
              onChange={e => setAllowedOrigins(e.target.value)}
              className="form-control"
              placeholder="https://myapp.com,https://staging.myapp.com"
            />
            <small className="hint">Comma-separated list of allowed origins for browser requests.</small>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Generating…' : 'Generate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewKeyModal;
