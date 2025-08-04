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
  genero: string; // ✅ NOVO CAMPO
  plano: string;
  status: string;
  turmas: string;
  horarios: string;
  dataMatricula: string;
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
  const [genero, setGenero] = useState(""); // ✅ NOVO ESTADO
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
      setGenero(alunoData.genero || ""); // ✅ INCLUIR GÊNERO
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
    setGenero(""); // ✅ LIMPAR GÊNERO
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

  // ✅ FUNÇÃO SUBMIT ATUALIZADA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // ✅ VALIDAÇÕES ATUALIZADAS
    if (!plano) {
      setError("Selecione um plano");
      return;
    }

    if (!genero) {
      // ✅ VALIDAR GÊNERO
      setError("Selecione o gênero");
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        const alunoId = `aluno_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}`;

        // ✅ SALVAR COM GÊNERO
        await setDoc(doc(db, "Alunos", alunoId), {
          // ✅ CORRIGIDO: "alunos" minúsculo
          nome,
          email,
          telefone,
          genero, // ✅ INCLUIR GÊNERO
          plano,
          status,
          turmas,
          horarios,
          dataMatricula: new Date().toISOString().split("T")[0],
          authCreated: false,
          role: "user",
        });

        setSuccessMessage(`Aluno cadastrado com sucesso!`);
        onSuccess();

        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        if (!alunoData?.id) {
          throw new Error("ID do aluno não encontrado");
        }

        // ✅ ATUALIZAR COM GÊNERO
        await updateDoc(doc(db, "Alunos", alunoData.id), {
          // ✅ CORRIGIDO: "alunos" minúsculo
          nome,
          telefone,
          genero, // ✅ INCLUIR GÊNERO
          plano,
          status,
          turmas,
          horarios,
        });

        setSuccessMessage("Aluno atualizado com sucesso!");
        onSuccess();

        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch (error: any) {
      console.error("❌ ERRO COMPLETO:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("Este email já está cadastrado no sistema");
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido");
      } else if (error.code === "auth/weak-password") {
        setError("Senha muito fraca");
      } else {
        setError(`Erro: ${error.message || "Erro desconhecido"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">
            {mode === "create" ? "Cadastrar Novo Aluno" : "Editar Aluno"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={mode === "edit"}
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* ✅ NOVO CAMPO GÊNERO */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Gênero *
            </label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Selecione o gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>

          {/* Planos */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Plano *
            </label>
            <select
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Selecione um plano</option>
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
            </select>
          </div>

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="text-green-600 text-xs bg-green-50 p-2 rounded-lg border border-green-200">
              {successMessage}
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="text-red-600 text-xs bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {loading ? (
                mode === "create" ? (
                  "Cadastrando..."
                ) : (
                  "Salvando..."
                )
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
