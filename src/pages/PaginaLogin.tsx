import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundImage from '../assets/bg-hawaii-desk.png';
import BackgroundImageMobile from '../assets/bg-hawaii-mobile.png';

function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setLoading(true);
    setError('');

    try {
      (email);
      
      // Tentar fazer login normalmente
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      ('✅ Login realizado com sucesso!');
      
      // Verificar se é admin
      const adminQuery = query(collection(db, "admins"), where("email", "==", email));
      const adminSnapshot = await getDocs(adminQuery);
      
      if (!adminSnapshot.empty) {
        ('👑 Admin detectado, redirecionando para admin-dashboard...');
        navigate('/admin-dashboard');
      } else {
        // Verificar se é aluno
        const alunoQuery = query(collection(db, "Alunos"), where("email", "==", email));
        const alunoSnapshot = await getDocs(alunoQuery);
        
        if (!alunoSnapshot.empty) {
          ('👤 Aluno detectado, redirecionando para /aluno...');
          navigate('/aluno/*');
        } else {
          ('❌ Usuário não encontrado nas coleções');
          setError('Usuário não encontrado no sistema.');
        }
      }
      
    } catch (err: any) {
      (err.code);
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        ('🔍 Verificando se é primeiro login do aluno...');
        
        try {
          // Buscar aluno na coleção Alunos
          const alunoQuery = query(collection(db, "Alunos"), where("email", "==", email));
          const querySnapshot = await getDocs(alunoQuery);
          
          (querySnapshot.empty ? 'Não encontrado' : 'Encontrado');
          
          if (!querySnapshot.empty) {
            const alunoDoc = querySnapshot.docs[0];
            const alunoData = alunoDoc.data();
            
            (alunoData);
            (alunoData.authCreated);
            
            // Se é primeiro acesso (authCreated = false ou undefined)
            if (alunoData.authCreated === false || alunoData.authCreated === undefined) {
              ('🆕 Tentando criar conta no Firebase Auth...');
              
              try {
                // Tentar criar usuário no Firebase Auth
                await createUserWithEmailAndPassword(auth, email, senha);
                ('✅ Conta criada no Auth com sucesso!');
              } catch (authError: any) {
                if (authError.code === 'auth/email-already-in-use') {
                  ('ℹ️ Usuário já existe no Auth, apenas fazendo login...');
                  // Se já existe, apenas fazer login
                  await signInWithEmailAndPassword(auth, email, senha);
                  ('✅ Login realizado com sucesso!');
                } else {
                  throw authError; // Re-throw outros erros
                }
              }
              
              // Marcar como conta criada no Firestore
              await updateDoc(doc(db, "Alunos", alunoDoc.id), {
                authCreated: true
              });
              
              ('✅ authCreated atualizado para true');
              ('🎯 Pronto para redirecionar...');
              ('🔄 Executando navigate para /aluno...');
              navigate('/aluno');
              ('✅ Navigate para /aluno executado!');
              return; // Adicionar return para garantir que pare aqui
            } else {
              setError('Senha incorreta. Use "Esqueci minha senha" se necessário.');
            }
          } else {
            ('❌ Email não encontrado no sistema');
            setError('Conta não encontrada. Se você é um novo aluno, entre em contato com o administrador.');
          }
        } catch (createError: any) {
          console.error('❌ Erro ao criar conta:', createError);
          setError('Erro ao processar login. Tente usar "Esqueci minha senha".');
        }
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else {
        setError('Erro no login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background Desktop */}
      <div
        style={{ backgroundImage: `url(${BackgroundImage})` }}
        className="hidden md:block fixed inset-0 w-full h-full bg-cover bg-center -z-10"
      ></div>
      
      {/* Background Mobile */}
      <div
        style={{ backgroundImage: `url(${BackgroundImageMobile})` }}
        className="block md:hidden fixed inset-0 w-full h-full bg-cover bg-center -z-10"
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

            {error && (
              <div className="mb-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/esqueci-senha" className="text-green-600 hover:teg-green-800 text-sm">
              Esqueci minha senha
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-600 hover:text-gray-800 text-sm">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaginaLogin;