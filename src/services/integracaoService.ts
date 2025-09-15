import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";

// ✅ INTERFACES
interface AlunoData {
  id: string;
  nome: string;
  plano: string;
  valorMensalidade: number;
  status: string;
  dataMatricula?: string;
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
}

interface AlunoComPagamentos {
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
}

interface CacheIntegracao {
  todosAlunos: AlunoComPagamentos[] | null;
  alunoIndividual: Map<string, AlunoComPagamentos>;
  timestampTodos: number;
  timestampIndividual: Map<string, number>;
}

const cacheIntegracao: CacheIntegracao = {
  todosAlunos: null,
  alunoIndividual: new Map(),
  timestampTodos: 0,
  timestampIndividual: new Map(),
};

const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

//  FUNÇÃO PARA INVALIDAR CACHE
function invalidarCacheIntegracao(): void {
  ("🧹 Invalidando cache de integração...");
  cacheIntegracao.todosAlunos = null;
  cacheIntegracao.timestampTodos = 0;
  cacheIntegracao.alunoIndividual.clear();
  cacheIntegracao.timestampIndividual.clear();
}

//  FUNÇÃO PARA VERIFICAR SE CACHE ESTÁ VÁLIDO
function cacheValidoTodos(): boolean {
  const now = Date.now();
  return (
    cacheIntegracao.todosAlunos !== null &&
    now - cacheIntegracao.timestampTodos < CACHE_TTL
  );
}

function cacheValidoIndividual(alunoId: string): boolean {
  const now = Date.now();
  const timestamp = cacheIntegracao.timestampIndividual.get(alunoId) || 0;
  return (
    cacheIntegracao.alunoIndividual.has(alunoId) && now - timestamp < CACHE_TTL
  );
}

// Criar aluno na nova estrutura com primeiro pagamento
export async function criarAlunoComPagamentosArray(
  alunoData: AlunoData
): Promise<void> {
  try {
    if (alunoData.status !== "Ativo") {
      `⏸️ Aluno ${alunoData.nome} não está ativo`;
      return;
    }

    // Verificar se já existe na nova estrutura
    const existeQuery = query(
      collection(db, "alunosPagamentos"),
      where("alunoId", "==", alunoData.id)
    );
    const existeSnapshot = await getDocs(existeQuery);

    if (!existeSnapshot.empty) {
      `⏸️ ${alunoData.nome} já existe na nova estrutura`;
      return;
    }

    // Calcular primeiro vencimento
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    let dataVencimento = new Date(hoje);

    if (diaHoje <= 5) {
      dataVencimento.setDate(5);
    } else {
      dataVencimento.setDate(20);
    }

    const mesReferencia = dataVencimento.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });

    // Criar documento na nova estrutura
    await addDoc(collection(db, "alunosPagamentos"), {
      alunoId: alunoData.id,
      nome: alunoData.nome,
      plano: alunoData.plano,
      valorMensalidade: alunoData.valorMensalidade,
      status: alunoData.status,
      dataMatricula: Timestamp.fromDate(
        alunoData.dataMatricula ? new Date(alunoData.dataMatricula) : hoje
      ),
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
    invalidarCacheIntegracao();
  } catch (error) {
    console.error("❌ Erro ao criar aluno na nova estrutura:", error);
    throw error;
  }
}

// ✅ FUNÇÃO 5 - Buscar aluno específico com pagamentos

