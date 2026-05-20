import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import { chatbotCompanyService, ragCompanyService } from '../services/chatbotService';
import type { Chatbot, ChatbotFormData, RagDocument } from '../types/chatbot';
import RagDocumentModal from '../components/chatbot/RagDocumentModal';

const ChatbotSettingsPage: React.FC = () => {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [form, setForm] = useState<ChatbotFormData>({
    chatbotName: '',
    modelName: 'gpt-oss:120b-cloud',
    temperature: 0.7,
    topK: 40,
    topP: 0.9,
    systemPrompt: '',
    active: true,
  });

  // RAG documents
  const [docs, setDocs] = useState<RagDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsPage, setDocsPage] = useState(0);
  const [docsTotalPages, setDocsTotalPages] = useState(0);
  const [showRagModal, setShowRagModal] = useState(false);
  const [editDoc, setEditDoc] = useState<RagDocument | null>(null);

  const loadChatbot = async () => {
    try {
      setLoading(true);
      const data = await chatbotCompanyService.getMy();
      setChatbot(data);
      setForm({
        chatbotName: data.chatbotName,
        modelName: data.modelName,
        temperature: data.temperature,
        topK: data.topK,
        topP: data.topP,
        systemPrompt: data.systemPrompt ?? '',
        active: data.active,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load chatbot');
    } finally {
      setLoading(false);
    }
  };

  const loadDocs = async (page = 0) => {
    try {
      setDocsLoading(true);
      const res = await ragCompanyService.getMy(page, 10);
      setDocs(res.data);
      setDocsTotalPages(res.totalPages);
      setDocsPage(res.pageNumber);
    } catch {
      // non-critical
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadChatbot();
    loadDocs(0);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await chatbotCompanyService.updateMy(form);
      setSuccess(res.message);
      await loadChatbot();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (documentId: number) => {
    if (!confirm('Remove this document from the knowledge base?')) return;
    try {
      await ragCompanyService.delete(documentId);
      await loadDocs(docsPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleDocSaved = async () => {
    setShowRagModal(false);
    setEditDoc(null);
    await loadDocs(0);
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Chatbot — {chatbot?.chatbotName ?? 'Settings'}</h1>
      </div>

      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="alert alert-success" role="alert">{success}</div>
      )}

      {/* ── Model settings form ─────────────────────────────────────────── */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Model Settings</h2>
        <form onSubmit={handleSave} className="form-grid">

          <div className="form-group">
            <label htmlFor="chatbotName">Chatbot Name</label>
            <input
              id="chatbotName"
              name="chatbotName"
              value={form.chatbotName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modelName">Model</label>
            <input
              id="modelName"
              name="modelName"
              value={form.modelName}
              onChange={handleChange}
              className="form-control"
              placeholder="gpt-oss:120b-cloud"
            />
          </div>

          <div className="form-group">
            <label htmlFor="temperature">
              Temperature&nbsp;
              <span className="hint">(0.0 – 2.0, current: {form.temperature})</span>
            </label>
            <input
              id="temperature"
              name="temperature"
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={form.temperature}
              onChange={handleChange}
              className="form-range"
            />
          </div>

          <div className="form-group">
            <label htmlFor="topK">
              Top-K&nbsp;
              <span className="hint">(1 – 200, current: {form.topK})</span>
            </label>
            <input
              id="topK"
              name="topK"
              type="range"
              min={1}
              max={200}
              step={1}
              value={form.topK}
              onChange={handleChange}
              className="form-range"
            />
          </div>

          <div className="form-group">
            <label htmlFor="topP">
              Top-P&nbsp;
              <span className="hint">(0.0 – 1.0, current: {form.topP})</span>
            </label>
            <input
              id="topP"
              name="topP"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={form.topP}
              onChange={handleChange}
              className="form-range"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="systemPrompt">System Prompt / Persona</label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={form.systemPrompt}
              onChange={handleChange}
              rows={4}
              className="form-control"
              placeholder="Describe the chatbot's persona and instructions…"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              &nbsp;Active
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </section>

      {/* ── RAG Knowledge Base ──────────────────────────────────────────── */}
      <section className="card">
        <div className="section-header">
          <h2>Knowledge Base (RAG Documents)</h2>
          <Button onClick={() => { setEditDoc(null); setShowRagModal(true); }}>
            + Add Document
          </Button>
        </div>

        {docsLoading ? (
          <LoadingSpinner />
        ) : docs.length === 0 ? (
          <p className="empty-state">No documents yet. Add text or upload a file.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.documentId}>
                  <td>{doc.documentTitle}</td>
                  <td>
                    <span className={`badge badge-${doc.documentType.toLowerCase()}`}>
                      {doc.documentType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${doc.active ? 'badge-active' : 'badge-inactive'}`}>
                      {doc.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => { setEditDoc(doc); setShowRagModal(true); }}
                    >
                      Edit
                    </button>
                    &nbsp;|&nbsp;
                    <button
                      className="btn-link btn-danger"
                      onClick={() => handleDeleteDoc(doc.documentId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {docsTotalPages > 1 && (
          <div className="pagination">
            <button disabled={docsPage === 0} onClick={() => loadDocs(docsPage - 1)}>
              ‹ Prev
            </button>
            <span>Page {docsPage + 1} of {docsTotalPages}</span>
            <button
              disabled={docsPage >= docsTotalPages - 1}
              onClick={() => loadDocs(docsPage + 1)}
            >
              Next ›
            </button>
          </div>
        )}
      </section>

      <RagDocumentModal
        open={showRagModal}
        editDoc={editDoc}
        onClose={() => { setShowRagModal(false); setEditDoc(null); }}
        onSaved={handleDocSaved}
        mode="company"
      />
    </Layout>
  );
};

export default ChatbotSettingsPage;
