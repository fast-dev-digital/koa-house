import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

// ✅ INTERFACE ATUALIZADA COM GÊNERO
interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
  plano: string;
  status: string;
  turmas: string;
  horarios: string;
  dataMatricula: string;
  authCreated?: boolean; // ✅ ADICIONAR PARA CONTROLE DE AUTH
  authUid?: string;
  role?: string;
}

interface AlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  alunoData?: Aluno | null;
}

export default function AlunoModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  alunoData,
}: AlunoModalProps) {
  // ✅ ESTADOS DOS CAMPOS (COM GÊNERO)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [genero, setGenero] = useState("");
  const [plano, setPlano] = useState("");
  const [status, setStatus] = useState("ativo");
  const [turmas, setTurmas] = useState("Seg-Qua");
  const [horarios, setHorarios] = useState("19:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ useEffect ATUALIZADO
  useEffect(() => {
    if (mode === "edit" && alunoData) {
      setNome(alunoData.nome);
      setEmail(alunoData.email);
      setTelefone(alunoData.telefone);
      setGenero(alunoData.genero || "Masculino"); // ✅ FALLBACK PARA DADOS ANTIGOS
      setPlano(alunoData.plano);
      setStatus(alunoData.status);
      setTurmas(alunoData.turmas);
      setHorarios(alunoData.horarios);
    } else {
      limparFormulario();
    }
  }, [mode, alunoData, isOpen]);

  // ✅ FUNÇÃO LIMPAR ATUALIZADA
  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setGenero("");
    setPlano("");
    setStatus("ativo");
    setTurmas("Seg-Qua");
    setHorarios("19:00");
    setError("");
    setSuccessMessage("");
  };

  const handleClose = () => {
    limparFormulario();
    onClose();
  };

  //  FUNÇÃO SUBMIT ATUALIZADA PARA NOVA IMPLEMENTAÇÃO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    //  VALIDAÇÕES ATUALIZADAS
    if (!nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (!email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    if (!telefone.trim()) {
      setError("Telefone é obrigatório");
      return;
    }

    if (!genero) {
      setError("Selecione o gênero");
      return;
    }

    if (!plano) {
      setError("Selecione um plano");
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        console.log("🚀 Criando novo aluno...");

        const alunoId = `aluno_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}`;

        // ✅ SALVAR APENAS NO FIRESTORE (NOVA IMPLEMENTAÇÃO)
        await setDoc(doc(db, "Alunos", alunoId), {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          telefone: telefone.trim(),
          genero,
          plano,
          status,
          turmas,
          horarios,
          dataMatricula: new Date().toISOString().split("T")[0],
          authCreated: false, // ✅ SEMPRE false PARA NOVOS CADASTROS
          role: "user",
          createdAt: new Date().toISOString(),
        });

        console.log("✅ Aluno salvo no Firestore");

        setSuccessMessage(` Aluno ${nome} cadastrado com sucesso!

📧 INSTRUÇÃO PARA O ALUNO:
"Acesse ${window.location.origin}/primeiro-acesso para ativar sua conta usando o email ${email}"

✅ Admin permanece logado!`);

        //  FECHAR MODAL APÓS SUCESSO
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 4000);
      } else {
        // ✅ MODO EDIÇÃO
        console.log("📝 Editando aluno...");

        if (!alunoData?.id) {
          throw new Error("ID do aluno não encontrado");
        }

        //  ATUALIZAR APENAS CAMPOS EDITÁVEIS
        await updateDoc(doc(db, "Alunos", alunoData.id), {
          nome: nome.trim(),
          telefone: telefone.trim(),
          genero: alunoData.genero, //
          plano,
          status,
          turmas,
          horarios,
          updatedAt: new Date().toISOString(),
        });

        console.log("Aluno atualizado no Firestore");

        setSuccessMessage("Aluno atualizado com sucesso!");

        // ✅ FECHAR MODAL APÓS SUCESSO
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      console.error("❌ ERRO COMPLETO:", error);

      // TRATAMENTO DE ERROS ESPECÍFICOS
      if (error.code === "permission-denied") {
        setError("❌ Sem permissão para realizar esta operação");
      } else if (error.code === "not-found") {
        setError("❌ Documento não encontrado");
      } else if (error.message?.includes("email")) {
        setError("❌ Erro relacionado ao email. Verifique se está correto.");
      } else {
        setError(
          ` Erro: ${error.message || "Erro desconhecido. Tente novamente."}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 transform scale-90">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-base font-bold text-gray-800">
            {mode === "create" ? "🆕 Cadastrar Novo Aluno" : "📝 Editar Aluno"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Digite o nome completo"
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="exemplo@email.com"
              disabled={mode === "edit" || loading}
              required
            />
            {mode === "edit" && (
              <p className="text-xs text-gray-500 mt-1">
                Email não pode ser alterado após cadastro
              </p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="(11) 99999-9999"
              disabled={loading}
              required
            />
          </div>

          {/* ✅ CAMPO GÊNERO */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Gênero *
            </label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={mode === "edit" || loading}
              required
            >
              <option value="">Selecione o gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            {mode === "edit" && (
              <p className="text-xs text-gray-500 mt-1">
                Gênero não pode ser alterado após cadastro
              </p>
            )}
          </div>

          {/* Plano */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Plano *
            </label>
            <select
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
              required
            >
              <option value="">Selecione um plano</option>
              <option value="Mensal"> Mensal</option>
              <option value="Semestral"> Semestral</option>
              <option value="Trimestral">Trimestral</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="suspenso">Suspenso</option>
            </select>
          </div>

          {/* Turmas */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Turmas
            </label>
            <select
              value={turmas}
              onChange={(e) => setTurmas(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            >
              <option value="Seg-Qua">Segunda e Quarta</option>
              <option value="Ter-Qui">Terça e Quinta</option>
            </select>
          </div>

          {/* Horários */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Horários
            </label>
            <select
              value={horarios}
              onChange={(e) => setHorarios(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            >
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
            </select>
          </div>

          {/*  MENSAGEM DE SUCESSO APRIMORADA */}
          {successMessage && (
            <div className="text-green-700 text-xs bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="whitespace-pre-line">{successMessage}</div>
            </div>
          )}

          {/*  MENSAGEM DE ERRO APRIMORADA */}
          {error && (
            <div className="text-red-700 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* ✅ BOTÕES APRIMORADOS */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  {mode === "create" ? "Cadastrando..." : "Salvando..."}
                </>
              ) : (
                <>
                  <FaSave className="text-xs" />
                  {mode === "create" ? "Cadastrar" : "Salvar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
