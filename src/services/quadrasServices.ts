import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Quadra } from "../types/quadra";

type CacheEntry = {
  quadras: Quadra[];
  cacheTimestamp: number;
};

const quadrasCachePorTenant = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

const assertTenantId = (tenantId: string) => {
  if (!tenantId?.trim()) {
    throw new Error("Tenant ID é obrigatório");
  }
};

const getQuadrasRef = (tenantId: string) => {
  assertTenantId(tenantId);
  return collection(db, `tenants/${tenantId}/quadras`);
};

const getQuadraDocRef = (tenantId: string, quadraId: string) => {
  assertTenantId(tenantId);
  if (!quadraId?.trim()) {
    throw new Error("ID da quadra é obrigatório");
  }

  return doc(db, `tenants/${tenantId}/quadras`, quadraId);
};

const isCacheValid = (tenantId: string) => {
  const cache = quadrasCachePorTenant.get(tenantId);
  if (!cache) return false;
  return Date.now() - cache.cacheTimestamp < CACHE_TTL;
};

const invalidateCache = (tenantId: string) => {
  quadrasCachePorTenant.delete(tenantId);
};

const mapDocToQuadra = (docSnap: any, tenantId: string): Quadra => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    tenantId,
    nome: data.nome || "",
    numero: data.numero || 0,
    localizacao: data.localizacao || "",
    tipo: data.tipo || "Descoberta",
    tamanho: data.tamanho || "",
    superficie: data.superficie || "Concreto",
    iluminacao: data.iluminacao || "Sim",
    ativa: data.ativa ?? true,
    cor: data.cor || "blue.100",
    observacoes: data.observacoes || "",
    createdAt: data.createdAt?.toDate?.()
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt,
  };
};

export async function buscarQuadras(tenantId: string): Promise<Quadra[]> {
  assertTenantId(tenantId);

  if (isCacheValid(tenantId)) {
    return quadrasCachePorTenant.get(tenantId)?.quadras || [];
  }

  const snapshot = await getDocs(
    query(getQuadrasRef(tenantId), orderBy("numero")),
  );
  const quadras = snapshot.docs.map((docSnap) =>
    mapDocToQuadra(docSnap, tenantId),
  );

  quadrasCachePorTenant.set(tenantId, {
    quadras,
    cacheTimestamp: Date.now(),
  });

  return quadras;
}

export async function criarQuadra(
  tenantId: string,
  quadra: Omit<Quadra, "id">,
): Promise<string> {
  assertTenantId(tenantId);
  const docRef = await addDoc(getQuadrasRef(tenantId), {
    ...quadra,
    tenantId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  invalidateCache(tenantId);
  return docRef.id;
}

export async function atualizarQuadra(
  tenantId: string,
  id: string,
  quadra: Partial<Quadra>,
): Promise<void> {
  assertTenantId(tenantId);
  const { id: _, ...resto } = quadra;
  await updateDoc(getQuadraDocRef(tenantId, id), {
    ...resto,
    tenantId,
    updatedAt: new Date().toISOString(),
  });
  invalidateCache(tenantId);
}

export async function excluirQuadra(
  tenantId: string,
  id: string,
): Promise<void> {
  assertTenantId(tenantId);
  await deleteDoc(getQuadraDocRef(tenantId, id));
  invalidateCache(tenantId);
}

export function limparCacheQuadras(tenantId?: string): void {
  if (tenantId?.trim()) {
    quadrasCachePorTenant.delete(tenantId);
  } else {
    quadrasCachePorTenant.clear();
  }
}
