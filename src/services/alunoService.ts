import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Aluno } from "../types/alunos";
import { normalizeEmail } from "../utils/tenant";

type CacheEntry = {
  alunos: Aluno[];
  ultimaBusca: number;
};

const cacheAlunosPorTenant = new Map<string, CacheEntry>();
const TEMPO_CACHE = 5 * 60 * 1000; // 5 minutos

const assertTenantId = (tenantId: string) => {
  if (!tenantId?.trim()) {
    throw new Error("Tenant ID é obrigatório");
  }
};

const getAlunosRef = (tenantId: string) => {
  assertTenantId(tenantId);
  return collection(db, `tenants/${tenantId}/alunos`);
};

const getAlunoDocRef = (tenantId: string, alunoId: string) => {
  assertTenantId(tenantId);
  if (!alunoId?.trim()) {
    throw new Error("Aluno ID é obrigatório");
  }

  return doc(db, `tenants/${tenantId}/alunos`, alunoId);
};

export async function buscarTodosAlunos(tenantId: string): Promise<Aluno[]> {
  assertTenantId(tenantId);
  const cache = cacheAlunosPorTenant.get(tenantId);
  const agora = Date.now();
  //  VERIFICA SE CACHE É VÁLIDO (existe + não expirou)
  if (cache && agora - cache.ultimaBusca < TEMPO_CACHE) {
    return cache.alunos;
  }

  try {
    const alunosRef = getAlunosRef(tenantId);

    // 📖 EXECUTA A BUSCA (operação assíncrona)
    const snapshot = await getDocs(alunosRef);

    // 🔄 CONVERTE DOCUMENTOS FIREBASE PARA ARRAY DE ALUNOS
    const alunos: Aluno[] = [];
    snapshot.forEach((documento) => {
      alunos.push({
        id: documento.id, // 🆔 ID único do Firebase
        tenantId,
        ...documento.data(), // 📝 Spread: copia todos os campos
      } as Aluno);
    });

    // 💾 ATUALIZA O CACHE PARA PRÓXIMAS CHAMADAS
    cacheAlunosPorTenant.set(tenantId, { alunos, ultimaBusca: agora });

    return alunos;
  } catch (error) {
    console.error("❌ Erro ao buscar alunos no Firebase:", error);
    throw new Error(`Falha ao carregar alunos: ${error}`);
  }
}

//  FUNÇÃO 2: BUSCAR ALUNO POR EMAIL (USA CACHE)
export function buscarAlunoPorEmail(
  tenantId: string,
  email: string,
): Aluno | null {
  assertTenantId(tenantId);
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const cache = cacheAlunosPorTenant.get(tenantId);
  if (!cache) {
    console.warn("⚠️ Cache vazio! Execute buscarTodosAlunos() primeiro");
    return null;
  }

  // BUSCA NO ARRAY EM MEMÓRIA (SUPER RÁPIDO)
  const alunoEncontrado = cache.alunos.find(
    (aluno) => normalizeEmail(aluno.email) === normalizedEmail,
  );

  if (alunoEncontrado) {
    `👤 Aluno encontrado no cache: ${alunoEncontrado.nome}`;
  } else {
    `🔍 Aluno com email "${email}" não encontrado`;
  }

  return alunoEncontrado || null;
}

// ➕ FUNÇÃO 3: CRIAR NOVO ALUNO
export async function criarAluno(
  tenantId: string,
  dadosAluno: Omit<Aluno, "id">,
): Promise<string> {
  assertTenantId(tenantId);
  try {
    // 📝 ADICIONA TIMESTAMPS AUTOMÁTICOS
    const alunoCompleto = {
      ...dadosAluno, // 📋 Dados informados
      tenantId,
      createdAt: new Date().toISOString(), // 📅 Data criação
      updatedAt: new Date().toISOString(), // 📅 Data atualização
    };

    // 🔥 SALVA NO FIREBASE
    const docRef = await addDoc(getAlunosRef(tenantId), alunoCompleto);

    // 🧹 INVALIDA O CACHE (força nova busca na próxima vez)
    limparCacheDeUmTenant(tenantId);
    ("🧹 Cache invalidado - próxima busca será atualizada");

    `✅ Aluno criado com ID: ${docRef.id}`;
    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao criar aluno:", error);
    throw new Error(`Falha ao criar aluno: ${error}`);
  }
}

