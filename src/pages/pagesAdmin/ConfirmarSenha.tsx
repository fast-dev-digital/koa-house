import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset} from 'firebase/auth';
import { auth } from '../../firebase-config';

export default function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [validCode, setValidCode] = useState(false);
  const navigate = useNavigate();

  const oobCode = searchParams.get('oobCode') || '';

  useEffect(() => {
    if (!oobCode) {
      setStatus('Código de verificação não encontrado na URL.');
      return;
    }
    
    verifyPasswordResetCode(auth, oobCode)
      .then(email => {
        setEmail(email);
        setValidCode(true);
      })
      .catch((error) => {
        console.error('Erro ao verificar código:', error);
        if (error.code === 'auth/expired-action-code') {
          setStatus('Link expirado. Solicite um novo link de redefinição.');
        } else if (error.code === 'auth/invalid-action-code') {
          setStatus('Link inválido. Verifique se copiou o link completo do email.');
        } else {
          setStatus('Link inválido ou expirado. Solicite um novo link.');
        }
      });
  }, [oobCode]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setStatus('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setStatus('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      if (error.code === 'auth/expired-action-code') {
        setStatus('Link expirado. Solicite um novo link de redefinição.');
      } else if (error.code === 'auth/invalid-action-code') {
        setStatus('Link inválido. Solicite um novo link de redefinição.');
      } else if (error.code === 'auth/weak-password') {
        setStatus('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setStatus('Erro ao redefinir a senha. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Redefinir Senha</h1>

        {!validCode ? (
          <p className="text-red-600 text-center">{status}</p>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleResetPassword();
            }}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-gray-600 text-center">
              Redefina a senha para: <span className="font-semibold">{email}</span>
            </p>

            <input
              type="password"
              placeholder="Nova senha"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirmar nova senha"
              className="p-3 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />

            {status && (
              <p className="text-sm text-center text-green-500">{status}</p>
            )}

            <button
              type="submit"
              className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Redefinir Senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
