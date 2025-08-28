import { useState, useEffect } from "react";
import {
  criarProfessor,
  atualizarProfessor,
  type ProfessorCreate,
  type ProfessorUpdate,
} from "../../services/professorService";
import { FaTimes, FaChalkboardTeacher, FaSave } from "react-icons/fa";
import type { Professor } from "../../types/professor";

interface ProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  professorData?: Professor | null;
}

export default function ProfessorModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  professorData,
}: ProfessorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    especialidade: "Futevôlei",
    status: "Ativo",
  });

  // Preencher formulário quando for edição
  useEffect(() => {
    if (mode === "edit" && professorData) {
      setFormData({
        nome: professorData.nome || "",
        email: professorData.email || "",
        telefone: professorData.telefone || "",
        especialidade: professorData.especialidade || "Futevôlei",
        status: professorData.status || "Ativo",
      });
    } else {
      // Reset para criação
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        especialidade: "Futevôlei",
        status: "Ativo",
      });
    }
  }, [mode, professorData, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ NOVA FUNÇÃO COM SERVICES
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "create") {
        // ✅ CRIAR VIA SERVICE
        const professorDataToSave: ProfessorCreate = {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          especialidade: formData.especialidade as
            | "Futevôlei"
            | "Beach Tennis"
            | "Vôlei",
          status: formData.status as "Ativo" | "Inativo",
        };

        const professorId = await criarProfessor(professorDataToSave);
        console.log("✅ Professor criado via service - ID:", professorId);
      } else {
        // ✅ ATUALIZAR VIA SERVICE
        if (!professorData?.id)
          throw new Error("ID do professor não encontrado");

        const updateData: ProfessorUpdate = {
          nome: formData.nome,
          telefone: formData.telefone,
          especialidade: formData.especialidade as
            | "Futevôlei"
            | "Beach Tennis"
            | "Vôlei",
          status: formData.status as "Ativo" | "Inativo",
        };

        await atualizarProfessor(professorData.id, updateData);
        console.log("✅ Professor atualizado via service:", professorData.id);
      }

      console.log("🎉 Sucesso! Chamando onSuccess()");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao salvar professor:", error);
      alert("Erro ao salvar professor!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ transform: "scale(0.9)", transformOrigin: "center" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center space-x-2">
            <FaChalkboardTeacher className="text-lg text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">
              {mode === "create" ? "Novo Professor" : "Editar Professor"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Digite o nome completo"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="professor@email.com"
              disabled={mode == "edit" || loading}
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
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              required
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Especialidade */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Especialidade *
            </label>
            <select
              name="especialidade"
              value={formData.especialidade}
              onChange={handleInputChange}
              required
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Futevôlei">Futevôlei</option>
              <option value="Beach Tennis">Beach Tennis</option>
              <option value="Vôlei">Vôlei</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <FaSave className="text-xs" />
              <span>{loading ? "Salvando..." : "Salvar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