// ✏️ FUNÇÃO 4: ATUALIZAR ALUNO EXISTENTE
export async function atualizarAluno(
  id: string,
  dadosAtualizacao: Partial<Aluno>,
  tenantId: string,
): Promise<void> {
  assertTenantId(tenantId);

  try {
    //  REFERÊNCIA AO DOCUMENTO ESPECÍFICO
    const docRef = getAlunoDocRef(tenantId, id);

    //  ADICIONA TIMESTAMP DE ATUALIZAÇÃO
    const dadosCompletos = {
      ...dadosAtualizacao, // 📋 Campos a atualizar
      tenantId,
      updatedAt: new Date().toISOString(), // ⏰ Marca quando foi atualizado
    };

    // 🔥 ATUALIZA NO FIREBASE
    await updateDoc(docRef, dadosCompletos);

    // ✅ Se mudou o status para Ativo, verificar e gerar pagamento
    if (dadosAtualizacao.status === "Ativo") {
      try {
        const { verificarEGerarPagamentoAlunoAtivo } =
          await import("./integracaoService");
        await verificarEGerarPagamentoAlunoAtivo(id);
      } catch (erro) {
        console.warn(
          "⚠️ Erro ao tentar gerar pagamento para aluno ativo:",
          erro,
        );
        // Não throw - deixa a atualização do aluno continuar mesmo se falhar a geração do pagamento
      }
    }

    // 🧹 INVALIDA CACHE
    limparCacheDeUmTenant(tenantId);
  } catch (error) {
    console.error("❌ Erro ao atualizar aluno:", error);
    throw new Error(`Falha ao atualizar aluno: ${error}`);
  }
}

//  FUNÇÃO 5: DELETAR ALUNO
export async function deletarAluno(
  id: string,
  tenantId: string,
): Promise<void> {
  assertTenantId(tenantId);
  try {
    `🗑️ Deletando aluno ID: ${id}`;

    // REFERÊNCIA AO DOCUMENTO
    const docRef = getAlunoDocRef(tenantId, id);

    // REMOVE DO FIREBASE
    await deleteDoc(docRef);

    //  INVALIDA CACHE
    limparCacheDeUmTenant(tenantId);
    ("✅ Aluno deletado e cache invalidado");
  } catch (error) {
    console.error("❌ Erro ao deletar aluno:", error);
    throw new Error(`Falha ao deletar aluno: ${error}`);
  }
}

//  FUNÇÃO 6: BUSCAR ALUNOS POR TURMA (USA CACHE)
export function buscarAlunosPorTurma(tenantId: string, turma: string): Aluno[] {
  assertTenantId(tenantId);
  const cache = cacheAlunosPorTenant.get(tenantId);
  if (!cache) {
    console.warn("⚠️ Cache vazio! Execute buscarTodosAlunos() primeiro");
    return [];
  }

  // 🔍 FILTRA ARRAY EM MEMÓRIA
  const alunosDaTurma = cache.alunos.filter((aluno) => aluno.turmas === turma);

  // 🎓 EXPLICAÇÃO DO .filter():
  // Percorre o array e retorna um NOVO ARRAY com elementos que satisfazem a condição
  // Diferente do .find() que retorna apenas 1 elemento

  `👥 Encontrados ${alunosDaTurma.length} alunos na turma "${turma}"`;
  return alunosDaTurma;
}

