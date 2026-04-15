import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";

// ✅ USAR INTERFACE EXISTENTE
import type { Turma } from "../types/turmas";

// ✅ INTERFACES COMPLEMENTARES (só as que não existem)
interface TurmaCreate {
  nome: string;
  modalidade: "Futevôlei" | "Beach Tennis" | "Vôlei";
  professorId: string;
  professorNome: string;
  dias: string;
  horario: string;
  capacidade: number;
  genero: "Masculino" | "Feminino" | "Teens";
  nivel: "Estreante" | "Iniciante" | "Intermediário";
  status?: "Ativa" | "Inativa";
}

interface TurmaUpdate {
  nome?: string;
  modalidade?: "Futevôlei" | "Beach Tennis" | "Vôlei";
  professorId?: string;
  professorNome?: string;
  dias?: string;
  horario?: string;
  capacidade?: number;
  genero?: "Masculino" | "Feminino" | "Teens";
  nivel?: "Estreante" | "Iniciante" | "Intermediário";
  status?: "Ativa" | "Inativa";
}

interface EstatisticasTurmas {
  totalTurmas: number;
  turmasAtivas: number;
  turmasInativas: number;
  modalidades: {
    [key: string]: number;
  };
  capacidadeTotal: number;
  alunosMatriculados: number;
  taxaOcupacao: number;
  turmasMaisPopulares: Array<{
    id: string;
    nome: string;
    modalidade: string;
    alunosInscritos: number;
    capacidade: number;
  }>;
}

type CacheEntry = {
  turmas: Turma[];
  cacheTimestamp: number;
};

const turmasCachePorTenant = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const assertTenantId = (tenantId: string) => {
  if (!tenantId?.trim()) {
    throw new Error("Tenant ID é obrigatório");
  }
};

function isCacheValid(tenantId: string): boolean {
  const cache = turmasCachePorTenant.get(tenantId);
  if (!cache) return false;
  return Date.now() - cache.cacheTimestamp < CACHE_TTL;
}

function invalidateCache(tenantId: string): void {
  turmasCachePorTenant.delete(tenantId);
  ("🧹 Cache de turmas invalidado");
}

const getTurmasRef = (tenantId: string) => {
  assertTenantId(tenantId);
  return collection(db, `tenants/${tenantId}/turmas`);
};

const getTurmaDocRef = (tenantId: string, turmaId: string) => {
  assertTenantId(tenantId);
  if (!turmaId?.trim()) {
    throw new Error("ID da turma é obrigatório");
  }

  return doc(db, `tenants/${tenantId}/turmas`, turmaId);
};

const mapDocToTurma = (docSnap: any, tenantId: string): Turma => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    nome: data.nome || "",
    modalidade: data.modalidade || "Futevôlei",
    professorId: data.professorId || "",
    professorNome: data.professorNome || "",
    dias: data.dias || "",
    horario: data.horario || "",
    capacidade: data.capacidade || 0,
    alunosInscritos: data.alunosInscritos || 0,
    genero: data.genero || "Masculino",
    nivel: data.nivel || "Estreante",
    status: data.status || "Ativa",
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    tenantId,
  } as Turma;
};

// BUSCAR TODAS AS TURMAS
//Buscar todas as turmas com cache inteligente

export async function buscarTodasTurmas(tenantId: string): Promise<Turma[]> {
  assertTenantId(tenantId);
  // ✅ Verificar cache primeiro
  if (isCacheValid(tenantId)) {
    const cache = turmasCachePorTenant.get(tenantId);
    if (cache) {
      ("🎯 Turmas carregadas do cache");
      return cache.turmas;
    }
  }

  try {
    ("📡 Buscando turmas no Firebase...");
    const snapshot = await getDocs(getTurmasRef(tenantId));
    const turmas: Turma[] = [];

    snapshot.forEach((docSnap) => {
      turmas.push(mapDocToTurma(docSnap, tenantId));
    });

    // ✅ Atualizar cache por tenant
    turmasCachePorTenant.set(tenantId, {
      turmas,
      cacheTimestamp: Date.now(),
    });

    `✅ ${turmas.length} turmas carregadas e cacheadas`;
    return turmas;
  } catch (error) {
    throw new Error("Erro ao carregar turmas");
  }
}

// ✅ FUNÇÕES DERIVADAS (USAM O CACHE)

/**
 * Buscar turmas ativas apenas
 */
export async function buscarTurmasAtivas(tenantId: string): Promise<Turma[]> {
  const todasTurmas = await buscarTodasTurmas(tenantId);
  const turmasAtivas = todasTurmas.filter((turma) => turma.status === "Ativa");
  `✅ ${turmasAtivas.length} turmas ativas encontradas`;
  return turmasAtivas;
}

/**
 * Buscar turmas por modalidade
 */
export async function buscarTurmasPorModalidade(
  tenantId: string,
  modalidade: "Futevôlei" | "Beach Tennis" | "Vôlei",
): Promise<Turma[]> {
  const todasTurmas = await buscarTodasTurmas(tenantId);
  const turmasModalidade = todasTurmas.filter(
    (turma) => turma.modalidade === modalidade,
  );
  `✅ ${turmasModalidade.length} turmas de ${modalidade} encontradas`;
  return turmasModalidade;
}

