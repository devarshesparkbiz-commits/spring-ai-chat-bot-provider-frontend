import React from 'react';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="error-alert" role="alert">
    <strong>Error:</strong> {message}
  </div>
);

export default ErrorAlert;
