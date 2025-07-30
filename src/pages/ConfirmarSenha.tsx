import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset} from 'firebase/auth';
import { auth } from '../firebase-config';

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
    if (!oobCode) return;
    verifyPasswordResetCode(auth, oobCode)
      .then(email => {
        setEmail(email);
        setValidCode(true);
      })
      .catch(() => {
        setStatus('Link inválido ou expirado.');
      });
  }, [oobCode]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setStatus('As senhas não coincidem.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('Erro ao redefinir a senha. Tente novamente.');
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-2">
          Redefinir Senha
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Redefina a senha para:
          <br />
          <span className="text-green-600 font-medium break-words">
            gabrielgasparotto45@gmail.com
          </span>
        </p>
        <form className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nova senha"
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition"
          >
            Redefinir Senha
          </button>
        </form>
      </div>
    </div>
  );
}
