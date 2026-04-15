import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { DadosEditaveisAluno } from "../types/pagamentos";
// ✅ INTERFACES
interface AlunoData {
  id: string;
  nome: string;
  plano: string;
  valorMensalidade: number;
  status: string;
  dataMatricula?: string;
  telefone: string;
}

interface PagamentoExistente {
  id: string;
  alunoId: string;
  alunoNome: string;
  dataVencimento: Date;
  valor: number;
}

interface PagamentoItem {
  mesReferencia: string;
  dataVencimento: Date;
  valor: number;
  status: "Pendente" | "Pago" | "Arquivado";
  dataPagamento?: Date;
  arquivadoEm?: Date;
  statusAnterior?: string;
  observacoes?: string;
  plano?: string;
}

export interface AlunoComPagamentos {
  id?: string;
  alunoId: string;
  nome: string;
  plano: string;
  valorMensalidade: number;
  status: string;
  dataMatricula: Date;
  pagamentos: PagamentoItem[];
  totais: {
    pago: number;
    pendente: number;
    arquivado: number;
  };
  proximoVencimento?: Date;
  createdAt: Date;
  updatedAt: Date;
  dataFinalMatricula?: Date;
  telefone?: string;
}

interface CacheIntegracao {
  todosAlunos: AlunoComPagamentos[] | null;
  alunoIndividual: Map<string, AlunoComPagamentos>;
  timestampTodos: number;
  timestampIndividual: Map<string, number>;
}

interface TotaisPagamentos {
  pago: number;
  pendente: number;
  arquivado: number;
}

const cacheIntegracaoPorTenant = new Map<string, CacheIntegracao>();

const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

function assertTenantId(tenantId: string): string {
  const tenantNormalizado = tenantId?.trim();
  if (!tenantNormalizado) {
    throw new Error("tenantId é obrigatório");
  }
  return tenantNormalizado;
}

function getOrCreateTenantCache(tenantId: string): CacheIntegracao {
  const tenantNormalizado = assertTenantId(tenantId);
  const cacheExistente = cacheIntegracaoPorTenant.get(tenantNormalizado);

  if (cacheExistente) {
    return cacheExistente;
  }

  const novoCache: CacheIntegracao = {
    todosAlunos: null,
    alunoIndividual: new Map(),
    timestampTodos: 0,
    timestampIndividual: new Map(),
  };

  cacheIntegracaoPorTenant.set(tenantNormalizado, novoCache);
  return novoCache;
}

//  FUNÇÃO PARA INVALIDAR CACHE
function invalidarCacheIntegracao(tenantId: string): void {
  ("🧹 Invalidando cache de integração...");
  const cacheIntegracao = getOrCreateTenantCache(tenantId);
  cacheIntegracao.todosAlunos = null;
  cacheIntegracao.timestampTodos = 0;
  cacheIntegracao.alunoIndividual.clear();
  cacheIntegracao.timestampIndividual.clear();
}

//  FUNÇÃO PARA VERIFICAR SE CACHE ESTÁ VÁLIDO
function cacheValidoTodos(tenantId: string): boolean {
  const now = Date.now();
  const cacheIntegracao = getOrCreateTenantCache(tenantId);
  return (
    cacheIntegracao.todosAlunos !== null &&
    now - cacheIntegracao.timestampTodos < CACHE_TTL
  );
}

function cacheValidoIndividual(tenantId: string, alunoId: string): boolean {
  const now = Date.now();
  const cacheIntegracao = getOrCreateTenantCache(tenantId);
  const timestamp = cacheIntegracao.timestampIndividual.get(alunoId) || 0;
  return (
    cacheIntegracao.alunoIndividual.has(alunoId) && now - timestamp < CACHE_TTL
  );
}

// Helpers
const getAlunosPagamentosRef = (tenantId: string) => {
  const t = assertTenantId(tenantId);
  return collection(db, `tenants/${t}/alunosPagamentos`);
};

const getAlunoPagamentoDocRef = (tenantId: string, docId: string) => {
  const t = assertTenantId(tenantId);
  return doc(db, `tenants/${t}/alunosPagamentos`, docId);
};

const getAlunoDocRef = (tenantId: string, alunoId: string) => {
  const t = assertTenantId(tenantId);
  return doc(db, `tenants/${t}/alunos`, alunoId);
};

const getPagamentosRef = (tenantId: string) => {
  const t = assertTenantId(tenantId);
  return collection(db, `tenants/${t}/pagamentos`);
};

const gerarMesReferencia = (data: Date): string =>
  data.toLocaleDateString("pt-BR", {
    month: "2-digit",
    year: "numeric",
  });

const calcularTotaisPagamentos = (pagamentos: any[]): TotaisPagamentos => {
  return pagamentos.reduce(
    (acc, pagamento) => {
      const valor = typeof pagamento?.valor === "number" ? pagamento.valor : 0;
      const status = pagamento?.status;

      if (status === "Pago") acc.pago += valor;
      else if (status === "Pendente") acc.pendente += valor;
      else if (status === "Arquivado") acc.arquivado += valor;

      return acc;
    },
    { pago: 0, pendente: 0, arquivado: 0 } as TotaisPagamentos,
  );
};

const obterStatusAluno = async (
  tenantId: string,
  alunoId: string,
): Promise<string> => {
  try {
    const docAluno = await getDoc(getAlunoDocRef(tenantId, alunoId));
    if (!docAluno.exists()) return "";
    return (docAluno.data().status || "").trim();
  } catch (e) {
    console.warn("⚠️ Não foi possível ler status em Alunos:", e);
    return "";
  }
};

// Criar aluno na nova estrutura com primeiro pagamento
export async function criarAlunoComPagamentosArray(
  alunoData: AlunoData,
  tenantId: string,
): Promise<void> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);

    if (alunoData.status !== "Ativo") {
      `⏸️ Aluno ${alunoData.nome} não está ativo`;
      return;
    }

    // Verificar se já existe na nova estrutura
    const existeQuery = query(
      getAlunosPagamentosRef(tenantId),
      where("alunoId", "==", alunoData.id),
    );
    const existeSnapshot = await getDocs(existeQuery);

    if (!existeSnapshot.empty) {
      `⏸️ ${alunoData.nome} já existe na nova estrutura`;
      return;
    }

    // Calcular primeiro vencimento
    const hoje = new Date();

    let dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), 10);

    const mesReferencia = dataVencimento.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });

    // Criar documento na nova estrutura
    await addDoc(getAlunosPagamentosRef(tenantId), {
      alunoId: alunoData.id,
      nome: alunoData.nome,
      plano: alunoData.plano,
      valorMensalidade: alunoData.valorMensalidade,
      status: alunoData.status,
      dataMatricula: Timestamp.fromDate(
        alunoData.dataMatricula ? new Date(alunoData.dataMatricula) : hoje,
      ),
      telefone: alunoData.telefone || "",
      pagamentos: [
        {
          mesReferencia,
          dataVencimento: Timestamp.fromDate(dataVencimento),
          valor: alunoData.valorMensalidade,
          status: "Pendente",
        },
      ],
      totais: {
        pago: 0,
        pendente: alunoData.valorMensalidade,
        arquivado: 0,
      },
      proximoVencimento: Timestamp.fromDate(dataVencimento),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    `✅ ${alunoData.nome} criado na nova estrutura`;
    invalidarCacheIntegracao(tenantNormalizado);
  } catch (error) {
    console.error("❌ Erro ao criar aluno na nova estrutura:", error);
    throw error;
  }
}

// ✅ FUNÇÃO 5 - Buscar aluno específico com pagamentos

