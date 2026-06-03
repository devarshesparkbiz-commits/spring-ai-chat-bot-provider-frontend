import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/companyService';
import { userService } from '../services/userService';
import { contactSalesAdminService } from '../services/contactSalesService';
import { myCompanyFaqService } from '../services/faqService';

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  onClick?: () => void;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon, label, value, sub, color, onClick, loading,
}) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s, transform 0.15s',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      if (!onClick) return;
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
  >
    {/* Colour accent bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 3, background: color, borderRadius: '14px 14px 0 0',
    }} />

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{icon}</span>
      {onClick && (
        <span style={{ fontSize: '0.75rem', color, fontWeight: 600, opacity: 0.8 }}>
          View →
        </span>
      )}
    </div>

    <div style={{
      fontSize: loading ? '1.2rem' : '2.2rem',
      fontWeight: 800,
      color: 'var(--color-text)',
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      letterSpacing: '-0.03em',
      lineHeight: 1,
    }}>
      {loading ? '…' : value}
    </div>

    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
      {label}
    </div>

    {sub && (
      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>
        {sub}
      </div>
    )}
  </div>
);

// ── Super Admin Dashboard ─────────────────────────────────────────────────────
const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [companies,    setCompanies]    = useState(0);
  const [adminUsers,   setAdminUsers]   = useState(0);
  const [companyUsers, setCompanyUsers] = useState(0);
  const [newSales,     setNewSales]     = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.allSettled([
      companyService.getPage(0, 1),
      userService.getAdminUsersPage(0, 1),
      userService.getCompanyUsersPage(0, 1),
      contactSalesAdminService.unreadCount(),
    ]).then(([c, a, u, s]) => {
      if (c.status === 'fulfilled') setCompanies(c.value.totalElements ?? 0);
      if (a.status === 'fulfilled') setAdminUsers(a.value.totalElements ?? 0);
      if (u.status === 'fulfilled') setCompanyUsers(u.value.totalElements ?? 0);
      if (s.status === 'fulfilled') setNewSales(s.value as number ?? 0);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1.25rem',
    }}>
      <StatCard
        icon="🏢"
        label="Companies"
        value={companies}
        sub="Active companies on the platform"
        color="#5865f2"
        loading={loading}
        onClick={() => navigate('/companies')}
      />
      <StatCard
        icon="👤"
        label="Admin Users"
        value={adminUsers}
        sub="Super admin accounts"
        color="#7c3aed"
        loading={loading}
        onClick={() => navigate('/admin-users')}
      />
      <StatCard
        icon="👥"
        label="Company Users"
        value={companyUsers}
        sub="Users across all companies"
        color="#0ea5e9"
        loading={loading}
        onClick={() => navigate('/company-users')}
      />
      <StatCard
        icon="📬"
        label="New Sales Enquiries"
        value={newSales}
        sub="Unread contact sales messages"
        color={newSales > 0 ? '#ef4444' : '#22c55e'}
        loading={loading}
        onClick={() => navigate('/contact-sales')}
      />
    </div>
  );
};

// ── Company Admin Dashboard ───────────────────────────────────────────────────
const CompanyAdminDashboard: React.FC = () => {
  const navigate   = useNavigate();
  const { companyId } = useAuth();
  const [users,   setUsers]   = useState(0);
  const [faqs,    setFaqs]    = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      userService.getCompanyUsersPage(0, 1, companyId),
      myCompanyFaqService.getPaginated(0, 1),
    ]).then(([u, f]) => {
      if (u.status === 'fulfilled') setUsers(u.value.totalElements ?? 0);
      if (f.status === 'fulfilled') setFaqs(f.value.totalElements ?? 0);
      setLoading(false);
    });
  }, [companyId]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1.25rem',
    }}>
      <StatCard
        icon="👥"
        label="Company Users"
        value={users}
        sub="Users in your company"
        color="#0ea5e9"
        loading={loading}
        onClick={() => navigate('/company-users')}
      />
      <StatCard
        icon="❓"
        label="FAQs"
        value={faqs}
        sub="Published FAQ entries"
        color="#f59e0b"
        loading={loading}
        onClick={() => navigate('/faqs')}
      />
    </div>
  );
};

// ── Company User Dashboard ────────────────────────────────────────────────────
const CompanyUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1.25rem',
    }}>
      <StatCard
        icon="💬"
        label="Chat"
        value="Open"
        sub="Start a conversation with the AI assistant"
        color="#5865f2"
        onClick={() => navigate('/chat')}
      />
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { userRole, userName } = useAuth();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN:   'Super Admin',
    COMPANY_ADMIN: 'Company Admin',
    COMPANY_USER:  'Company User',
  };

  return (
    <Layout>
      {/* ── Welcome banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #5865f2 0%, #7c3aed 100%)',
        borderRadius: 14,
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            fontWeight: 800,
            fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
            letterSpacing: '-0.03em',
            color: '#fff',
          }}>
            {greeting}{userName ? `, ${userName.split('@')[0]}` : ''}! 👋
          </h1>
          <p style={{ margin: '0.35rem 0 0', opacity: 0.8, fontSize: '0.92rem' }}>
            Signed in as <strong>{roleLabel[userRole ?? ''] ?? userRole}</strong>
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 10,
          padding: '0.5rem 1rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          backdropFilter: 'blur(4px)',
        }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* ── Role-specific stats ─────────────────────────────────────────────── */}
      <h2 style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
        marginBottom: '1rem',
      }}>
        Overview
      </h2>

      {userRole === 'SUPER_ADMIN'   && <SuperAdminDashboard />}
      {userRole === 'COMPANY_ADMIN' && <CompanyAdminDashboard />}
      {userRole === 'COMPANY_USER'  && <CompanyUserDashboard />}
    </Layout>
  );
};

export default DashboardPage;