export async function buscarAlunoComPagamentos(
  alunoId: string
): Promise<AlunoComPagamentos | null> {
  try {
    // ✅ VERIFICAR CACHE INDIVIDUAL PRIMEIRO
    if (cacheValidoIndividual(alunoId)) {
      
      return cacheIntegracao.alunoIndividual.get(alunoId) || null;
    }

   
    const alunoQuery = query(
      collection(db, "alunosPagamentos"),
      where("alunoId", "==", alunoId)
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
export async function listarAlunosComPagamentos(): Promise<
  AlunoComPagamentos[]
> {
  try {
    // VERIFICAR CACHE PRIMEIRO
    if (cacheValidoTodos()) {
      
      return cacheIntegracao.todosAlunos!;
    }

   
    const snapshot = await getDocs(collection(db, "alunosPagamentos"));
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

// ✅ FUNÇÃO ULTRA-DEFENSIVA - Adicionar próximo pagamento ao array de um aluno
export async function adicionarProximoPagamentoArray(
  alunoId: string
): Promise<void> {
  try {
    const alunoComPagamentos = await buscarAlunoComPagamentos(alunoId);

    if (!alunoComPagamentos) {
      throw new Error("Aluno não encontrado na nova estrutura");
    }

    // Verificar se aluno está ativo
    if (alunoComPagamentos.status !== "Ativo") {
      `⏸️ Aluno ${alunoComPagamentos.nome} não está ativo`;
      return;
    }

    // Verificar se já tem pagamento pendente
    const temPendente = alunoComPagamentos.pagamentos.some(
      (p) => p.status === "Pendente"
    );
    if (temPendente) {
      `⏸️ ${alunoComPagamentos.nome} já possui pagamento pendente`;
      return;
    }

    // Calcular próximo vencimento (último vencimento + 1 mês)
    const ultimoPagamento =
      alunoComPagamentos.pagamentos[alunoComPagamentos.pagamentos.length - 1];
    const proximoVencimento = new Date(ultimoPagamento.dataVencimento);
    proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);

    const mesReferencia = proximoVencimento.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });

    `📅 Gerando próximo pagamento:`;
    `   • Aluno: ${alunoComPagamentos.nome}`;
    `   • Próximo vencimento: ${proximoVencimento.toLocaleDateString("pt-BR")}`;

    // ✅ CRIAR ARRAY COMPLETAMENTE LIMPO
    const novosPagamentos: any[] = [];

    // ✅ PROCESSAR pagamentos existentes
    for (const pagamento of alunoComPagamentos.pagamentos) {
      const pagamentoBase: any = {
        mesReferencia: pagamento.mesReferencia || "",
        dataVencimento: Timestamp.fromDate(
          pagamento.dataVencimento
            ? new Date(pagamento.dataVencimento)
            : new Date()
        ),
        valor: typeof pagamento.valor === "number" ? pagamento.valor : 0,
        status: pagamento.status || "Pendente",
      };

      // Adicionar campos opcionais apenas se válidos
      if (pagamento.dataPagamento && pagamento.dataPagamento instanceof Date) {
        pagamentoBase.dataPagamento = Timestamp.fromDate(
          pagamento.dataPagamento
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

    // ✅ ADICIONAR novo pagamento (sem campos undefined)
    const novoPagamento = {
      mesReferencia,
      dataVencimento: Timestamp.fromDate(proximoVencimento),
      valor:
        typeof alunoComPagamentos.valorMensalidade === "number"
          ? alunoComPagamentos.valorMensalidade
          : 0,
      status: "Pendente",
    };

    novosPagamentos.push(novoPagamento);

    const novoTotalPendente =
      (alunoComPagamentos.totais?.pendente || 0) +
      (alunoComPagamentos.valorMensalidade || 0);

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
      doc(db, "alunosPagamentos", alunoComPagamentos.id!),
      dadosLimpos
    );

    `✅ Próximo pagamento adicionado para ${alunoComPagamentos.nome}`;
    invalidarCacheIntegracao();
    ("invalidar cache funcionando");
  } catch (error) {
    console.error("❌ Erro ao adicionar próximo pagamento:", error);
    throw error;
  }
}

// ✅ FUNÇÃO 8 - Marcar pagamento como pago na nova estrutura
// ...existing code...

// ✅ FUNÇÃO ULTRA-DEFENSIVA - Marcar pagamento como pago na nova estrutura
export async function marcarPagamentoPagoArray(
  alunoId: string,
  mesReferencia: string,
  dataPagamento: Date = new Date()
): Promise<void> {
  try {
    const alunoComPagamentos = await buscarAlunoComPagamentos(alunoId);

    if (!alunoComPagamentos) {
      throw new Error("Aluno não encontrado");
    }

    `💰 Marcando pagamento como pago:`;
    `   • Aluno: ${alunoComPagamentos.nome}`;
    `   • Mês: ${mesReferencia}`;

    // ✅ Verificar se o pagamento existe e está pendente
    const pagamentoEncontrado = alunoComPagamentos.pagamentos.find(
      (p) => p.mesReferencia === mesReferencia && p.status === "Pendente"
    );

    if (!pagamentoEncontrado) {
      throw new Error(
        `Pagamento não encontrado ou não está pendente para o mês ${mesReferencia}`
      );
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
            : new Date(pagamento.dataVencimento)
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
    const totalPago = novosPagamentos
      .filter((p) => p.status === "Pago")
      .reduce((sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0), 0);

    const totalPendente = novosPagamentos
      .filter((p) => p.status === "Pendente")
      .reduce((sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0), 0);

    const totalArquivado = novosPagamentos
      .filter((p) => p.status === "Arquivado")
      .reduce((sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0), 0);

    `📊 Totais atualizados:`;
    `   • Pago: R$ ${totalPago.toFixed(2)}`;
    `   • Pendente: R$ ${totalPendente.toFixed(2)}`;
    `   • Arquivado: R$ ${totalArquivado.toFixed(2)}`;

    // ✅ DADOS PARA ATUALIZAR completamente limpos (sem undefined)
    const dadosLimpos = {
      pagamentos: novosPagamentos,
      totais: {
        pago: totalPago,
        pendente: totalPendente,
        arquivado: totalArquivado,
      },
      updatedAt: Timestamp.now(),
    };

    await updateDoc(
      doc(db, "alunosPagamentos", alunoComPagamentos.id!),
      dadosLimpos
    );

    `✅ Pagamento marcado como pago para ${alunoComPagamentos.nome}`;
    invalidarCacheIntegracao();
  } catch (error) {
    console.error("❌ Erro ao marcar pagamento como pago:", error);
    throw error;
  }
}

// ✅ FUNÇÃO 9 - Fechar próximo mês disponível (PARA TESTES - SEM LÓGICA DE MÊS ATUAL)
export async function fecharMesComArray(): Promise<{
  alunosProcessados: number;
  pagamentosArquivados: number;
  novosPagamentosGerados: number;
  erro?: string;
  mensagem?: string;
}> {
  try {
    console.log(
      "[fecharMesComArray] Iniciando fechamento do próximo mês disponível..."
    );
    const alunosSnapshot = await getDocs(
      query(collection(db, "alunosPagamentos"), where("status", "==", "Ativo"))
    );
    if (alunosSnapshot.empty) {
      return {
        alunosProcessados: 0,
        pagamentosArquivados: 0,
        novosPagamentosGerados: 0,
        erro: "Nenhum aluno ativo encontrado",
      };
    }
    console.log(
      `[fecharMesComArray] Alunos ativos encontrados: ${alunosSnapshot.size}`
    );
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
    console.log(
      `[fecharMesComArray] Meses disponíveis para fechar: ${mesesOrdenados.join(
        ", "
      )}`
    );
    console.log(
      `[fecharMesComArray] Mês selecionado para fechar: ${mesParaFechar}`
    );
    let alunosProcessados = 0,
      pagamentosArquivados = 0,
      novosPagamentosGerados = 0,
      alunosComPagamentosJaArquivados = 0,
      alunosSemPagamentosDoMes = 0;

    for (const alunoDoc of alunosSnapshot.docs) {
      try {
        const alunoData = alunoDoc.data();
        const pagamentos = alunoData.pagamentos || [];
        const pagamentosDoMes = pagamentos.filter(
          (p: any) => p.mesReferencia === mesParaFechar
        );
        if (pagamentosDoMes.length === 0) {
          alunosSemPagamentosDoMes++;
          continue;
        }
        const todosArquivados = pagamentosDoMes.every(
          (p: any) => p.status === "Arquivado"
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
          console.log(
            `[fecharMesComArray] Processando aluno: ${alunoData.nome} (${alunoDoc.id})`
          );
          console.log(
            `[fecharMesComArray] Pagamentos do mês ${mesParaFechar}:`,
            pagamentosDoMes
          );
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
        const proximoVencimento = new Date(maiorAnoNum, maiorMesNum - 1, 20);
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
        const proximoMes = proximoVencimento.toLocaleDateString("pt-BR", {
          month: "2-digit",
          year: "numeric",
        });

        // Só gera novo pagamento se todos os pagamentos do maior mês estiverem arquivados e não existir pagamento para o próximo mês
        const existePagamentoProximoMes = pagamentosAtualizados.some(
          (p: any) => p.mesReferencia === proximoMes
        );
        if (todosArquivadosMaiorMes && !existePagamentoProximoMes) {
          console.log(
            `[fecharMesComArray] Gerando novo pagamento para o próximo mês (${proximoMes}) do aluno ${alunoData.nome} (${alunoDoc.id})`
          );
          const novoPagamento = limparObjetoUndefined({
            mesReferencia: proximoMes,
            dataVencimento: Timestamp.fromDate(proximoVencimento),
            valor: alunoData.valorMensalidade,
            status: "Pendente",
          });
          pagamentosAtualizados.push(novoPagamento);
          novosPagamentosGerados++;
        }

        const totalPago = pagamentosAtualizados
          .filter((p: any) => p.status === "Pago")
          .reduce((sum: number, p: any) => sum + (p.valor || 0), 0);
        const totalPendente = pagamentosAtualizados
          .filter((p: any) => p.status === "Pendente")
          .reduce((sum: number, p: any) => sum + (p.valor || 0), 0);
        const totalArquivado = pagamentosAtualizados
          .filter((p: any) => p.status === "Arquivado")
          .reduce((sum: number, p: any) => sum + (p.valor || 0), 0);

        const pagamentosPendentes = pagamentosAtualizados.filter(
          (p: any) => p.status === "Pendente"
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
            pago: totalPago,
            pendente: totalPendente,
            arquivado: totalArquivado,
          },
          proximoVencimento: proximoVencimentoField,
          updatedAt: Timestamp.now(),
        });
        await updateDoc(alunoDoc.ref, dadosParaAtualizar);
        alunosProcessados++;
      } catch (error) {
        console.error(
          `[fecharMesComArray] Erro ao processar aluno ${alunoDoc.id}:`,
          error
        );
      }
    }
    let mensagem = "";
    if (pagamentosArquivados === 0 && alunosComPagamentosJaArquivados > 0) {
      mensagem = `Mês ${mesParaFechar} já foi fechado anteriormente. ${alunosComPagamentosJaArquivados} alunos já tinham pagamentos arquivados.`;
    } else if (pagamentosArquivados === 0 && alunosSemPagamentosDoMes > 0) {
      mensagem = `Nenhum pagamento encontrado para o mês ${mesParaFechar}. ${alunosSemPagamentosDoMes} alunos sem pagamentos do mês.`;
    }
    invalidarCacheIntegracao();
    return {
      alunosProcessados,
      pagamentosArquivados,
      novosPagamentosGerados,
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
export async function migrarPagamentosParaNovaEstrutura(): Promise<{
  alunosMigrados: number;
  pagamentosMigrados: number;
  erro?: string;
}> {
  try {
    ("🔄 Iniciando migração para nova estrutura...");

    // 1. Buscar todos os pagamentos da estrutura ANTIGA
    const pagamentosSnapshot = await getDocs(collection(db, "pagamentos"));
    const pagamentosPorAluno: { [alunoId: string]: any[] } = {};

    // 2. Agrupar pagamentos por aluno
    pagamentosSnapshot.forEach((doc) => {
      const data = doc.data();
      const alunoId = data.alunoId;

      if (!pagamentosPorAluno[alunoId]) {
        pagamentosPorAluno[alunoId] = [];
      }

      // ✅ Tratamento seguro das datas
      const dataVencimento = data.dataVencimento?.toDate
        ? data.dataVencimento.toDate()
        : new Date(data.dataVencimento || Date.now());

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
          collection(db, "alunosPagamentos"),
          where("alunoId", "==", alunoId)
        );
        const existeSnapshot = await getDocs(existeQuery);

        if (!existeSnapshot.empty) {
          `⏸️ Aluno ${alunoId} já migrado`;
          continue;
        }

        // Buscar dados do aluno
        const alunoDoc = await getDoc(doc(db, "Alunos", alunoId));
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
            0
          );
        const totalPendente = pagamentos
          .filter((p) => p.status === "Pendente")
          .reduce(
            (sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0),
            0
          );
        const totalArquivado = pagamentos
          .filter((p) => p.status === "Arquivado")
          .reduce(
            (sum, p) => sum + (typeof p.valor === "number" ? p.valor : 0),
            0
          );

        // Próximo vencimento
        const pagamentosPendentes = pagamentos.filter(
          (p) => p.status === "Pendente"
        );
        const proximoVencimento =
          pagamentosPendentes.length > 0
            ? pagamentosPendentes.sort(
                (a, b) =>
                  a.dataVencimento.getTime() - b.dataVencimento.getTime()
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

        await addDoc(collection(db, "alunosPagamentos"), dadosAluno);

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

// ✅ EXPORTAR TIPOS
export type {
  AlunoData,
  PagamentoExistente,
  PagamentoItem,
  AlunoComPagamentos,
};