export async function buscarAlunoComPagamentos(
  alunoId: string,
  tenantId: string,
): Promise<AlunoComPagamentos | null> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    const cacheIntegracao = getOrCreateTenantCache(tenantNormalizado);

    // ✅ VERIFICAR CACHE INDIVIDUAL PRIMEIRO
    if (cacheValidoIndividual(tenantNormalizado, alunoId)) {
      return cacheIntegracao.alunoIndividual.get(alunoId) || null;
    }

    const alunoQuery = query(
      getAlunosPagamentosRef(tenantId),
      where("alunoId", "==", alunoId),
    );

    const alunoSnapshot = await getDocs(alunoQuery);

    if (alunoSnapshot.empty) {
      return null;
    }

    const docSnapshot = alunoSnapshot.docs[0];
    const data = docSnapshot.data();

    const aluno: AlunoComPagamentos = {
      id: docSnapshot.id,
      alunoId: data.alunoId,
      nome: data.nome,
      plano: data.plano,
      valorMensalidade: data.valorMensalidade,
      status: data.status,
      dataMatricula: data.dataMatricula?.toDate() || new Date(),
      pagamentos:
        data.pagamentos?.map((p: any) => ({
          ...p,
          dataVencimento: p.dataVencimento?.toDate() || new Date(),
          dataPagamento: p.dataPagamento?.toDate(),
          arquivadoEm: p.arquivadoEm?.toDate(),
        })) || [],
      totais: data.totais || { pago: 0, pendente: 0, arquivado: 0 },
      proximoVencimento: data.proximoVencimento?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      dataFinalMatricula: data.dataFinalMatricula?.toDate(),
      telefone: data.telefone || "",
    };

    // ✅ CACHEAR RESULTADO
    cacheIntegracao.alunoIndividual.set(alunoId, aluno);
    cacheIntegracao.timestampIndividual.set(alunoId, Date.now());

    `✅ Aluno ${data.nome} carregado e cacheado`;
    return aluno;
  } catch (error) {
    console.error("❌ Erro ao buscar aluno:", error);
    return null;
  }
}
// ✅ FUNÇÃO 6 - Listar todos alunos com pagamentos
// ✅ SUBSTITUIR A FUNÇÃO COMPLETA (LINHA 169):
export async function listarAlunosComPagamentos(
  tenantId: string,
): Promise<AlunoComPagamentos[]> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    const cacheIntegracao = getOrCreateTenantCache(tenantNormalizado);

    // VERIFICAR CACHE PRIMEIRO
    if (cacheValidoTodos(tenantNormalizado)) {
      return cacheIntegracao.todosAlunos!;
    }

    const snapshot = await getDocs(getAlunosPagamentosRef(tenantId));
    const alunos: AlunoComPagamentos[] = [];

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const aluno: AlunoComPagamentos = {
        id: docSnapshot.id,
        alunoId: data.alunoId,
        nome: data.nome,
        plano: data.plano,
        valorMensalidade: data.valorMensalidade,
        status: data.status,
        dataMatricula: data.dataMatricula?.toDate() || new Date(),
        pagamentos:
          data.pagamentos?.map((p: any) => ({
            ...p,
            dataVencimento: p.dataVencimento?.toDate() || new Date(),
            dataPagamento: p.dataPagamento?.toDate(),
            arquivadoEm: p.arquivadoEm?.toDate(),
          })) || [],
        totais: data.totais || { pago: 0, pendente: 0, arquivado: 0 },
        proximoVencimento: data.proximoVencimento?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dataFinalMatricula: data.dataFinalMatricula?.toDate(),
        telefone: data.telefone || "",
      };

      alunos.push(aluno);

      // ✅ CACHEAR TAMBÉM INDIVIDUALMENTE
      cacheIntegracao.alunoIndividual.set(data.alunoId, aluno);
      cacheIntegracao.timestampIndividual.set(data.alunoId, Date.now());
    });

    // ✅ CACHEAR RESULTADO
    cacheIntegracao.todosAlunos = alunos;
    cacheIntegracao.timestampTodos = Date.now();

    `✅ ${alunos.length} alunos carregados e cacheados`;
    return alunos;
  } catch (error) {
    console.error("❌ Erro ao listar alunos:", error);
    return [];
  }
}

// ✅ FUNÇÃO 7 - Adicionar próximo pagamento ao array de um aluno
// ...existing code...

// ✅ FUNÇÃO UTILITÁRIA - Remover campos undefined de um objeto (EXPORTADA)
export function limparObjetoUndefined(obj: any): any {
  const objetoLimpo: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      objetoLimpo[key] = value;
    }
  }

  return objetoLimpo;
}

//  FUNÇÃO PARA SINCRONIZAR TODOS OS DADOS DO ALUNO

//  FUNÇÃO PARA SINCRONIZAR DADOS DE TODOS OS ALUNOS

// ✅ FUNÇÃO PARA SINCRONIZAR DADOS DE TODOS OS ALUNOS (INCLUINDO INATIVOS)

// ✅ FUNÇÃO ESPECÍFICA - Sincronizar APENAS telefone dos alunos (com Batch Processing)

// ✅ FUNÇÃO ULTRA-DEFENSIVA - Adicionar próximo pagamento ao array de um aluno
export async function adicionarProximoPagamentoArray(
  alunoId: string,
  tenantId: string,
): Promise<void> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    const alunoComPagamentos = await buscarAlunoComPagamentos(
      alunoId,
      tenantNormalizado,
    );
    if (!alunoComPagamentos) {
      throw new Error("Aluno não encontrado na nova estrutura");
    }

    // ✅ Status SEMPRE da collection Alunos
    const statusAluno = await obterStatusAluno(tenantId, alunoId);
    if (statusAluno.toLowerCase() !== "ativo") return;

    // Verificar se já tem pagamento pendente
    const temPendente = alunoComPagamentos.pagamentos.some(
      (p) => p.status === "Pendente",
    );
    if (temPendente) {
      `⏸️ ${alunoComPagamentos.nome} já possui pagamento pendente`;
      return;
    }

    // Calcular próximo vencimento (último vencimento + 1 mês)
    const ultimoPagamento =
      alunoComPagamentos.pagamentos[alunoComPagamentos.pagamentos.length - 1];
    const ultimoVencimento = new Date(ultimoPagamento.dataVencimento);
    const proximoVencimento = new Date(
      ultimoVencimento.getFullYear(),
      ultimoVencimento.getMonth() + 1,
      10,
    ); // Sempre dia 10

    const mesReferencia = gerarMesReferencia(proximoVencimento);

    const novosPagamentos: any[] = [];

    //  PROCESSAR pagamentos existentes
    for (const pagamento of alunoComPagamentos.pagamentos) {
      const pagamentoBase: any = {
        mesReferencia: pagamento.mesReferencia || "",
        dataVencimento: Timestamp.fromDate(
          pagamento.dataVencimento
            ? new Date(pagamento.dataVencimento)
            : new Date(),
        ),
        valor: typeof pagamento.valor === "number" ? pagamento.valor : 0,
        status: pagamento.status || "Pendente",
      };

      // Adicionar campos opcionais apenas se válidos
      if (pagamento.dataPagamento && pagamento.dataPagamento instanceof Date) {
        pagamentoBase.dataPagamento = Timestamp.fromDate(
          pagamento.dataPagamento,
        );
      }

      if (pagamento.arquivadoEm && pagamento.arquivadoEm instanceof Date) {
        pagamentoBase.arquivadoEm = Timestamp.fromDate(pagamento.arquivadoEm);
      }

      if (
        pagamento.statusAnterior &&
        typeof pagamento.statusAnterior === "string" &&
        pagamento.statusAnterior.trim()
      ) {
        pagamentoBase.statusAnterior = pagamento.statusAnterior.trim();
      }

      if (
        pagamento.observacoes &&
        typeof pagamento.observacoes === "string" &&
        pagamento.observacoes.trim()
      ) {
        pagamentoBase.observacoes = pagamento.observacoes.trim();
      }

      // ✅ LIMPAR undefined antes de adicionar
      novosPagamentos.push(limparObjetoUndefined(pagamentoBase));
    }

    // ✅ Usar valor do ÚLTIMO pagamento do alunosPagamentos (fallback: valorMensalidade)
    const valorUltimoPagamento =
      typeof ultimoPagamento?.valor === "number"
        ? ultimoPagamento.valor
        : typeof alunoComPagamentos.valorMensalidade === "number"
          ? alunoComPagamentos.valorMensalidade
          : 0;

    // ✅ ADICIONAR novo pagamento (sem campos undefined)
    // ✅ Plano atual do alunosPagamentos, com fallback opcional ao último pagamento
    const planoParaNovo =
      typeof alunoComPagamentos.plano === "string" &&
      alunoComPagamentos.plano.trim()
        ? alunoComPagamentos.plano.trim()
        : typeof ultimoPagamento?.plano === "string"
          ? ultimoPagamento.plano
          : undefined;

    const novoPagamento = limparObjetoUndefined({
      mesReferencia,
      dataVencimento: Timestamp.fromDate(proximoVencimento),
      valor: valorUltimoPagamento,
      status: "Pendente",
      ...(planoParaNovo ? { plano: planoParaNovo } : {}),
    });

    novosPagamentos.push(novoPagamento);

    const novoTotalPendente =
      (alunoComPagamentos.totais?.pendente || 0) + (valorUltimoPagamento || 0);

    // ✅ DADOS LIMPOS para atualização (sem undefined)
    const dadosLimpos = {
      pagamentos: novosPagamentos,
      proximoVencimento: Timestamp.fromDate(proximoVencimento),
      totais: {
        pago: alunoComPagamentos.totais?.pago || 0,
        pendente: novoTotalPendente,
        arquivado: alunoComPagamentos.totais?.arquivado || 0,
      },
      updatedAt: Timestamp.now(),
    };

    await updateDoc(
      getAlunoPagamentoDocRef(tenantId, alunoComPagamentos.id!),
      dadosLimpos,
    );

    `✅ Próximo pagamento adicionado para ${alunoComPagamentos.nome}`;
    invalidarCacheIntegracao(tenantNormalizado);
    ("invalidar cache funcionando");
  } catch (error) {
    console.error("❌ Erro ao adicionar próximo pagamento:", error);
    throw error;
  }
}

