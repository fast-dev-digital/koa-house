import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Aluno } from "../types/alunos";

// 📦 SISTEMA DE CACHE GLOBAL
let cacheAlunos: Aluno[] | null = null; // 💾 Armazena alunos na memória
let ultimaBusca: number = 0; // ⏰ Timestamp da última busca
const TEMPO_CACHE = 5 * 60 * 1000; // 🕐 5 minutos em milissegundos

// 🎓 EXPLICAÇÃO: Essas variáveis ficam fora da classe para serem globais
// Assim, independente de quantas vezes chamemos as funções,
// o cache persiste durante toda a sessão do usuário

// 🔥 FUNÇÃO 1: BUSCAR TODOS OS ALUNOS (COM CACHE INTELIGENTE)
export async function buscarTodosAlunos(): Promise<Aluno[]> {
  const agora = Date.now(); // ⏰ Pega timestamp atual

  // ✅ VERIFICA SE CACHE É VÁLIDO (existe + não expirou)
  if (cacheAlunos && agora - ultimaBusca < TEMPO_CACHE) {
    console.log("📦 Cache válido! Retornando alunos salvos (RÁPIDO)");
    return cacheAlunos; // 🚀 RETORNO INSTANTÂNEO!
  }

  // 🔥 CACHE EXPIROU OU NÃO EXISTE - BUSCAR NO FIREBASE
  console.log("🔥 Buscando alunos no Firebase... (pode demorar)");

  try {
    // 🗂️ REFERÊNCIA À COLEÇÃO "Alunos" no Firebase
    const alunosRef = collection(db, "Alunos");

    // 📖 EXECUTA A BUSCA (operação assíncrona)
    const snapshot = await getDocs(alunosRef);

    // 🔄 CONVERTE DOCUMENTOS FIREBASE PARA ARRAY DE ALUNOS
    const alunos: Aluno[] = [];
    snapshot.forEach((documento) => {
      const dadosDoDocumento = documento.data();
      alunos.push({
        id: documento.id, // 🆔 ID único do Firebase
        ...dadosDoDocumento, // 📝 Spread: copia todos os campos
      } as Aluno);
    });

    // 💾 ATUALIZA O CACHE PARA PRÓXIMAS CHAMADAS
    cacheAlunos = alunos;
    ultimaBusca = agora;

    console.log(
      `✅ ${alunos.length} alunos carregados e cachados com sucesso!`
    );
    return alunos;
  } catch (error) {
    console.error("❌ Erro ao buscar alunos no Firebase:", error);
    throw new Error(`Falha ao carregar alunos: ${error}`);
  }
}

// 🔍 FUNÇÃO 2: BUSCAR ALUNO POR EMAIL (USA CACHE)
export function buscarAlunoPorEmail(email: string): Aluno | null {
  // 🎓 EXPLICAÇÃO: Esta função é SÍNCRONA (sem await)
  // porque usa apenas o cache em memória, não acessa Firebase

  if (!cacheAlunos) {
    console.warn("⚠️ Cache vazio! Execute buscarTodosAlunos() primeiro");
    return null;
  }

  // 🔍 BUSCA NO ARRAY EM MEMÓRIA (SUPER RÁPIDO)
  const alunoEncontrado = cacheAlunos.find(
    (aluno) => aluno.email.toLowerCase() === email.toLowerCase()
  );

  // 🎓 EXPLICAÇÃO DO .find():
  // Percorre o array e retorna o PRIMEIRO elemento que satisfaz a condição
  // Se não encontrar nada, retorna undefined

  if (alunoEncontrado) {
    console.log(`👤 Aluno encontrado no cache: ${alunoEncontrado.nome}`);
  } else {
    console.log(`🔍 Aluno com email "${email}" não encontrado`);
  }

  return alunoEncontrado || null;
}

