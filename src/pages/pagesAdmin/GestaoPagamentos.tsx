import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaCreditCard, FaDownload, FaArchive } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import type { Pagamento } from "../../types/pagamentos";
import { gerarPagamentoParaAluno } from "../../services/integracaoService";
// Adicionar antes do export default function:
const pagamentosColumns = [
  {
    key: "alunoNome",
    label: "Aluno",
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
];
export default function GestaoPagamentos() {
  // Dados
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState<Pagamento[]>(
    []
  );
  // Loading e controle
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  // Filtros e busca
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Modal e toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      // 1. Pegando referência da coleção
      const pagamentosRef = collection(db, "pagamentos");
      // 2. Buscar Dados
      const snapshot = await getDocs(pagamentosRef);
      // 3. Transformar em um array
      const pagamentosData: Pagamento[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        pagamentosData.push({
          id: doc.id,
          alunoId: data.alunoId || "",
          alunoNome: data.alunoNome || "",
          valor: data.valor || 0,
          planoTipo: data.plano || "Mensal",
          mesReferencia: data.mesReferencia || "",
          dataVencimento: data.dataVencimento?.toDate() || new Date(),
          dataPagamento: data.dataPagamento?.toDate() || undefined,
          status: data.status || "Pendente",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      // 4.Atualizar estados
      setPagamentos(pagamentosData);
      console.log("Pagamentos carregados");
      const pagamentosAtivos = pagamentosData.filter(
        (p) => p.status !== "Arquivado"
      );
      setPagamentos(pagamentosAtivos);
    } catch (error) {
      // Add toast de erros
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const calcularEstatisticas = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa

    // Filtrar por status
    const pagamentosPendentes = pagamentos.filter(
      (p) => p.status === "Pendente"
    );
    const pagamentosPagos = pagamentos.filter((p) => p.status === "Pago");

    // Calcular valores
    const totalReceber = pagamentosPendentes.reduce(
      (sum, p) => sum + p.valor,
      0
    );
    const totalRecebido = pagamentosPagos.reduce((sum, p) => sum + p.valor, 0);

    // Pagamentos em atraso (vencimento já passou)
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
  const estatisticas = calcularEstatisticas();

  // Filtros disponíveis
  const searchFilters = [
    {
      label: "Status do Pagamento",
      options: [
        { value: "Pendente", label: "Pendente" },
        { value: "Pago", label: "Pago" },
        { value: "Atrasado", label: "Em Atraso" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: "Todos os Status",
    },
  ];

  // Filtragem dos pagamentos
  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let filtrados = pagamentos.filter((p) =>
      p.alunoNome.toLowerCase().includes(searchText.toLowerCase())
    );

    if (statusFilter === "Atrasado") {
      filtrados = filtrados.filter(
        (p) =>
          p.status === "Pendente" &&
          new Date(p.dataVencimento).setHours(0, 0, 0, 0) < hoje.getTime()
      );
    } else if (statusFilter) {
      filtrados = filtrados.filter((p) => p.status === statusFilter);
    }

    setPagamentosFiltrados(filtrados);
  }, [pagamentos, searchText, statusFilter]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const gerarPagamentosParaAlunosExistentes = async () => {
    try {
      setLoading(true);

      // 1. Buscar todos os alunos
      const alunosSnapshot = await getDocs(collection(db, "Alunos"));

      console.log(`📋 Encontrados ${alunosSnapshot.size} Alunos`);

      // 2. Para cada aluno, verificar e gerar pagamento
      for (const alunoDoc of alunosSnapshot.docs) {
        const aluno = alunoDoc.data();

        console.log(
          `👤 Processando aluno: ${aluno.nome}, status: ${aluno.status}`
        );

        // Verificar se já existe pagamento
        const pagamentosExistentes = await getDocs(
          query(
            collection(db, "pagamentos"),
            where("alunoId", "==", alunoDoc.id)
          )
        );

        if (pagamentosExistentes.empty) {
          // Gerar pagamento usando o serviço
          await gerarPagamentoParaAluno({
            id: alunoDoc.id,
            nome: aluno.nome,
            plano: aluno.plano,
            valorMensalidade: aluno.valorMensalidade || 150,
            status: aluno.status, // ✅ Usar status do aluno
          });

          console.log(`✅ Pagamento gerado para ${aluno.nome}`);
        } else {
          console.log(`⏸️ ${aluno.nome} já possui pagamento`);
        }
      }

      setToastMessage("Pagamentos gerados com sucesso!");
      setToastType("success");
      setShowToast(true);
      fetchPagamentos(); // Recarregar
    } catch (error) {
      console.error("❌ Erro:", error);
      setToastMessage("Erro ao gerar pagamentos");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoPago = async (pagamento: Pagamento) => {
    try {
      // 1. Marcar como pago
      await updateDoc(doc(db, "pagamentos", pagamento.id!), {
        status: "Pago",
        dataPagamento: new Date(),
        updatedAt: new Date(),
      });

      // 2. Gerar próximo pagamento
      await gerarProximoPagamento(pagamento);

      setToastMessage("Pagamento confirmado e próximo gerado!");
      setToastType("success");
      setShowToast(true);
      fetchPagamentos();
    } catch (error) {
      setToastMessage("Erro ao processar pagamento");
      setToastType("error");
      setShowToast(true);
    }
  };

  const gerarProximoPagamento = async (pagamentoAtual: Pagamento) => {
    // Buscar dados do aluno
    const alunoDoc = await getDoc(doc(db, "Alunos", pagamentoAtual.alunoId));
    const aluno = alunoDoc.data();
    // Verificar se o aluno existe
    if (!aluno) {
      throw new Error("Aluno não encotrado!");
    }
    // Calcular próximo vencimento baseado no plano
    const proximoVencimento = calcularProximoVencimento(
      pagamentoAtual.dataVencimento,
      aluno.plano
    );

    // Gerar novo pagamento
    await addDoc(collection(db, "pagamentos"), {
      alunoId: pagamentoAtual.alunoId,
      alunoNome: pagamentoAtual.alunoNome,
      valor: aluno.valorMensalidade,
      mesReferencia: proximoVencimento.toLocaleDateString("pt-BR", {
        month: "2-digit",
        year: "numeric",
      }),
      mesAno: `${proximoVencimento.getFullYear()}-${String(
        proximoVencimento.getMonth() + 1
      ).padStart(2, "0")}`,
      dataVencimento: proximoVencimento,
      status: "Pendente",
      planoTipo: aluno.plano,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const calcularProximoVencimento = (vencimentoAtual: Date, plano: string) => {
    const proximo = new Date(vencimentoAtual);

    switch (plano) {
      case "Mensal":
        proximo.setMonth(proximo.getMonth() + 1);
        break;
      case "Trimestral":
        proximo.setMonth(proximo.getMonth() + 3);
        break;
      case "Semestral":
        proximo.setMonth(proximo.getMonth() + 6);
        break;
    }

    return proximo;
  };

  const handleFecharMes = async () => {
    if (!confirm("Deseja fechar o mês? Todos os pagamentos serão arquivados!"))
      return;

    try {
      setLoading(true);

      // 1. Buscar TODOS os pagamentos ativos
      const q = query(
        collection(db, "pagamentos"),
        where("status", "in", ["Pago", "Pendente"])
      );

      const snapshot = await getDocs(q);
      console.log(`📋 Encontrados ${snapshot.size} pagamentos para arquivar`);

      if (snapshot.empty) {
        setToastMessage("Nenhum pagamento encontrado para arquivar");
        setToastType("error");
        setShowToast(true);
        return;
      }

      // 2. Coletar dados dos pagamentos antes de arquivar
      const dadosPagamentos = new Map();
      snapshot.forEach((docSnapshot) => {
        const pagamento = docSnapshot.data();
        dadosPagamentos.set(pagamento.alunoId, {
          dataVencimentoAtual: pagamento.dataVencimento.toDate(),
          alunoNome: pagamento.alunoNome,
          valor: pagamento.valor,
          planoTipo: pagamento.planoTipo,
        });
      });

      // 3. Arquivar em lote
      const batch = writeBatch(db);
      snapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
          status: "Arquivado",
          arquivadoEm: new Date(),
          updatedAt: new Date(),
        });
      });

      await batch.commit();
      console.log("✅ Pagamentos arquivados com sucesso");

      // 4. Buscar alunos ativos para verificar status
      const alunosSnapshot = await getDocs(
        query(collection(db, "Alunos"), where("status", "==", "ativo"))
      );

      console.log(`👥 Encontrados ${alunosSnapshot.size} alunos ativos`);

      // 5. Gerar novos pagamentos baseados nos dados originais
      let pagamentosGerados = 0;

      for (const [alunoId, dadosPagamento] of dadosPagamentos) {
        try {
          // Verificar se o aluno ainda está ativo
          const alunoDoc = await getDoc(doc(db, "Alunos", alunoId));

          if (!alunoDoc.exists()) {
            console.log(`❌ Aluno ${alunoId} não encontrado`);
            continue;
          }

          const aluno = alunoDoc.data();

          if (aluno.status !== "ativo") {
            console.log(`⏸️ Aluno ${aluno.nome} não está mais ativo`);
            continue;
          }

          // ✅ CALCULAR próximo vencimento baseado no PLANO E DIA ORIGINAL
          const dataVencimentoAtual = dadosPagamento.dataVencimentoAtual;
          const proximoVencimento = new Date(dataVencimentoAtual);

          // ✅ SOMAR baseado no PLANO (preservando o dia original)
          switch (aluno.plano) {
            case "Mensal":
              proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
              break;
            case "Trimestral":
              proximoVencimento.setMonth(proximoVencimento.getMonth() + 3);
              break;
            case "Semestral":
              proximoVencimento.setMonth(proximoVencimento.getMonth() + 6);
              break;
            default:
              proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
          }

          // ✅ VERIFICAR se já existe pagamento ativo para este aluno
          const pagamentosExistentes = await getDocs(
            query(
              collection(db, "pagamentos"),
              where("alunoId", "==", alunoId),
              where("status", "in", ["Pendente", "Pago"])
            )
          );

          if (pagamentosExistentes.empty) {
            await addDoc(collection(db, "pagamentos"), {
              alunoId: alunoId,
              alunoNome: aluno.nome,
              valor: aluno.valorMensalidade || dadosPagamento.valor,
              mesReferencia: proximoVencimento.toLocaleDateString("pt-BR", {
                month: "2-digit",
                year: "numeric",
              }),
              dataVencimento: proximoVencimento, // ✅ Preserva dia original + soma baseada no plano
              status: "Pendente",
              planoTipo: aluno.plano || "Mensal",
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            pagamentosGerados++;
            console.log(
              `✅ Novo pagamento gerado para ${aluno.nome} - Plano: ${
                aluno.plano
              } - Vencimento: ${proximoVencimento.toLocaleDateString(
                "pt-BR"
              )} (dia ${proximoVencimento.getDate()})`
            );
          } else {
            console.log(`⏸️ ${aluno.nome} já possui pagamento ativo`);
          }
        } catch (error) {
          console.error(
            `❌ Erro ao gerar pagamento para aluno ${alunoId}:`,
            error
          );
        }
      }

      setToastMessage(
        `Mês fechado! ${snapshot.size} pagamentos arquivados e ${pagamentosGerados} novos gerados`
      );
      setToastType("success");
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

  return (
    <div className="p-6">
      {/* 1. HEADER com título e botão "Exportar CSV" */}
      {/* 1. HEADER com título e botões */}
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
          >
            <FaArchive />
            Fechar Mês
          </button>
        </div>
      </div>

      {/* 2. CARDS DE ESTATÍSTICAS - TODO: implementar */}
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
          onEdit={handleMarcarComoPago}
        />
      </div>
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
