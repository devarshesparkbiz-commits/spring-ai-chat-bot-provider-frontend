import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import {
  contactSalesAdminService,
  STATUS_META,
  STATUS_FLOW,
  type ContactSalesEntry,
  type ContactSalesStatus,
} from '../services/contactSalesService';

// ── Status badge-select — one-way flow only (no backtracking) ────────────────
const StatusChanger: React.FC<{
  entry: ContactSalesEntry;
  onChange: (id: number, status: ContactSalesStatus) => Promise<void>;
}> = ({ entry, onChange }) => {
  const [busy, setBusy] = useState(false);
  const meta            = STATUS_META[entry.status];
  const currentIdx      = STATUS_FLOW.indexOf(entry.status);
  // Only allow current status and forward — past options are excluded
  const allowedOptions  = STATUS_FLOW.slice(currentIdx);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const next = e.target.value as ContactSalesStatus;
    if (next === entry.status) return;
    setBusy(true);
    try { await onChange(entry.id, next); } finally { setBusy(false); }
  };

  return (
    <select
      value={entry.status}
      onChange={handleChange}
      disabled={busy || entry.status === 'GHOSTED'}
      onClick={e => e.stopPropagation()}
      style={{
        display: 'inline-block',
        padding: '0.22rem 1.6rem 0.22rem 0.65rem',
        borderRadius: 999,
        border: `1.5px solid ${meta.color}`,
        background: meta.bg,
        color: meta.color,
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        cursor: busy || entry.status === 'GHOSTED' ? 'default' : 'pointer',
        outline: 'none',
        appearance: 'auto',
        WebkitAppearance: 'auto',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
      }}
      aria-label="Change status"
    >
      {allowedOptions.map(s => (
        <option key={s} value={s} style={{ background: '#fff', color: '#333', fontWeight: 600 }}>
          {STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const ContactSalesPage: React.FC = () => {
  const [entries, setEntries]           = useState<ContactSalesEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selected, setSelected]         = useState<ContactSalesEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContactSalesStatus | 'ALL'>('ALL');

  const load = useCallback(async (p = 0) => {
    try {
      setLoading(true);
      const res = await contactSalesAdminService.list(p, 20);
      setEntries(res.data);
      setPage(res.pageNumber);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const handleStatusChange = async (id: number, status: ContactSalesStatus) => {
    const updated = await contactSalesAdminService.updateStatus(id, status);
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...updated } : null);
  };

  const openEntry = (entry: ContactSalesEntry) => {
    setSelected(entry);
    if (!entry.read) {
      contactSalesAdminService.markRead(entry.id).catch(() => {});
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, read: true } : e));
    }
  };

  const displayed = filterStatus === 'ALL'
    ? entries
    : entries.filter(e => e.status === filterStatus);

  // Count per status for filter tabs
  const counts = STATUS_FLOW.reduce((acc, s) => {
    acc[s] = entries.filter(e => e.status === s).length;
    return acc;
  }, {} as Record<ContactSalesStatus, number>);

  return (
    <Layout>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Contact Sales</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            {totalElements} total enquir{totalElements === 1 ? 'y' : 'ies'}
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* ── Status filter tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['ALL', ...STATUS_FLOW] as const).map(s => {
          const isAll    = s === 'ALL';
          const active   = filterStatus === s;
          const count    = isAll ? entries.length : counts[s as ContactSalesStatus];
          const meta     = isAll ? null : STATUS_META[s as ContactSalesStatus];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 999,
                border: active
                  ? `2px solid ${isAll ? '#5865f2' : meta!.color}`
                  : '2px solid var(--color-border)',
                background: active
                  ? (isAll ? 'rgba(88,101,242,0.1)' : meta!.bg)
                  : 'transparent',
                color: active
                  ? (isAll ? '#5865f2' : meta!.color)
                  : 'var(--color-text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {isAll ? 'All' : meta!.label}
              <span style={{
                background: active
                  ? (isAll ? '#5865f2' : meta!.color)
                  : 'var(--color-border)',
                color: active ? '#fff' : 'var(--color-text-muted)',
                borderRadius: 999,
                padding: '0 0.4rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                minWidth: 18,
                textAlign: 'center',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner />
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No enquiries{filterStatus !== 'ALL' ? ` with status "${STATUS_META[filterStatus].label}"` : ''}.
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 10 }} />
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(e => (
                    <tr
                      key={e.id}
                      style={{ cursor: 'pointer', fontWeight: e.read ? 400 : 600 }}
                      onClick={() => openEntry(e)}
                    >
                      {/* Unread dot */}
                      <td>
                        {!e.read && (
                          <span style={{
                            display: 'inline-block', width: 8, height: 8,
                            borderRadius: '50%', background: '#5865f2',
                          }} title="Unread" />
                        )}
                      </td>
                      <td>{e.fullName}</td>
                      <td style={{ fontSize: '0.88rem' }}>{e.email}</td>
                      <td>{e.companyName}</td>
                      <td style={{
                        maxWidth: 220, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontSize: '0.88rem', color: 'var(--color-text-muted)',
                      }}>
                        {e.message || '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Status — one-way badge-select */}
                      <td onClick={ev => ev.stopPropagation()}>
                        <StatusChanger entry={e} onChange={handleStatusChange} />
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '1rem' }}>
              <button disabled={page === 0} onClick={() => load(page - 1)}>‹ Prev</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>Next ›</button>
            </div>
          )}
        </>
      )}

      {/* ── Detail modal ───────────────────────────────────────────────────── */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 16, padding: '2rem',
              width: '100%', maxWidth: 540,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              animation: 'modal-in 0.18s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selected.fullName}</h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                  {selected.email} · {selected.companyName}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
              >×</button>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Message
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--color-text)', whiteSpace: 'pre-wrap', margin: 0 }}>
                {selected.message || 'No message provided.'}
              </p>
            </div>

            {/* Status pipeline in modal */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                Pipeline Status
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {STATUS_FLOW.map((s, idx) => {
                  const meta      = STATUS_META[s];
                  const isCurrent = selected.status === s;
                  const isPast    = STATUS_FLOW.indexOf(selected.status) > idx;
                  const isFuture  = STATUS_FLOW.indexOf(selected.status) < idx;
                  return (
                    <React.Fragment key={s}>
                      <button
                        disabled={isPast || isCurrent}
                        onClick={() => !isPast && !isCurrent && handleStatusChange(selected.id, s)}
                        style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: 999,
                          border: `2px solid ${isCurrent ? meta.color : isPast ? meta.color : 'var(--color-border)'}`,
                          background: isCurrent ? meta.bg : isPast ? meta.bg : 'transparent',
                          color: isCurrent ? meta.color : isPast ? meta.color : 'var(--color-text-muted)',
                          fontSize: '0.8rem',
                          fontWeight: isCurrent ? 700 : 500,
                          cursor: isFuture ? 'pointer' : 'default',
                          opacity: isPast ? 0.4 : 1,
                          transition: 'all 0.15s',
                        }}
                        title={isFuture ? `Advance to ${meta.label}` : meta.label}
                      >
                        {isCurrent && '● '}{meta.label}
                      </button>
                      {idx < STATUS_FLOW.length - 1 && (
                        <span style={{ color: 'var(--color-border)', fontSize: '0.8rem' }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}
              </span>
              <a
                href={`mailto:${selected.email}?subject=Re: Your RentABot enquiry`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'linear-gradient(135deg,#5865f2,#7c3aed)',
                  color: '#fff', borderRadius: 8, padding: '0.5rem 1.1rem',
                  fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                }}
              >
                ✉ Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ContactSalesPage;
