import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

// ✅ INTERFACES EXPANDIDAS
interface Aluno {
  id: string;
  nome?: string;
  email?: string;
  turmas?: string;
  horarios?: string;
  plano?: string;
  telefone?: string;
  genero?: string;
  status?: string;
  dataMatricula?: string;
}

interface Turma {
  id: string;
  nome?: string;
  modalidade?: string;
  genero?: string;
  nivel?: string;
  dias?: string;
  horario?: string;
  professorNome?: string;
  capacidade?: number;
  alunosInscritos?: number;
  createdAt?: string;
}

// ✅ FUNÇÃO PARA EXPORTAR ALUNOS (MANTIDA COMPATÍVEL)
export const exportarAlunosCSV = async () => {
  try {
    console.log("🔄 Iniciando exportação dos alunos...");

    const alunosRef = collection(db, "Alunos");
    const snapshot = await getDocs(alunosRef);

    console.log(`📊 Encontrados ${snapshot.size} alunos`);

    if (snapshot.empty) {
      alert("⚠️ Nenhum aluno encontrado para exportar!");
      return;
    }

    const alunos: Aluno[] = [];
    snapshot.forEach((doc) => {
      alunos.push({
        id: doc.id,
        ...doc.data(),
      } as Aluno);
    });

    const csvContent = converterAlunosParaCSV(alunos);
    const nomeArquivo = gerarNomeArquivoComData("alunos");
    baixarCSV(csvContent, nomeArquivo);

    console.log("✅ Exportação de alunos concluída!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao exportar alunos:", error);
    alert("❌ Erro ao exportar dados. Verifique o console para mais detalhes.");
    throw error;
  }
};

// ✅ NOVA FUNÇÃO PARA EXPORTAR TURMAS
export const exportarTurmasCSV = async () => {
  try {
    console.log("🔄 Iniciando exportação das turmas...");

    const turmasRef = collection(db, "turmas");
    const snapshot = await getDocs(turmasRef);

    console.log(`📊 Encontradas ${snapshot.size} turmas`);

    if (snapshot.empty) {
      alert("⚠️ Nenhuma turma encontrada para exportar!");
      return;
    }

    const turmas: Turma[] = [];
    snapshot.forEach((doc) => {
      turmas.push({
        id: doc.id,
        ...doc.data(),
      } as Turma);
    });

    const csvContent = converterTurmasParaCSV(turmas);
    const nomeArquivo = gerarNomeArquivoComData("turmas");
    baixarCSV(csvContent, nomeArquivo);

    console.log("✅ Exportação de turmas concluída!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao exportar turmas:", error);
    alert("❌ Erro ao exportar dados. Verifique o console para mais detalhes.");
    throw error;
  }
};

// ✅ NOVA FUNÇÃO PARA EXPORTAR TURMAS COM FILTROS
export const exportarTurmasComFiltros = (
  turmas: Turma[],
  filtros?: {
    searchText?: string;
    modalidadeFilter?: string;
    generoFilter?: string;
    professorFilter?: string;
  }
) => {
  try {
    console.log("🔄 Exportando turmas com filtros aplicados...");

    let turmasFiltradas = [...turmas];

    // ✅ APLICAR FILTROS SE FORNECIDOS
    if (filtros) {
      turmasFiltradas = turmas.filter((turma) => {
        const matchSearch =
          !filtros.searchText ||
          (turma.nome || "")
            .toLowerCase()
            .includes(filtros.searchText.toLowerCase()) ||
          (turma.professorNome || "")
            .toLowerCase()
            .includes(filtros.searchText.toLowerCase()) ||
          (turma.modalidade || "")
            .toLowerCase()
            .includes(filtros.searchText.toLowerCase());

        const matchModalidade =
          !filtros.modalidadeFilter ||
          turma.modalidade === filtros.modalidadeFilter;

        const matchGenero =
          !filtros.generoFilter || turma.genero === filtros.generoFilter;

        const matchProfessor =
          !filtros.professorFilter ||
          turma.professorNome === filtros.professorFilter;

        return matchSearch && matchModalidade && matchGenero && matchProfessor;
      });
    }

    console.log(`📊 ${turmasFiltradas.length} turmas após filtros`);

    if (turmasFiltradas.length === 0) {
      alert("⚠️ Nenhuma turma encontrada com os filtros aplicados!");
      return;
    }

    const csvContent = converterTurmasParaCSV(turmasFiltradas);
    const nomeArquivo = gerarNomeArquivoComData("turmas_filtradas");
    baixarCSV(csvContent, nomeArquivo);

    console.log("✅ Exportação de turmas filtradas concluída!");
    return {
      sucesso: true,
      nomeArquivo,
      totalRegistros: turmasFiltradas.length,
    };
  } catch (error) {
    console.error("❌ Erro ao exportar turmas filtradas:", error);
    throw error;
  }
};

