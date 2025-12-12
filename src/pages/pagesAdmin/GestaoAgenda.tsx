// src/pages/pagesAdmin/GestaoAgenda.tsx
import { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import type { Quadra, Reserva, SlotHorario } from "../../types/agenda";
import {
  buscarQuadras,
  buscarReservasPorData,
  excluirReserva,
  gerarSlotsHorarios,
  formatarData,
} from "../../services/agendaService";
import ReservaModal from "../../components/componentsAdmin/ReservaModal";
import DeleteConfirmModal from "../../components/componentsAdmin/DeleteConfirmModal";
import Toast from "../../components/componentsAdmin/Toast";

export default function GestaoAgenda() {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [slots, setSlots] = useState<SlotHorario[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Estados
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<Reserva | null>(
    null
  );
  const [quadraSelecionada, setQuadraSelecionada] = useState<string>("");
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("");

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservaParaDeletar, setReservaParaDeletar] = useState<Reserva | null>(
    null
  );

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
  };

  // Carregar quadras e slots ao montar
  useEffect(() => {
    carregarQuadras();
    setSlots(gerarSlotsHorarios());
  }, []);

  // Carregar reservas quando mudar a data
  useEffect(() => {
    carregarReservas();
  }, [dataSelecionada]);

  const carregarQuadras = async () => {
    try {
      const quadrasData = await buscarQuadras();
      // Aceita tanto 'ativa' quanto 'status' (para compatibilidade)
      const quadrasFiltradas = quadrasData.filter(
        (q: any) => q.ativa === true || q.status === true
      );
      setQuadras(quadrasFiltradas);
    } catch (error) {
      console.error("Erro ao carregar quadras:", error);
      showToast("Erro ao carregar quadras", "error");
    }
  };

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const reservasData = await buscarReservasPorData(dataSelecionada);
      setReservas(reservasData);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      showToast("Erro ao carregar reservas", "error");
    } finally {
      setLoading(false);
    }
  };

  // Navegação de data
  const navegarData = (dias: number) => {
    const novaData = new Date(dataSelecionada);
    novaData.setDate(novaData.getDate() + dias);
    setDataSelecionada(novaData);
  };

  const irParaHoje = () => {
    setDataSelecionada(new Date());
  };

  // Verificar se existe reserva em um slot
  const obterReserva = (
    quadraId: string,
    horarioInicio: string
  ): Reserva | null => {
    return (
      reservas.find(
        (r) => r.quadraId === quadraId && r.horarioInicio === horarioInicio
      ) || null
    );
  };

  // Abrir modal para criar nova reserva
  const abrirModalCriar = (quadraId: string, horarioInicio: string) => {
    setReservaSelecionada(null);
    setQuadraSelecionada(quadraId);
    setHorarioSelecionado(horarioInicio);
    setShowReservaModal(true);
  };

  // Abrir modal para editar reserva
  const abrirModalEditar = (reserva: Reserva) => {
    setReservaSelecionada(reserva);
    setQuadraSelecionada("");
    setHorarioSelecionado("");
    setShowReservaModal(true);
  };

  // Abrir modal de confirmação de exclusão
  const abrirModalDeletar = (reserva: Reserva) => {
    setReservaParaDeletar(reserva);
    setShowDeleteModal(true);
  };

  // Confirmar exclusão
  const confirmarExclusao = async () => {
    if (!reservaParaDeletar?.id) return;

    try {
      await excluirReserva(reservaParaDeletar.id);
      showToast("Reserva excluída com sucesso!", "success");
      carregarReservas();
    } catch (error) {
      console.error("Erro ao excluir reserva:", error);
      showToast("Erro ao excluir reserva", "error");
    } finally {
      setShowDeleteModal(false);
      setReservaParaDeletar(null);
    }
  };

  // Cores por tipo de reserva
  const obterCorTipo = (tipo: string): string => {
    const cores: Record<string, string> = {
      aula: "bg-blue-100 border-blue-300 text-blue-800",
      experimental: "bg-purple-100 border-purple-300 text-purple-800",
      livre: "bg-green-100 border-green-300 text-green-800",
      personal: "bg-orange-100 border-orange-300 text-orange-800",
    };
    return cores[tipo] || "bg-gray-100 border-gray-300 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestão de Agenda
          </h1>
          <p className="text-gray-600">
            Gerencie as reservas das quadras por horário
          </p>
        </div>
        <button
          onClick={() => abrirModalCriar("", "")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <FaPlus size={16} />
          Nova Reserva
        </button>
      </div>

      {/* Controles de Data */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
        <button
          onClick={() => navegarData(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FaChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {formatarData(dataSelecionada)}
          </h2>
          <button
            onClick={irParaHoje}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Hoje
          </button>
        </div>

        <button
          onClick={() => navegarData(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {/* Grid de Agenda */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : quadras.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <p className="text-xl mb-4">Nenhuma quadra cadastrada</p>
            <p className="text-sm">
              Cadastre quadras no Firestore para começar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[100px]">
                    Horário
                  </th>
                  {quadras.map((quadra) => (
                    <th
                      key={quadra.id}
                      className="p-3 text-center text-sm font-semibold text-white min-w-[200px]"
                      style={{ backgroundColor: quadra.cor || "#f3f4f6" }}
                    >
                      {quadra.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr
                    key={slot.inicio}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 text-sm font-medium text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-200">
                      {slot.label}
                    </td>
                    {quadras.map((quadra) => {
                      const reserva = obterReserva(quadra.id!, slot.inicio);
                      return (
                        <td
                          key={`${quadra.id}-${slot.inicio}`}
                          className="p-2 border-r border-gray-200 align-top"
                        >
                          {reserva ? (
                            // Slot com reserva
                            <div
                              className={`${obterCorTipo(
                                reserva.tipo
                              )} border-2 rounded-lg p-3 min-h-[80px] cursor-pointer hover:shadow-md transition group relative`}
                              onClick={() => abrirModalEditar(reserva)}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="text-xs font-bold uppercase">
                                  {reserva.tipo}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      abrirModalEditar(reserva);
                                    }}
                                    className="p-1 bg-white rounded hover:bg-gray-100"
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      abrirModalDeletar(reserva);
                                    }}
                                    className="p-1 bg-white rounded hover:bg-red-100 text-red-600"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs font-medium mb-1">
                                {reserva.horarioInicio} - {reserva.horarioFim}
                              </p>
                              {reserva.turmaNome && (
                                <p className="text-xs truncate">
                                  {reserva.turmaNome}
                                </p>
                              )}
                              {reserva.professorNome && (
                                <p className="text-xs truncate">
                                  {reserva.professorNome}
                                </p>
                              )}
                              {reserva.alunos && reserva.alunos.length > 0 && (
                                <p className="text-xs">
                                  {reserva.alunos.length} aluno(s)
                                </p>
                              )}
                              {reserva.status === "pendente" && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                                  Pendente
                                </span>
                              )}
                              {reserva.status === "cancelada" && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded-full">
                                  Cancelada
                                </span>
                              )}
                            </div>
                          ) : (
                            // Slot vazio
                            <button
                              onClick={() =>
                                abrirModalCriar(quadra.id!, slot.inicio)
                              }
                              className="w-full min-h-[80px] border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center group"
                            >
                              <FaPlus
                                size={16}
                                className="text-gray-400 group-hover:text-blue-600"
                              />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span className="text-sm text-gray-700">Aula</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
            <span className="text-sm text-gray-700">Experimental</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">Livre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
            <span className="text-sm text-gray-700">Personal</span>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showReservaModal && (
        <ReservaModal
          isOpen={showReservaModal}
          onClose={() => {
            setShowReservaModal(false);
            setReservaSelecionada(null);
            setQuadraSelecionada("");
            setHorarioSelecionado("");
          }}
          reserva={reservaSelecionada}
          quadras={quadras}
          dataSelecionada={dataSelecionada}
          horarioSelecionado={horarioSelecionado}
          quadraSelecionada={quadraSelecionada}
          onSuccess={carregarReservas}
        />
      )}

      {showDeleteModal && reservaParaDeletar && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setReservaParaDeletar(null);
          }}
          onConfirm={confirmarExclusao}
          item={reservaParaDeletar}
          itemType="reserva"
          title="Excluir Reserva"
          message={`Deseja realmente excluir a reserva de ${
            reservaParaDeletar.turmaNome || reservaParaDeletar.tipo
          } (${reservaParaDeletar.horarioInicio} - ${
            reservaParaDeletar.horarioFim
          })?`}
        />
      )}
    </div>
  );
}
