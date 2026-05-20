import React from 'react';
import type { SortState } from '../../hooks/useTableControls';

interface SortIconProps {
  columnKey: string;
  sort: SortState | null;
}

const SortIcon: React.FC<SortIconProps> = ({ columnKey, sort }) => {
  if (sort?.key !== columnKey) {
    return <span className="sort-icon sort-icon--idle" aria-hidden="true">⇅</span>;
  }
  return (
    <span className="sort-icon sort-icon--active" aria-hidden="true">
      {sort.dir === 'asc' ? '↑' : '↓'}
    </span>
  );
};

export default SortIcon;
