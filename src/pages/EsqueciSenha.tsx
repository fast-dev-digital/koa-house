import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnviarEmail = async () => {
    setMensagem("");
    setErro("");
    setLoading(true);

    if (!email.trim()) {
      setErro("Por favor, digite um email válido.");
      setLoading(false);
      return;
    }

    try {
      // Verificar se o email existe como admin
      const adminQuery = query(
        collection(db, "admins"),
        where("email", "==", email)
      );
      const adminSnapshot = await getDocs(adminQuery);

      // Verificar se o email existe como aluno
      const alunoQuery = query(
        collection(db, "Alunos"),
        where("email", "==", email)
      );
      const alunoSnapshot = await getDocs(alunoQuery);

      // Se não existe nem como admin nem como aluno
      if (adminSnapshot.empty && alunoSnapshot.empty) {
        ("❌ Email não encontrado no sistema");
        setErro(
          "Email não encontrado no sistema. Verifique se está correto ou contate o administrador."
        );
        setLoading(false);
        return;
      }

      const isAluno = !alunoSnapshot.empty;

      // ✅ SE É ALUNO, VERIFICAR SE JÁ TEM CONTA NO AUTH
      if (isAluno) {
        const alunoData = alunoSnapshot.docs[0].data();

        // ✅ SE É PRIMEIRO ACESSO (não tem authCreated ou authCreated = false)
        if (!alunoData.authCreated) {
          ("🎯 Primeiro acesso detectado - redirecionando...");

          setMensagem(` Detectamos que este é seu primeiro acesso!
          Como aluno, você precisa ativar sua conta primeiro.
          Redirecionando para página de ativação em 3 segundos...`);

          setTimeout(() => {
            navigate(`/primeiro-acesso?email=${encodeURIComponent(email)}`);
          }, 3000);

          setLoading(false);
          return;
        }
      }

      ("📤 Enviando redefinição de senha...");

      //  CONTINUAR FLUXO NORMAL PARA ADMINS E ALUNOS JÁ ATIVADOS
      const actionCodeSettings = {
        url: `${window.location.origin}/redefinir-senha`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      setMensagem(
        "Link de redefinição enviado! Verifique sua caixa de entrada e pasta de spam. Você será redirecionado em alguns segundos..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 7000);
    } catch (error: any) {
      console.error("❌ Erro ao enviar email:", error);

      if (error.code === "auth/user-not-found") {
        // ✅ ISSO SÓ DEVERIA ACONTECER SE HOUVER INCONSISTÊNCIA
        setErro(` Detectamos uma inconsistência nos dados do sistema.

POSSÍVEIS SOLUÇÕES:
• Se você é ALUNO: Clique no botão "Primeiro Acesso" abaixo
• Se você é ADMIN: Contate o suporte técnico
• Verifique se digitou o email corretamente`);
      } else if (error.code === "auth/invalid-email") {
        setErro("Email inválido. Verifique o formato do endereço de email.");
      } else if (error.code === "auth/too-many-requests") {
        setErro(
          "Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente."
        );
      } else {
        setErro(
          "Erro ao enviar email de redefinição. Tente novamente em alguns instantes ou contate o administrador."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar se é erro de inconsistência
  const isErroInconsistencia =
    erro.includes("inconsistência") || erro.includes("user-not-found");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Redefinir Senha
          </h1>
          <p className="text-sm text-gray-600">
            Digite seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleEnviarEmail}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Verificando..." : "Enviar Link de Redefinição"}
          </button>
        </div>

        {/* Mensagem de Sucesso */}
        {mensagem && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center whitespace-pre-line">
              {mensagem}
            </p>
          </div>
        )}

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center whitespace-pre-line">
              {erro}
            </p>
          </div>
        )}

        {/* ✅ BOTÃO PRIMEIRO ACESSO PARA ERROS DE INCONSISTÊNCIA */}
        {isErroInconsistencia && email && (
          <div className="mt-4">
            <button
              onClick={() =>
                navigate(`/primeiro-acesso?email=${encodeURIComponent(email)}`)
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Primeiro Acesso (Alunos)
            </button>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            O link de redefinição é válido por 1 hora e só pode ser usado uma
            vez.
          </p>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            to="/login"
            className="block text-blue-600 hover:text-blue-800 text-sm hover:underline"
          >
            ← Voltar para o login
          </Link>
          <Link
            to="/primeiro-acesso"
            className="block text-green-600 hover:text-green-800 text-sm hover:underline"
          >
            Primeiro Acesso (Alunos)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
