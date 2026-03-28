import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OwnerRoute({ children }) {
  const { isAuthenticated, isOwner } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!isOwner) {
    return <Navigate to="/catalog" replace />;
  }

  return children;
}
