import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaSquareFull } from "react-icons/fa";
import type { Quadra } from "../../types/quadra";
import {
  criarQuadra,
  excluirQuadra,
  atualizarQuadra,
} from "../../services/quadrasServices";

interface QuadraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  quadraData?: Quadra | null;
}

type TipoQuadra = "Descoberta" | "Coberta";
type SuperficieQuadra = "Terra" | "Saibra" | "Concreto" | "PVC";
type IluminacaoQuadra = "Sim" | "Não";

interface FormDataType {
  nome: string;
  numero: number;
  localizacao: string;
  tipo: TipoQuadra;
  tamanho: string;
  superficie: SuperficieQuadra;
  iluminacao: IluminacaoQuadra;
  ativa: boolean;
  cor: string;
  observacoes: string;
}

const INICIAL_STATE: FormDataType = {
  nome: "",
  numero: 1,
  localizacao: "",
  tipo: "Descoberta",
  tamanho: "",
  superficie: "Concreto",
  iluminacao: "Sim",
  ativa: true,
  cor: "blue.100",
  observacoes: "",
};

const COR_OPTIONS = [
  { value: "blue.100", label: "Azul", hex: "#BEE3F8" },
  { value: "green.100", label: "Verde", hex: "#C6F6D5" },
  { value: "yellow.100", label: "Amarelo", hex: "#FEEBC8" },
  { value: "orange.100", label: "Laranja", hex: "#FED7D7" },
  { value: "purple.100", label: "Roxo", hex: "#E9D8FD" },
  { value: "pink.100", label: "Rosa", hex: "#FED7E2" },
];

export default function QuadraModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  quadraData,
}: QuadraModalProps) {
  const [formData, setFormData] = useState<FormDataType>(INICIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && quadraData) {
      setFormData({
        nome: quadraData.nome || "",
        numero: quadraData.numero || 1,
        localizacao: quadraData.localizacao || "",
        tipo: quadraData.tipo || "Descoberta",
        tamanho: quadraData.tamanho || "",
        superficie: quadraData.superficie || "Concreto",
        iluminacao: quadraData.iluminacao || "Sim",
        ativa: quadraData.ativa || true,
        cor: quadraData.cor || "blue.100",
        observacoes: quadraData.observacoes || "",
      });
    } else {
      setFormData(INICIAL_STATE);
    }
    setError("");
  }, [mode, quadraData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      [name]:
        name === "numero"
          ? parseInt(value) || 1
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validações
      if (!formData.nome.trim()) {
        throw new Error("Nome da quadra é obrigatório");
      }
      if (!formData.localizacao.trim()) {
        throw new Error("Localização é obrigatória");
      }
      if (!formData.tamanho.trim()) {
        throw new Error("Tamanho é obrigatório");
      }

      if (mode === "create") {
        const { id: _, ...dataWithoutId } = formData;
        await criarQuadra(dataWithoutId as Omit<Quadra, "id">);
      } else if (mode === "edit" && quadraData?.id) {
        await atualizarQuadra(quadraData.id, {
          ...formData,
          updatedAt: new Date().toISOString(),
        } as Partial<Quadra>);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar quadra");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaSquareFull size={24} />
            <h2 className="text-2xl font-bold">
              {mode === "create" ? "Nova Quadra" : "Editar Quadra"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* GRID 2 COLUNAS */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome da Quadra *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Quadra 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Número */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número *
              </label>
              <input
                type="number"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Localização */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Localização *
              </label>
              <input
                type="text"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleChange}
                placeholder="Ex: Bloco A, Fundo da quadra, Área coberta"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleSelectChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Descoberta">Descoberta</option>
                <option value="Coberta">Coberta</option>
              </select>
            </div>

            {/* Tamanho */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tamanho *
              </label>
              <input
                type="text"
                name="tamanho"
                value={formData.tamanho}
                onChange={handleChange}
                placeholder="Ex: 20x40m"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Superfície */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Superfície *
              </label>
              <select
                name="superficie"
                value={formData.superficie}
                onChange={handleSelectChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Terra">Terra</option>
                <option value="Saibra">Saibra</option>
                <option value="Concreto">Concreto</option>
                <option value="PVC">PVC</option>
              </select>
            </div>

            {/* Iluminação */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Iluminação *
              </label>
              <select
                name="iluminacao"
                value={formData.iluminacao}
                onChange={handleSelectChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cor de Identificação
              </label>
              <div className="flex gap-2 flex-wrap">
                {COR_OPTIONS.map((corOption) => (
                  <button
                    key={corOption.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, cor: corOption.value }))
                    }
                    title={corOption.label}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.cor === corOption.value
                        ? "border-gray-800 shadow-lg"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: corOption.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="ativa"
                  checked={formData.ativa}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Quadra Ativa
                </span>
              </label>
            </div>

            {/* Observações */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                placeholder="Anotações adicionais sobre a quadra..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <FaSave size={18} />
              {loading ? "Salvando..." : "Salvar Quadra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