/**
 * Buscar turma por ID
 */
export async function buscarTurmaPorId(
  tenantId: string,
  id: string,
): Promise<Turma | null> {
  assertTenantId(tenantId);
  if (!id || !id.trim()) {
    console.warn("⚠️ ID da turma não fornecido");
    return null;
  }

  try {
    // ✅ Tentar buscar do cache primeiro
    const todasTurmas = await buscarTodasTurmas(tenantId);
    const turmaEncontrada = todasTurmas.find((turma) => turma.id === id);

    if (turmaEncontrada) {
      `✅ Turma ${id} encontrada no cache`;
      return turmaEncontrada;
    }

    // ✅ Se não encontrou no cache, buscar diretamente
    `📡 Buscando turma ${id} diretamente no Firebase...`;
    const turmaDoc = await getDoc(getTurmaDocRef(tenantId, id));

    if (!turmaDoc.exists()) {
      console.warn(`⚠️ Turma ${id} não encontrada`);
      return null;
    }

    const turma = mapDocToTurma(turmaDoc, tenantId);

    `✅ Turma ${id} carregada diretamente`;
    return turma;
  } catch (error) {
    console.error(`❌ Erro ao buscar turma ${id}:`, error);
    throw error;
  }
}

/**
 * Buscar turmas disponíveis (com vagas)
 */
export async function buscarTurmasDisponiveis(
  tenantId: string,
): Promise<Turma[]> {
  const turmasAtivas = await buscarTurmasAtivas(tenantId);
  const turmasDisponiveis = turmasAtivas.filter(
    (turma) => turma.alunosInscritos < turma.capacidade,
  );
  `✅ ${turmasDisponiveis.length} turmas disponíveis encontradas`;
  return turmasDisponiveis;
}

/**
 * Buscar turmas por professor
 */
export async function buscarTurmasPorProfessor(
  tenantId: string,
  professorId: string,
): Promise<Turma[]> {
  const todasTurmas = await buscarTodasTurmas(tenantId);
  const turmasProfessor = todasTurmas.filter(
    (turma) => turma.professorId === professorId,
  );
  `✅ ${turmasProfessor.length} turmas do professor encontradas`;
  return turmasProfessor;
}

// ✅ OPERAÇÕES CRUD

/**
 * Criar nova turma
 */
