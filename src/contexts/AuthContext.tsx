import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase-config";

interface UserData {
  id: string;
  email: string;
  nome: string;
  role: "admin" | "user";
  [key: string]: any;
}

interface AuthContextType {
  user: any;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Verificar se é admin
          const adminQuery = query(
            collection(db, "admins"),
            where("email", "==", currentUser.email?.toLowerCase())
          );
          const adminSnapshot = await getDocs(adminQuery);

          if (!adminSnapshot.empty) {
            const adminDoc = adminSnapshot.docs[0];
            const adminData = adminDoc.data();

            setUser(currentUser);
            setUserData({
              id: adminDoc.id,
              email: adminData.email || currentUser.email,
              nome: adminData.nome || "Admin",
              role: "admin",
              ...adminData,
            });
          } else {
            // Verificar se é aluno
            console.log("🔍 Buscando aluno...");

            const alunoQuery = query(
              collection(db, "Alunos"),
              where("email", "==", currentUser.email?.toLowerCase())
            );
            const alunoSnapshot = await getDocs(alunoQuery);
            console.log(
              "✅ Aluno query executada, vazio?",
              alunoSnapshot.empty
            );
            if (!alunoSnapshot.empty) {
              const alunoDoc = alunoSnapshot.docs[0];
              const alunoData = alunoDoc.data();

              setUser(currentUser);
              setUserData({
                id: alunoDoc.id,
                email: alunoData.email || currentUser.email,
                nome: alunoData.nome || "Usuário",
                role: "user",
                ...alunoData,
              });
            } else {
              ("❌ Usuário não encontrado nas coleções");
              setUser(null);
              setUserData(null);
            }
          }
        } else {
          ("❌ Nenhum usuário logado");
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar dados do usuário:", error);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
