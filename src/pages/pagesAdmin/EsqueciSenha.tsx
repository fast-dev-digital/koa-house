import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { Link, useNavigate} from 'react-router-dom';

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();  
  const handleEnviarEmail = async () => {
    setMensagem('');
    setErro('');

    try {
      // Especifica a URL exata para onde o link deve redirecionar
      const actionCodeSettings = {
        url: `${window.location.origin}/redefinir-senha`,
        handleCodeInApp: false,
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMensagem('Enviamos um link para seu e-mail!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        setErro('E-mail não encontrado.');
      } else {
        setErro('Erro ao enviar e-mail. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-4 text-center">Redefinir Senha</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Digite seu e-mail para receber um link de redefinição.
        </p>

        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleEnviarEmail}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Enviar link
        </button>

        {mensagem && <p className="mt-4 text-green-600 text-sm text-center">{mensagem}</p>}
        {erro && <p className="mt-4 text-red-600 text-sm text-center">{erro}</p>}

        <p className="mt-6 text-sm text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EsqueciSenha;
