import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Professor } from "../types/professor";
// ✅ INTERFACE SIMPLES

export interface ProfessorCreate {
  nome: string;
  email: string;
  telefone?: string;
  especialidade: "Futevôlei" | "Beach Tennis" | "Vôlei";
  status: "Ativo" | "Inativo";
}

export interface ProfessorUpdate {
  nome?: string;
  telefone?: string;
  especialidade?: "Futevôlei" | "Beach Tennis" | "Vôlei";
  status?: "Ativo" | "Inativo";
}
export interface EstatisticasProfessores {
  total: number;
  ativos: number;
  inativos: number;
  especialidades: number;
  porEspecialidade: Record<string, number>;
}
// ✅ CACHE GLOBAL (IGUAL AO TURMA SERVICE)
let professoresCache: Professor[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function isCacheValid(): boolean {
  if (!professoresCache || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

function invalidateCache(): void {
  professoresCache = null;
  cacheTimestamp = null;
  console.log("🧹 Cache de professores invalidado");
}

// ✅ FUNÇÃO PRINCIPAL
export async function buscarTodosProfessores(): Promise<Professor[]> {
  // Cache primeiro
  if (isCacheValid() && professoresCache) {
    console.log("🎯 Professores carregados do cache");
    return professoresCache;
  }

  try {
    console.log("📡 Buscando professores no Firebase...");
    const professoresQuery = query(
      collection(db, "professores"),
      orderBy("nome")
    );

    const snapshot = await getDocs(professoresQuery);
    const professores: Professor[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      professores.push({
        id: doc.id,
        nome: data.nome || "",
        email: data.email || "",
        telefone: data.telefone || "",
        especialidade: data.especialidade || "Futevôlei",
        status: data.status || "Ativo",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Professor);
    });

    // Atualizar cache
    professoresCache = professores;
    cacheTimestamp = Date.now();

    console.log(`✅ ${professores.length} professores carregados e cacheados`);
    return professores;
  } catch (error) {
    console.error("❌ Erro ao buscar professores:", error);
    throw new Error("Erro ao carregar professores");
  }
}

// ✅ PROFESSORES ATIVOS APENAS
export async function buscarProfessoresAtivos(): Promise<Professor[]> {
  const todosProfessores = await buscarTodosProfessores();
  return todosProfessores.filter((prof) => prof.status === "Ativo");
}

export async function criarProfessor(
  professorData: ProfessorCreate
): Promise<string> {
  try {
    console.log("📝 Criando professor:", professorData.nome);

    const docRef = await addDoc(collection(db, "professores"), {
      ...professorData,
      turmaIds: [], // Array vazio para turmas
      createdAt: new Date(),
    });

    console.log("✅ Professor criado com ID:", docRef.id);

    // ✅ INVALIDAR CACHE AUTOMATICAMENTE
    invalidateCache();

    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao criar professor:", error);
    throw new Error("Erro ao criar professor");
  }
}

// ✅ FUNÇÃO ATUALIZAR PROFESSOR
export async function atualizarProfessor(
  id: string,
  updateData: ProfessorUpdate
): Promise<void> {
  try {
    console.log("📝 Atualizando professor:", id);

    await updateDoc(doc(db, "professores", id), {
      ...updateData,
      updatedAt: new Date(),
    });

    console.log("✅ Professor atualizado:", id);

    // ✅ INVALIDAR CACHE AUTOMATICAMENTE
    invalidateCache();
  } catch (error) {
    console.error("❌ Erro ao atualizar professor:", error);
    throw new Error("Erro ao atualizar professor");
  }
}

export async function obterEstatisticasProfessores(): Promise<EstatisticasProfessores> {
  try {
    console.log("📊 Calculando estatísticas de professores...");

    const professores = await buscarTodosProfessores();

    const estatisticas: EstatisticasProfessores = {
      total: professores.length,
      ativos: professores.filter((p) => p.status === "Ativo").length,
      inativos: professores.filter((p) => p.status === "Inativo").length,
      especialidades: new Set(professores.map((p) => p.especialidade)).size,
      porEspecialidade: {},
    };

    // Calcular por especialidade
    professores.forEach((professor) => {
      const esp = professor.especialidade;
      estatisticas.porEspecialidade[esp] =
        (estatisticas.porEspecialidade[esp] || 0) + 1;
    });

    console.log("✅ Estatísticas calculadas:", estatisticas);
    return estatisticas;
  } catch (error) {
    console.error("❌ Erro ao calcular estatísticas:", error);
    throw new Error("Erro ao calcular estatísticas de professores");
  }
}

// ✅ EXPORT DA INTERFACE
export type { Professor };
