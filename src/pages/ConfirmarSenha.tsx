// src/pages/RedefinirSenha.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase-config';

const RedefinirSenha = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const navigate = useNavigate();
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (oobCode) {
        verifyPasswordResetCode(auth, oobCode)
        .then(email => {
          setEmail(email);
          setValidCode(true);
        })
        .catch(() => {
          setStatus('Link inválido ou expirado.');
        });
    }
  }, [oobCode]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setStatus('As senhas não coincidem.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setStatus('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error(error);
      setStatus('Erro ao redefinir senha.');
    }
  };

  if (!oobCode) {
    return <p>Link inválido.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow-lg rounded-lg border">
      <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
      {validCode ? (
        <>
          <p className="mb-2 text-gray-500">E-mail: {email}</p>
          <input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
          <button
            onClick={handleResetPassword}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Redefinir Senha
          </button>
        </>
      ) : (
        <p className="text-red-500">{status}</p>
      )}

      {status && <p className="mt-4 text-sm text-center">{status}</p>}
    </div>
  );
};

export default RedefinirSenha;
