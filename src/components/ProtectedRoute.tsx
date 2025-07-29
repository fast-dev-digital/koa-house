import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase-config";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        (async () => {
          const docRef = doc(db, "admins", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setLoading(false);
        })();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;

  if (!isAdmin) return <Navigate to="/login" replace />;

  return <>{children}</>;
}