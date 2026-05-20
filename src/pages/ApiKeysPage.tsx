import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import { apiKeyService, type ApiKey } from '../services/apiKeyService';
import IntegrationDocsModal from '../components/apikey/IntegrationDocsModal';
import NewKeyModal from '../components/apikey/NewKeyModal';

const ApiKeysPage: React.FC = () => {
  const [keys, setKeys]           = useState<ApiKey[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [revealedKey, setRevealedKey] = useState<ApiKey | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDocs, setShowDocs]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const keyInputRef               = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      setKeys(await apiKeyService.list());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Called after create or regenerate — shows the plain key banner
  const handleKeyRevealed = (key: ApiKey) => {
    setRevealedKey(key);
    setShowNewModal(false);
    setCopied(false);
    load();
  };

  const handleRevoke = async (keyId: number) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      await apiKeyService.revoke(keyId);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to revoke key');
    }
  };

  const handleRegenerate = async (keyId: number, keyName: string) => {
    if (!confirm(`Regenerate key "${keyName}"? The current key will stop working immediately.`)) return;
    try {
      const fresh = await apiKeyService.regenerate(keyId);
      handleKeyRevealed(fresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to regenerate key');
    }
  };

  // Selects all text in the readonly input then copies to clipboard
  const copyKey = () => {
    const input = keyInputRef.current;
    if (!input || !revealedKey?.plainKey) return;
    input.select();
    input.setSelectionRange(0, revealedKey.plainKey.length); // mobile support
    navigator.clipboard.writeText(revealedKey.plainKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      // Fallback for environments where clipboard API is unavailable
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>API Keys</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button onClick={() => setShowDocs(true)}>📄 Integration Docs</Button>
          <Button onClick={() => setShowNewModal(true)}>+ Generate Key</Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* ── Revealed key banner (shown after create or regenerate) ─────────── */}
      {revealedKey?.plainKey && (
        <div className="new-key-banner" role="alert">
          <div className="new-key-banner-header">
            <span>🔑 <strong>{revealedKey.keyName}</strong> — copy this key now, it won't be shown again</span>
            <button className="banner-dismiss" onClick={() => setRevealedKey(null)} aria-label="Dismiss">×</button>
          </div>
          <div className="new-key-value">
            <input
              ref={keyInputRef}
              type="text"
              readOnly
              value={revealedKey.plainKey}
              className="key-input-readonly"
              onFocus={e => {
                e.target.select();
                e.target.setSelectionRange(0, revealedKey.plainKey!.length);
              }}
              aria-label="Full API Key"
              spellCheck={false}
              autoComplete="off"
            />
            <button className="copy-btn" onClick={copyKey}>
              {copied ? '✓ Copied!' : 'Copy Full Key'}
            </button>
          </div>
          <p className="new-key-hint">
            Prefix shown in table: <code>{revealedKey.keyPrefix}…</code>
          </p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : keys.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <p>No API keys yet. Generate one to start integrating your chatbot.</p>
        </div>
      ) : (
        <table className="data-table" style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Key Prefix</th>
              <th>Allowed Origins</th>
              <th>Status</th>
              <th>Last Used</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.keyId}>
                <td><strong>{k.keyName}</strong></td>
                <td>
                  <code className="key-prefix">{k.keyPrefix}…</code>
                </td>
                <td>
                  {k.allowedOrigins
                    ? <span className="origins-list">{k.allowedOrigins}</span>
                    : <span className="hint">All origins</span>}
                </td>
                <td>
                  <span className={`badge ${k.active ? 'badge-active' : 'badge-inactive'}`}>
                    {k.active ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}</td>
                <td>{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '—'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {k.active && (
                    <>
                      <button
                        className="btn-link"
                        onClick={() => handleRegenerate(k.keyId, k.keyName)}
                        title="Revoke this key and generate a new one with the same settings"
                      >
                        🔄 Regenerate
                      </button>
                      &nbsp;|&nbsp;
                      <button
                        className="btn-link btn-danger"
                        onClick={() => handleRevoke(k.keyId)}
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <NewKeyModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleKeyRevealed}
      />

      <IntegrationDocsModal
        open={showDocs}
        onClose={() => setShowDocs(false)}
      />
    </Layout>
  );
};

export default ApiKeysPage;
