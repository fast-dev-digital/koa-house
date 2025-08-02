import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userData, loading } = useAuth();

  // LOGS DETALHADOS PARA DEBUG

  if (loading) {
    ('⏳ ProtectedRoute - AINDA CARREGANDO');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    ('🚫 ProtectedRoute - SEM USER - Redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  if (!userData) {
    ('🚫 ProtectedRoute - SEM USERDATA - Redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userData.role !== requiredRole) {
    (`🚫 ProtectedRoute - ROLE INCORRETA: ${userData.role} !== ${requiredRole}`);
    return <Navigate to="/login" replace />;
  }

  ('✅ ProtectedRoute - ACESSO LIBERADO!');
  return <>{children}</>;
};

export default ProtectedRoute;