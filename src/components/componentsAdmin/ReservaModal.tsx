// src/components/componentsAdmin/ReservaModal.tsx
import { useState, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import type { Reserva, Quadra } from "../../types/agenda";
import {
  criarReserva,
  atualizarReserva,
  criarReservaMensal,
} from "../../services/agendaService";
import { FaTimes, FaPlus } from "react-icons/fa";
import Toast from "./Toast";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";

interface Turma {
  id: string;
  nome: string;
  horario: string;
  dias: string[];
  professorNome: string;
}

interface ReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva?: Reserva | null;
  quadras: Quadra[];
  dataSelecionada: Date;
  horarioSelecionado?: string;
  quadraSelecionada?: string;
  onSuccess: () => void;
}

export default function ReservaModal({
  isOpen,
  onClose,
  reserva,
  quadras,
  dataSelecionada,
  horarioSelecionado,
  quadraSelecionada,
  onSuccess,
}: ReservaModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    quadraId: string;
    horarioInicio: string;
    horarioFim: string;
    tipo: "aula" | "personal" | "livre" | "experimental";
    status: "confirmada" | "pendente" | "cancelada";
    turmaNome: string;
    professorNome: string;
    observacoes: string;
  }>({
    quadraId: quadraSelecionada || "",
    horarioInicio: horarioSelecionado || "",
    horarioFim: "",
    tipo: "aula",
    status: "confirmada",
    turmaNome: "",
    professorNome: "",
    observacoes: "",
  });

  const [alunosInput, setAlunosInput] = useState("");
  const [alunos, setAlunos] = useState<string[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaManual, setTurmaManual] = useState(false);
  const [reservaMensal, setReservaMensal] = useState(false);
  const [diasSemana, setDiasSemana] = useState<number[]>([]);

  // Carregar turmas quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarTurmas();
    }
  }, [isOpen]);

  async function carregarTurmas() {
    try {
      const q = query(collection(db, "turmas"), where("status", "==", "Ativa"));
      const snapshot = await getDocs(q);
      const turmasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        horario: doc.data().horario,
        dias: doc.data().dias || [],
        professorNome: doc.data().professorNome || "",
      }));
      setTurmas(turmasData);
    } catch (error) {
      // Ignora erros silenciosamente
    }
  }

  useEffect(() => {
    if (reserva) {
      setFormData({
        quadraId: reserva.quadraId,
        horarioInicio: reserva.horarioInicio,
        horarioFim: reserva.horarioFim,
        tipo: reserva.tipo,
        status: reserva.status,
        turmaNome: reserva.turmaNome || "",
        professorNome: reserva.professorNome || "",
        observacoes: reserva.observacoes || "",
      });
      setAlunos(reserva.alunos || []);
    } else {
      setFormData({
        quadraId: quadraSelecionada || "",
        horarioInicio: horarioSelecionado || "",
        horarioFim: "",
        tipo: "aula",
        status: "confirmada",
        turmaNome: "",
        professorNome: "",
        observacoes: "",
      });
      setAlunos([]);
    }
  }, [reserva, quadraSelecionada, horarioSelecionado]);

  const handleAddAluno = () => {
    if (alunosInput.trim()) {
      setAlunos([...alunos, alunosInput.trim()]);
      setAlunosInput("");
    }
  };

  const handleRemoveAluno = (index: number) => {
    setAlunos(alunos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.quadraId || !formData.horarioInicio || !formData.horarioFim) {
      showToast("Preencha quadra, horário de início e fim", "error");
      return;
    }

    // Se for reserva mensal, verifica se selecionou dias
    if (reservaMensal && diasSemana.length === 0) {
      showToast("Selecione pelo menos um dia da semana", "error");
      return;
    }

    setLoading(true);
    try {
      const quadra = quadras.find((q) => q.id === formData.quadraId);

      const dados: any = {
        quadraId: formData.quadraId,
        quadraNome: quadra?.nome || "",
        data: dataSelecionada,
        horarioInicio: formData.horarioInicio,
        horarioFim: formData.horarioFim,
        tipo: formData.tipo,
        status: formData.status,
      };

      //  Adiciona campos opcionais apenas se tiverem valor
      if (formData.turmaNome?.trim()) {
        dados.turmaNome = formData.turmaNome.trim();
      }
      if (formData.professorNome?.trim()) {
        dados.professorNome = formData.professorNome.trim();
      }
      if (alunos.length > 0) {
        dados.alunos = alunos;
      }
      if (formData.observacoes?.trim()) {
        dados.observacoes = formData.observacoes.trim();
      }

      if (reserva?.id) {
        await atualizarReserva(reserva.id, dados);
        showToast("Reserva atualizada com sucesso!", "success");
      } else if (reservaMensal) {
        // Criar reservas mensais
        const totalCriadas = await criarReservaMensal(
          dados,
          dataSelecionada,
          diasSemana
        );
        showToast(`${totalCriadas} reservas criadas para o mês!`, "success");
      } else {
        await criarReserva(dados);
        showToast("Reserva criada com sucesso!", "success");
      }

      onSuccess();
      onClose();
    } catch (error) {
      showToast("Erro ao salvar reserva", "error");
    } finally {
      setLoading(false);
    }
  };

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
  };

  if (!isOpen) return null;

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              {reserva ? "Editar Reserva" : "Nova Reserva"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Quadra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quadra <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.quadraId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, quadraId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma quadra...</option>
                {quadras.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Início <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.horarioInicio}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, horarioInicio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.horarioFim}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, horarioFim: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipo}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({
                    ...formData,
                    tipo: e.target.value as Reserva["tipo"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="aula">Aula</option>
                <option value="experimental">Experimental</option>
                <option value="livre">Livre</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Reserva["status"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="confirmada">Confirmada</option>
                <option value="pendente">Pendente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Turma (opcional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Turma (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => setTurmaManual(!turmaManual)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {turmaManual ? "Selecionar turma" : "Entrada manual"}
                </button>
              </div>
              {turmaManual ? (
                <input
                  type="text"
                  placeholder="Ex: Turma Iniciante - Segunda/Quarta"
                  value={formData.turmaNome}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, turmaNome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <select
                  value={formData.turmaNome}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, turmaNome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma turma</option>
                  {turmas.map((turma) => {
                    const dias = Array.isArray(turma.dias)
                      ? turma.dias.join(", ")
                      : turma.dias;
                    return (
                      <option key={turma.id} value={turma.nome}>
                        {turma.nome} - {turma.horario} ({dias}) - Prof.{" "}
                        {turma.professorNome}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Professor (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professor (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Prof. João Silva"
                value={formData.professorNome}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, professorNome: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Alunos (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alunos (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite o nome e pressione Enter"
                  value={alunosInput}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAlunosInput(e.target.value)
                  }
                  onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
                    e.key === "Enter" && handleAddAluno()
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddAluno}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaPlus size={14} />
                  Adicionar
                </button>
              </div>
              {alunos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {alunos.map((aluno, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {aluno}
                      <button
                        onClick={() => handleRemoveAluno(index)}
                        className="hover:text-blue-600"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reserva Mensal - Apenas para novas reservas */}
            {!reserva && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="reservaMensal"
                    checked={reservaMensal}
                    onChange={(e) => {
                      setReservaMensal(e.target.checked);
                      if (!e.target.checked) setDiasSemana([]);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="reservaMensal"
                    className="text-sm font-medium text-gray-700"
                  >
                    Reserva Mensal (criar para todos os dias selecionados do
                    mês)
                  </label>
                </div>

                {reservaMensal && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      Selecione os dias da semana em que a reserva deve ser
                      criada:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Dom", value: 0 },
                        { label: "Seg", value: 1 },
                        { label: "Ter", value: 2 },
                        { label: "Qua", value: 3 },
                        { label: "Qui", value: 4 },
                        { label: "Sex", value: 5 },
                        { label: "Sáb", value: 6 },
                      ].map((dia) => (
                        <button
                          key={dia.value}
                          type="button"
                          onClick={() => {
                            if (diasSemana.includes(dia.value)) {
                              setDiasSemana(
                                diasSemana.filter((d) => d !== dia.value)
                              );
                            } else {
                              setDiasSemana([...diasSemana, dia.value]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            diasSemana.includes(dia.value)
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          {dia.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      A reserva será criada em todas as ocorrências dos dias
                      selecionados no mês de{" "}
                      {dataSelecionada.toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Informações adicionais..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Salvando..."
                : reserva
                ? "Atualizar"
                : reservaMensal
                ? "Criar Reservas do Mês"
                : "Criar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
