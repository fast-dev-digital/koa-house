import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaUser } from "react-icons/fa";
import {
  criarAluno,
  atualizarAluno,
  buscarAlunoPorEmail,
} from "../../services/alunoService";
import { criarAlunoComPagamentosArray } from "../../services/integracaoService";
import type { Aluno } from "../../types/alunos";

interface AlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  alunoData?: Aluno | null;
}

// ✅ APENAS CORREÇÃO DE TIPOS (mantendo o resto igual)
type GeneroType = "Masculino" | "Feminino";
type PlanoType = "Mensal" | "Trimestral" | "Semestral";
type StatusType = "Ativo" | "Inativo" | "Suspenso"; // ✅ CORRIGIDO PARA MAIÚSCULO

interface FormDataType {
  nome: string;
  email: string;
  telefone: string;
  genero: GeneroType | "";
  plano: PlanoType | "";
  status: StatusType;
  valorMensalidade: number;
}

const INITIAL_STATE: FormDataType = {
  nome: "",
  email: "",
  telefone: "",
  genero: "",
  plano: "",
  status: "Ativo", // ✅ CORRIGIDO PARA MAIÚSCULO
  valorMensalidade: 150,
};

export default function AlunoModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  alunoData,
}: AlunoModalProps) {
  const [formData, setFormData] = useState<FormDataType>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (mode === "edit" && alunoData && isOpen) {
      setFormData({
        nome: alunoData.nome,
        email: alunoData.email,
        telefone: alunoData.telefone,
        genero: alunoData.genero || "Masculino",
        plano: alunoData.plano,
        status: alunoData.status,
        valorMensalidade: alunoData.valorMensalidade || 150,
      });
    } else {
      setFormData(INITIAL_STATE);
    }

    setError("");
    setSuccessMessage("");
  }, [mode, alunoData, isOpen]);

  const updateField = <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    const { nome, email, telefone, genero, plano } = formData;

    if (!nome.trim()) return "Nome é obrigatório";
    if (!email.trim()) return "Email é obrigatório";
    if (!telefone.trim()) return "Telefone é obrigatório";
    if (!genero) return "Selecione o gênero";
    if (!plano) return "Selecione um plano";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Email inválido";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "create") {
        const emailExistente = buscarAlunoPorEmail(
          formData.email.trim().toLowerCase()
        );
        if (emailExistente) {
          setError("Este email já está cadastrado");
          setLoading(false);
          return;
        }

        if (!formData.genero || !formData.plano) {
          setError("Todos os campos obrigatórios devem ser preenchidos");
          setLoading(false);
          return;
        }

        const novoAluno: Omit<Aluno, "id"> = {
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          telefone: formData.telefone.trim(),
          genero: formData.genero as GeneroType,
          plano: formData.plano as PlanoType,
          status: formData.status,
          valorMensalidade: formData.valorMensalidade,
          dataMatricula: new Date().toISOString().split("T")[0],
          turmasIds: [],
          horarios: "",
          role: "user",
          authCreated: false,
          authUid: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const novoAlunoId = await criarAluno(novoAluno);

        await criarAlunoComPagamentosArray({
          id: novoAlunoId,
          nome: formData.nome.trim(),
          plano: formData.plano as PlanoType,
          valorMensalidade: formData.valorMensalidade,
          status: formData.status,
          dataMatricula: new Date().toISOString().split("T")[0],
        });

        setSuccessMessage(`Aluno ${formData.nome} cadastrado com sucesso!`);
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 2000);
      } else {
        if (!alunoData?.id) throw new Error("ID do aluno não encontrado");

        const dadosAtualizacao: Partial<Aluno> = {
          nome: formData.nome.trim(),
          telefone: formData.telefone.trim(),
          status: formData.status,
          valorMensalidade: formData.valorMensalidade,
          updatedAt: new Date().toISOString(),
        };

        if (formData.genero) {
          dadosAtualizacao.genero = formData.genero as GeneroType;
        }
        if (formData.plano) {
          dadosAtualizacao.plano = formData.plano as PlanoType;
        }

        await atualizarAluno(alunoData.id, dadosAtualizacao);

        setSuccessMessage(`Aluno ${formData.nome} atualizado com sucesso!`);
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Erro no AlunoModal:", error);
      setError(error.message || "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ transform: "scale(0.9)", transformOrigin: "center" }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FaUser className="text-lg text-green-600" />
            <h3 className="text-base font-semibold text-gray-900">
              {mode === "create" ? "Novo Aluno" : "Editar Aluno"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* NOME COMPLETO */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={(e) => updateField("nome", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={mode === "edit" || loading}
                required
              />
            </div>

            {/* TELEFONE */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => updateField("telefone", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
                required
              />
            </div>

            {/* GÊNERO */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gênero *
              </label>
              <select
                value={formData.genero}
                onChange={(e) =>
                  updateField("genero", e.target.value as GeneroType | "")
                }
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={mode === "edit" || loading}
                required
              >
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>

            {/* PLANO */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Plano *
              </label>
              <select
                value={formData.plano}
                onChange={(e) =>
                  updateField("plano", e.target.value as PlanoType | "")
                }
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
                required
              >
                <option value="">Selecione um plano</option>
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
              </select>
            </div>

            {/* VALOR MENSALIDADE */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Valor da Mensalidade *
              </label>
              <input
                type="number"
                placeholder="150"
                step="0.01"
                min="1"
                value={formData.valorMensalidade}
                onChange={(e) =>
                  updateField("valorMensalidade", Number(e.target.value))
                }
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
                required
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  updateField("status", e.target.value as StatusType)
                }
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>
          </div>

          {/* MENSAGEM DE SUCESSO */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-green-600 text-xs"> {successMessage}</p>
            </div>
          )}

          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-red-600 text-xs"> {error}</p>
            </div>
          )}

          {/* BOTÕES */}
          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5"
            >
              <FaSave className="text-xs" />
              <span>
                {loading
                  ? mode === "create"
                    ? "Cadastrando..."
                    : "Salvando..."
                  : mode === "create"
                  ? "Cadastrar Aluno"
                  : "Salvar Alterações"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
