import { useState, useEffect } from "react";
import {
  FaTimes,
  FaUser,
  FaCreditCard,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaArchive,
} from "react-icons/fa";
import {
  buscarHistoricoParaAdmin,
  buscarHistoricoParaAluno,
  type HistoricoResponse,
} from "../services/historicoService";

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  alunoId: string;
  userType: "admin" | "aluno";
}

export default function HistoricoModal({
  isOpen,
  onClose,
  alunoId,
  userType,
}: HistoricoModalProps) {
  // Estados principais
  const [historico, setHistorico] = useState<HistoricoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros internos
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [filtroMes, setFiltroMes] = useState<string>("");

  // Buscar histórico quando modal abrir
  useEffect(() => {
    if (isOpen && alunoId) {
      fetchHistorico();
    }
  }, [isOpen, alunoId, userType]);

  const fetchHistorico = async () => {
    try {
      setLoading(true);
      setError(null);

      let response: HistoricoResponse;

      if (userType === "admin") {
        response = await buscarHistoricoParaAdmin(alunoId);
      } else {
        response = await buscarHistoricoParaAluno(alunoId);
      }

      setHistorico(response);
    } catch (err) {
      console.error("❌ Erro ao buscar histórico:", err);
      setError("Erro ao carregar histórico do aluno");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pagamentos baseado nos filtros internos
  const pagamentosFiltrados =
    historico?.pagamentos.filter((pagamento: any) => {
      const matchStatus = !filtroStatus || pagamento.status === filtroStatus;
      const matchMes = !filtroMes || pagamento.mesReferencia === filtroMes;
      return matchStatus && matchMes;
    }) || [];

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pendente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Arquivado":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pago":
        return <FaCheckCircle className="text-green-600" />;
      case "Pendente":
        return <FaClock className="text-yellow-600" />;
      case "Arquivado":
        return <FaArchive className="text-gray-600" />;
      default:
        return <FaExclamationCircle className="text-red-600" />;
    }
  };

  // Verificar se pagamento está atrasado
  const isAtrasado = (pagamento: any) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(pagamento.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);

    return pagamento.status === "Pendente" && vencimento < hoje;
  };

  // Obter meses únicos para filtro
  const mesesDisponiveis = Array.from(
    new Set(historico?.pagamentos.map((p: any) => p.mesReferencia) || [])
  )
    .sort()
    .reverse();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 1. HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <FaUser className="text-xl" />
            <div>
              <h2 className="text-xl font-bold">Histórico de Pagamentos</h2>
              <p className="text-blue-100 text-sm">
                {historico?.aluno.nome || "Carregando..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* 2. LOADING */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando histórico...</p>
          </div>
        )}

        {/* 3. ERROR */}
        {error && (
          <div className="p-6 text-center">
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              <FaExclamationCircle className="inline mr-2" />
              {error}
            </div>
            <button
              onClick={fetchHistorico}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* 4. CONTEÚDO PRINCIPAL */}
        {historico && !loading && (
          <div className="flex flex-col h-full max-h-[70vh]">
            {/* 4.1 INFORMAÇÕES DO ALUNO */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Info Básica */}
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Aluno</p>
                    <p className="font-semibold">{historico.aluno.nome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaCreditCard className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Plano</p>
                    <p className="font-semibold">{historico.aluno.plano}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Mensalidade</p>
                    <p className="font-semibold">
                      R${" "}
                      {historico.aluno.valorMensalidade.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      historico.aluno.status === "ativo"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-semibold capitalize">
                      {historico.aluno.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4.2 ESTATÍSTICAS */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-700">
                    Total Pago
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    R${" "}
                    {historico.estatisticas.totalPago.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-700">
                    Pendente
                  </h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    R${" "}
                    {historico.estatisticas.totalPendente.toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="text-sm font-medium text-red-700">
                    Em Atraso
                  </h4>
                  <p className="text-2xl font-bold text-red-600">
                    R${" "}
                    {historico.estatisticas.totalAtrasado.toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700">
                    Total Pagamentos
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {historico.estatisticas.quantidadePagamentos}
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3 FILTROS */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-4">
                {/* Filtro por Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="">Todos</option>
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                    {userType === "admin" && (
                      <option value="Arquivado">Arquivado</option>
                    )}
                  </select>
                </div>

                {/* Filtro por Mês */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mês
                  </label>
                  <select
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="">Todos</option>
                    {mesesDisponiveis.map((mes: any) => (
                      <option key={mes} value={mes}>
                        {mes}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botão Limpar Filtros */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFiltroStatus("");
                      setFiltroMes("");
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>

            {/* 4.4 LISTA DE PAGAMENTOS */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {pagamentosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaCalendarAlt className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>Nenhum pagamento encontrado com os filtros aplicados</p>
                  </div>
                ) : (
                  pagamentosFiltrados.map((pagamento: any) => (
                    <div
                      key={pagamento.id}
                      className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                        isAtrasado(pagamento)
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Info do Pagamento */}
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">
                            {getStatusIcon(pagamento.status)}
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {pagamento.mesReferencia}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Vencimento:{" "}
                              {new Date(
                                pagamento.dataVencimento
                              ).toLocaleDateString("pt-BR")}
                              {isAtrasado(pagamento) && (
                                <span className="text-red-600 font-semibold ml-2">
                                  (ATRASADO)
                                </span>
                              )}
                            </p>
                            {pagamento.dataPagamento && (
                              <p className="text-sm text-green-600">
                                Pago em:{" "}
                                {new Date(
                                  pagamento.dataPagamento
                                ).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Valor e Status */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-800">
                            R${" "}
                            {pagamento.valor.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              pagamento.status
                            )}`}
                          >
                            {pagamento.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. FOOTER */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