// ✅ FUNÇÃO 7.5 - Verificar e gerar pagamento para aluno que voltou a ser ativo
export async function verificarEGerarPagamentoAlunoAtivo(
  alunoId: string,
  tenantId: string,
): Promise<{ sucesso: boolean; mensagem?: string; erro?: string }> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    `🔍 Verificando necessidade de gerar pagamento para aluno ${alunoId}`;

    // Buscar aluno em alunosPagamentos
    const alunoQuery = query(
      getAlunosPagamentosRef(tenantId),
      where("alunoId", "==", alunoId),
    );
    const alunoSnapshot = await getDocs(alunoQuery);

    if (alunoSnapshot.empty) {
      return {
        sucesso: false,
        erro: "Aluno não encontrado em alunosPagamentos",
      };
    }

    const alunoDoc = alunoSnapshot.docs[0];
    const alunoData = alunoDoc.data();
    const pagamentos = alunoData.pagamentos || [];

    // Verificar status na collection Alunos
    const statusAluno = await obterStatusAluno(tenantId, alunoId);

    // Se não está ativo, não gerar
    if (statusAluno.toLowerCase() !== "ativo") {
      return {
        sucesso: false,
        mensagem: "Aluno não está ativo",
      };
    }

    // Verificar se já tem pagamento pendente
    const temPendente = pagamentos.some((p: any) => p.status === "Pendente");
    if (temPendente) {
      return {
        sucesso: false,
        mensagem: "Aluno já possui pagamento pendente",
      };
    }

    // Gerar novo pagamento
    if (pagamentos.length > 0) {
      // Tem histórico - gerar próximo mês
      const ultimoPagamento = pagamentos[pagamentos.length - 1];
      const ultimoVencimento = ultimoPagamento.dataVencimento?.toDate
        ? ultimoPagamento.dataVencimento.toDate()
        : new Date(ultimoPagamento.dataVencimento);

      const proximoVencimento = new Date(
        ultimoVencimento.getFullYear(),
        ultimoVencimento.getMonth() + 1,
        10,
      );

      const mesReferencia = gerarMesReferencia(proximoVencimento);

      // Verificar se já existe
      const jaExiste = pagamentos.some(
        (p: any) => p.mesReferencia === mesReferencia,
      );

      if (jaExiste) {
        return {
          sucesso: false,
          mensagem: `Pagamento para ${mesReferencia} já existe`,
        };
      }

      const valorPagamento =
        typeof ultimoPagamento.valor === "number"
          ? ultimoPagamento.valor
          : typeof alunoData.valorMensalidade === "number"
            ? alunoData.valorMensalidade
            : 0;

      const planoParaNovo =
        typeof alunoData.plano === "string" && alunoData.plano.trim()
          ? alunoData.plano.trim()
          : typeof ultimoPagamento?.plano === "string"
            ? ultimoPagamento.plano
            : undefined;

      const novoPagamento = limparObjetoUndefined({
        mesReferencia,
        dataVencimento: Timestamp.fromDate(proximoVencimento),
        valor: valorPagamento,
        status: "Pendente",
        ...(planoParaNovo ? { plano: planoParaNovo } : {}),
      });

      pagamentos.push(novoPagamento);

      const totais = calcularTotaisPagamentos(pagamentos);

      await updateDoc(alunoDoc.ref, {
        pagamentos: pagamentos.map((p: any) => limparObjetoUndefined(p)),
        totais: {
          pago: totais.pago,
          pendente: totais.pendente,
          arquivado: totais.arquivado,
        },
        proximoVencimento: Timestamp.fromDate(proximoVencimento),
        updatedAt: Timestamp.now(),
      });

      `   ✅ Pagamento gerado: ${mesReferencia} - R$ ${valorPagamento}`;
      invalidarCacheIntegracao(tenantNormalizado);

      return {
        sucesso: true,
        mensagem: `Pagamento gerado para ${mesReferencia}`,
      };
    } else {
      // Sem histórico - criar primeiro pagamento
      const hoje = new Date();
      const proximoVencimento = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        10,
      );
      if (proximoVencimento < hoje) {
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      }

      const mesReferencia = gerarMesReferencia(proximoVencimento);

      const valorPagamento =
        typeof alunoData.valorMensalidade === "number"
          ? alunoData.valorMensalidade
          : 0;

      const planoParaNovo =
        typeof alunoData.plano === "string" && alunoData.plano.trim()
          ? alunoData.plano.trim()
          : undefined;

      const novoPagamento = limparObjetoUndefined({
        mesReferencia,
        dataVencimento: Timestamp.fromDate(proximoVencimento),
        valor: valorPagamento,
        status: "Pendente",
        ...(planoParaNovo ? { plano: planoParaNovo } : {}),
      });

      await updateDoc(alunoDoc.ref, {
        pagamentos: [novoPagamento],
        totais: {
          pago: 0,
          pendente: valorPagamento,
          arquivado: 0,
        },
        proximoVencimento: Timestamp.fromDate(proximoVencimento),
        updatedAt: Timestamp.now(),
      });

      `   ✅ Primeiro pagamento criado: ${mesReferencia} - R$ ${valorPagamento}`;
      invalidarCacheIntegracao(tenantNormalizado);

      return {
        sucesso: true,
        mensagem: `Primeiro pagamento criado para ${mesReferencia}`,
      };
    }
  } catch (error: any) {
    console.error("❌ Erro ao verificar/gerar pagamento:", error);
    return {
      sucesso: false,
      erro: `Erro: ${error?.message}`,
    };
  }
}

