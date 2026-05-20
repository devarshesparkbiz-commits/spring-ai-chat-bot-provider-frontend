import React, { useState, useEffect } from 'react';
import { ragCompanyService, ragAdminService } from '../../services/chatbotService';
import type { RagDocument, RagDocumentFormData } from '../../types/chatbot';

interface Props {
  open: boolean;
  editDoc: RagDocument | null;
  onClose: () => void;
  onSaved: () => void;
  /** 'company' = COMPANY_ADMIN endpoints; 'admin' = SUPER_ADMIN endpoints */
  mode: 'company' | 'admin';
  /** Required when mode === 'admin' */
  companyId?: number;
}

type Tab = 'text' | 'file';

const RagDocumentModal: React.FC<Props> = ({
  open,
  editDoc,
  onClose,
  onSaved,
  mode,
  companyId,
}) => {
  const [tab, setTab] = useState<Tab>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editDoc) {
      setTitle(editDoc.documentTitle);
      setContent(editDoc.content);
      setTab('text'); // editing always uses text form
    } else {
      setTitle('');
      setContent('');
      setFile(null);
      setTab('text');
    }
    setError('');
  }, [editDoc, open]);

  if (!open) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editDoc) {
        // Update existing document
        const data: RagDocumentFormData = { documentTitle: title, content };
        await ragCompanyService.update(editDoc.documentId, data);
      } else if (tab === 'text') {
        const data: RagDocumentFormData = { documentTitle: title, content };
        if (mode === 'company') {
          await ragCompanyService.addText(data);
        } else {
          await ragAdminService.addText(companyId!, data);
        }
      } else {
        if (!file) { setError('Please select a file'); setSaving(false); return; }
        if (mode === 'company') {
          await ragCompanyService.uploadFile(title, file);
        } else {
          await ragAdminService.uploadFile(companyId!, title, file);
        }
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="RAG Document">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{editDoc ? 'Edit Document' : 'Add Knowledge Document'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {!editDoc && (
          <div className="tab-bar">
            <button
              className={`tab-btn ${tab === 'text' ? 'active' : ''}`}
              onClick={() => setTab('text')}
              type="button"
            >
              Plain Text
            </button>
            <button
              className={`tab-btn ${tab === 'file' ? 'active' : ''}`}
              onClick={() => setTab('file')}
              type="button"
            >
              Upload File
            </button>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label htmlFor="rag-title">Title</label>
            <input
              id="rag-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="form-control"
              placeholder="e.g. Return Policy, Product Manual…"
            />
          </div>

          {(editDoc || tab === 'text') && (
            <div className="form-group">
              <label htmlFor="rag-content">Content</label>
              <textarea
                id="rag-content"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={8}
                className="form-control"
                placeholder="Paste or type the knowledge content here…"
              />
            </div>
          )}

          {!editDoc && tab === 'file' && (
            <div className="form-group">
              <label htmlFor="rag-file">File (TXT, DOCX, PDF)</label>
              <input
                id="rag-file"
                type="file"
                accept=".txt,.docx,.pdf"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="form-control"
              />
              <small className="hint">Supported: .txt, .docx, .pdf (max 20 MB)</small>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RagDocumentModal;
