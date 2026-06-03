import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, extractRoleFromToken, extractCompanyIdFromToken } from '../services/authService';
import type { Role } from '../types/user';
import '../styles/login.css';

const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mounted, setMounted]   = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Trigger entrance animation after mount
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data      = await authService.login({ email, password });
      const role      = (extractRoleFromToken(data.token) as Role) ?? 'SUPER_ADMIN';
      const companyId = extractCompanyIdFromToken(data.token);
      login(data.token, role, email, companyId);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${mounted ? 'login-page--in' : ''}`}>
      {/* Left panel — branding */}
      <div className="login-left" aria-hidden="true">
        <div className="login-left-content">
          <div className="login-brand">
            Rent<span className="login-brand-accent">A</span>Bot
          </div>
          <h2 className="login-tagline">
            AI chatbots,<br />rented — not built.
          </h2>
          <p className="login-sub">
            Deploy a fully trained chatbot on your website in minutes.
            No ML expertise needed.
          </p>
          <div className="login-orbs" aria-hidden="true">
            <div className="login-orb login-orb-1" />
            <div className="login-orb login-orb-2" />
            <div className="login-orb login-orb-3" />
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-form-wrap">
          {/* Back to landing */}
          <Link to="/" className="login-back">
            ← Back to RentABot
          </Link>

          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to your admin dashboard</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <span className="login-error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form" noValidate>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" aria-hidden="true" />
              ) : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <div className="login-hint">
            <p>Don't have an account?</p>
            <Link to="/#contact" className="login-contact-link">
              Contact Sales →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
