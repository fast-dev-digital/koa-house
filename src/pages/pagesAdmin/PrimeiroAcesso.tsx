import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase-config"; // ✅ CORRIGIR CAMINHO
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

//  INTERFACE PARA TIPAGEM
interface AlunoData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
  plano: string;
  status: string;
  turmas: string;
  horarios: string;
  authCreated: boolean;
  authUid?: string;
  dataMatricula: string;
}

export default function PrimeiroAcesso() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [alunoData, setAlunoData] = useState<AlunoData | null>(null); // TIPAGEM CORRETA
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setTimeout(() => verificarEmail(decodeURIComponent(emailParam)), 500);
    }
  }, [searchParams]);

  const verificarEmail = async (emailToCheck: string = email) => {
    if (!emailToCheck.trim()) return;

    setVerificandoEmail(true);
    setErro("");

    try {
      

      const alunoQuery = query(
        collection(db, "Alunos"),
        where("email", "==", emailToCheck.toLowerCase())
      );

      const alunoSnapshot = await getDocs(alunoQuery);

      if (alunoSnapshot.empty) {
        setErro(
          "Email não encontrado no sistema. Verifique se está correto ou contate o administrador."
        );
        setAlunoData(null);
        return;
      }

      const aluno = alunoSnapshot.docs[0];
      const dadosAluno = aluno.data();

      

      if (dadosAluno.authCreated === true) {
        setErro(
          'Esta conta já está ativada. Use "Redefinir Senha" na tela de login se esqueceu sua senha.'
        );
        setAlunoData(null);
        return;
      }

      // ✅ SETAR DADOS DO ALUNO COM TIPAGEM CORRETA
      setAlunoData({
        id: aluno.id,
        nome: dadosAluno.nome || "",
        email: dadosAluno.email || "",
        telefone: dadosAluno.telefone || "",
        genero: dadosAluno.genero || "",
        plano: dadosAluno.plano || "",
        status: dadosAluno.status || "",
        turmas: dadosAluno.turmas || "",
        horarios: dadosAluno.horarios || "",
        authCreated: dadosAluno.authCreated || false,
        authUid: dadosAluno.authUid || "",
        dataMatricula: dadosAluno.dataMatricula || "",
      });

      setErro("");
    } catch (error: any) {
      console.error("❌ Erro ao verificar email:", error);
      setErro("Erro ao verificar email. Tente novamente.");
      setAlunoData(null);
    } finally {
      setVerificandoEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // TIPAGEM DO EVENT
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!alunoData) {
      setErro("Verifique seu email primeiro.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      

      // ✅ CRIAR CONTA NO FIREBASE AUTH
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );

      

      // ✅ ATUALIZAR FIRESTORE
      await updateDoc(doc(db, "Alunos", alunoData.id), {
        authCreated: true,
        authUid: userCredential.user.uid,
        dataAtivacao: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      ("✅ Firestore atualizado");

      setSucesso(` Conta ativada com sucesso!
      Bem-vindo(a), ${alunoData.nome}!
      Agora você pode fazer login normalmente usando:
      Email: ${email}
      Senha: (a que você acabou de criar)

      Redirecionando para o login...`);

      setTimeout(() => {
        navigate("/login");
      }, 9000);
    } catch (error: any) {
      console.error("❌ Erro ao ativar conta:", error);

      if (error.code === "auth/email-already-in-use") {
        setErro(
          'Este email já possui uma conta ativa. Use "Redefinir Senha" na tela de login.'
        );
      } else if (error.code === "auth/weak-password") {
        setErro(
          "Senha muito fraca. Use pelo menos 6 caracteres com letras e números."
        );
      } else if (error.code === "auth/invalid-email") {
        setErro("Email inválido. Verifique o formato.");
      } else {
        setErro(`Erro ao ativar conta: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Primeiro Acesso
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Ative sua conta criando uma senha segura
          </p>
          {alunoData && (
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <p className="text-green-800 text-sm">
                Olá, <strong>{alunoData.nome}</strong>!<br />
                Vamos ativar sua conta.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Seu email cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => verificarEmail()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
            {verificandoEmail && (
              <p className="text-xs text-gray-500 mt-1">Verificando email...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !alunoData || verificandoEmail}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Ativando..." : "Ativar Conta"}
          </button>
        </form>

        {erro && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center whitespace-pre-line">
              {erro}
            </p>
          </div>
        )}

        {sucesso && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center whitespace-pre-line">
              {sucesso}
            </p>
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          <Link
            to="/login"
            className="block text-blue-600 hover:text-blue-800 text-sm hover:underline"
          >
            ← Voltar para o login
          </Link>
          <Link
            to="/esqueci-senha"
            className="block text-green-600 hover:text-green-800 text-sm hover:underline"
          >
            Redefinir Senha
          </Link>
        </div>
      </div>
    </div>
  );
}
