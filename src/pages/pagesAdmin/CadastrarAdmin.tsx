import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../../firebase-config';

export default function CadastrarAdmin() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (senha !== confirmarSenha) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      await setDoc(doc(db, "admins", user.uid), {
        nome,
        email,
        role: "admin",
        criadoEm: new Date()
      });
      
      // 📧 ENVIAR EMAIL DE VERIFICAÇÃO
      await sendEmailVerification(user);
      
      setSuccess('Admin cadastrado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      setError('Erro ao cadastrar admin: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Cadastrar novo Admin</h2>
      <form onSubmit={handleCadastro}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full mb-2 px-3 py-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-2 px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full mb-2 px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirmar Senha"
          value={confirmarSenha}
          onChange={e => setConfirmarSenha(e.target.value)}
          className="w-full mb-2 px-3 py-2 border rounded"
          required
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Admin'}
        </button>
      </form>
    </div>
  );
}