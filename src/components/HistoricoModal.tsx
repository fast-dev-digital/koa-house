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
  FaPhone,
} from "react-icons/fa";
import {
  buscarHistoricoParaAdmin,
  buscarHistoricoParaAluno,
  buscarHistoricoAlunoNovo, // ✅ IMPORTAR nova função
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

      let response: HistoricoResponse | null;

      // ✅ SEMPRE TENTAR A NOVA ESTRUTURA PRIMEIRO
      response = await buscarHistoricoAlunoNovo(alunoId);

      // ✅ SE NÃO ENCONTRAR NA NOVA ESTRUTURA, TENTAR A ANTIGA
      if (!response) {
        ("🔄 Tentando estrutura antiga...");
        if (userType === "admin") {
          response = await buscarHistoricoParaAdmin(alunoId);
        } else {
          response = await buscarHistoricoParaAluno(alunoId);
        }
      }

      if (!response) {
        throw new Error("Histórico não encontrado em nenhuma estrutura");
      }

      setHistorico(response);
    } catch (err) {
      console.error("❌ Erro ao buscar histórico:", err);
      setError("Erro ao carregar histórico do aluno");
    } finally {
      setLoading(false);
    }
  };

  // ✅ REMOVER FILTROS - Mostrar todos os pagamentos
  const pagamentosFiltrados = historico?.pagamentos || [];

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 1. HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-orange-600 text-white">
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <FaPhone className="text-teal-600" />
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="font-semibold text-sm">
                      {(historico.aluno as any).telefone || "Não informado"}
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

            {/* 4.2 LISTA DE PAGAMENTOS */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {pagamentosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaCalendarAlt className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>Nenhum pagamento encontrado</p>
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
      </div>
    </div>
  );
}