// ✅ FUNÇÃO 8 - Marcar pagamento como pago na nova estrutura
export async function marcarPagamentoPagoArray(
  alunoId: string,
  mesReferencia: string,
  dataPagamento: Date = new Date(),
  tenantId: string,
): Promise<void> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    const alunoComPagamentos = await buscarAlunoComPagamentos(
      alunoId,
      tenantNormalizado,
    );

    if (!alunoComPagamentos) {
      throw new Error("Aluno não encontrado");
    }

    // ✅ Verificar status do aluno na collection Alunos
    const statusAluno = await obterStatusAluno(tenantId, alunoId);

    // ✅ Verificar se o pagamento existe e está pendente
    const pagamentoEncontrado = alunoComPagamentos.pagamentos.find(
      (p) => p.mesReferencia === mesReferencia && p.status === "Pendente",
    );

    if (!pagamentoEncontrado) {
      throw new Error(
        `Pagamento não encontrado ou não está pendente para o mês ${mesReferencia}`,
      );
    }

    // ✅ LÓGICA ESPECÍFICA PARA ALUNO INATIVO
    if (statusAluno.toLowerCase() !== "ativo") {
      const novosPagamentos: any[] = [];

      for (const pagamento of alunoComPagamentos.pagamentos) {
        const pagamentoBase: any = {
          mesReferencia: pagamento.mesReferencia || "",
          dataVencimento: Timestamp.fromDate(
            pagamento.dataVencimento instanceof Date
              ? pagamento.dataVencimento
              : new Date(pagamento.dataVencimento),
          ),
          valor: typeof pagamento.valor === "number" ? pagamento.valor : 0,
          status: pagamento.status || "Pendente",
        };

        // Se é o pagamento que queriam marcar como pago, arquivar
        if (
          pagamento.mesReferencia === mesReferencia &&
          pagamento.status === "Pendente"
        ) {
          pagamentoBase.status = "Arquivado";
          pagamentoBase.statusAnterior = "Pendente";
          pagamentoBase.arquivadoEm = Timestamp.now();
          pagamentoBase.observacoes =
            "Arquivado automaticamente - pagamento de aluno inativo";

          // Pagamento arquivado automaticamente
        } else {
          // Manter campos opcionais dos outros pagamentos
          if (pagamento.dataPagamento) {
            const dataParaConverter =
              pagamento.dataPagamento instanceof Date
                ? pagamento.dataPagamento
                : new Date(pagamento.dataPagamento);
            if (!isNaN(dataParaConverter.getTime())) {
              pagamentoBase.dataPagamento =
                Timestamp.fromDate(dataParaConverter);
            }
          }

          if (pagamento.arquivadoEm) {
            const dataParaConverter =
              pagamento.arquivadoEm instanceof Date
                ? pagamento.arquivadoEm
                : new Date(pagamento.arquivadoEm);
            if (!isNaN(dataParaConverter.getTime())) {
              pagamentoBase.arquivadoEm = Timestamp.fromDate(dataParaConverter);
            }
          }

          if (
            pagamento.statusAnterior &&
            typeof pagamento.statusAnterior === "string" &&
            pagamento.statusAnterior.trim()
          ) {
            pagamentoBase.statusAnterior = pagamento.statusAnterior.trim();
          }

          if (
            pagamento.observacoes &&
            typeof pagamento.observacoes === "string" &&
            pagamento.observacoes.trim()
          ) {
            pagamentoBase.observacoes = pagamento.observacoes.trim();
          }
        }

        novosPagamentos.push(limparObjetoUndefined(pagamentoBase));
      }

      // Recalcular totais
      const totais = calcularTotaisPagamentos(novosPagamentos);

      await updateDoc(
        getAlunoPagamentoDocRef(tenantId, alunoComPagamentos.id!),
        {
          pagamentos: novosPagamentos,
          totais: {
            pago: totais.pago,
            pendente: totais.pendente,
            arquivado: totais.arquivado,
          },
          updatedAt: Timestamp.now(),
        },
      );

      invalidarCacheIntegracao(tenantNormalizado);
      return; // Sair da função aqui
    }

    // ✅ CRIAR PAGAMENTOS COMPLETAMENTE NOVOS (sem undefined)
    const novosPagamentos: any[] = [];

    for (const pagamento of alunoComPagamentos.pagamentos) {
      // ✅ OBJETO BASE sempre limpo
      const pagamentoBase: any = {
        mesReferencia: pagamento.mesReferencia || "",
        dataVencimento: Timestamp.fromDate(
          pagamento.dataVencimento instanceof Date
            ? pagamento.dataVencimento
            : new Date(pagamento.dataVencimento),
        ),
        valor: typeof pagamento.valor === "number" ? pagamento.valor : 0,
        status: pagamento.status || "Pendente",
      };

      // ✅ Se é o pagamento que estamos marcando como pago
      if (
        pagamento.mesReferencia === mesReferencia &&
        pagamento.status === "Pendente"
      ) {
        pagamentoBase.status = "Pago";
        pagamentoBase.dataPagamento = Timestamp.fromDate(dataPagamento);

        `   ✅ Pagamento ${mesReferencia} marcado como pago`;
      } else {
        // ✅ Para outros pagamentos, adicionar campos opcionais apenas se válidos

        // Adicionar dataPagamento apenas se existir e for válida
        if (pagamento.dataPagamento) {
          const dataParaConverter =
            pagamento.dataPagamento instanceof Date
              ? pagamento.dataPagamento
              : new Date(pagamento.dataPagamento);
          if (!isNaN(dataParaConverter.getTime())) {
            pagamentoBase.dataPagamento = Timestamp.fromDate(dataParaConverter);
          }
        }

        // Adicionar arquivadoEm apenas se existir e for válida
        if (pagamento.arquivadoEm) {
          const dataParaConverter =
            pagamento.arquivadoEm instanceof Date
              ? pagamento.arquivadoEm
              : new Date(pagamento.arquivadoEm);
          if (!isNaN(dataParaConverter.getTime())) {
            pagamentoBase.arquivadoEm = Timestamp.fromDate(dataParaConverter);
          }
        }

        // Adicionar statusAnterior apenas se existir e não for vazio
        if (
          pagamento.statusAnterior &&
          typeof pagamento.statusAnterior === "string" &&
          pagamento.statusAnterior.trim()
        ) {
          pagamentoBase.statusAnterior = pagamento.statusAnterior.trim();
        }

        // Adicionar observacoes apenas se existir e não for vazio
        if (
          pagamento.observacoes &&
          typeof pagamento.observacoes === "string" &&
          pagamento.observacoes.trim()
        ) {
          pagamentoBase.observacoes = pagamento.observacoes.trim();
        }
      }

      // ✅ LIMPAR undefined antes de adicionar
      novosPagamentos.push(limparObjetoUndefined(pagamentoBase));
    }

    // ✅ RECALCULAR totais com segurança
    const totais = calcularTotaisPagamentos(novosPagamentos);

    `📊 Totais atualizados:`;
    `   • Pago: R$ ${totais.pago.toFixed(2)}`;
    `   • Pendente: R$ ${totais.pendente.toFixed(2)}`;
    `   • Arquivado: R$ ${totais.arquivado.toFixed(2)}`;

    // ✅ DADOS PARA ATUALIZAR completamente limpos (sem undefined)
    const dadosLimpos = {
      pagamentos: novosPagamentos,
      totais: {
        pago: totais.pago,
        pendente: totais.pendente,
        arquivado: totais.arquivado,
      },
      updatedAt: Timestamp.now(),
    };

    await updateDoc(
      getAlunoPagamentoDocRef(tenantId, alunoComPagamentos.id!),
      dadosLimpos,
    );

    `✅ Pagamento marcado como pago para ${alunoComPagamentos.nome}`;
    invalidarCacheIntegracao(tenantNormalizado);
  } catch (error) {
    console.error("❌ Erro ao marcar pagamento como pago:", error);
    throw error;
  }
}

