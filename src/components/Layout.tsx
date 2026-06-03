import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileService } from '../services/profileService';
import UserAvatar from './common/UserAvatar';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
}

const NAV_LINKS: Record<string, { label: string; to: string }[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard',     to: '/dashboard'      },
    { label: 'Companies',     to: '/companies'      },
    { label: 'Admin Users',   to: '/admin-users'    },
    { label: 'Company Users', to: '/company-users'  },
    { label: 'Contact Sales', to: '/contact-sales'  },
  ],
  COMPANY_ADMIN: [
    { label: 'Dashboard',     to: '/dashboard'     },
    { label: 'FAQs',          to: '/faqs'          },
    { label: 'Chatbot',       to: '/chatbot'       },
    { label: 'API Keys',      to: '/api-keys'      },
    { label: 'Company Users', to: '/company-users' },
  ],
  COMPANY_USER: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Chat',      to: '/chat'      },
  ],
};

const THEME_META = {
  light:  { icon: '☀️', label: 'Light'  },
  dark:   { icon: '🌙', label: 'Dark'   },
  system: { icon: '💻', label: 'System' },
};

// ── Navbar avatar ─────────────────────────────────────────────────────────────
const NavAvatar: React.FC<{ userName: string | null }> = ({ userName }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; profileImageUrl?: string } | null>(null);

  useEffect(() => {
    profileService.get()
      .then(p => setProfile({ firstName: p.firstName, lastName: p.lastName, profileImageUrl: p.profileImageUrl }))
      .catch(() => {});
  }, []);

  // Derive initials from userName email if profile not loaded yet
  const fallbackName = userName?.split('@')[0] ?? '';
  const firstName = profile?.firstName ?? fallbackName;
  const lastName  = profile?.lastName  ?? '';

  return (
    <button
      onClick={() => navigate('/profile')}
      title="My Profile"
      aria-label="My Profile"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Wrap in a div to add the white border ring */}
      <div style={{
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        lineHeight: 0,
      }}>
        <UserAvatar
          firstName={firstName}
          lastName={lastName}
          profileImageUrl={profile?.profileImageUrl}
          size={32}
        />
      </div>
    </button>
  );
};

// ── Layout ────────────────────────────────────────────────────────────────────
const Layout: React.FC<LayoutProps> = ({ children, fullHeight = false }) => {
  const navigate = useNavigate();
  const { userRole, userName, logout } = useAuth();
  const { mode, cycle } = useTheme();

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = (userRole && NAV_LINKS[userRole]) ?? [];
  const meta  = THEME_META[mode];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand"><h1>Admin Panel</h1></div>

        <div className="navbar-menu">
          {links.map(link => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </div>

        <div className="navbar-user">
          {/* Theme cycle */}
          <button
            className="theme-toggle"
            onClick={cycle}
            aria-label={`Theme: ${meta.label}. Click to cycle.`}
            title={`Theme: ${meta.label}`}
          >
            {meta.icon}
          </button>

          {/* Profile avatar */}
          <NavAvatar userName={userName} />

          {/* Username (hidden on small screens via CSS) */}
          {userName && (
            <span className="navbar-username">{userName.split('@')[0]}</span>
          )}

          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className={`main-content${fullHeight ? ' main-content--chat' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
