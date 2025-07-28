// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // Importa o tipo ReactNode separadamente
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'; // Importa o tipo User separadamente
import { auth } from '../firebase-config'; // Importa a instância de autenticação do Firebase

// Definimos o "formato" das informações que o nosso contexto vai fornecer
type AuthContextType = {
    currentUser: User | null; // O usuário pode ser um objeto 'User' do Firebase ou nulo.
    loading: boolean; // Um estado para sabermos se a verificação inicial já terminou
};

// Criamos o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criamos o nosso Provedor (o componente que vai "abraçar" o app)
type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); //Começa como 'true' para indicar que está verificando o usuário

    useEffect(() => {
        // A mágica do Firebase: onAuthStateChanged
        // Esta função é um "ouvinte". Ela roda uma vez quando é montada, e depois
        // roda de novo TODA VEZ que o estado de autenticação do usuário muda (login ou logout).
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user); // Define o usuário (pode ser o objeto do usuário ou null)
            setLoading(false); // Marca que a verificação inicial terminou
        });

        // Função de limpeza: Quando o componente for desmontado, o "ouvinte" é removido
        // Isso evite vazamentos de memória
        return unsubscribe
    }, []);

    // O valor que será compartilhado com todos os componentes filhos
    const value = {
        currentUser,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );  
}

// Criamos nosso Hook customizado para facilitar o uso do contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}