// ✅ EXEMPLO DIDÁTICO - Versão transacional para aprendizado
export async function marcarPagamentoPagoArrayComTransacaoExemplo(
  alunoId: string,
  mesReferencia: string,
  dataPagamento: Date = new Date(),
  tenantId: string,
): Promise<void> {
  const tenantNormalizado = assertTenantId(tenantId);

  // 1) Status do aluno continua fora da transação
  const statusAluno = await obterStatusAluno(tenantNormalizado, alunoId);

  // 2) Descobre o doc do aluno em alunosPagamentos
  const alunoQuery = query(
    getAlunosPagamentosRef(tenantNormalizado),
    where("alunoId", "==", alunoId),
  );
  const alunoSnapshot = await getDocs(alunoQuery);

  if (alunoSnapshot.empty) {
    throw new Error("Aluno não encontrado em alunosPagamentos");
  }

  const alunoDocId = alunoSnapshot.docs[0].id;
  const alunoDocRef = getAlunoPagamentoDocRef(tenantNormalizado, alunoDocId);

  // 3) Toda alteração crítica é atômica
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(alunoDocRef);
    if (!snap.exists()) {
      throw new Error("Documento de pagamento do aluno não encontrado");
    }

    const data = snap.data();
    const pagamentosOriginais = Array.isArray(data.pagamentos)
      ? data.pagamentos
      : [];

    const toDate = (value: any): Date => {
      if (!value) return new Date();
      if (value instanceof Date) return value;
      if (typeof value?.toDate === "function") return value.toDate();
      return new Date(value);
    };

    const pagamentosNormalizados = pagamentosOriginais.map((p: any) => ({
      ...p,
      mesReferencia: p.mesReferencia || "",
      status: p.status || "Pendente",
      valor: typeof p.valor === "number" ? p.valor : 0,
      dataVencimento: toDate(p.dataVencimento),
      dataPagamento: p.dataPagamento ? toDate(p.dataPagamento) : undefined,
      arquivadoEm: p.arquivadoEm ? toDate(p.arquivadoEm) : undefined,
    }));

    const pagamentoAlvo = pagamentosNormalizados.find(
      (p: any) => p.mesReferencia === mesReferencia && p.status === "Pendente",
    );

    if (!pagamentoAlvo) {
      throw new Error(
        `Pagamento não encontrado ou não está pendente para o mês ${mesReferencia}`,
      );
    }

    const novosPagamentos = pagamentosNormalizados.map((pagamento: any) => {
      const base: any = {
        mesReferencia: pagamento.mesReferencia,
        dataVencimento: Timestamp.fromDate(toDate(pagamento.dataVencimento)),
        valor: typeof pagamento.valor === "number" ? pagamento.valor : 0,
      };

      if (
        pagamento.mesReferencia === mesReferencia &&
        pagamento.status === "Pendente"
      ) {
        if (statusAluno.toLowerCase() !== "ativo") {
          base.status = "Arquivado";
          base.statusAnterior = "Pendente";
          base.arquivadoEm = Timestamp.now();
          base.observacoes =
            "Arquivado automaticamente - pagamento de aluno inativo";
        } else {
          base.status = "Pago";
          base.dataPagamento = Timestamp.fromDate(dataPagamento);
        }
      } else {
        base.status = pagamento.status || "Pendente";
        if (pagamento.dataPagamento)
          base.dataPagamento = Timestamp.fromDate(
            toDate(pagamento.dataPagamento),
          );
        if (pagamento.arquivadoEm)
          base.arquivadoEm = Timestamp.fromDate(toDate(pagamento.arquivadoEm));
        if (pagamento.statusAnterior)
          base.statusAnterior = pagamento.statusAnterior;
        if (pagamento.observacoes) base.observacoes = pagamento.observacoes;
      }

      return limparObjetoUndefined(base);
    });

    const totais = calcularTotaisPagamentos(novosPagamentos);

    tx.update(alunoDocRef, {
      pagamentos: novosPagamentos,
      totais: {
        pago: totais.pago,
        pendente: totais.pendente,
        arquivado: totais.arquivado,
      },
      updatedAt: Timestamp.now(),
    });
  });

  invalidarCacheIntegracao(tenantNormalizado);
}

