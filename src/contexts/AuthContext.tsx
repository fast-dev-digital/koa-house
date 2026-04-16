import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { normalizeEmail } from "../utils/tenant";
import {
  buscarAdminPorEmail,
  buscarAlunoPorEmail,
} from "../services/identityLookupService";

interface UserData {
  id: string;
  email: string;
  nome: string;
  role: "admin" | "user";
  tenantId?: string | null;
  tenantIds?: string[];
  [key: string]: any;
}

interface AuthContextType {
  user: any;
  userData: UserData | null;
  currentTenantId: string | null;
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
  const currentTenantId = userData?.tenantId ?? null;

  useEffect(() => {
    const finalizarSessaoInvalida = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Erro ao encerrar sessão inválida:", error);
      }
      setUser(null);
      setUserData(null);
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const normalizedEmail = normalizeEmail(currentUser.email);

          // Verificar se é admin
          const adminIdentity = await buscarAdminPorEmail(normalizedEmail);

          if (adminIdentity) {
            const adminData = adminIdentity.data as Record<string, any>;
            const tenantId = adminIdentity.tenantId;

            if (!tenantId) {
              console.error("Admin autenticado sem tenantId válido.");
              await finalizarSessaoInvalida();
              return;
            }

            setUser(currentUser);
            setUserData({
              id: adminIdentity.id,
              email: adminData.email || currentUser.email,
              nome: adminData.nome || "Admin",
              role: "admin",
              tenantId,
              tenantIds: tenantId ? [tenantId] : [],
              ...adminData,
            });
          } else {
            // Verificar se é aluno

            const alunoIdentity = await buscarAlunoPorEmail(normalizedEmail, {
              expectedAuthUid: currentUser.uid,
            });
            if (alunoIdentity) {
              const alunoData = alunoIdentity.data as Record<string, any>;
              const tenantId = alunoIdentity.tenantId;

              if (!tenantId) {
                console.error("Aluno autenticado sem tenantId válido.");
                await finalizarSessaoInvalida();
                return;
              }

              setUser(currentUser);
              setUserData({
                id: alunoIdentity.id,
                email: alunoData.email || currentUser.email,
                nome: alunoData.nome || "Usuário",
                role: "user",
                tenantId,
                tenantIds: tenantId ? [tenantId] : [],
                ...alunoData,
              });
            } else {
              ("❌ Usuário não encontrado nas coleções");
              await finalizarSessaoInvalida();
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
    currentTenantId,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
