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

type CacheEntry = {
  professores: Professor[];
  cacheTimestamp: number;
};

const professoresCachePorTenant = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

const assertTenantId = (tenantId: string) => {
  if (!tenantId?.trim()) {
    throw new Error("Tenant ID é obrigatório");
  }
};

const getProfessoresRef = (tenantId: string) => {
  assertTenantId(tenantId);
  return collection(db, `tenants/${tenantId}/professores`);
};

const getProfessorDocRef = (tenantId: string, professorId: string) => {
  assertTenantId(tenantId);
  if (!professorId?.trim()) {
    throw new Error("ID do professor é obrigatório");
  }

  return doc(db, `tenants/${tenantId}/professores`, professorId);
};

const isCacheValid = (tenantId: string) => {
  const cache = professoresCachePorTenant.get(tenantId);
  if (!cache) return false;
  return Date.now() - cache.cacheTimestamp < CACHE_TTL;
};

const invalidateCache = (tenantId: string) => {
  professoresCachePorTenant.delete(tenantId);
};

const mapDocToProfessor = (docSnap: any, tenantId: string): Professor => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    tenantId,
    nome: data.nome || "",
    email: data.email || "",
    telefone: data.telefone || "",
    especialidade: data.especialidade || "Futevôlei",
    status: data.status || "Ativo",
    turmaIds: data.turmaIds || [],
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
};

export async function buscarTodosProfessores(
  tenantId: string,
): Promise<Professor[]> {
  assertTenantId(tenantId);

  if (isCacheValid(tenantId)) {
    return professoresCachePorTenant.get(tenantId)?.professores || [];
  }

  try {
    const professoresQuery = query(
      getProfessoresRef(tenantId),
      orderBy("nome"),
    );

    const snapshot = await getDocs(professoresQuery);
    const professores = snapshot.docs.map((docSnap) =>
      mapDocToProfessor(docSnap, tenantId),
    );

    professoresCachePorTenant.set(tenantId, {
      professores,
      cacheTimestamp: Date.now(),
    });

    return professores;
  } catch (error) {
    console.error("❌ Erro ao buscar professores:", error);
    throw new Error("Erro ao carregar professores");
  }
}

export async function buscarProfessoresAtivos(
  tenantId: string,
): Promise<Professor[]> {
  const todosProfessores = await buscarTodosProfessores(tenantId);
  return todosProfessores.filter((prof) => prof.status === "Ativo");
}

export async function criarProfessor(
  tenantId: string,
  professorData: ProfessorCreate,
): Promise<string> {
  assertTenantId(tenantId);

  try {
    const docRef = await addDoc(getProfessoresRef(tenantId), {
      ...professorData,
      tenantId,
      turmaIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    invalidateCache(tenantId);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao criar professor:", error);
    throw new Error("Erro ao criar professor");
  }
}

export async function atualizarProfessor(
  tenantId: string,
  id: string,
  updateData: ProfessorUpdate,
): Promise<void> {
  assertTenantId(tenantId);

  try {
    await updateDoc(getProfessorDocRef(tenantId, id), {
      ...updateData,
      tenantId,
      updatedAt: new Date(),
    });

    invalidateCache(tenantId);
  } catch (error) {
    console.error("❌ Erro ao atualizar professor:", error);
    throw new Error("Erro ao atualizar professor");
  }
}

export async function obterEstatisticasProfessores(
  tenantId: string,
): Promise<EstatisticasProfessores> {
  assertTenantId(tenantId);

  try {
    const professores = await buscarTodosProfessores(tenantId);

    const estatisticas: EstatisticasProfessores = {
      total: professores.length,
      ativos: professores.filter((p) => p.status === "Ativo").length,
      inativos: professores.filter((p) => p.status === "Inativo").length,
      especialidades: new Set(professores.map((p) => p.especialidade)).size,
      porEspecialidade: {},
    };

    professores.forEach((professor) => {
      const esp = professor.especialidade;
      estatisticas.porEspecialidade[esp] =
        (estatisticas.porEspecialidade[esp] || 0) + 1;
    });

    return estatisticas;
  } catch (error) {
    console.error("❌ Erro ao calcular estatísticas:", error);
    throw new Error("Erro ao calcular estatísticas de professores");
  }
}

export function limparCacheProfessores(tenantId?: string): void {
  if (tenantId?.trim()) {
    professoresCachePorTenant.delete(tenantId);
  } else {
    professoresCachePorTenant.clear();
  }
}

export type { Professor };
