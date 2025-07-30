import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase-config";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'user' | 'any'; // Define que tipo de usuário pode acessar
}

export default function ProtectedRoute({ children, requireRole = 'any' }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        (async () => {
          // Verifica se é admin
          const adminDocRef = doc(db, "admins", user.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          
          if (adminDocSnap.exists() && adminDocSnap.data().role === "admin") {
            setIsAdmin(true);
            setIsUser(false);
          } else {
            // Verifica se é usuário comum
            const userDocRef = doc(db, "Alunos", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              setIsUser(true);
              setIsAdmin(false);
            } else {
              setIsUser(false);
              setIsAdmin(false);
            }
          }
          setLoading(false);
        })();
      } else {
        setIsAdmin(false);
        setIsUser(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;

  // Lógica de segurança baseada no role requerido
  if (requireRole === 'admin') {
    // Apenas admins podem acessar
    if (!isAdmin) return <Navigate to="/login" replace />;
  } else if (requireRole === 'user') {
    // Apenas usuários comuns podem acessar
    if (!isUser) return <Navigate to="/login" replace />;
  } else {
    // requireRole === 'any' - qualquer usuário logado pode acessar
    if (!isAdmin && !isUser) return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};