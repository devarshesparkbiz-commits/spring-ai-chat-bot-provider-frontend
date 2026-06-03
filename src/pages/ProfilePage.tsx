import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { profileService, type UserProfile } from '../services/profileService';

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar: React.FC<{
  profile: UserProfile;
  onUpload: (f: File) => void;
  onRemove: () => void;
  uploading: boolean;
}> = ({ profile, onUpload, onRemove, uploading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      {/* Avatar circle */}
      <div
        style={{
          width: 110, height: 110, borderRadius: '50%',
          background: profile.profileImageUrl
            ? `url(${profile.profileImageUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg,#5865f2,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem', fontWeight: 800, color: '#fff',
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          border: '3px solid var(--color-border)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {!profile.profileImageUrl && initials}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 24, height: 24,
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'login-spin 0.65s linear infinite',
            }} />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.35rem 0.9rem', borderRadius: 8,
            border: '1.5px solid #5865f2', background: 'rgba(88,101,242,0.08)',
            color: '#5865f2', fontSize: '0.82rem', fontWeight: 600,
            cursor: uploading ? 'wait' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {profile.profileImageUrl ? '📷 Change' : '📷 Upload'}
        </button>
        {profile.profileImageUrl && (
          <button
            onClick={onRemove}
            disabled={uploading}
            style={{
              padding: '0.35rem 0.9rem', borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600,
              cursor: uploading ? 'wait' : 'pointer', fontFamily: 'inherit',
            }}
          >
            Remove
          </button>
        )}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
        JPG, PNG or GIF · max 5 MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) { onUpload(f); e.target.value = ''; }
        }}
      />
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const [profile,   setProfile]   = useState<UserProfile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Profile form
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [savingInfo,   setSavingInfo]   = useState(false);
  const [infoSuccess,  setInfoSuccess]  = useState('');
  const [infoError,    setInfoError]    = useState('');

  // Password form
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCurr,   setShowCurr]   = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [savingPw,   setSavingPw]   = useState(false);
  const [pwSuccess,  setPwSuccess]  = useState('');
  const [pwError,    setPwError]    = useState('');

  // Image
  const [uploading, setUploading] = useState(false);
  const [imgError,  setImgError]  = useState('');

  useEffect(() => {
    profileService.get()
      .then(p => {
        setProfile(p);
        setFirstName(p.firstName ?? '');
        setLastName(p.lastName ?? '');
        setMobileNumber(p.mobileNumber ?? '');
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true); setInfoError(''); setInfoSuccess('');
    try {
      const updated = await profileService.update({ firstName, lastName, mobileNumber });
      setProfile(updated);
      setInfoSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setInfoError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    setSavingPw(true); setPwError(''); setPwSuccess('');
    try {
      const res = await profileService.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setPwSuccess(res.message);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setSavingPw(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setImgError('File must be under 5 MB'); return; }
    setUploading(true); setImgError('');
    try {
      const updated = await profileService.uploadImage(file);
      setProfile(updated);
    } catch (err: unknown) {
      setImgError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setUploading(true); setImgError('');
    try {
      const updated = await profileService.removeImage();
      setProfile(updated);
    } catch (err: unknown) {
      setImgError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      {error && <ErrorAlert message={error} />}

      {profile && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Left: avatar + read-only info ─────────────────────────────── */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14, padding: '2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Avatar
              profile={profile}
              onUpload={handleUpload}
              onRemove={handleRemoveImage}
              uploading={uploading}
            />
            {imgError && (
              <p style={{ fontSize: '0.8rem', color: '#dc2626', textAlign: 'center', margin: 0 }}>
                {imgError}
              </p>
            )}

            <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                Account Info
              </div>
              {[
                { label: 'Email',   value: profile.email },
                { label: 'Role',    value: profile.userRole?.replace('_', ' ') },
                { label: 'Company', value: profile.companyName ?? '—' },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{row.label}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', wordBreak: 'break-all' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: edit forms ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Personal info */}
            <section style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 14, padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--color-text)' }}>
                Personal Information
              </h2>

              {infoError   && <div style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', borderLeft: '3px solid #dc2626', padding: '0.65rem 0.9rem', borderRadius: 6, fontSize: '0.88rem', marginBottom: '1rem' }}>{infoError}</div>}
              {infoSuccess && <div style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a', borderLeft: '3px solid #16a34a', padding: '0.65rem 0.9rem', borderRadius: 6, fontSize: '0.88rem', marginBottom: '1rem' }}>{infoSuccess}</div>}

              <form onSubmit={handleSaveInfo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { id: 'fn', label: 'First Name', value: firstName, set: setFirstName, required: true },
                  { id: 'ln', label: 'Last Name',  value: lastName,  set: setLastName,  required: true },
                ].map(f => (
                  <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor={f.id} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{f.label}</label>
                    <input
                      id={f.id} type="text" value={f.value} required={f.required}
                      onChange={e => f.set(e.target.value)}
                      style={{ padding: '0.65rem 0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', color: 'var(--color-text)', background: 'var(--color-surface)', outline: 'none' }}
                      onFocus={e => (e.target.style.borderColor = '#5865f2')}
                      onBlur={e  => (e.target.style.borderColor = 'var(--color-border)')}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: '1 / -1' }}>
                  <label htmlFor="mob" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>Mobile Number</label>
                  <input
                    id="mob" type="tel" value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    placeholder="+1 555 000 0000"
                    style={{ padding: '0.65rem 0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', color: 'var(--color-text)', background: 'var(--color-surface)', outline: 'none' }}
                    onFocus={e => (e.target.style.borderColor = '#5865f2')}
                    onBlur={e  => (e.target.style.borderColor = 'var(--color-border)')}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit" disabled={savingInfo}
                    style={{
                      padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg,#5865f2,#7c3aed)',
                      color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                      cursor: savingInfo ? 'wait' : 'pointer', fontFamily: 'inherit',
                      opacity: savingInfo ? 0.7 : 1,
                    }}
                  >
                    {savingInfo ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </section>

            {/* Change password */}
            <section style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 14, padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--color-text)' }}>
                Change Password
              </h2>

              {pwError   && <div style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', borderLeft: '3px solid #dc2626', padding: '0.65rem 0.9rem', borderRadius: 6, fontSize: '0.88rem', marginBottom: '1rem' }}>{pwError}</div>}
              {pwSuccess && <div style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a', borderLeft: '3px solid #16a34a', padding: '0.65rem 0.9rem', borderRadius: 6, fontSize: '0.88rem', marginBottom: '1rem' }}>{pwSuccess}</div>}

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { id: 'cpw', label: 'Current Password', value: currentPw, set: setCurrentPw, show: showCurr, toggle: () => setShowCurr(v => !v) },
                  { id: 'npw', label: 'New Password',     value: newPw,     set: setNewPw,     show: showNew,  toggle: () => setShowNew(v => !v)  },
                  { id: 'cpw2', label: 'Confirm New Password', value: confirmPw, set: setConfirmPw, show: showNew, toggle: () => setShowNew(v => !v) },
                ].map(f => (
                  <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor={f.id} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id={f.id} type={f.show ? 'text' : 'password'}
                        value={f.value} required
                        onChange={e => f.set(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', color: 'var(--color-text)', background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#5865f2')}
                        onBlur={e  => (e.target.style.borderColor = 'var(--color-border)')}
                      />
                      <button
                        type="button" onClick={f.toggle}
                        style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.55, lineHeight: 1 }}
                      >
                        {f.show ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit" disabled={savingPw}
                    style={{
                      padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg,#5865f2,#7c3aed)',
                      color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                      cursor: savingPw ? 'wait' : 'pointer', fontFamily: 'inherit',
                      opacity: savingPw ? 0.7 : 1,
                    }}
                  >
                    {savingPw ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;
