import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md backdrop-blur-xl bg-white/90 border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 mx-4 sm:mx-auto relative overflow-hidden"
        >
          {/* Gradient overlay para efeito glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Bem vindo à Arena Brazuka!</h1>
              <p className="text-gray-600 font-medium">Faça login para continuar</p>
            </motion.div>

            <form onSubmit={handleLogin}>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-6"
              >
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 hover:bg-white/80 placeholder-gray-400"
                  placeholder="Digite seu email"
                  required
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                />
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-6"
              >
                <label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
                <input
                  type="password"
                  id="senha"
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 hover:bg-white/80 placeholder-gray-400"
                  placeholder="Digite sua senha"
                  required
                  value={senha}
                  onChange={(evento) => setSenha(evento.target.value)}
                />
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Mensagem de Termos de Serviço e Política de Privacidade */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mb-4 text-center"
              >
                <p className="text-xs text-gray-600">
                  Ao fazer login você aceita os{' '}
                  <Link 
                    to="/termos-de-servico" 
                    className="text-green-600 hover:text-green-800 underline transition-colors duration-300"
                  >
                    Termos de Serviço
                  </Link>
                  {' '}e{' '}
                  <Link 
                    to="/politica-de-privacidade" 
                    className="text-green-600 hover:text-green-800 underline transition-colors duration-300"
                  >
                    Política de Privacidade
                  </Link>
                </p>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </motion.button>
            </form>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <Link 
                to="/esqueci-senha" 
                className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-300 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-4 text-center"
            >
              <Link 
                to="/" 
                className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-300 hover:underline"
              >
                <span className="mr-1">←</span> Voltar ao início
              </Link>
            </motion.div>
          </div>
         </motion.div>
       </div>
     </>
  );
}

export default PaginaLogin;