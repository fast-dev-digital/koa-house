import {
  collection,
  getDocs,
  query,
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

// ✅ CACHE GLOBAL SIMPLES (IGUAL AO ALUNO SERVICE)
let turmasCache: Turma[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function isCacheValid(): boolean {
  if (!turmasCache || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

function invalidateCache(): void {
  turmasCache = null;
  cacheTimestamp = null;
  ("🧹 Cache de turmas invalidado");
}

// BUSCAR TODAS AS TURMAS
//Buscar todas as turmas com cache inteligente

export async function buscarTodasTurmas(): Promise<Turma[]> {
  // ✅ Verificar cache primeiro
  if (isCacheValid() && turmasCache) {
    ("🎯 Turmas carregadas do cache");
    return turmasCache;
  }

  try {
    ("📡 Buscando turmas no Firebase...");
    const turmasQuery = query(collection(db, "turmas"));

    const snapshot = await getDocs(turmasQuery);
    const turmas: Turma[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      turmas.push({
        id: doc.id,
        nome: data.nome || "",
        modalidade: data.modalidade || "Futevôlei",
        professorId: data.professorId || "",
        professorNome: data.professorNome || "",
        dias: data.dias || "",
        horario: data.horario || "",
        capacidade: data.capacidade || 0,
        alunosInscritos: data.alunosInscritos || 0,
        genero: data.genero || "Masculino", // ✅ USAR VALORES CORRETOS DA INTERFACE
        nivel: data.nivel || "Estreante", // ✅ ADICIONAR NIVEL (ESTAVA FALTANDO)
        status: data.status || "Ativa",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    // ✅ Atualizar cache global
    turmasCache = turmas;
    cacheTimestamp = Date.now();

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
export async function buscarTurmasAtivas(): Promise<Turma[]> {
  const todasTurmas = await buscarTodasTurmas();
  const turmasAtivas = todasTurmas.filter((turma) => turma.status === "Ativa");
  `✅ ${turmasAtivas.length} turmas ativas encontradas`;
  return turmasAtivas;
}

/**
 * Buscar turmas por modalidade
 */
export async function buscarTurmasPorModalidade(
  modalidade: "Futevôlei" | "Beach Tennis" | "Vôlei"
): Promise<Turma[]> {
  const todasTurmas = await buscarTodasTurmas();
  const turmasModalidade = todasTurmas.filter(
    (turma) => turma.modalidade === modalidade
  );
  `✅ ${turmasModalidade.length} turmas de ${modalidade} encontradas`;
  return turmasModalidade;
}

/**
 * Buscar turma por ID
 */
export async function buscarTurmaPorId(id: string): Promise<Turma | null> {
  if (!id || !id.trim()) {
    console.warn("⚠️ ID da turma não fornecido");
    return null;
  }

  try {
    // ✅ Tentar buscar do cache primeiro
    const todasTurmas = await buscarTodasTurmas();
    const turmaEncontrada = todasTurmas.find((turma) => turma.id === id);

    if (turmaEncontrada) {
      `✅ Turma ${id} encontrada no cache`;
      return turmaEncontrada;
    }

    // ✅ Se não encontrou no cache, buscar diretamente
    `📡 Buscando turma ${id} diretamente no Firebase...`;
    const turmaDoc = await getDoc(doc(db, "turmas", id));

    if (!turmaDoc.exists()) {
      console.warn(`⚠️ Turma ${id} não encontrada`);
      return null;
    }

    const data = turmaDoc.data();
    const turma: Turma = {
      id: turmaDoc.id,
      nome: data.nome || "",
      modalidade: data.modalidade || "Beach Tennis",
      professorId: data.professorId || "",
      professorNome: data.professorNome || "",
      dias: data.dias || "",
      horario: data.horario || "",
      capacidade: data.capacidade || 0,
      alunosInscritos: data.alunosInscritos || 0,
      genero: data.genero || "Teens", // ✅ CORRIGIDO
      nivel: data.nivel || "Iniciante", // ✅ ADICIONADO
      status: data.status || "Ativa",
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };

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
export async function buscarTurmasDisponiveis(): Promise<Turma[]> {
  const turmasAtivas = await buscarTurmasAtivas();
  const turmasDisponiveis = turmasAtivas.filter(
    (turma) => turma.alunosInscritos < turma.capacidade
  );
  `✅ ${turmasDisponiveis.length} turmas disponíveis encontradas`;
  return turmasDisponiveis;
}

/**
 * Buscar turmas por professor
 */
export async function buscarTurmasPorProfessor(
  professorId: string
): Promise<Turma[]> {
  const todasTurmas = await buscarTodasTurmas();
  const turmasProfessor = todasTurmas.filter(
    (turma) => turma.professorId === professorId
  );
  `✅ ${turmasProfessor.length} turmas do professor encontradas`;
  return turmasProfessor;
}

// ✅ OPERAÇÕES CRUD

/**
 * Criar nova turma
 */
// ✅ CORRIGIR A FUNÇÃO criarTurma - ADICIONAR LOGS E FORÇAR RELOAD
export async function criarTurma(turmaData: TurmaCreate): Promise<string> {
  try {
    const novaTurma = {
      ...turmaData,
      alunosInscritos: 0,
      status: turmaData.status || "Ativa",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "turmas"), novaTurma);

    // ✅ INVALIDAR CACHE COM LOG
    ("🧹 Invalidando cache após criar turma...");
    invalidateCache();

    // ✅ FORÇAR RELOAD IMEDIATO DO CACHE
    ("🔄 Forçando reload do cache...");
    await buscarTodasTurmas(); // Força reload imediato

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
  id: string,
  dados: TurmaUpdate
): Promise<void> {
  try {
    `📝 Atualizando turma ${id}`;

    const dadosAtualizacao = {
      ...dados,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(doc(db, "turmas", id), dadosAtualizacao);

    // ✅ Invalidar cache
    invalidateCache();

    await buscarTodasTurmas();
    `✅ Turma ${id} atualizada`;
  } catch (error) {
    console.error(`❌ Erro ao atualizar turma ${id}:`, error);
    throw new Error("Erro ao atualizar turma");
  }
}

/**
 * Remover turma
 */
export async function removerTurma(id: string): Promise<void> {
  try {
    `🗑️ Removendo turma ${id}`;

    await deleteDoc(doc(db, "turmas", id));

    // ✅ Invalidar cache
    invalidateCache();

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
  turmaId: string,
  novoContador: number
): Promise<void> {
  try {
    `📊 Atualizando contador da turma ${turmaId} para ${novoContador}`;

    await updateDoc(doc(db, "turmas", turmaId), {
      alunosInscritos: Math.max(0, novoContador),
      updatedAt: Timestamp.now(),
    });

    // ✅ Invalidar cache
    invalidateCache();

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
  turmaId: string
): Promise<void> {
  try {
    const turma = await buscarTurmaPorId(turmaId);
    if (turma) {
      const novoContador = turma.alunosInscritos + 1;
      await atualizarContadorAlunos(turmaId, novoContador);
    }
  } catch (error) {
    console.error(
      `❌ Erro ao incrementar contador da turma ${turmaId}:`,
      error
    );
    throw error;
  }
}

/**
 * Decrementar contador de alunos
 */
export async function decrementarContadorAlunos(
  turmaId: string
): Promise<void> {
  try {
    const turma = await buscarTurmaPorId(turmaId);
    if (turma) {
      const novoContador = Math.max(0, turma.alunosInscritos - 1);
      await atualizarContadorAlunos(turmaId, novoContador);
    }
  } catch (error) {
    console.error(
      `❌ Erro ao decrementar contador da turma ${turmaId}:`,
      error
    );
    throw error;
  }
}

// ✅ ESTATÍSTICAS

/**
 * Obter estatísticas das turmas
 */
export async function obterEstatisticasTurmas(): Promise<EstatisticasTurmas> {
  try {
    ("📊 Calculando estatísticas das turmas...");
    const todasTurmas = await buscarTodasTurmas();

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
      0
    );
    const alunosMatriculados = todasTurmas.reduce(
      (sum, turma) => sum + turma.alunosInscritos,
      0
    );
    const taxaOcupacao =
      capacidadeTotal > 0 ? (alunosMatriculados / capacidadeTotal) * 100 : 0;

    // Top 5 turmas mais populares
    const turmasMaisPopulares = todasTurmas
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
export async function contarAlunosPorTurma(turmaId: string): Promise<number> {
  try {
    const turma = await buscarTurmaPorId(turmaId);
    return turma ? turma.alunosInscritos : 0;
  } catch (error) {
    console.error(`❌ Erro ao contar alunos da turma ${turmaId}:`, error);
    return 0;
  }
}

export async function temVagasDisponiveis(turmaId: string): Promise<boolean> {
  try {
    const turma = await buscarTurmaPorId(turmaId);
    return turma ? turma.alunosInscritos < turma.capacidade : false;
  } catch (error) {
    console.error(`❌ Erro ao verificar vagas da turma ${turmaId}:`, error);
    return false;
  }
}

/**
 * Limpar cache manualmente (útil para desenvolvimento)
 */
export function limparCacheTurmas(): void {
  invalidateCache();
  ("🧹 Cache de turmas limpo manualmente");
}

// ✅ EXPORTS (SÓ AS NOVAS INTERFACES)
export type { TurmaCreate, TurmaUpdate, EstatisticasTurmas };