// ➕ FUNÇÃO 3: CRIAR NOVO ALUNO
export async function criarAluno(
  dadosAluno: Omit<Aluno, "id">
): Promise<string> {
  // 🎓 EXPLICAÇÃO DO Omit<Aluno, "id">:
  // "Pegue o tipo Aluno mas REMOVA o campo 'id'"
  // Isso porque o Firebase gera o ID automaticamente

  try {
    console.log("➕ Criando novo aluno...");

    // 📝 ADICIONA TIMESTAMPS AUTOMÁTICOS
    const alunoCompleto = {
      ...dadosAluno, // 📋 Dados informados
      createdAt: new Date().toISOString(), // 📅 Data criação
      updatedAt: new Date().toISOString(), // 📅 Data atualização
    };

    // 🔥 SALVA NO FIREBASE
    const docRef = await addDoc(collection(db, "Alunos"), alunoCompleto);

    // 🧹 INVALIDA O CACHE (força nova busca na próxima vez)
    limparCache();
    console.log("🧹 Cache invalidado - próxima busca será atualizada");

    console.log(`✅ Aluno criado com ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao criar aluno:", error);
    throw new Error(`Falha ao criar aluno: ${error}`);
  }
}

// ✏️ FUNÇÃO 4: ATUALIZAR ALUNO EXISTENTE
export async function atualizarAluno(
  id: string,
  dadosAtualizacao: Partial<Aluno>
): Promise<void> {
  // 🎓 EXPLICAÇÃO DO Partial<Aluno>:
  // "Todos os campos de Aluno são OPCIONAIS"
  // Assim podemos atualizar só nome, ou só email, etc.

  try {
    console.log(`✏️ Atualizando aluno ID: ${id}`);

    // 📄 REFERÊNCIA AO DOCUMENTO ESPECÍFICO
    const docRef = doc(db, "Alunos", id);

    // 📝 ADICIONA TIMESTAMP DE ATUALIZAÇÃO
    const dadosCompletos = {
      ...dadosAtualizacao, // 📋 Campos a atualizar
      updatedAt: new Date().toISOString(), // ⏰ Marca quando foi atualizado
    };

    // 🔥 ATUALIZA NO FIREBASE
    await updateDoc(docRef, dadosCompletos);

    // 🧹 INVALIDA CACHE
    limparCache();
    console.log("✅ Aluno atualizado e cache invalidado");
  } catch (error) {
    console.error("❌ Erro ao atualizar aluno:", error);
    throw new Error(`Falha ao atualizar aluno: ${error}`);
  }
}

// 🗑️ FUNÇÃO 5: DELETAR ALUNO
export async function deletarAluno(id: string): Promise<void> {
  try {
    console.log(`🗑️ Deletando aluno ID: ${id}`);

    // 📄 REFERÊNCIA AO DOCUMENTO
    const docRef = doc(db, "Alunos", id);

    // 🔥 REMOVE DO FIREBASE
    await deleteDoc(docRef);

    // 🧹 INVALIDA CACHE
    limparCache();
    console.log("✅ Aluno deletado e cache invalidado");
  } catch (error) {
    console.error("❌ Erro ao deletar aluno:", error);
    throw new Error(`Falha ao deletar aluno: ${error}`);
  }
}

// 🔍 FUNÇÃO 6: BUSCAR ALUNOS POR TURMA (USA CACHE)
export function buscarAlunosPorTurma(turma: string): Aluno[] {
  if (!cacheAlunos) {
    console.warn("⚠️ Cache vazio! Execute buscarTodosAlunos() primeiro");
    return [];
  }

  // 🔍 FILTRA ARRAY EM MEMÓRIA
  const alunosDaTurma = cacheAlunos.filter((aluno) => aluno.turmas === turma);

  // 🎓 EXPLICAÇÃO DO .filter():
  // Percorre o array e retorna um NOVO ARRAY com elementos que satisfazem a condição
  // Diferente do .find() que retorna apenas 1 elemento

  console.log(
    `👥 Encontrados ${alunosDaTurma.length} alunos na turma "${turma}"`
  );
  return alunosDaTurma;
}

// 📊 FUNÇÃO 7: BUSCAR ALUNOS ATIVOS (USA CACHE)
export function buscarAlunosAtivos(): Aluno[] {
  if (!cacheAlunos) {
    console.warn("⚠️ Cache vazio! Execute buscarTodosAlunos() primeiro");
    return [];
  }

  const alunosAtivos = cacheAlunos.filter((aluno) => aluno.status === "Ativo");

  console.log(`✅ ${alunosAtivos.length} alunos ativos encontrados`);
  return alunosAtivos;
}

// 🧹 FUNÇÃO AUXILIAR: LIMPAR CACHE
function limparCache(): void {
  // 🎓 EXPLICAÇÃO: Esta função é PRIVADA (não exportada)
  // Só pode ser usada dentro deste arquivo

  cacheAlunos = null; // 🗑️ Remove dados da memória
  ultimaBusca = 0; // ⏰ Zera timestamp

  console.log("🧹 Cache limpo - próxima busca será no Firebase");
}

// 📊 FUNÇÃO 8: ESTATÍSTICAS RÁPIDAS (USA CACHE)
export function obterEstatisticasAlunos() {
  if (!cacheAlunos) {
    return {
      total: 0,
      ativos: 0,
      inativos: 0,
      suspensos: 0,
    };
  }

  // 🔢 CONTA DIFERENTES STATUS
  const stats = {
    total: cacheAlunos.length,
    ativos: cacheAlunos.filter((a) => a.status === "Ativo").length,
    inativos: cacheAlunos.filter((a) => a.status === "Inativo").length,
    suspensos: cacheAlunos.filter((a) => a.status === "Suspenso").length,
  };

  console.log("📊 Estatísticas calculadas:", stats);
  return stats;
}

// 🔄 FUNÇÃO 9: FORÇAR REFRESH DO CACHE
export async function recarregarCache(): Promise<Aluno[]> {
  console.log("🔄 Forçando atualização do cache...");

  // 🧹 LIMPA CACHE ATUAL
  limparCache();

  // 🔥 BUSCA NOVAMENTE (vai direto pro Firebase)
  return await buscarTodosAlunos();
}

// 📝 FUNÇÃO 10: VERIFICAR SE CACHE ESTÁ VÁLIDO
export function cacheEstaValido(): boolean {
  if (!cacheAlunos) return false;

  const agora = Date.now();
  const cacheValido = agora - ultimaBusca < TEMPO_CACHE;

  console.log(`🔍 Cache ${cacheValido ? "VÁLIDO" : "EXPIRADO"}`);
  return cacheValido;
}

// 🔄 MANTÉM COMPATIBILIDADE COM SEU CÓDIGO ATUAL
// 🎓 EXPLICAÇÃO: Estas linhas garantem que seu código atual continue funcionando
// sem precisar alterar nada nos componentes
export const buscarAlunoPorEmail_OLD = buscarAlunoPorEmail;

// EXPORTS DE COMPATIBILIDADE (para não quebrar seu código atual)
export { buscarTodosAlunos as buscarTodosAlunos_CACHED };
