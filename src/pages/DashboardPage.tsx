import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface DashboardCard {
  title: string;
  items: string[];
}

const ROLE_CONTENT: Record<string, { heading: string; cards: DashboardCard[] }> = {
  SUPER_ADMIN: {
    heading: 'Super Admin Dashboard',
    cards: [
      {
        title: 'Companies',
        items: ['Create, read, and update companies'],
      },
      {
        title: 'Admin Users',
        items: ['Manage super admin accounts'],
      },
      {
        title: 'Company Users',
        items: ['Manage all company users across the platform'],
      },
    ],
  },
  COMPANY_ADMIN: {
    heading: 'Company Admin Dashboard',
    cards: [
      {
        title: 'FAQs',
        items: ['Add, update, and manage FAQs for your company'],
      },
      {
        title: 'Company Users',
        items: ['Create, read, and update company users'],
      },
    ],
  },
  COMPANY_USER: {
    heading: 'User Dashboard',
    cards: [
      {
        title: 'Welcome',
        items: ['View your company information'],
      },
    ],
  },
};

const DashboardPage: React.FC = () => {
  const { userRole, userName } = useAuth();
  const content = (userRole && ROLE_CONTENT[userRole]) ?? ROLE_CONTENT['COMPANY_USER'];

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-welcome">
        <p>
          Welcome back{userName ? `, ${userName}` : ''}! You are signed in as{' '}
          <strong>{userRole}</strong>.
        </p>
      </div>
      <h2 className="dashboard-heading">{content.heading}</h2>
      <div className="dashboard-cards">
        {content.cards.map(card => (
          <div key={card.title} className="dashboard-card">
            <h3>{card.title}</h3>
            <ul>
              {card.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default DashboardPage;
