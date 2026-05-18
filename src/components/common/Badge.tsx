import React from 'react';

interface BadgeProps {
  active: boolean;
}

const Badge: React.FC<BadgeProps> = ({ active }) => (
  <span className={`badge ${active ? 'badge-active' : 'badge-inactive'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

export default Badge;
