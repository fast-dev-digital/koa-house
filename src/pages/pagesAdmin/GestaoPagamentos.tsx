import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
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
  criarAlunoComPagamentosArray,
  listarAlunosComPagamentos,
  limparObjetoUndefined, // ✅ IMPORTAR função utilitária
} from "../../services/integracaoService";
import HistoricoModal from "../../components/HistoricoModal";
import {
  exportarPagamentosCSV,
  exportarPagamentosComFiltros,
} from "../../utils/exportarCsv";

export default function GestaoPagamentos() {
  // Estados principais
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState<Pagamento[]>(
    []
  );
  // Estados para controle do Modal
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>("");

  // Estados de controle
  const [loading, setLoading] = useState(false);

  // Estados de filtros
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planoFilter, setPlanoFilter] = useState("");

  // Estados de toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Buscar pagamentos da nova estrutura
  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando pagamentos da nova estrutura...");

      //  USAR NOVA FUNÇÃO - Buscar alunos com pagamentos
      const alunosComPagamentos = await listarAlunosComPagamentos();
      console.log(`📊 Encontrados ${alunosComPagamentos.length} alunos`);

      // CONVERTER para formato da tabela atual
      const pagamentosFormatados: Pagamento[] = [];

      alunosComPagamentos.forEach((aluno) => {
        // Para cada aluno, pegar todos os pagamentos não arquivados
        aluno.pagamentos.forEach((pagamento) => {
          //  FILTRAR apenas pagamentos ativos (não arquivados)
          if (pagamento.status !== "Arquivado") {
            pagamentosFormatados.push({
              id: `${aluno.alunoId}_${pagamento.mesReferencia}`, // ID único combinado
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
            });
          }
        });
      });

      console.log(
        `📋 Total de pagamentos formatados: ${pagamentosFormatados.length}`
      );
      setPagamentos(pagamentosFormatados);
    } catch (error) {
      console.error("❌ Erro ao buscar nova estrutura:", error);
      setToastMessage("Erro ao carregar pagamentos da nova estrutura");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO - Calcular estatísticas
  const calcularEstatisticas = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pagamentosPendentes = pagamentos.filter(
      (p) => p.status === "Pendente"
    );
    const pagamentosPagos = pagamentos.filter((p) => p.status === "Pago");

    const totalReceber = pagamentosPendentes.reduce(
      (sum, p) => sum + p.valor,
      0
    );
    const totalRecebido = pagamentosPagos.reduce((sum, p) => sum + p.valor, 0);

    const emAtraso = pagamentosPendentes.filter((p) => {
      const vencimento = new Date(p.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      return vencimento < hoje;
    });

    return {
      totalReceber,
      totalRecebido,
      quantidadePendente: pagamentosPendentes.length,
      quantidadeEmAtraso: emAtraso.length,
      valorEmAtraso: emAtraso.reduce((sum, p) => sum + p.valor, 0),
    };
  };
  // Função para abrir Modal
  const handleVerHistorico = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    setShowHistoricoModal(true);
  };

  // Função para fechar o modal
  const handleCloseHistorico = () => {
    setShowHistoricoModal(false);
    setSelectedAlunoId("");
  };
  // Colunas da tabela
  const pagamentosColumns = [
    {
      key: "alunoNome",
      label: "Aluno",
      sortable: true,
    },
    {
      key: "planoTipo",
      label: "Plano",
      sortable: true,
    },
    {
      key: "mesReferencia",
      label: "Mês Referência",
      sortable: true,
    },
    {
      key: "valor",
      label: "Valor",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "dataVencimento",
      label: "Vencimento",
      sortable: true,
      render: (value: Date) => {
        const hoje = new Date();
        const vencimento = new Date(value);
        const atrasado = vencimento < hoje;

        return (
          <span className={atrasado ? "text-red-600 font-semibold" : ""}>
            {vencimento.toLocaleDateString("pt-BR")}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string, row: Pagamento) => {
        const hoje = new Date();
        const vencimento = new Date(row.dataVencimento);
        const realStatus =
          value === "Pendente" && vencimento < hoje ? "Atrasado" : value;

        const colors = {
          Pago: "bg-green-100 text-green-700",
          Pendente: "bg-yellow-100 text-yellow-700",
          Atrasado: "bg-red-100 text-red-700",
        };

        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              colors[realStatus as keyof typeof colors]
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
      render: (
        value: any,
        row: Pagamento // ✅ CORRETO: value, row
      ) => (
        <div className="flex items-center gap-2">
          {/* ✅ AGORA row.alunoNome funcionará */}
          <button
            onClick={() => handleVerHistorico(row.alunoId)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
            title={`Ver histórico de ${row.alunoNome}`}
          >
            <FaHistory className="text-xs" />
            Histórico
          </button>

          {/* Resto do código mantido igual... */}
          {row.status === "Pendente" ? (
            <button
              onClick={() => handleMarcarComoPago(row)}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
              title="Marcar como pago"
              disabled={loading}
            >
              <FaEdit className="text-xs" />
              Pagar
            </button>
          ) : (
            <button
              className="bg-gray-400 text-gray-600 px-3 py-1 rounded-md text-xs cursor-not-allowed flex items-center gap-1"
              title={`Pagamento já realizado ${
                row.dataPagamento
                  ? `em ${new Date(row.dataPagamento).toLocaleDateString(
                      "pt-BR"
                    )}`
                  : ""
              }`}
              disabled
            >
              <FaEdit className="text-xs" />
              Pago ✓
            </button>
          )}
        </div>
      ),
    },
  ];

  // ✅ FUNÇÃO - Gerar pagamentos para alunos sem pagamento
  const gerarPagamentosParaAlunosExistentes = async () => {
    try {
      setLoading(true);
      console.log("🔄 Iniciando geração de pagamentos na NOVA ESTRUTURA...");

      // 1. Buscar todos os alunos ativos
      const alunosSnapshot = await getDocs(
        query(collection(db, "Alunos"), where("status", "==", "ativo"))
      );

      console.log(`📋 Encontrados ${alunosSnapshot.size} alunos ativos`);

      let alunosCriados = 0;
      let alunosJaExistentes = 0;
      const erros: string[] = [];

      // 2. Para cada aluno ativo, criar na nova estrutura
      for (const alunoDoc of alunosSnapshot.docs) {
        try {
          const aluno = alunoDoc.data();

          // ✅ USAR NOVA FUNÇÃO - Criar aluno com primeiro pagamento no array
          await criarAlunoComPagamentosArray({
            id: alunoDoc.id,
            nome: aluno.nome,
            plano: aluno.plano || "Mensal",
            valorMensalidade: aluno.valorMensalidade || 150,
            status: aluno.status,
            dataMatricula: aluno.dataMatricula,
          });

          alunosCriados++;
          console.log(`✅ ${aluno.nome} criado na nova estrutura`);
        } catch (error: any) {
          if (error.message?.includes("já existe")) {
            alunosJaExistentes++;
            console.log(
              `⏸️ ${alunoDoc.data().nome} já existe na nova estrutura`
            );
          } else {
            console.error(`❌ Erro ao criar ${alunoDoc.data().nome}:`, error);
            erros.push(`${alunoDoc.data().nome}: ${error.message}`);
          }
        }
      }

      // 3. Buscar dados da nova estrutura para exibir
      const alunosComPagamentos = await listarAlunosComPagamentos();
      console.log(
        `📊 Total na nova estrutura: ${alunosComPagamentos.length} alunos`
      );

      // 4. Mostrar resultado
      let mensagem = "";
      if (alunosCriados > 0) {
        mensagem += ` ${alunosCriados} alunos criados na nova estrutura. `;
      }
      if (alunosJaExistentes > 0) {
        mensagem += ` ${alunosJaExistentes} já existiam. `;
      }
      if (erros.length > 0) {
        mensagem += ` ${erros.length} erros encontrados.`;
        console.error("Erros detalhados:", erros);
      }

      setToastMessage(
        mensagem || `${alunosComPagamentos.length} alunos na nova estrutura!`
      );
      setToastType(erros.length > 0 ? "error" : "success");
      setShowToast(true);

      // 5. ✅ OPCIONAL: Atualizar lista (ainda vai buscar da estrutura antiga)
      fetchPagamentos();
    } catch (error) {
      console.error("❌ Erro geral:", error);
      setToastMessage("Erro ao gerar pagamentos na nova estrutura");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  //  FUNÇÃO - Marcar como pago e gerar próximo (CORRIGIDA)
  const handleMarcarComoPago = async (pagamento: Pagamento) => {
    try {
      setLoading(true);
      console.log(
        `💰 Marcando pagamento como pago: ${pagamento.alunoNome} - ${pagamento.mesReferencia}`
      );

      // ✅ LIMPAR dados do pagamento antes de enviar
      const pagamentoLimpo = limparObjetoUndefined({
        alunoId: pagamento.alunoId,
        mesReferencia: pagamento.mesReferencia,
        alunoNome: pagamento.alunoNome,
        valor: pagamento.valor,
        dataVencimento: pagamento.dataVencimento,
        status: pagamento.status,
        planoTipo: pagamento.planoTipo,
        // Só incluir campos opcionais se existirem
        ...(pagamento.dataPagamento && {
          dataPagamento: pagamento.dataPagamento,
        }),
        ...(pagamento.arquivadoEm && { arquivadoEm: pagamento.arquivadoEm }),
        ...(pagamento.createdAt && { createdAt: pagamento.createdAt }),
        ...(pagamento.updatedAt && { updatedAt: pagamento.updatedAt }),
      });

      console.log("🧹 Dados limpos para envio:", pagamentoLimpo);

      // ✅ USAR NOVA FUNÇÃO - Marcar pagamento como pago no array
      await marcarPagamentoPagoArray(
        pagamentoLimpo.alunoId,
        pagamentoLimpo.mesReferencia,
        new Date()
      );

      // ✅ USAR NOVA FUNÇÃO - Gerar próximo pagamento no array
      await adicionarProximoPagamentoArray(pagamentoLimpo.alunoId);

      setToastMessage(
        `Pagamento de ${pagamentoLimpo.alunoNome} confirmado e próximo gerado!`
      );
      setToastType("success");
      setShowToast(true);

      // Recarregar dados
      fetchPagamentos();
    } catch (error) {
      console.error("❌ Erro ao marcar como pago:", error);
      setToastMessage(`Erro ao processar pagamento: ${error}`);
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO - Fechar mês (apenas arquivar - usando service) - MELHORADA
  const handleFecharMes = async () => {
    if (
      !confirm(
        "Deseja fechar o próximo mês disponível? Isso irá arquivar os pagamentos mais antigos e gerar próximos para alunos com pendências."
      )
    )
      return;

    try {
      setLoading(true);
      console.log("🗃️ Iniciando fechamento do próximo mês disponível...");

      // ✅ USAR NOVA FUNÇÃO - Fechar próximo mês disponível
      const resultado = await fecharMesComArray();

      if (resultado.erro) {
        setToastMessage(resultado.erro);
        setToastType("error");
      } else {
        // ✅ VERIFICAR se há mensagem especial (mês já fechado)
        if (resultado.mensagem) {
          setToastMessage(resultado.mensagem);
          setToastType("success");
        } else {
          const mensagem = [
            `${resultado.alunosProcessados} alunos processados`,
            `${resultado.pagamentosArquivados} pagamentos arquivados`,
            `${resultado.novosPagamentosGerados} novos pagamentos gerados`,
          ].join(" • ");

          setToastMessage(`Próximo mês fechado com sucesso! ${mensagem}`);
          setToastType("success");
        }
      }

      setShowToast(true);
      fetchPagamentos();
    } catch (error) {
      console.error("❌ Erro ao fechar mês:", error);
      setToastMessage("Erro ao fechar mês");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchPagamentos();
  }, []);

  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let filtrados = pagamentos.filter((p) =>
      p.alunoNome.toLowerCase().includes(searchText.toLowerCase())
    );

    if (statusFilter == "Atrasado") {
      filtrados = filtrados.filter((p) => p.status === statusFilter);
    }
    if (statusFilter) {
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

  // Dados para o componente
  const estatisticas = calcularEstatisticas();

  const searchFilters = [
    {
      label: "Status do Pagamento",
      options: [
        { value: "Pendente", label: "Pendente" },
        { value: "Pago", label: "Pago" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: "Todos os Status",
    },
    {
      label: "Status do Plano",
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
  const handleExportarCSV = () => {
    try {
      console.log("📊 Iniciando exportação de pagamentos...");

      const filtros = {
        searchText,
        statusFilter,
        planoFilter,
      };

      // Se há filtros aplicados, exportar dados filtrados
      if (searchText || statusFilter || planoFilter) {
        const resultado = exportarPagamentosComFiltros(
          pagamentosFiltrados,
          filtros
        );

        if (resultado) {
          setToastMessage(
            `✅ ${resultado.totalRegistros} pagamentos exportados com filtros aplicados!`
          );
          setToastType("success");
          setShowToast(true);
        }
      } else {
        // Se não há filtros, exportar todos os dados da tela atual
        if (pagamentos.length === 0) {
          setToastMessage("⚠️ Nenhum pagamento disponível para exportar!");
          setToastType("error");
          setShowToast(true);
          return;
        }

        const resultado = exportarPagamentosComFiltros(pagamentos);

        if (resultado) {
          setToastMessage(
            `✅ ${resultado.totalRegistros} pagamentos exportados com sucesso!`
          );
          setToastType("success");
          setShowToast(true);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao exportar:", error);
      setToastMessage("❌ Erro ao exportar dados de pagamentos");
      setToastType("error");
      setShowToast(true);
    }
  };

  // ✅ NOVA FUNÇÃO - Exportar todos os pagamentos do Firestore

  return (
    <div className="p-6">
      {/* 1. HEADER */}
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

          <button
            onClick={gerarPagamentosParaAlunosExistentes}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Gerando..." : "Gerar Pagamentos"}
          </button>

          <button
            onClick={handleFecharMes}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <FaArchive />
            {loading ? "Processando..." : "Fechar Próximo Mês"}
          </button>
        </div>
      </div>

      {/* 2. CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total a Receber</h3>
          <p className="text-2xl font-bold text-red-600">
            R${" "}
            {estatisticas.totalReceber.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {estatisticas.quantidadePendente} pagamento(s) pendente(s)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Recebido</h3>
          <p className="text-2xl font-bold text-green-600">
            R${" "}
            {estatisticas.totalRecebido.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {pagamentos.filter((p) => p.status === "Pago").length} pagamento(s)
            realizado(s)
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
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* 3. SEARCH E FILTERS */}
      <SearchAndFilters
        searchValue={searchText}
        onSearchChange={setSearchText}
        filters={searchFilters}
        searchPlaceholder="Buscar por nome do aluno..."
        searchLabel="Buscar Aluno"
      />

      {/* 4. TABELA DE PAGAMENTOS */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={pagamentosFiltrados}
          columns={pagamentosColumns}
          loading={loading}
        />
      </div>
      {/* Modal de Histórico */}
      {showHistoricoModal && (
        <HistoricoModal
          isOpen={showHistoricoModal}
          onClose={handleCloseHistorico}
          alunoId={selectedAlunoId}
          userType="admin" // ✅ Sempre admin nesta página
        />
      )}

      {/* 5. TOAST */}
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
