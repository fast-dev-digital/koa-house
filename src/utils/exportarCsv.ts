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
interface Professor {
  id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  status?: string;
  turmaIds?: string[];
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
// ...existing code...

// ✅ NOVA FUNÇÃO PARA EXPORTAR PROFESSORES (SEGUINDO O PADRÃO DOS ALUNOS)
export const exportarProfessoresCSV = async () => {
  try {
    console.log("🔄 Iniciando exportação dos professores...");

    const professoresRef = collection(db, "professores");
    const snapshot = await getDocs(professoresRef);

    console.log(`📊 Encontrados ${snapshot.size} professores`);

    if (snapshot.empty) {
      alert("⚠️ Nenhum professor encontrado para exportar!");
      return;
    }

    const professores: Professor[] = [];
    snapshot.forEach((doc) => {
      professores.push({
        id: doc.id,
        ...doc.data(),
      } as Professor);
    });

    const csvContent = converterProfessoresParaCSV(professores);
    const nomeArquivo = gerarNomeArquivoComData("professores");
    baixarCSV(csvContent, nomeArquivo);

    console.log("✅ Exportação de professores concluída!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao exportar professores:", error);
    alert("❌ Erro ao exportar dados. Verifique o console para mais detalhes.");
    throw error;
  }
};

// ✅ NOVA FUNÇÃO PARA EXPORTAR PROFESSORES COM FILTROS
export const exportarProfessoresComFiltros = (
  professores: Professor[],
  filtros?: {
    searchText?: string;
    statusFilter?: string;
    especialidadeFilter?: string;
  }
) => {
  try {
    console.log("🔄 Exportando professores com filtros aplicados...");

    let professoresFiltrados = [...professores];

    // ✅ APLICAR FILTROS SE FORNECIDOS
    if (filtros) {
      professoresFiltrados = professores.filter((professor) => {
        const matchSearch =
          !filtros.searchText ||
          (professor.nome || "")
            .toLowerCase()
            .includes(filtros.searchText.toLowerCase()) ||
          (professor.email || "")
            .toLowerCase()
            .includes(filtros.searchText.toLowerCase());

        const matchStatus =
          !filtros.statusFilter || professor.status === filtros.statusFilter;

        const matchEspecialidade =
          !filtros.especialidadeFilter ||
          professor.especialidade === filtros.especialidadeFilter;

        return matchSearch && matchStatus && matchEspecialidade;
      });
    }

    console.log(`📊 ${professoresFiltrados.length} professores após filtros`);

    if (professoresFiltrados.length === 0) {
      alert("⚠️ Nenhum professor encontrado com os filtros aplicados!");
      return;
    }

    const csvContent = converterProfessoresParaCSV(professoresFiltrados);
    const nomeArquivo = gerarNomeArquivoComData("professores_filtrados");
    baixarCSV(csvContent, nomeArquivo);

    console.log("✅ Exportação de professores filtrados concluída!");
    return {
      sucesso: true,
      nomeArquivo,
      totalRegistros: professoresFiltrados.length,
    };
  } catch (error) {
    console.error("❌ Erro ao exportar professores filtrados:", error);
    throw error;
  }
};

// ✅ FUNÇÃO PARA CONVERTER PROFESSORES PARA CSV
const converterProfessoresParaCSV = (professores: Professor[]): string => {
  if (professores.length === 0) {
    return "Nenhum professor encontrado";
  }

  // ✅ CABEÇALHO COM TODOS OS CAMPOS RELEVANTES
  const cabecalho = [
    "Nome",
    "Email",
    "Telefone",
    "Especialidade",
    "Status",
    "Quantidade de Turmas",
    "Turmas (IDs)",
    "Data Cadastro",
  ].join(",");

  const linhas = professores.map((professor) => {
    const quantidadeTurmas = professor.turmaIds?.length || 0;
    const turmasIds = professor.turmaIds?.join("; ") || "";

    return [
      `"${professor.nome || ""}"`,
      `"${professor.email || ""}"`,
      `"${professor.telefone || ""}"`,
      `"${professor.especialidade || ""}"`,
      `"${professor.status || ""}"`,
      `"${quantidadeTurmas}"`,
      `"${turmasIds}"`,
    ].join(",");
  });

  // ✅ ADICIONAR RESUMO NO FINAL
  const totalProfessores = professores.length;
  const professoresAtivos = professores.filter(
    (p) => p.status === "Ativo"
  ).length;
  const professoresInativos = professores.filter(
    (p) => p.status === "Inativo"
  ).length;
  const totalTurmas = professores.reduce(
    (sum, prof) => sum + (prof.turmaIds?.length || 0),
    0
  );
  const futevolei = professores.filter(
    (p) => p.especialidade === "Futevôlei"
  ).length;
  const beachTennis = professores.filter(
    (p) => p.especialidade === "Beach Tennis"
  ).length;

  const resumo = [
    "",
    `"=== RESUMO GERAL ==="`,
    `"Total de Professores: ${totalProfessores}"`,
    `"Professores Ativos: ${professoresAtivos}"`,
    `"Professores Inativos: ${professoresInativos}"`,
    `"Total de Turmas Atribuídas: ${totalTurmas}"`,
    `"Especialidade Futevôlei: ${futevolei}"`,
    `"Especialidade Beach Tennis: ${beachTennis}"`,
    `"Média de Turmas por Professor: ${
      totalProfessores > 0 ? (totalTurmas / totalProfessores).toFixed(1) : 0
    }"`,
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
