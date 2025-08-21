import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Pagamento } from "../types/pagamentos";

interface HistoricoOptions {
  alunoId: string;
  incluirArquivados?: boolean;
  limitePagamentos?: number;
  filtroStatus?: string[];
  filtroPerido?: {
    inicio: Date;
    fim: Date;
  };
}

// ✅ EXPORTAR a interface
export interface HistoricoResponse {
  aluno: {
    id: string;
    nome: string;
    plano: string;
    status: string;
    valorMensalidade: number;
    dataMatricula?: Date;
    telefone?: string;
    email?: string;
  };
  pagamentos: Pagamento[];
  estatisticas: {
    totalPago: number;
    totalPendente: number;
    totalAtrasado: number;
    quantidadePagamentos: number;
    ultimoPagamento?: Date;
    proximoVencimento?: Date;
    mediaValorPagamento: number;
  };
}

// ✅ FUNÇÃO PRINCIPAL - Buscar histórico completo
export async function buscarHistoricoAluno(
  options: HistoricoOptions
): Promise<HistoricoResponse> {
  try {
    console.log(`📋 Buscando histórico para aluno: ${options.alunoId}`);

    // 1️⃣ BUSCAR DADOS DO ALUNO
    const alunoDoc = await getDoc(doc(db, "Alunos", options.alunoId));
    if (!alunoDoc.exists()) {
      throw new Error("Aluno não encontrado");
    }

    const alunoData = alunoDoc.data();
    const aluno = {
      id: alunoDoc.id,
      nome: alunoData.nome || "Nome não informado",
      plano: alunoData.plano || "Não informado",
      status: alunoData.status || "Inativo",
      valorMensalidade: alunoData.valorMensalidade || 0,
      dataMatricula: alunoData.dataMatricula?.toDate(),
      telefone: alunoData.telefone,
      email: alunoData.email,
    };

    // 2️⃣ CONSTRUIR QUERY DE PAGAMENTOS
    let pagamentosQuery = query(
      collection(db, "pagamentos"),
      where("alunoId", "==", options.alunoId)
    );

    // ✅ FILTRO POR STATUS
    if (options.filtroStatus && options.filtroStatus.length > 0) {
      if (options.incluirArquivados) {
        pagamentosQuery = query(
          pagamentosQuery,
          where("status", "in", options.filtroStatus)
        );
      } else {
        const statusSemArquivados = options.filtroStatus.filter(
          (status) => status !== "Arquivado"
        );
        if (statusSemArquivados.length > 0) {
          pagamentosQuery = query(
            pagamentosQuery,
            where("status", "in", statusSemArquivados)
          );
        }
      }
    } else if (!options.incluirArquivados) {
      pagamentosQuery = query(
        pagamentosQuery,
        where("status", "in", ["Pendente", "Pago"])
      );
    }

    // ✅ ORDENAÇÃO E LIMITE
    pagamentosQuery = query(pagamentosQuery, orderBy("dataVencimento", "desc"));

    if (options.limitePagamentos) {
      pagamentosQuery = query(pagamentosQuery, limit(options.limitePagamentos));
    }

    // 3️⃣ EXECUTAR QUERY
    const pagamentosSnapshot = await getDocs(pagamentosQuery);
    let pagamentos: Pagamento[] = [];

    pagamentosSnapshot.forEach((doc) => {
      const data = doc.data();
      pagamentos.push({
        id: doc.id,
        alunoId: data.alunoId,
        alunoNome: data.alunoNome,
        valor: data.valor || 0,
        planoTipo: data.planoTipo || "Mensal",
        mesReferencia: data.mesReferencia || "",
        dataVencimento: data.dataVencimento?.toDate() || new Date(),
        dataPagamento: data.dataPagamento?.toDate(),
        status: data.status || "Pendente",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        arquivadoEm: data.arquivadoEm?.toDate(),
      });
    });

    // 4️⃣ APLICAR FILTRO DE PERÍODO (se especificado)
    if (options.filtroPerido) {
      pagamentos = pagamentos.filter((pagamento) => {
        const dataVencimento = new Date(pagamento.dataVencimento);
        return (
          dataVencimento >= options.filtroPerido!.inicio &&
          dataVencimento <= options.filtroPerido!.fim
        );
      });
    }

    console.log(`✅ Encontrados ${pagamentos.length} pagamentos`);

    // 5️⃣ CALCULAR ESTATÍSTICAS
    const estatisticas = calcularEstatisticas(pagamentos);

    return {
      aluno,
      pagamentos,
      estatisticas,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    throw error;
  }
}

// ✅ FUNÇÃO AUXILIAR - Calcular estatísticas
function calcularEstatisticas(pagamentos: Pagamento[]) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const pagamentosPagos = pagamentos.filter((p) => p.status === "Pago");
  const pagamentosPendentes = pagamentos.filter((p) => p.status === "Pendente");

  const pagamentosAtrasados = pagamentosPendentes.filter((p) => {
    const vencimento = new Date(p.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  });

  const totalPago = pagamentosPagos.reduce((sum, p) => sum + p.valor, 0);
  const totalPendente = pagamentosPendentes.reduce(
    (sum, p) => sum + p.valor,
    0
  );
  const totalAtrasado = pagamentosAtrasados.reduce(
    (sum, p) => sum + p.valor,
    0
  );

  const ultimoPagamento = pagamentosPagos
    .filter((p) => p.dataPagamento)
    .sort(
      (a, b) =>
        new Date(b.dataPagamento!).getTime() -
        new Date(a.dataPagamento!).getTime()
    )[0]?.dataPagamento;

  const proximoVencimento = pagamentosPendentes.sort(
    (a, b) =>
      new Date(a.dataVencimento).getTime() -
      new Date(b.dataVencimento).getTime()
  )[0]?.dataVencimento;

  const mediaValorPagamento =
    pagamentos.length > 0
      ? pagamentos.reduce((sum, p) => sum + p.valor, 0) / pagamentos.length
      : 0;

  return {
    totalPago,
    totalPendente,
    totalAtrasado,
    quantidadePagamentos: pagamentos.length,
    ultimoPagamento,
    proximoVencimento,
    mediaValorPagamento,
  };
}

// ✅ EXPORTAR FUNÇÃO CONVENIENTE - Para admin (todos os dados)
export async function buscarHistoricoParaAdmin(
  alunoId: string,
  filtros?: {
    status?: string[];
    periodo?: { inicio: Date; fim: Date };
    limite?: number;
  }
): Promise<HistoricoResponse> {
  return buscarHistoricoAluno({
    alunoId,
    incluirArquivados: true, // ✅ Admin vê tudo
    limitePagamentos: filtros?.limite || 200, // Limite alto
    filtroStatus: filtros?.status,
    filtroPerido: filtros?.periodo,
  });
}

// ✅ EXPORTAR FUNÇÃO CONVENIENTE - Para aluno (dados limitados)
export async function buscarHistoricoParaAluno(
  alunoId: string,
  filtros?: {
    status?: string[];
    periodo?: { inicio: Date; fim: Date };
  }
): Promise<HistoricoResponse> {
  return buscarHistoricoAluno({
    alunoId,
    incluirArquivados: false, // ✅ Aluno nunca vê arquivados
    limitePagamentos: 50, // Limite para performance
    filtroStatus: filtros?.status || ["Pago", "Pendente"], // Só relevantes
    filtroPerido: filtros?.periodo,
  });
}

// ✅ EXPORTAR FUNÇÃO ADICIONAL - Buscar resumo rápido (para dashboards)
export async function buscarResumoAluno(alunoId: string): Promise<{
  proximoVencimento?: Date;
  ultimoPagamento?: Date;
  totalDevendo: number;
  statusGeral: "Em dia" | "Atrasado" | "Sem pagamentos";
}> {
  try {
    const historico = await buscarHistoricoParaAluno(alunoId);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pagamentosAtrasados = historico.pagamentos.filter((p) => {
      const vencimento = new Date(p.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      return p.status === "Pendente" && vencimento < hoje;
    });

    let statusGeral: "Em dia" | "Atrasado" | "Sem pagamentos" = "Em dia";

    if (historico.pagamentos.length === 0) {
      statusGeral = "Sem pagamentos";
    } else if (pagamentosAtrasados.length > 0) {
      statusGeral = "Atrasado";
    }

    return {
      proximoVencimento: historico.estatisticas.proximoVencimento,
      ultimoPagamento: historico.estatisticas.ultimoPagamento,
      totalDevendo: historico.estatisticas.totalPendente,
      statusGeral,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar resumo:", error);
    return {
      totalDevendo: 0,
      statusGeral: "Sem pagamentos",
    };
  }
}
