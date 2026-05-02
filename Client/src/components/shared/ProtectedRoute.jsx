import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Fuel } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], publicOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="bg-amber-500 p-3 rounded-2xl animate-bounce">
          <Fuel className="text-white" size={32} />
        </div>
      </div>
    );
  }

  // If page is for non-logged users only (Login/Register)
  if (publicOnly && user) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'owner') return <Navigate to="/dashboard/pump" replace />;
    return <Navigate to="/" replace />;
  }

  // If page requires auth and user is not logged in
  if (!publicOnly && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If page requires specific role and user role doesn't match
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access something else
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'owner') return <Navigate to="/dashboard/pump" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
