import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
}

const NAV_LINKS: Record<string, { label: string; to: string }[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard',     to: '/dashboard'     },
    { label: 'Companies',     to: '/companies'     },
    { label: 'Admin Users',   to: '/admin-users'   },
    { label: 'Company Users', to: '/company-users' },
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
          {userName && <span className="navbar-username">{userName}</span>}

          <button
            className="theme-toggle"
            onClick={cycle}
            aria-label={`Theme: ${meta.label}. Click to cycle.`}
            title={`Theme: ${meta.label}`}
          >
            {meta.icon}
          </button>

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
