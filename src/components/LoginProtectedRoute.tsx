import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege a página de login
 * Redireciona usuários já logados para suas respectivas dashboards
 */
const LoginProtectedRoute = ({ children }: LoginProtectedRouteProps) => {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (loading) {
      ('⏳ LoginProtectedRoute - Carregando dados do usuário...');
      return;
    }

    // Se há usuário logado e dados carregados
    if (user && userData) {
      ('🔄 LoginProtectedRoute - Usuário já logado detectado:', userData.role);
      
      // Redirecionar baseado no role
      if (userData.role === 'admin') {
        ('👑 Redirecionando admin para dashboard...');
        navigate('/admin-dashboard', { replace: true });
      } else if (userData.role === 'user') {
        ('👤 Redirecionando aluno para dashboard...');
        navigate('/aluno', { replace: true });
      } else {
        ('❓ Role desconhecido:', userData.role);
        // Para roles desconhecidos, redirecionar para home
        navigate('/', { replace: true });
      }
    } else {
      ('✅ LoginProtectedRoute - Usuário não logado, permitindo acesso à página de login');
    }
  }, [user, userData, loading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário logado, mostrar a página de login
  if (!user || !userData) {
    return <>{children}</>;
  }

  // Se chegou até aqui, significa que o redirecionamento está acontecendo
  // Mostrar uma tela de loading temporária
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
};

export default LoginProtectedRoute;