// ✅ FUNÇÃO 9 - Fechar próximo mês disponível (PARA TESTES - SEM LÓGICA DE MÊS ATUAL)
export async function fecharMesComArray(tenantId: string): Promise<{
  alunosProcessados: number;
  pagamentosArquivados: number;
  novosPagamentosGerados: number;
  alunosInativos?: number;
  nomesAlunosInativos?: string[];
  erro?: string;
  mensagem?: string;
}> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    // ✅ Buscar todos os alunos (filtraremos por status de Alunos)
    const alunosSnapshot = await getDocs(getAlunosPagamentosRef(tenantId));
    if (alunosSnapshot.empty) {
      return {
        alunosProcessados: 0,
        pagamentosArquivados: 0,
        novosPagamentosGerados: 0,
        erro: "Nenhum aluno encontrado",
      };
    }

    let mesParaFechar = "";
    const mesesDisponiveis = new Set<string>();
    alunosSnapshot.docs.forEach((alunoDoc) => {
      const alunoData = alunoDoc.data();
      (alunoData.pagamentos || []).forEach((p: any) => {
        if (p.status !== "Arquivado") mesesDisponiveis.add(p.mesReferencia);
      });
    });
    // Ordenar meses cronologicamente (ano, depois mês)
    const mesesOrdenados = Array.from(mesesDisponiveis).sort((a, b) => {
      const [ma, aa] = a.split("/");
      const [mb, ab] = b.split("/");
      return Number(aa) !== Number(ab)
        ? Number(aa) - Number(ab)
        : Number(ma) - Number(mb);
    });
    if (mesesOrdenados.length === 0) {
      return {
        alunosProcessados: 0,
        pagamentosArquivados: 0,
        novosPagamentosGerados: 0,
        mensagem: "Não há pagamentos disponíveis para fechar",
      };
    }
    mesParaFechar = mesesOrdenados[0];

    let alunosProcessados = 0,
      pagamentosArquivados = 0,
      novosPagamentosGerados = 0,
      alunosComPagamentosJaArquivados = 0,
      alunosSemPagamentosDoMes = 0,
      alunosInativos = 0;

    const nomesAlunosInativos: string[] = [];

    for (const alunoDoc of alunosSnapshot.docs) {
      try {
        const alunoData = alunoDoc.data();

        // ✅ Status SEMPRE da collection Alunos
        const statusAluno = await obterStatusAluno(
          tenantId,
          alunoData.alunoId || alunoDoc.id,
        );

        const pagamentos = alunoData.pagamentos || [];

        // ✅ Se aluno INATIVO: arquivar TODOS os pagamentos não-arquivados
        if (statusAluno.toLowerCase() !== "ativo") {
          alunosInativos++;
          nomesAlunosInativos.push(alunoData.nome);

          // Arquivar TODOS os pagamentos não-arquivados (Pendente, Atrasado, Pago)
          let pagamentosArquivadosNeste = 0;
          const pagamentosAtualizados = pagamentos.map((pagamento: any) => {
            if (pagamento.status !== "Arquivado") {
              pagamentosArquivados++;
              pagamentosArquivadosNeste++;
              return limparObjetoUndefined({
                ...pagamento,
                status: "Arquivado",
                statusAnterior: pagamento.status,
                arquivadoEm: Timestamp.now(),
                observacoes: "Arquivado automaticamente - aluno inativo",
              });
            }
            return limparObjetoUndefined(pagamento);
          });

          // Pagamentos arquivados com sucesso

          // Recalcular totais
          const totais = calcularTotaisPagamentos(pagamentosAtualizados);

          // Atualizar documento

          await updateDoc(alunoDoc.ref, {
            pagamentos: pagamentosAtualizados,
            totais: {
              pago: totais.pago,
              pendente: totais.pendente,
              arquivado: totais.arquivado,
            },
            updatedAt: Timestamp.now(),
          });

          alunosProcessados++;
          continue;
        }

        // ✅ Aluno ATIVO: NÃO restaurar pagamentos arquivados por inatividade
        // ✅ Se aluno está ativo e NÃO tem nenhum pagamento pendente, gerar um
        const temPendente = pagamentos.some(
          (p: any) => p.status === "Pendente",
        );

        if (!temPendente) {
          let novoPagamentoCriado = false;

          // Encontrar o último pagamento para calcular próximo vencimento
          if (pagamentos.length > 0) {
            const ultimoPagamento = pagamentos[pagamentos.length - 1];
            const ultimoVencimento = ultimoPagamento.dataVencimento?.toDate
              ? ultimoPagamento.dataVencimento.toDate()
              : new Date(ultimoPagamento.dataVencimento);

            const proximoVencimento = new Date(
              ultimoVencimento.getFullYear(),
              ultimoVencimento.getMonth() + 1,
              10,
            );

            const mesReferencia = gerarMesReferencia(proximoVencimento);

            // Verificar se já existe pagamento para este mês
            const jaExiste = pagamentos.some(
              (p: any) => p.mesReferencia === mesReferencia,
            );

            if (!jaExiste) {
              const valorPagamento =
                typeof ultimoPagamento.valor === "number"
                  ? ultimoPagamento.valor
                  : typeof alunoData.valorMensalidade === "number"
                    ? alunoData.valorMensalidade
                    : 0;

              const planoParaNovo =
                typeof alunoData.plano === "string" && alunoData.plano.trim()
                  ? alunoData.plano.trim()
                  : typeof ultimoPagamento?.plano === "string"
                    ? ultimoPagamento.plano
                    : undefined;

              const novoPagamento = limparObjetoUndefined({
                mesReferencia,
                dataVencimento: Timestamp.fromDate(proximoVencimento),
                valor: valorPagamento,
                status: "Pendente",
                ...(planoParaNovo ? { plano: planoParaNovo } : {}),
              });

              pagamentos.push(novoPagamento);
              novosPagamentosGerados++;
              novoPagamentoCriado = true;

              // Recalcular totais com novo pagamento
              const totaisNovoPagamento = calcularTotaisPagamentos(pagamentos);

              await updateDoc(alunoDoc.ref, {
                pagamentos: pagamentos.map((p: any) =>
                  limparObjetoUndefined(p),
                ),
                totais: {
                  pago: totaisNovoPagamento.pago,
                  pendente: totaisNovoPagamento.pendente,
                  arquivado: totaisNovoPagamento.arquivado,
                },
                proximoVencimento: Timestamp.fromDate(proximoVencimento),
                updatedAt: Timestamp.now(),
              });
            }
          } else {
            // Se não tem nenhum pagamento, criar o primeiro

            const hoje = new Date();
            const proximoVencimento = new Date(
              hoje.getFullYear(),
              hoje.getMonth(),
              10,
            );
            if (proximoVencimento < hoje) {
              proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
            }

            const mesReferencia = gerarMesReferencia(proximoVencimento);

            const valorPagamento =
              typeof alunoData.valorMensalidade === "number"
                ? alunoData.valorMensalidade
                : 0;

            const planoParaNovo =
              typeof alunoData.plano === "string" && alunoData.plano.trim()
                ? alunoData.plano.trim()
                : undefined;

            const novoPagamento = limparObjetoUndefined({
              mesReferencia,
              dataVencimento: Timestamp.fromDate(proximoVencimento),
              valor: valorPagamento,
              status: "Pendente",
              ...(planoParaNovo ? { plano: planoParaNovo } : {}),
            });

            await updateDoc(alunoDoc.ref, {
              pagamentos: [novoPagamento],
              totais: {
                pago: 0,
                pendente: valorPagamento,
                arquivado: 0,
              },
              proximoVencimento: Timestamp.fromDate(proximoVencimento),
              updatedAt: Timestamp.now(),
            });

            novosPagamentosGerados++;
            novoPagamentoCriado = true;
          }

          // Se criou novo pagamento, pular processamento normal do mês
          if (novoPagamentoCriado) {
            alunosProcessados++;
            continue;
          }
        }

        // ✅ Processar normalmente o fechamento do mês
        const pagamentosDoMes = pagamentos.filter(
          (p: any) => p.mesReferencia === mesParaFechar,
        );
        if (pagamentosDoMes.length === 0) {
          alunosSemPagamentosDoMes++;
          continue;
        }
        const todosArquivados = pagamentosDoMes.every(
          (p: any) => p.status === "Arquivado",
        );
        if (todosArquivados) {
          alunosComPagamentosJaArquivados++;
          continue;
        }

        let pagamentosAtualizados = pagamentos.map((pagamento: any) => {
          if (
            pagamento.mesReferencia === mesParaFechar &&
            pagamento.status !== "Arquivado"
          ) {
            pagamentosArquivados++;
            return limparObjetoUndefined({
              ...pagamento,
              status: "Arquivado",
              statusAnterior: pagamento.status,
              arquivadoEm: Timestamp.now(),
            });
          }

          return limparObjetoUndefined(pagamento);
        });

        // Encontrar o maior mês existente no array de pagamentos
        const maiorMes = pagamentosAtualizados.reduce((max: number, p: any) => {
          const [mes, ano] = p.mesReferencia.split("/").map(Number);
          const valor = ano * 100 + mes;
          return valor > max ? valor : max;
        }, 0);

        // Verificar se todos os pagamentos do maior mês estão arquivados
        const [maiorMesNum, maiorAnoNum] = [
          maiorMes % 100,
          Math.floor(maiorMes / 100),
        ];
        const pagamentosMaiorMes = pagamentosAtualizados.filter((p: any) => {
          const [mes, ano] = p.mesReferencia.split("/").map(Number);
          return mes === maiorMesNum && ano === maiorAnoNum;
        });
        const todosArquivadosMaiorMes =
          pagamentosMaiorMes.length > 0 &&
          pagamentosMaiorMes.every((p: any) => p.status === "Arquivado");

        // Calcular o próximo vencimento a partir do maior mês
        const proximoVencimento = new Date(maiorAnoNum, maiorMesNum - 1, 10);
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
        const proximoMes = proximoVencimento.toLocaleDateString("pt-BR", {
          month: "2-digit",
          year: "numeric",
        });

        // Só gera novo pagamento se todos os pagamentos do maior mês estiverem arquivados e não existir pagamento para o próximo mês
        const existePagamentoProximoMes = pagamentosAtualizados.some(
          (p: any) => p.mesReferencia === proximoMes,
        );

        // ✅ DUPLA VERIFICAÇÃO: Só gera se o aluno CONTINUA ativo
        if (
          todosArquivadosMaiorMes &&
          !existePagamentoProximoMes &&
          statusAluno.toLowerCase() === "ativo"
        ) {
          // ✅ Usa o valor do último pagamento (mais seguro que valorMensalidade)
          const ultimoPagamento =
            pagamentosAtualizados[pagamentosAtualizados.length - 1];
          const valorUltimoPagamento =
            typeof ultimoPagamento?.valor === "number"
              ? ultimoPagamento.valor
              : typeof alunoData.valorMensalidade === "number"
                ? alunoData.valorMensalidade
                : 0;

          // ✅ Plano atual do alunosPagamentos, com fallback opcional ao último pagamento
          const planoParaNovo =
            typeof alunoData.plano === "string" && alunoData.plano.trim()
              ? alunoData.plano.trim()
              : typeof ultimoPagamento?.plano === "string"
                ? ultimoPagamento.plano
                : undefined;

          const novoPagamento = limparObjetoUndefined({
            mesReferencia: proximoMes,
            dataVencimento: Timestamp.fromDate(proximoVencimento),
            valor: valorUltimoPagamento,
            status: "Pendente",
            ...(planoParaNovo ? { plano: planoParaNovo } : {}),
          });
          pagamentosAtualizados.push(novoPagamento);
          novosPagamentosGerados++;
        } else if (todosArquivadosMaiorMes && !existePagamentoProximoMes) {
          alunosInativos++;
          if (!nomesAlunosInativos.includes(alunoData.nome)) {
            nomesAlunosInativos.push(alunoData.nome);
          }
        }

        const totaisPagamentosAtualizados = calcularTotaisPagamentos(
          pagamentosAtualizados,
        );

        const pagamentosPendentes = pagamentosAtualizados.filter(
          (p: any) => p.status === "Pendente",
        );
        const proximoVencimentoField =
          pagamentosPendentes.length > 0
            ? pagamentosPendentes.sort((a: any, b: any) => {
                const dateA = a.dataVencimento?.toDate
                  ? a.dataVencimento.toDate()
                  : new Date(a.dataVencimento);
                const dateB = b.dataVencimento?.toDate
                  ? b.dataVencimento.toDate()
                  : new Date(b.dataVencimento);
                return dateA.getTime() - dateB.getTime();
              })[0].dataVencimento
            : null;

        const dadosParaAtualizar = limparObjetoUndefined({
          pagamentos: pagamentosAtualizados,
          totais: {
            pago: totaisPagamentosAtualizados.pago,
            pendente: totaisPagamentosAtualizados.pendente,
            arquivado: totaisPagamentosAtualizados.arquivado,
          },
          proximoVencimento: proximoVencimentoField,
          updatedAt: Timestamp.now(),
        });
        await updateDoc(alunoDoc.ref, dadosParaAtualizar);
        alunosProcessados++;
      } catch (error) {
        console.error(
          `[fecharMesComArray] Erro ao processar aluno ${alunoDoc.id}:`,
          error,
        );
      }
    }
    let mensagem = "";
    if (pagamentosArquivados === 0 && alunosComPagamentosJaArquivados > 0) {
      mensagem = `Mês ${mesParaFechar} já foi fechado anteriormente. ${alunosComPagamentosJaArquivados} alunos já tinham pagamentos arquivados.`;
    } else if (pagamentosArquivados === 0 && alunosSemPagamentosDoMes > 0) {
      mensagem = `Nenhum pagamento encontrado para o mês ${mesParaFechar}. ${alunosSemPagamentosDoMes} alunos sem pagamentos do mês.`;
    }

    if (alunosInativos > 0) {
      const msgInativos =
        alunosInativos === 1
          ? `${alunosInativos} aluno inativo foi ignorado`
          : `${alunosInativos} alunos inativos foram ignorados`;

      mensagem = mensagem
        ? `${mensagem} ${msgInativos}.`
        : `${msgInativos} durante o fechamento do mês.`;
    }

    invalidarCacheIntegracao(tenantNormalizado);
    return {
      alunosProcessados,
      pagamentosArquivados,
      novosPagamentosGerados,
      alunosInativos,
      nomesAlunosInativos,
      mensagem,
    };
  } catch (error: any) {
    console.error("[fecharMesComArray] Erro ao fechar mês:", error);
    return {
      alunosProcessados: 0,
      pagamentosArquivados: 0,
      novosPagamentosGerados: 0,
      erro: `Erro: ${error?.message}`,
    };
  }
}

