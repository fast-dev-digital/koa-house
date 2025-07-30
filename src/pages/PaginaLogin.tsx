import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import BackgroundImage from '../assets/background-image.svg';

function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Faz o login normal
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      // Agora precisa descobrir se é admin ou aluno
      // Primeiro verifica se é admin
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      
      if (adminDoc.exists() && adminDoc.data().role === "admin") {
        // É admin, vai para dashboard admin
        alert('Login de admin bem sucedido!');
        navigate('/admin-dashboard');
      } else {
        // Verifica se é aluno
        const alunoDoc = await getDoc(doc(db, "Alunos", user.uid));
        
        if (alunoDoc.exists()) {
          // É aluno, vai para dashboard do aluno
          alert('Login de aluno bem sucedido!');
          setTimeout(() => navigate('/aluno'), 500);
        } else {
          // Não é nem admin nem aluno - problema!
          setError('Usuário não encontrado no sistema.');
          await auth.signOut(); // Desloga
        }
      }
      
    } catch (err: any) {
      console.error("Erro no login:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao fazer login. Tente novamente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{ backgroundImage: `url(${BackgroundImage})` }}
        className="fixed inset-0 w-full h-full bg-cover bg-center -z-10"
      ></div>

      <div className="min-h-screen w-full flex items-center justify-center relative">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mx-2 sm:mx-auto">
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
                placeholder="Email"
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
                placeholder="Senha"
                required
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

            <button
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Esqueceu a senha? <br />
            <Link to="/esqueci-senha" className="font-medium text-green-600 hover:underline">Redefinir a senha</Link>

          </p>
        </div>
      </div>
    </>
  );
}

export default PaginaLogin;