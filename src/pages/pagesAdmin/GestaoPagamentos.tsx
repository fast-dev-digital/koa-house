import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
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
  gerarPagamentoParaAluno,
  gerarProximoPagamento,
  arquivarPagamentosMesAtual,
} from "../../services/integracaoService";
import HistoricoModal from "../../components/HistoricoModal";

export default function GestaoPagamentos() {
  // Estados principais
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState<Pagamento[]>(
    []
  );
  // Estados para controle do Modal
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>("");
  const [selectedAlunoNome, setSelectedAlunoNome] = useState<string>("");
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

  // ✅ FUNÇÃO - Buscar pagamentos (apenas ativos)
  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "pagamentos"));
      const pagamentosData: Pagamento[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        pagamentosData.push({
          id: doc.id,
          alunoId: data.alunoId || "",
          alunoNome: data.alunoNome || "",
          valor: data.valor || 0,
          planoTipo: data.planoTipo || "Mensal",
          mesReferencia: data.mesReferencia || "",
          dataVencimento: data.dataVencimento?.toDate() || new Date(),
          dataPagamento: data.dataPagamento?.toDate() || undefined,
          status: data.status || "Pendente",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      // ✅ FILTRAR apenas pagamentos ativos (não arquivados)
      const pagamentosAtivos = pagamentosData.filter(
        (p) => p.status !== "Arquivado"
      );

      setPagamentos(pagamentosAtivos);
      console.log(`📊 ${pagamentosAtivos.length} pagamentos ativos carregados`);
    } catch (error) {
      console.error("❌ Erro ao buscar pagamentos:", error);
      setToastMessage("Erro ao carregar pagamentos");
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
  const handleVerHistorico = (alunoId: string, alunoNome: string) => {
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
      render: (value: any, row: Pagamento) => (
        <div className="flex items-center gap-2">
          {/* Botão Ver Histórico - Sempre ativo */}
          <button
            onClick={() => handleVerHistorico(row.alunoId, row.alunoNome)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
            title={`Ver histórico de ${row.alunoNome}`}
          >
            <FaHistory className="text-xs" />
            Histórico
          </button>

          {/* Botão Pagar - Condicional baseado no status */}
          {row.status === "Pendente" ? (
            // ✅ ATIVO - Se pendente, permite clicar
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
            // ✅ DESABILITADO - Se já pago, mostra status visual
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
      const alunosSnapshot = await getDocs(collection(db, "Alunos"));
      console.log(`📋 Encontrados ${alunosSnapshot.size} alunos`);

      let pagamentosGerados = 0;

      for (const alunoDoc of alunosSnapshot.docs) {
        const aluno = alunoDoc.data();

        // Verificar se já existe pagamento ativo
        const pagamentosExistentes = await getDocs(
          query(
            collection(db, "pagamentos"),
            where("alunoId", "==", alunoDoc.id),
            where("status", "in", ["Pendente", "Pago"])
          )
        );

        if (pagamentosExistentes.empty) {
          // ✅ USAR SERVICE - Gerar primeiro pagamento
          await gerarPagamentoParaAluno({
            id: alunoDoc.id,
            nome: aluno.nome,
            plano: aluno.plano,
            valorMensalidade: aluno.valorMensalidade || 150,
            status: aluno.status,
          });

          pagamentosGerados++;
          console.log(`✅ Pagamento gerado para ${aluno.nome}`);
        } else {
          console.log(`⏸️ ${aluno.nome} já possui pagamento ativo`);
        }
      }

      setToastMessage(`${pagamentosGerados} pagamentos gerados com sucesso!`);
      setToastType("success");
      setShowToast(true);
      fetchPagamentos();
    } catch (error) {
      console.error("❌ Erro:", error);
      setToastMessage("Erro ao gerar pagamentos");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO - Marcar como pago e gerar próximo (usando service)
  const handleMarcarComoPago = async (pagamento: Pagamento) => {
    try {
      if (!pagamento.id) {
        throw new Error("ID do pagamento não encontrado");
      }

      // 1. Marcar como pago
      await updateDoc(doc(db, "pagamentos", pagamento.id), {
        status: "Pago",
        dataPagamento: new Date(),
        updatedAt: new Date(),
      });

      // 2. ✅ USAR SERVICE - Gerar próximo pagamento (sempre +1 mês)
      await gerarProximoPagamento({
        id: pagamento.id,
        alunoId: pagamento.alunoId,
        alunoNome: pagamento.alunoNome,
        dataVencimento: pagamento.dataVencimento,
        valor: pagamento.valor,
      });

      setToastMessage("Pagamento confirmado e próximo gerado!");
      setToastType("success");
      setShowToast(true);
      fetchPagamentos();
    } catch (error) {
      console.error("❌ Erro ao marcar como pago:", error);
      setToastMessage("Erro ao processar pagamento");
      setToastType("error");
      setShowToast(true);
    }
  };

  // ✅ FUNÇÃO - Fechar mês (apenas arquivar - usando service)
  const handleFecharMes = async () => {
    if (!confirm("Deseja arquivar os pagamentos do mês anterior?")) return;

    try {
      setLoading(true);

      // ✅ USAR SERVICE - Arquivar pagamentos do mês anterior
      const resultado = await arquivarPagamentosMesAtual();

      if (resultado.erro) {
        setToastMessage(resultado.erro);
        setToastType("error");
      } else {
        setToastMessage(
          `${resultado.arquivados} pagamentos arquivados com sucesso!`
        );
        setToastType("success");
      }

      setShowToast(true);
      fetchPagamentos();
    } catch (error) {
      console.error("❌ Erro ao fechar mês:", error);
      setToastMessage("Erro ao arquivar pagamentos");
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

    if (statusFilter) {
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
        { value: "Atrasado", label: "Atrasado" },
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
            onClick={() => console.log("Exportar CSV")}
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
            {loading ? "Processando..." : "Fechar Mês"}
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