// 📊 FUNÇÃO 7: BUSCAR ALUNOS ATIVOS (USA CACHE)
export function buscarAlunosAtivos(tenantId: string): Aluno[] {
  assertTenantId(tenantId);
  const cache = cacheAlunosPorTenant.get(tenantId);
  if (!cache) {
    console.warn("⚠️ Cache vazio! Execute buscarTodosAlunos() primeiro");
    return [];
  }

  const alunosAtivos = cache.alunos.filter((aluno) => aluno.status === "Ativo");

  `✅ ${alunosAtivos.length} alunos ativos encontrados`;
  return alunosAtivos;
}

// 🧹 FUNÇÃO AUXILIAR: LIMPAR CACHE
function limparCacheDeUmTenant(tenantId: string): void {
  assertTenantId(tenantId);
  cacheAlunosPorTenant.delete(tenantId); // 🗑️ Remove dados da memória
}

// 📊 FUNÇÃO 8: ESTATÍSTICAS RÁPIDAS (USA CACHE)
export function obterEstatisticasAlunos(tenantId: string) {
  assertTenantId(tenantId);
  const cache = cacheAlunosPorTenant.get(tenantId);
  if (!cache) {
    return {
      total: 0,
      ativos: 0,
      inativos: 0,
    };
  }

  // 🔢 CONTA DIFERENTES STATUS
  const stats = {
    total: cache.alunos.length,
    ativos: cache.alunos.filter((a) => a.status === "Ativo").length,
    inativos: cache.alunos.filter((a) => a.status === "Inativo").length,
  };

  return stats;
}

// 🔄 FUNÇÃO 9: FORÇAR REFRESH DO CACHE
export async function recarregarCache(tenantId: string): Promise<Aluno[]> {
  assertTenantId(tenantId);

  // 🧹 LIMPA CACHE ATUAL
  limparCacheDeUmTenant(tenantId);

  // 🔥 BUSCA NOVAMENTE (vai direto pro Firebase)
  return await buscarTodosAlunos(tenantId);
}

// 📝 FUNÇÃO 10: VERIFICAR SE CACHE ESTÁ VÁLIDO
export function cacheEstaValido(tenantId: string): boolean {
  assertTenantId(tenantId);
  const cache = cacheAlunosPorTenant.get(tenantId);
  if (!cache) return false;

  const agora = Date.now();
  const cacheValido = agora - cache.ultimaBusca < TEMPO_CACHE;

  `🔍 Cache ${cacheValido ? "VÁLIDO" : "EXPIRADO"}`;
  return cacheValido;
}

// 🔄 MANTÉM COMPATIBILIDADE COM SEU CÓDIGO ATUAL
// 🎓 EXPLICAÇÃO: Estas linhas garantem que seu código atual continue funcionando
// sem precisar alterar nada nos componentes
export const buscarAlunoPorEmail_OLD = buscarAlunoPorEmail;

// EXPORTS DE COMPATIBILIDADE (para não quebrar seu código atual)
export { buscarTodosAlunos as buscarTodosAlunos_CACHED };

// Funções para testes unitários
export function __setCacheAlunos(tenantId: string, alunos: Aluno[] | null) {
  assertTenantId(tenantId);
  if (!alunos) {
    cacheAlunosPorTenant.delete(tenantId);
    return;
  }

  cacheAlunosPorTenant.set(tenantId, {
    alunos,
    ultimaBusca: Date.now(),
  });
}

export function __setUltimaBusca(tenantId: string, ts: number) {
  assertTenantId(tenantId);
  const cache = cacheAlunosPorTenant.get(tenantId);
  if (cache) {
    cache.ultimaBusca = ts;
  }
}

export function __clearCacheDeTenant(tenantId: string) {
  assertTenantId(tenantId);
  cacheAlunosPorTenant.delete(tenantId);
}

export function __clearCacheCompleto() {
  cacheAlunosPorTenant.clear();
}
