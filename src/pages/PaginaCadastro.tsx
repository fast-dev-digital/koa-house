import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Importação do que precisamos do Firebase
import { auth, db } from '../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import BackgroundImage from '../assets/background-image.svg';


function PaginaCadastro() {
  // Estados para cada campo do form
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [CPF, setCPF] = useState('');
  const [Telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados de feedback, assim como na tela de Login
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Função para lidar com o cadastro
  const handleCadastro = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError('');

    // Validação inicial: as senhas conferem?
    if (senha !== confirmarSenha) {
      setError('As senhas não conferem');
      return; // Para a execução da função aqui
    }

    setLoading(true);

    try {
      // Chamada ao Firebase para criar o usuário na parte "Authentication"
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Passo extra: Salvar infos adicionais (como Nome) no Firestore
      // Isso cria um documento na coleção usuários com o mesmo ID do usuário autenticado
      await setDoc(doc(db, "Alunos", user.uid), {
        nome: nome,
        email: email,
        CPF: CPF,
        Telefone: Telefone,
        datadecriacao: new Date()
      });

      alert('Usuario cadastrado com sucesso!');
      navigate('/login');
      // Futuramente, redirecionaremos para a tela de login ou home após o cadastro.
    } catch (err: any) {
      console.error("Error no cadastro:", err);
      // Lógica para tratar erros comuns no Firebase
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter no mínimo 6 caracteres.');
      } else {
        setError('Ocorreu um erro ao criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 6. O JSX (a parte visual)
  return (
    <>
      {/* Background fixo */}
      <div
        style={{ backgroundImage: `url(${BackgroundImage})` }}
        className="fixed inset-0 w-full h-full bg-cover bg-center -z-10"
      ></div>

      {/* Formulário centralizado */}
      <div className="min-h-screen w-full flex items-center justify-center relative w-85">
        <div className="w-full max-w-lg md:max-w-2xl bg-white rounded-lg shadow-md p-4 sm:p-6 mx-2 sm:mx-auto md:mt-20">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Criar sua Conta</h1>
            <p className="text-gray-500">Junte-se à Arena Brazuka!</p>
          </div>

          <form onSubmit={handleCadastro}>
            {/* Campo Nome */}
            <div className="mb-2">
              <label
                htmlFor="nome"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Nome Completo
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                className="w-full px-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Campo Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Campo CPF */}
            <div className="mb-4">
              <label htmlFor="CPF" className="block text-xs font-medium text-gray-700 mb-1">CPF</label>
              <input type="CPF" id="CPF" value={CPF} onChange={e => setCPF(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Campo Telefone */}
            <div className="mb-4">
              <label htmlFor="Telefone" className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
              <input type="Telefone" id="Telefone" value={Telefone} onChange={e => setTelefone(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>


            {/* Campo Senha */}
            <div className="mb-4">
              <label htmlFor="senha" className="block text-xs font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" id="senha" value={senha} onChange={e => setSenha(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Campo Confirmar Senha */}
            <div className="mb-3">
              <label htmlFor="confirmar-senha" className="block text-xs font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <input type="password" id="confirmar-senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required className="w-full px-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {error && <div className="text-red-500 text-xs text-center mb-4">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 disabled:bg-blue-300">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Já tem uma conta? <br />
            <Link to="/login" className="font-medium text-green-600 hover:underline">Faça Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default PaginaCadastro;