import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedActionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedAction: React.FC<ProtectedActionProps> = ({ children, fallback }) => {
  const { isAuthenticated, setShowLoginModal } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setShowLoginModal(true);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
};

export default ProtectedAction;
