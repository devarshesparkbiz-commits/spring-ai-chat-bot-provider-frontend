import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner" role="status" aria-label="Loading">
    <div className="spinner" />
    <span>Loading...</span>
  </div>
);

export default LoadingSpinner;
