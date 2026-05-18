import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS: Record<string, { label: string; to: string }[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Companies', to: '/companies' },
    { label: 'Admin Users', to: '/admin-users' },
    { label: 'Company Users', to: '/company-users' },
  ],
  COMPANY_ADMIN: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Company Users', to: '/company-users' },
  ],
  COMPANY_USER: [{ label: 'Dashboard', to: '/dashboard' }],
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { userRole, userName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = (userRole && NAV_LINKS[userRole]) ?? [];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>Admin Panel</h1>
        </div>
        <div className="navbar-menu">
          {links.map(link => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="navbar-user">
          {userName && <span className="navbar-username">{userName}</span>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