// ✅ FUNÇÃO 10 - Migração da estrutura antiga para nova (corrigida)
export async function migrarPagamentosParaNovaEstrutura(
  tenantId: string,
): Promise<{
  alunosMigrados: number;
  pagamentosMigrados: number;
  erro?: string;
}> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    // 1. Buscar todos os pagamentos da estrutura ANTIGA
    const pagamentosSnapshot = await getDocs(
      getPagamentosRef(tenantNormalizado),
    );
    const pagamentosPorAluno: { [alunoId: string]: any[] } = {};

    // 2. Agrupar pagamentos por aluno
    pagamentosSnapshot.forEach((doc) => {
      const data = doc.data();
      const alunoId = data.alunoId;

      if (!pagamentosPorAluno[alunoId]) {
        pagamentosPorAluno[alunoId] = [];
      }

      // ✅ Tratamento seguro das datas
      // ...existing code...
      const dataVencimento = (() => {
        if (data.dataVencimento?.toDate) {
          const d = data.dataVencimento.toDate();
          return new Date(d.getFullYear(), d.getMonth(), 10); // Sempre dia 10
        }
        if (data.dataVencimento) {
          const d = new Date(data.dataVencimento);
          return new Date(d.getFullYear(), d.getMonth(), 10); // Sempre dia 10
        }
        return new Date(Date.now());
      })();
      // ...existing code...
      const dataPagamento = data.dataPagamento?.toDate
        ? data.dataPagamento.toDate()
        : data.dataPagamento
          ? new Date(data.dataPagamento)
          : undefined;

      const arquivadoEm = data.arquivadoEm?.toDate
        ? data.arquivadoEm.toDate()
        : data.arquivadoEm
          ? new Date(data.arquivadoEm)
          : undefined;

      pagamentosPorAluno[alunoId].push({
        mesReferencia: data.mesReferencia || "",
        dataVencimento,
        valor: typeof data.valor === "number" ? data.valor : 0,
        status: data.status || "Pendente",
        dataPagamento,
        arquivadoEm,
        statusAnterior: data.statusAnterior || undefined,
        observacoes: data.observacoes || undefined,
      });
    });

    let alunosMigrados = 0;
    let pagamentosMigrados = 0;

    // 3. Para cada aluno, criar documento na nova estrutura
    for (const [alunoId, pagamentos] of Object.entries(pagamentosPorAluno)) {
      try {
        // Verificar se já existe na nova estrutura
        const existeQuery = query(
          getAlunosPagamentosRef(tenantNormalizado),
          where("alunoId", "==", alunoId),
        );
        const existeSnapshot = await getDocs(existeQuery);

        if (!existeSnapshot.empty) {
          `⏸️ Aluno ${alunoId} já migrado`;
          continue;
        }

        // Buscar dados do aluno
        const alunoDoc = await getDoc(
          getAlunoDocRef(tenantNormalizado, alunoId),
        );
        if (!alunoDoc.exists()) {
          `⚠️ Aluno ${alunoId} não encontrado`;
          continue;
        }

        const alunoData = alunoDoc.data();

        // Calcular totais
        const totalPago = pagamentos
          .filter((p) => p.status === "Pago")
          .reduce(
            (sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0),
            0,
          );
        const totalPendente = pagamentos
          .filter((p) => p.status === "Pendente")
          .reduce(
            (sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0),
            0,
          );
        const totalArquivado = pagamentos
          .filter((p) => p.status === "Arquivado")
          .reduce(
            (sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0),
            0,
          );

        // Próximo vencimento
        const pagamentosPendentes = pagamentos.filter(
          (p) => p.status === "Pendente",
        );
        const proximoVencimento =
          pagamentosPendentes.length > 0
            ? pagamentosPendentes.sort(
                (a, b) =>
                  a.dataVencimento.getTime() - b.dataVencimento.getTime(),
              )[0].dataVencimento
            : null;

        // ✅ Preparar pagamentos para salvar (SEM UNDEFINED)
        const pagamentosParaSalvar = pagamentos.map((p) => {
          const pagamentoBase: any = {
            mesReferencia: p.mesReferencia,
            dataVencimento: Timestamp.fromDate(p.dataVencimento),
            valor: p.valor,
            status: p.status,
          };

          // Adicionar campos opcionais apenas se válidos
          if (p.dataPagamento && !isNaN(p.dataPagamento.getTime())) {
            pagamentoBase.dataPagamento = Timestamp.fromDate(p.dataPagamento);
          }

          if (p.arquivadoEm && !isNaN(p.arquivadoEm.getTime())) {
            pagamentoBase.arquivadoEm = Timestamp.fromDate(p.arquivadoEm);
          }

          if (
            p.statusAnterior &&
            typeof p.statusAnterior === "string" &&
            p.statusAnterior.trim()
          ) {
            pagamentoBase.statusAnterior = p.statusAnterior.trim();
          }

          if (
            p.observacoes &&
            typeof p.observacoes === "string" &&
            p.observacoes.trim()
          ) {
            pagamentoBase.observacoes = p.observacoes.trim();
          }

          // ✅ RETORNAR SEM UNDEFINED
          return limparObjetoUndefined(pagamentoBase);
        });

        // ✅ Criar na nova estrutura (SEM UNDEFINED)
        const dadosAluno: any = {
          alunoId,
          nome: alunoData.nome || "Nome não informado",
          plano: alunoData.plano || "Mensal",
          valorMensalidade:
            typeof alunoData.valorMensalidade === "number"
              ? alunoData.valorMensalidade
              : 150,
          status: alunoData.status || "ativo",
          dataMatricula: alunoData.dataMatricula || Timestamp.now(),
          pagamentos: pagamentosParaSalvar,
          totais: {
            pago: totalPago,
            pendente: totalPendente,
            arquivado: totalArquivado,
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // Adicionar proximoVencimento apenas se válido
        if (proximoVencimento) {
          dadosAluno.proximoVencimento = Timestamp.fromDate(proximoVencimento);
        }

        await addDoc(getAlunosPagamentosRef(tenantNormalizado), dadosAluno);

        alunosMigrados++;
        pagamentosMigrados += pagamentos.length;
        `✅ ${alunoData.nome} migrado com ${pagamentos.length} pagamentos`;
      } catch (error) {
        console.error(`❌ Erro ao migrar aluno ${alunoId}:`, error);
      }
    }

    `🎉 Migração concluída:`;
    `   • ${alunosMigrados} alunos migrados`;
    `   • ${pagamentosMigrados} pagamentos migrados`;

    return { alunosMigrados, pagamentosMigrados };
  } catch (error: any) {
    console.error("❌ Erro na migração:", error);
    return {
      alunosMigrados: 0,
      pagamentosMigrados: 0,
      erro: `Erro: ${error?.message || "Erro desconhecido"}`,
    };
  }
}

