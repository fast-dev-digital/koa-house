import { useState, useEffect } from "react";
//import { collection, getDocs, query, where } from "firebase/firestore";
//import { db } from "../../firebase-config";
import {
  FaCreditCard,
  FaDownload,
  FaArchive,
  FaHistory,
  FaEdit,
} from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import type { Pagamento } from "../../types/pagamentos";
import {
  adicionarProximoPagamentoArray,
  fecharMesComArray,
  marcarPagamentoPagoArray,
  //criarAlunoComPagamentosArray,
  listarAlunosComPagamentos,
  limparObjetoUndefined,
} from "../../services/integracaoService";
import HistoricoModal from "../../components/HistoricoModal";
import { exportarPagamentosComFiltros } from "../../utils/exportarCsv";
import {
  formatarDataBR,
  verificarStatusVencimento,
  obterDiasRestantes,
  planoTemDataFinal,
} from "../../utils/dateUtils";

export default function GestaoPagamentos() {
  // ✅ ESTADOS CONSOLIDADOS
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState<Pagamento[]>(
    []
  );
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planoFilter, setPlanoFilter] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // ✅ FUNÇÃO ÚNICA - Toast helper
  const mostrarToast = (
    mensagem: string,
    tipo: "success" | "error" = "success"
  ) => {
    setToastMessage(mensagem);
    setToastType(tipo);
    setShowToast(true);
  };

  // ✅ FUNÇÃO PRINCIPAL - Buscar pagamentos
  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const alunosComPagamentos = await listarAlunosComPagamentos();

      // 🔍 DEBUG - Verificar se dataFinalMatricula está vindo
      console.log("📊 Primeiro aluno:", {
        nome: alunosComPagamentos[0]?.nome,
        plano: alunosComPagamentos[0]?.plano,
        dataFinalMatricula: alunosComPagamentos[0]?.dataFinalMatricula,
      });

      const pagamentosFormatados: Pagamento[] = [];
      alunosComPagamentos.forEach((aluno) => {
        aluno.pagamentos.forEach((pagamento) => {
          if (pagamento.status !== "Arquivado") {
            pagamentosFormatados.push({
              id: `${aluno.alunoId}_${pagamento.mesReferencia}`,
              alunoId: aluno.alunoId,
              alunoNome: aluno.nome,
              planoTipo: aluno.plano || "Mensal",
              mesReferencia: pagamento.mesReferencia,
              valor: pagamento.valor,
              dataVencimento: pagamento.dataVencimento,
              status: pagamento.status,
              dataPagamento: pagamento.dataPagamento,
              arquivadoEm: pagamento.arquivadoEm,
              createdAt: aluno.createdAt,
              updatedAt: aluno.updatedAt,
              dataFinalMatricula: aluno.dataFinalMatricula,
            });
          }
        });
      });

      // Antes de setar pagamentos:
      const pagamentosFiltrados = pagamentosFormatados.filter(
        (p) => p && typeof p === "object" && "status" in p
      );
      setPagamentos(pagamentosFiltrados);
    } catch (error) {
      mostrarToast("Erro ao carregar pagamentos", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO - Gerar pagamentos para alunos existentes
  {
    /*const gerarPagamentosParaAlunosExistentes = async () => {
    try {
      setLoading(true);
      const alunosSnapshot = await getDocs(
        query(collection(db, "Alunos"), where("status", "==", "Ativo"))
      );

      let alunosCriados = 0;
      let alunosJaExistentes = 0;

      for (const alunoDoc of alunosSnapshot.docs) {
        try {
          const aluno = alunoDoc.data();
          await criarAlunoComPagamentosArray({
            id: alunoDoc.id,
            nome: aluno.nome,
            plano: aluno.plano || "Mensal",
            valorMensalidade: aluno.valorMensalidade || 150,
            status: aluno.status,
            dataMatricula: aluno.dataMatricula,
          });
          alunosCriados++;
        } catch (error: any) {
          if (error.message?.includes("já existe")) {
            alunosJaExistentes++;
          }
        }
      }

      const mensagem = `${alunosCriados} criados, ${alunosJaExistentes} já existiam`;
      mostrarToast(mensagem);
      fetchPagamentos();
    } catch (error) {
      mostrarToast("Erro ao gerar pagamentos", "error");
    } finally {
      setLoading(false);
    }
  };
 */
  }
  // ✅ FUNÇÃO - Marcar como pago
  const handleMarcarComoPago = async (pagamento: Pagamento) => {
    try {
      setLoading(true);
      const pagamentoLimpo = limparObjetoUndefined({
        alunoId: pagamento.alunoId,
        mesReferencia: pagamento.mesReferencia,
        alunoNome: pagamento.alunoNome,
        valor: pagamento.valor,
        dataVencimento: pagamento.dataVencimento,
        status: pagamento.status,
        planoTipo: pagamento.planoTipo,
        ...(pagamento.dataPagamento && {
          dataPagamento: pagamento.dataPagamento,
        }),
        ...(pagamento.arquivadoEm && { arquivadoEm: pagamento.arquivadoEm }),
      });

      await marcarPagamentoPagoArray(
        pagamentoLimpo.alunoId,
        pagamentoLimpo.mesReferencia,
        new Date()
      );
      await adicionarProximoPagamentoArray(pagamentoLimpo.alunoId);

      mostrarToast(`Pagamento de ${pagamentoLimpo.alunoNome} confirmado!`);
      fetchPagamentos();
    } catch (error) {
      mostrarToast("Erro ao processar pagamento", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO - Fechar mês
  const handleFecharMes = async () => {
    if (!confirm("Deseja fechar o próximo mês disponível?")) return;

    try {
      setLoading(true);
      const resultado = await fecharMesComArray();

      if (resultado.erro) {
        mostrarToast(resultado.erro, "error");
      } else {
        const mensagem =
          resultado.mensagem ||
          `${resultado.alunosProcessados} processados • ${resultado.pagamentosArquivados} arquivados`;
        mostrarToast(mensagem);
      }

      fetchPagamentos();
    } catch (error) {
      mostrarToast("Erro ao fechar mês", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO - Sincronizar dados de todos os alunos
  /* Sincronização removida: botão temporário retirado conforme solicitado */

  // ✅ FUNÇÃO - Exportar CSV
  const handleExportarCSV = () => {
    try {
      const dados =
        searchText || statusFilter || planoFilter
          ? pagamentosFiltrados
          : pagamentos;

      if (dados.length === 0) {
        mostrarToast("Nenhum pagamento para exportar", "error");
        return;
      }

      const resultado = exportarPagamentosComFiltros(dados);
      if (resultado) {
        mostrarToast(`${resultado.totalRegistros} pagamentos exportados!`);
      }
    } catch (error) {
      mostrarToast("Erro ao exportar", "error");
    }
  };

  // ✅ FUNÇÃO - Calcular estatísticas (inline)
  const getEstatisticas = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pendentes = pagamentos.filter((p) => p.status === "Pendente");
    const pagos = pagamentos.filter((p) => p.status === "Pago");
    const atrasados = pendentes.filter(
      (p) => new Date(p.dataVencimento) < hoje
    );

    return {
      totalReceber: pendentes.reduce((sum, p) => sum + p.valor, 0),
      totalRecebido: pagos.reduce((sum, p) => sum + p.valor, 0),
      quantidadePendente: pendentes.length,
      quantidadeEmAtraso: atrasados.length,
      valorEmAtraso: atrasados.reduce((sum, p) => sum + p.valor, 0),
    };
  };

  // ✅ COLUNAS SIMPLIFICADAS
  const pagamentosColumns = [
    { key: "alunoNome", label: "Aluno", sortable: true },
    { key: "planoTipo", label: "Plano", sortable: true },
    { key: "mesReferencia", label: "Mês", sortable: true },
    {
      key: "dataFinalMatricula",
      label: "Data Final",
      sortable: true,
      render: (value: any, row: Pagamento) => {
        // Só mostrar data final para planos Trimestral e Semestral
        if (!planoTemDataFinal(row.planoTipo)) {
          return <span className="text-gray-500 text-xs">N/A (Mensal)</span>;
        }

        if (!value)
          return <span className="text-gray-500 text-xs">Não calculado</span>;

        // ✅ Converter Date para string se necessário
        let dataString: string;
        if (value instanceof Date) {
          dataString = value.toISOString().split("T")[0]; // YYYY-MM-DD
        } else if (typeof value === "string") {
          dataString = value;
        } else {
          return (
            <span className="text-gray-500 text-xs">Formato inválido</span>
          );
        }

        const statusClass = verificarStatusVencimento(dataString);
        const diasRestantes = obterDiasRestantes(dataString);

        let statusText = "";
        if (diasRestantes !== null) {
          if (diasRestantes < 0) statusText = " (Vencido)";
          else if (diasRestantes <= 7) statusText = ` (${diasRestantes}d)`;
        }

        return (
          <span className={statusClass}>
            {formatarDataBR(dataString)}
            {statusText}
          </span>
        );
      },
    },
    {
      key: "valor",
      label: "Valor",
      sortable: true,
      render: (_: any, row: any) => {
        if (!row || typeof row !== "object" || typeof row.valor !== "number") {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <span className="font-semibold text-green-600">
            R$ {row.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: "dataVencimento",
      label: "Vencimento",
      sortable: true,
      render: (_: any, row: any) => {
        if (!row || typeof row !== "object" || !row.dataVencimento) {
          return <span className="text-gray-400">—</span>;
        }
        const atrasado = new Date(row.dataVencimento) < new Date();
        return (
          <span className={atrasado ? "text-red-600 font-semibold" : ""}>
            {new Date(row.dataVencimento).toLocaleDateString("pt-BR")}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_: any, row: any) => {
        if (!row || typeof row !== "object" || typeof row.status !== "string") {
          return <span className="text-gray-400">—</span>;
        }
        const hoje = new Date();
        const vencimento = row.dataVencimento
          ? new Date(row.dataVencimento)
          : null;
        const realStatus =
          row.status === "Pendente" && vencimento && vencimento < hoje
            ? "Atrasado"
            : row.status;
        const colors = {
          Pago: "bg-green-100 text-green-700",
          Pendente: "bg-yellow-100 text-yellow-700",
          Atrasado: "bg-red-100 text-red-700",
        };

        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              colors[realStatus as keyof typeof colors] || ""
            }`}
          >
            {realStatus}
          </span>
        );
      },
    },
    {
      key: "acoes",
      label: "Ações",
      render: (_: any, row: Pagamento) => {
        if (!row) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedAlunoId(row.alunoId);
                setShowHistoricoModal(true);
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <FaHistory className="text-xs" />
              Histórico
            </button>
            <button
              onClick={() => handleMarcarComoPago(row)}
              disabled={row.status !== "Pendente" || loading}
              className={`px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
                row.status === "Pendente"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              <FaEdit className="text-xs" />
              {row.status === "Pendente" ? "Pagar" : "Pago ✓"}
            </button>
          </div>
        );
      },
    },
  ];

  // ✅ FILTERS SIMPLIFICADOS
  const searchFilters = [
    {
      label: "Status",
      options: [
        { value: "Pendente", label: "Pendente" },
        { value: "Pago", label: "Pago" },
        { value: "Atrasado", label: "Atrasado" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: "Todos os Status",
    },
    {
      label: "Plano",
      options: [
        { value: "Mensal", label: "Mensal" },
        { value: "Trimestral", label: "Trimestral" },
        { value: "Semestral", label: "Semestral" },
      ],
      value: planoFilter,
      onChange: setPlanoFilter,
      placeholder: "Todos os Planos",
    },
  ];

  // ✅ EFFECTS CONSOLIDADOS
  useEffect(() => {
    fetchPagamentos();
  }, []);

  useEffect(() => {
    const hoje = new Date();
    let filtrados = pagamentos.filter((p) =>
      p.alunoNome.toLowerCase().includes(searchText.toLowerCase())
    );

    if (statusFilter === "Atrasado") {
      filtrados = filtrados.filter(
        (p) => p.status === "Pendente" && new Date(p.dataVencimento) < hoje
      );
    } else if (statusFilter) {
      filtrados = filtrados.filter((p) => p.status === statusFilter);
    }

    if (planoFilter) {
      filtrados = filtrados.filter((p) => p.planoTipo === planoFilter);
    }

    setPagamentosFiltrados(filtrados);
  }, [pagamentos, searchText, statusFilter, planoFilter]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const estatisticas = getEstatisticas();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaCreditCard className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestão de Pagamentos
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportarCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaDownload />
            Exportar CSV
          </button>

          {/* <button
            onClick={gerarPagamentosParaAlunosExistentes}
            className="bg-gray-400 text-gray-200 px-4 py-2 rounded-lg cursor-not-allowed"
            disabled={true}
            title="Função desabilitada"
          >
            Gerar Pagamentos (Desabilitado)
          </button> */}
          <button
            onClick={handleFecharMes}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <FaArchive />
            {loading ? "Processando..." : "Fechar Mês"}
          </button>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total a Receber</h3>
          <p className="text-2xl font-bold text-red-600">
            R${" "}
            {estatisticas.totalReceber.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {estatisticas.quantidadePendente} pendente(s)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Recebido</h3>
          <p className="text-2xl font-bold text-green-600">
            R${" "}
            {estatisticas.totalRecebido.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {pagamentos.filter((p) => p.status === "Pago").length} realizado(s)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pendentes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {estatisticas.quantidadePendente}
          </p>
          <p className="text-xs text-gray-400 mt-1">No prazo</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Em Atraso</h3>
          <p className="text-2xl font-bold text-red-600">
            {estatisticas.quantidadeEmAtraso}
          </p>
          <p className="text-xs text-red-500 mt-1">
            R${" "}
            {estatisticas.valorEmAtraso.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* SEARCH E FILTERS */}
      <SearchAndFilters
        searchValue={searchText}
        onSearchChange={setSearchText}
        filters={searchFilters}
        searchPlaceholder="Buscar por nome do aluno..."
        searchLabel="Buscar Aluno"
      />

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={pagamentosFiltrados.filter(
            (p) => p && typeof p === "object" && typeof p.status === "string"
          )}
          columns={pagamentosColumns}
          loading={loading}
        />
      </div>

      {/* MODAL */}
      {showHistoricoModal && (
        <HistoricoModal
          isOpen={showHistoricoModal}
          onClose={() => {
            setShowHistoricoModal(false);
            setSelectedAlunoId("");
          }}
          alunoId={selectedAlunoId}
          userType="admin"
        />
      )}

      {/* TOAST */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
