import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaTimes, FaUsers, FaSave } from "react-icons/fa";
import type { Turma } from "../../types/turmas";

interface Professor {
  id: string;
  nome: string;
  email: string;
}

interface TurmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  turmaData?: Turma | null;
}

export default function TurmaModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  turmaData,
}: TurmaModalProps) {
  console.log("🎯 TurmasModal renderizado - isOpen:", isOpen); // ✅ DEBUG

  // ESTADOS DO FORMULÁRIO - SEM DATAS NO ESTADO INICIAL
  const [formData, setFormData] = useState<Turma>({
    nome: "",
    modalidade: "Futevôlei",
    genero: "Masculino",
    nivel: "Estreante",
    dias: "",
    horario: "",
    professorId: "",
    professorNome: "",
    capacidade: 0,
    alunosInscritos: 0,
    status: "Ativa",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ESTADOS DE CONTROLE
  const [loading, setLoading] = useState(false);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // CARREGAR PROFESSORES DO FIREBASE
  useEffect(() => {
    const fetchProfessores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "professores"));
        const professoresData: Professor[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          professoresData.push({
            id: doc.id,
            nome: data.nome || "",
            email: data.email || "",
          });
        });

        setProfessores(professoresData);
        console.log("📚 Professores carregados:", professoresData.length); // ✅ DEBUG
      } catch (error) {
        console.error("Erro ao carregar professores:", error);
      }
    };

    if (isOpen) {
      fetchProfessores();
    }
  }, [isOpen]);

  // POPULAR FORMULÁRIO QUANDO EDITAR - SEM DATAS NO RESET
  useEffect(() => {
    if (mode === "edit" && turmaData) {
      setFormData({
        ...turmaData,
        capacidade: turmaData.capacidade || 0,
        alunosInscritos: turmaData.alunosInscritos || 0,
      });
    } else {
      // Reset para modo create - SEM DATAS
      setFormData({
        nome: "",
        modalidade: "Futevôlei",
        genero: "Masculino",
        nivel: "Estreante",
        dias: "",
        horario: "",
        professorId: "",
        professorNome: "",
        capacidade: 0,
        alunosInscritos: 0,
        status: "Ativa",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    setErrors({});
  }, [mode, turmaData, isOpen]);

  // 🎯 VALIDAÇÕES SIMPLIFICADAS - SÓ NOME OBRIGATÓRIO PARA TESTE
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome?.trim()) {
      newErrors.nome = "Nome da turma é obrigatório";
    }

    // ✅ REMOVIDAS TODAS AS OUTRAS VALIDAÇÕES PARA TESTE

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // HANDLE INPUT CHANGES
  const handleInputChange = (field: keyof Turma, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // HANDLE PROFESSOR CHANGE
  const handleProfessorChange = (professorId: string) => {
    const professor = professores.find((p) => p.id === professorId);
    setFormData((prev) => ({
      ...prev,
      professorId,
      professorNome: professor?.nome || "",
    }));

    if (errors.professorId) {
      setErrors((prev) => ({
        ...prev,
        professorId: "",
      }));
    }
  };

  // 🎯 SUBMIT COM VALORES PADRÃO PARA TESTE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // ✅ DADOS COM VALORES PADRÃO PARA TESTE
      const turmaDataToSave = {
        nome: formData.nome,
        modalidade: formData.modalidade || "Futevôlei",
        genero: formData.genero || "Masculino",
        nivel: formData.nivel || "Estreante",
        dias: formData.dias || "Não informado",
        horario: formData.horario || "A definir",
        professorId: formData.professorId || "",
        professorNome: formData.professorNome || "Professor não definido",
        capacidade: formData.capacidade || 10,
        // ✅ CORREÇÃO: Preservar alunosInscritos ao editar, zerar apenas ao criar
        alunosInscritos: mode === "edit" ? (formData.alunosInscritos || 0) : 0,
        status: formData.status || "Ativa",
        createdAt: new Date(), // ✅ CORRETO: new Date() com D maiúsculo
        updatedAt: new Date(), // ✅ CORRETO: new Date() com D maiúsculo
      };

      console.log("🎯 Dados que vão para o Firebase:", turmaDataToSave); // ✅ DEBUG

      if (mode === "create") {
        const docRef = await addDoc(collection(db, "turmas"), turmaDataToSave);
        console.log("✅ Turma criada com ID:", docRef.id); // ✅ DEBUG
      } else {
        if (turmaData?.id) {
          await updateDoc(doc(db, "turmas", turmaData.id), {
            ...turmaDataToSave,
            createdAt: turmaData.createdAt, // Manter data de criação original
          });
          console.log("✅ Turma atualizada:", turmaData.id); // ✅ DEBUG
        }
      }

      console.log("🎉 Sucesso! Chamando onSuccess()"); // ✅ DEBUG
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao salvar turma:", error);
      setErrors({ submit: "Erro ao salvar turma. Tente novamente." });
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
            <FaUsers className="text-lg text-green-600" />
            <h3 className="text-base font-semibold text-gray-900">
              {mode === "create" ? "Nova Turma" : "Editar Turma"}
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
            {/* NOME DA TURMA - ÚNICO OBRIGATÓRIO */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nome da Turma *
              </label>
              <input
                type="text"
                value={formData.nome || ""}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.nome ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ex: Teste Futevôlei"
              />
              {errors.nome && (
                <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
              )}
            </div>

            {/* MODALIDADE */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Modalidade
              </label>
              <select
                value={formData.modalidade || "Futevôlei"}
                onChange={(e) =>
                  handleInputChange("modalidade", e.target.value)
                }
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Futevôlei">Futevôlei</option>
                <option value="Beach Tennis">Beach Tennis</option>
              </select>
            </div>

            {/* GÊNERO */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gênero
              </label>
              <select
                value={formData.genero || "Masculino"}
                onChange={(e) => handleInputChange("genero", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Teens">Teens</option>
              </select>
            </div>

            {/* NÍVEL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nível
              </label>
              <select
                value={formData.nivel || "Estreante"}
                onChange={(e) => handleInputChange("nivel", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Estreante">Estreante</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
              </select>
            </div>

            {/* PROFESSOR - OPCIONAL PARA TESTE */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Professor (Opcional para teste)
              </label>
              <select
                value={formData.professorId || ""}
                onChange={(e) => handleProfessorChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Nenhum professor (teste)</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* DIAS - OPCIONAL PARA TESTE */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dias da Semana (Opcional para teste)
              </label>
              <select
                value={formData.dias || ""}
                onChange={(e) => handleInputChange("dias", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Não informado</option>
                <option value="Seg-Qua">Segunda e Quarta</option>
                <option value="Ter-Qui">Terça e Quinta</option>
                <option value="Seg">Segunda-Feira</option>
                <option value="Ter">Terça-Feira</option>
                <option value="Qua">Quarta-Feira</option>
                <option value="Qui">Quinta-Feira</option>
                <option value="Sex">Sexta-Feira</option>
              </select>
            </div>

            {/* HORÁRIO - OPCIONAL PARA TESTE */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Horário (Opcional para teste)
              </label>
              <input
                type="text"
                value={formData.horario || ""}
                onChange={(e) => handleInputChange("horario", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ex: 18:00 - 19:00 (opcional)"
              />
            </div>

            {/* CAPACIDADE - OPCIONAL PARA TESTE */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Capacidade (Opcional para teste)
              </label>
              <input
                type="number"
                min="0"
                value={formData.capacidade || 0}
                onChange={(e) =>
                  handleInputChange("capacidade", parseInt(e.target.value) || 0)
                }
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ex: 12 (opcional)"
              />
            </div>
          </div>

          {/* ERRO GERAL */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-red-600 text-xs">{errors.submit}</p>
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
                    ? "Criando..."
                    : "Salvando..."
                  : mode === "create"
                  ? "Criar Turma"
                  : "Salvar Alterações"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
