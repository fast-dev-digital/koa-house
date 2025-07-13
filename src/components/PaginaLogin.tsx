// src/components/PaginaLogin.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Ferramentas de autenticação do arquivo de config do Firebase
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';

function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estados para feedback ao usuário
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (evento: React.FormEvent) => {
    evento.preventDefault();

    // Limpa erros antigos e ativa o estado de carregamento
    setError('');
    setLoading(true);

    try {
      // Chamada principal para o Firebase
      await signInWithEmailAndPassword(auth, email, senha);
      alert('Login bem sucedido!');
      // Aqui redirecionar user para tela principal
    } catch (err: any) {
      // Se der erro, mesangem amigável
      console.error("Erro no login:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao fazer login. Tente novamente');
      }
    } finally {
      // Independente do resultado, desativa o estado de carregando
      setLoading(false);
    }
  };
 
  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bem vindo à Arena Brazuka!</h1>
          <p className="text-gray-500">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password"
              id="senha"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Sua senha"
              required
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
            disabled={loading} // O botão fica desabilitado enquanto tiver carregando
          >
            {loading ? 'Entrando...' : 'Entrar'} {/* Muda o texto do botão*/}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?
          <Link to="/cadastro" className="font-medium text-blue-600 hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default PaginaLogin;