// ✅ FUNÇÃO PARA CONVERTER ALUNOS PARA CSV (ATUALIZADA)
const converterAlunosParaCSV = (alunos: Aluno[]): string => {
  if (alunos.length === 0) {
    return "Nenhum aluno encontrado";
  }

  // ✅ CABEÇALHO EXPANDIDO COM NOVOS CAMPOS
  const cabecalho = [
    "Nome",
    "Email",
    "Telefone",
    "Gênero",
    "Plano",
    "Status",
    "Turma",
    "Horário",
    "Data Matrícula",
  ].join(",");

  const linhas = alunos.map((aluno) => {
    return [
      `"${aluno.nome || ""}"`,
      `"${aluno.email || ""}"`,
      `"${aluno.telefone || ""}"`,
      `"${aluno.genero || ""}"`,
      `"${aluno.plano || ""}"`,
      `"${aluno.status || ""}"`,
      `"${aluno.turmas || ""}"`,
      `"${aluno.horarios || ""}"`,
      `"${aluno.dataMatricula || ""}"`,
    ].join(",");
  });

  return [cabecalho, ...linhas].join("\n");
};

// ✅ NOVA FUNÇÃO PARA CONVERTER TURMAS PARA CSV
const converterTurmasParaCSV = (turmas: Turma[]): string => {
  if (turmas.length === 0) {
    return "Nenhuma turma encontrada";
  }

  const cabecalho = [
    "Nome da Turma",
    "Modalidade",
    "Gênero",
    "Nível",
    "Dias",
    "Horário",
    "Professor",
    "Capacidade",
    "Alunos Inscritos",
    "Vagas Disponíveis",
    "Ocupação (%)",
    "Data Criação",
  ].join(",");

  const linhas = turmas.map((turma) => {
    const alunosInscritos = turma.alunosInscritos || 0;
    const capacidade = turma.capacidade || 0;
    const vagasDisponiveis = Math.max(0, capacidade - alunosInscritos);
    const ocupacao =
      capacidade > 0 ? Math.round((alunosInscritos / capacidade) * 100) : 0;
    const dataFormatada = turma.createdAt
      ? new Date(turma.createdAt).toLocaleDateString("pt-BR")
      : "";

    return [
      `"${turma.nome || ""}"`,
      `"${turma.modalidade || ""}"`,
      `"${turma.genero || ""}"`,
      `"${turma.nivel || ""}"`,
      `"${turma.dias || ""}"`,
      `"${turma.horario || ""}"`,
      `"${turma.professorNome || ""}"`,
      `"${capacidade}"`,
      `"${alunosInscritos}"`,
      `"${vagasDisponiveis}"`,
      `"${ocupacao}%"`,
      `"${dataFormatada}"`,
    ].join(",");
  });

  // ✅ ADICIONAR RESUMO NO FINAL
  const totalAlunos = turmas.reduce(
    (sum, turma) => sum + (turma.alunosInscritos || 0),
    0
  );
  const totalCapacidade = turmas.reduce(
    (sum, turma) => sum + (turma.capacidade || 0),
    0
  );
  const ocupacaoGeral =
    totalCapacidade > 0 ? Math.round((totalAlunos / totalCapacidade) * 100) : 0;

  const resumo = [
    "",
    `"=== RESUMO GERAL ==="`,
    `"Total de Turmas: ${turmas.length}"`,
    `"Capacidade Total: ${totalCapacidade}"`,
    `"Alunos Matriculados: ${totalAlunos}"`,
    `"Vagas Livres: ${totalCapacidade - totalAlunos}"`,
    `"Ocupação Geral: ${ocupacaoGeral}%"`,
  ].join("\n");

  return [cabecalho, ...linhas].join("\n") + "\n" + resumo;
};

// ✅ FUNÇÕES AUXILIARES (MANTIDAS IGUAIS)
const baixarCSV = (csvContent: string, nomeArquivo: string) => {
  const BOM = "\uFEFF";
  const csvComBOM = BOM + csvContent;

  const blob = new Blob([csvComBOM], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

export const gerarNomeArquivoComData = (prefixo: string = "dados"): string => {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR").replace(/\//g, "-");
  const hora = agora
    .toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/:/g, "-");
  return `${prefixo}_${data}_${hora}.csv`;
};