export async function criarTurma(
  tenantId: string,
  turmaData: TurmaCreate,
): Promise<string> {
  assertTenantId(tenantId);
  try {
    const novaTurma = {
      ...turmaData,
      tenantId,
      alunosInscritos: 0,
      status: turmaData.status || "Ativa",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(getTurmasRef(tenantId), novaTurma);

    // ✅ INVALIDAR CACHE COM LOG
    ("🧹 Invalidando cache após criar turma...");
    invalidateCache(tenantId);

    // ✅ FORÇAR RELOAD IMEDIATO DO CACHE
    ("🔄 Forçando reload do cache...");
    await buscarTodasTurmas(tenantId); // Força reload imediato

    `✅ Turma criada com ID: ${docRef.id}`;
    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao criar turma:", error);
    throw new Error("Erro ao criar turma");
  }
}

/**
 * Atualizar turma
 */
export async function atualizarTurma(
  tenantId: string,
  id: string,
  dados: TurmaUpdate,
): Promise<void> {
  assertTenantId(tenantId);
  try {
    `📝 Atualizando turma ${id}`;

    const dadosAtualizacao = {
      ...dados,
      tenantId,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(getTurmaDocRef(tenantId, id), dadosAtualizacao);

    // ✅ Invalidar cache
    invalidateCache(tenantId);

    await buscarTodasTurmas(tenantId);
    `✅ Turma ${id} atualizada`;
  } catch (error) {
    console.error(`❌ Erro ao atualizar turma ${id}:`, error);
    throw new Error("Erro ao atualizar turma");
  }
}

/**
 * Remover turma
 */
export async function removerTurma(
  tenantId: string,
  id: string,
): Promise<void> {
  assertTenantId(tenantId);
  try {
    `🗑️ Removendo turma ${id}`;

    await deleteDoc(getTurmaDocRef(tenantId, id));

    // ✅ Invalidar cache
    invalidateCache(tenantId);

    `✅ Turma ${id} removida`;
  } catch (error) {
    console.error(`❌ Erro ao remover turma ${id}:`, error);
    throw new Error("Erro ao remover turma");
  }
}

/**
 * Atualizar contador de alunos
 */
export async function atualizarContadorAlunos(
  tenantId: string,
  turmaId: string,
  novoContador: number,
): Promise<void> {
  assertTenantId(tenantId);
  try {
    `📊 Atualizando contador da turma ${turmaId} para ${novoContador}`;

    await updateDoc(getTurmaDocRef(tenantId, turmaId), {
      alunosInscritos: Math.max(0, novoContador),
      updatedAt: Timestamp.now(),
    });

    // ✅ Invalidar cache
    invalidateCache(tenantId);

    `✅ Contador da turma ${turmaId} atualizado para ${novoContador}`;
  } catch (error) {
    console.error(`❌ Erro ao atualizar contador da turma ${turmaId}:`, error);
    throw error;
  }
}

/**
 * Incrementar contador de alunos
 */
export async function incrementarContadorAlunos(
  tenantId: string,
  turmaId: string,
): Promise<void> {
  assertTenantId(tenantId);
  try {
    const turma = await buscarTurmaPorId(tenantId, turmaId);
    if (turma) {
      const novoContador = turma.alunosInscritos + 1;
      await atualizarContadorAlunos(tenantId, turmaId, novoContador);
    }
  } catch (error) {
    console.error(
      `❌ Erro ao incrementar contador da turma ${turmaId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Decrementar contador de alunos
 */
export async function decrementarContadorAlunos(
  tenantId: string,
  turmaId: string,
): Promise<void> {
  assertTenantId(tenantId);
  try {
    const turma = await buscarTurmaPorId(tenantId, turmaId);
    if (turma) {
      const novoContador = Math.max(0, turma.alunosInscritos - 1);
      await atualizarContadorAlunos(tenantId, turmaId, novoContador);
    }
  } catch (error) {
    console.error(
      `❌ Erro ao decrementar contador da turma ${turmaId}:`,
      error,
    );
    throw error;
  }
}

// ✅ ESTATÍSTICAS

/**
 * Obter estatísticas das turmas
 */
export async function obterEstatisticasTurmas(
  tenantId: string,
): Promise<EstatisticasTurmas> {
  assertTenantId(tenantId);
  try {
    ("📊 Calculando estatísticas das turmas...");
    const todasTurmas = await buscarTodasTurmas(tenantId);

    const turmasAtivas = todasTurmas.filter((t) => t.status === "Ativa");
    const turmasInativas = todasTurmas.filter((t) => t.status !== "Ativa");

    // Contar modalidades
    const modalidades: { [key: string]: number } = {};
    todasTurmas.forEach((turma) => {
      modalidades[turma.modalidade] = (modalidades[turma.modalidade] || 0) + 1;
    });

    // Calcular capacidades e ocupação
    const capacidadeTotal = todasTurmas.reduce(
      (sum, turma) => sum + turma.capacidade,
      0,
    );
    const alunosMatriculados = todasTurmas.reduce(
      (sum, turma) => sum + turma.alunosInscritos,
      0,
    );
    const taxaOcupacao =
      capacidadeTotal > 0 ? (alunosMatriculados / capacidadeTotal) * 100 : 0;

    // Top 5 turmas mais populares
    const turmasMaisPopulares = [...todasTurmas]
      .sort((a, b) => b.alunosInscritos - a.alunosInscritos)
      .slice(0, 5)
      .map((turma) => ({
        id: turma.id!,
        nome: turma.nome,
        modalidade: turma.modalidade,
        alunosInscritos: turma.alunosInscritos,
        capacidade: turma.capacidade,
      }));

    const estatisticas: EstatisticasTurmas = {
      totalTurmas: todasTurmas.length,
      turmasAtivas: turmasAtivas.length,
      turmasInativas: turmasInativas.length,
      modalidades,
      capacidadeTotal,
      alunosMatriculados,
      taxaOcupacao: Math.round(taxaOcupacao * 10) / 10,
      turmasMaisPopulares,
    };

    ("✅ Estatísticas de turmas calculadas");
    return estatisticas;
  } catch (error) {
    console.error("❌ Erro ao obter estatísticas de turmas:", error);
    throw error;
  }
}

// ✅ HELPERS

/**
 * Contar alunos por turma (útil para validações)
 */
export async function contarAlunosPorTurma(
  tenantId: string,
  turmaId: string,
): Promise<number> {
  assertTenantId(tenantId);
  try {
    const turma = await buscarTurmaPorId(tenantId, turmaId);
    return turma ? turma.alunosInscritos : 0;
  } catch (error) {
    console.error(`❌ Erro ao contar alunos da turma ${turmaId}:`, error);
    return 0;
  }
}

export async function temVagasDisponiveis(
  tenantId: string,
  turmaId: string,
): Promise<boolean> {
  assertTenantId(tenantId);
  try {
    const turma = await buscarTurmaPorId(tenantId, turmaId);
    return turma ? turma.alunosInscritos < turma.capacidade : false;
  } catch (error) {
    console.error(`❌ Erro ao verificar vagas da turma ${turmaId}:`, error);
    return false;
  }
}

/**
 * Limpar cache manualmente (útil para desenvolvimento)
 */
export function limparCacheTurmas(tenantId?: string): void {
  if (tenantId?.trim()) {
    turmasCachePorTenant.delete(tenantId);
  } else {
    turmasCachePorTenant.clear();
  }
  ("🧹 Cache de turmas limpo manualmente");
}

// ✅ EXPORTS (SÓ AS NOVAS INTERFACES)
export type { TurmaCreate, TurmaUpdate, EstatisticasTurmas };