// ...existing code...

// ✅ FUNÇÃO - Atualizar dados editáveis do aluno em alunosPagamentos
export async function atualizarDadosAlunoPagamento(
  alunoId: string,
  dadosEditaveis: DadosEditaveisAluno,
  tenantId: string,
): Promise<{ sucesso: boolean; mensagem?: string; erro?: string }> {
  try {
    const tenantNormalizado = assertTenantId(tenantId);
    // 1️⃣ Validar dados
    if (!dadosEditaveis.plano || dadosEditaveis.plano.trim() === "") {
      return {
        sucesso: false,
        erro: "Plano não pode estar vazio",
      };
    }

    if (
      typeof dadosEditaveis.valorMensalidade !== "number" ||
      dadosEditaveis.valorMensalidade <= 0
    ) {
      return {
        sucesso: false,
        erro: "Valor da mensalidade deve ser maior que 0",
      };
    }

    // 2️⃣ Buscar documento em alunosPagamentos pela query
    const alunoQuery = query(
      getAlunosPagamentosRef(tenantId),
      where("alunoId", "==", alunoId),
    );
    const alunoSnapshot = await getDocs(alunoQuery);

    if (alunoSnapshot.empty) {
      return {
        sucesso: false,
        erro: "Aluno não encontrado em alunosPagamentos",
      };
    }

    // Pegar o document ID correto
    const alunoDocIds = alunoSnapshot.docs.map((d) => d.id);

    // 3️⃣ Converter dataFinalMatricula se necessário
    let dataFinalTimestamp: Timestamp | undefined = undefined;
    if (dadosEditaveis.dataFinalMatricula) {
      const date =
        dadosEditaveis.dataFinalMatricula instanceof Date
          ? dadosEditaveis.dataFinalMatricula
          : new Date(dadosEditaveis.dataFinalMatricula);

      if (isNaN(date.getTime())) {
        return {
          sucesso: false,
          erro: "Data final inválida",
        };
      }

      dataFinalTimestamp = Timestamp.fromDate(date);
    }

    // 4️⃣ Preparar objeto para atualizar
    const dadosParaAtualizar: any = {
      plano: dadosEditaveis.plano.trim(),
      valorMensalidade:
        typeof dadosEditaveis.valorMensalidade === "number"
          ? dadosEditaveis.valorMensalidade
          : parseFloat(String(dadosEditaveis.valorMensalidade)),
      telefone: dadosEditaveis.telefone || "",
      updatedAt: Timestamp.now(),
    };

    // Adicionar dataFinalMatricula só se for válida
    if (dataFinalTimestamp) {
      dadosParaAtualizar.dataFinalMatricula = dataFinalTimestamp;
    }

    // 5️⃣ Atualizar documentos: também alinhar "valor" dos pagamentos ao valorMensalidade
    await Promise.all(
      alunoSnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const pagamentosOriginais = Array.isArray(data.pagamentos)
          ? data.pagamentos
          : [];

        const novoValor = dadosParaAtualizar.valorMensalidade;

        // Atualiza apenas o campo "valor" de cada pagamento, mantendo status e demais campos
        const pagamentosAtualizados = pagamentosOriginais.map((p: any) =>
          limparObjetoUndefined({
            ...p,
            valor: novoValor,
          }),
        );

        // Recalcula totais com os novos valores
        const totaisAtualizados = calcularTotaisPagamentos(
          pagamentosAtualizados,
        );

        const payload = {
          ...dadosParaAtualizar,
          pagamentos: pagamentosAtualizados,
          totais: {
            pago: totaisAtualizados.pago,
            pendente: totaisAtualizados.pendente,
            arquivado: totaisAtualizados.arquivado,
          },
        };

        await updateDoc(getAlunoPagamentoDocRef(tenantId, docSnap.id), payload);
      }),
    );

    `✅ Dados atualizados para ${alunoId} em ${alunoDocIds.length} documento(s)`;

    // ✅ Sincronizar de volta para collection Alunos
    try {
      const alunoRef = getAlunoDocRef(tenantId, alunoId);
      const alunoDoc = await getDoc(alunoRef);

      if (alunoDoc.exists()) {
        const dadosParaSincronizar: any = {
          plano: dadosEditaveis.plano.trim(),
          valorMensalidade: dadosEditaveis.valorMensalidade,
          updatedAt: Timestamp.now(),
        };

        if (dadosEditaveis.telefone) {
          dadosParaSincronizar.telefone = dadosEditaveis.telefone;
        }

        if (dataFinalTimestamp) {
          dadosParaSincronizar.dataFinalMatricula = dataFinalTimestamp;
        }

        await updateDoc(alunoRef, dadosParaSincronizar);
      }
    } catch (syncError) {
      console.warn(
        "⚠️ Erro ao sincronizar para Alunos (não crítico):",
        syncError,
      );
    }

    invalidarCacheIntegracao(tenantNormalizado);

    return {
      sucesso: true,
      mensagem: "Dados do aluno atualizados com sucesso",
    };
  } catch (error: any) {
    console.error("[atualizarDadosAlunoPagamento] Erro:", error);
    return {
      sucesso: false,
      erro: `Erro ao atualizar: ${error?.message}`,
    };
  }
}

// ✅ EXPORTAR TIPOS
export type { AlunoData, PagamentoExistente, PagamentoItem };
