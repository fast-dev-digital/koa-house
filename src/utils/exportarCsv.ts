import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import type { Pagamento } from "../types/pagamentos";

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

    const alunosRef = collection(db, "Alunos");
    const snapshot = await getDocs(alunosRef);


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

    const turmasRef = collection(db, "turmas");
    const snapshot = await getDocs(turmasRef);


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


    if (turmasFiltradas.length === 0) {
      alert("⚠️ Nenhuma turma encontrada com os filtros aplicados!");
      return;
    }

    const csvContent = converterTurmasParaCSV(turmasFiltradas);
    const nomeArquivo = gerarNomeArquivoComData("turmas_filtradas");
    baixarCSV(csvContent, nomeArquivo);

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

    const professoresRef = collection(db, "professores");
    const snapshot = await getDocs(professoresRef);


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


    if (professoresFiltrados.length === 0) {
      alert("⚠️ Nenhum professor encontrado com os filtros aplicados!");
      return;
    }

    const csvContent = converterProfessoresParaCSV(professoresFiltrados);
    const nomeArquivo = gerarNomeArquivoComData("professores_filtrados");
    baixarCSV(csvContent, nomeArquivo);

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

export const exportarPagamentosCSV = async () => {
  try {

    const pagamentosRef = collection(db, "pagamentos");
    const snapshot = await getDocs(pagamentosRef);


    if (snapshot.empty) {
      alert("⚠️ Nenhum pagamento encontrado para exportar!");
      return;
    }

    const pagamentos: Pagamento[] = [];
    snapshot.forEach((doc) => {
      pagamentos.push({
        id: doc.id,
        ...doc.data(),
      } as Pagamento);
    });

    const csvContent = converterPagamentosParaCSV(pagamentos);
    const nomeArquivo = gerarNomeArquivoComData("pagamentos");
    baixarCSV(csvContent, nomeArquivo);

    return true;
  } catch (error) {
    console.error("❌ Erro ao exportar pagamentos:", error);
    alert("❌ Erro ao exportar dados. Verifique o console para mais detalhes.");
    throw error;
  }
};

// ✅ NOVA FUNÇÃO PARA EXPORTAR PAGAMENTOS COM FILTROS
export const exportarPagamentosComFiltros = (
  pagamentos: Pagamento[],
  filtros?: {
    searchText?: string;
    statusFilter?: string;
    planoFilter?: string;
  }
) => {
  try {

    let pagamentosFiltrados = [...pagamentos];

    // ✅ APLICAR FILTROS SE FORNECIDOS
    if (filtros) {
      pagamentosFiltrados = pagamentos.filter((pagamento) => {
        const matchSearch =
          !filtros.searchText ||
          (pagamento.alunoNome || "")
            .toLowerCase()
            .includes(filtros.searchText.toLowerCase()) ||
          (pagamento.mesReferencia || "")
            .toLowerCase()
            .includes(filtros.searchText.toLowerCase());

        const matchStatus =
          !filtros.statusFilter || pagamento.status === filtros.statusFilter;

        const matchPlano =
          !filtros.planoFilter || pagamento.planoTipo === filtros.planoFilter;

        return matchSearch && matchStatus && matchPlano;
      });
    }

    (`📊 ${pagamentosFiltrados.length} pagamentos após filtros`);

    if (pagamentosFiltrados.length === 0) {
      alert("⚠️ Nenhum pagamento encontrado com os filtros aplicados!");
      return;
    }

    const csvContent = converterPagamentosParaCSV(pagamentosFiltrados);
    const nomeArquivo = gerarNomeArquivoComData("pagamentos_filtrados");
    baixarCSV(csvContent, nomeArquivo);

    ("✅ Exportação de pagamentos filtrados concluída!");
    return {
      sucesso: true,
      nomeArquivo,
      totalRegistros: pagamentosFiltrados.length,
    };
  } catch (error) {
    console.error("❌ Erro ao exportar pagamentos filtrados:", error);
    throw error;
  }
};

// ✅ FUNÇÃO PARA CONVERTER PAGAMENTOS PARA CSV
const converterPagamentosParaCSV = (pagamentos: Pagamento[]): string => {
  if (pagamentos.length === 0) {
    return "Nenhum pagamento encontrado";
  }

  // ✅ CABEÇALHO COM TODOS OS CAMPOS RELEVANTES
  const cabecalho = [
    "Aluno",
    "Plano",
    "Mês Referência",
    "Valor",
    "Data Vencimento",
    "Status",
    "Data Pagamento",
    "Dias em Atraso",
    "Situação",
    "Data Criação",
  ].join(",");

  const hoje = new Date();

  const linhas = pagamentos.map((pagamento) => {
    const dataVencimento = pagamento.dataVencimento
      ? new Date(pagamento.dataVencimento)
      : null;

    const dataPagamento = pagamento.dataPagamento
      ? new Date(pagamento.dataPagamento).toLocaleDateString("pt-BR")
      : "";

    const dataVencimentoFormatada = dataVencimento
      ? dataVencimento.toLocaleDateString("pt-BR")
      : "";

    // Calcular dias em atraso
    let diasAtraso = 0;
    let situacao = pagamento.status || "";

    if (pagamento.status === "Pendente" && dataVencimento) {
      const diffTime = hoje.getTime() - dataVencimento.getTime();
      diasAtraso = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      if (diasAtraso > 0) {
        situacao = "Atrasado";
      }
    } else if (pagamento.status === "Pago") {
      situacao = "Pago";
    }

    const dataFormatada = pagamento.createdAt
      ? new Date(pagamento.createdAt).toLocaleDateString("pt-BR")
      : "";

    return [
      `"${pagamento.alunoNome || ""}"`,
      `"${pagamento.planoTipo || ""}"`,
      `"${pagamento.mesReferencia || ""}"`,
      `"${pagamento.valor || 0}"`,
      `"${dataVencimentoFormatada}"`,
      `"${pagamento.status || ""}"`,
      `"${dataPagamento}"`,
      `"${diasAtraso > 0 ? diasAtraso : ""}"`,
      `"${situacao}"`,
      `"${dataFormatada}"`,
    ].join(",");
  });

  // ✅ ADICIONAR RESUMO FINANCEIRO NO FINAL
  const totalPagamentos = pagamentos.length;
  const pagamentosPagos = pagamentos.filter((p) => p.status === "Pago");
  const pagamentosPendentes = pagamentos.filter((p) => p.status === "Pendente");

  const valorTotal = pagamentos.reduce((sum, p) => sum + (p.valor || 0), 0);
  const valorPago = pagamentosPagos.reduce((sum, p) => sum + (p.valor || 0), 0);
  const valorPendente = pagamentosPendentes.reduce(
    (sum, p) => sum + (p.valor || 0),
    0
  );

  // Calcular pagamentos em atraso
  const pagamentosAtrasados = pagamentos.filter((p) => {
    if (p.status !== "Pendente" || !p.dataVencimento) return false;
    const vencimento = new Date(p.dataVencimento);
    return vencimento < hoje;
  });

  const valorAtrasado = pagamentosAtrasados.reduce(
    (sum, p) => sum + (p.valor || 0),
    0
  );

  const resumo = [
    "",
    `"=== RESUMO FINANCEIRO ==="`,
    `"Total de Pagamentos: ${totalPagamentos}"`,
    `"Valor Total: R$ ${valorTotal.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}"`,
    `"Pagamentos Realizados: ${pagamentosPagos.length}"`,
    `"Valor Recebido: R$ ${valorPago.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}"`,
    `"Pagamentos Pendentes: ${pagamentosPendentes.length}"`,
    `"Valor a Receber: R$ ${valorPendente.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}"`,
    `"Pagamentos em Atraso: ${pagamentosAtrasados.length}"`,
    `"Valor em Atraso: R$ ${valorAtrasado.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}"`,
    `"Taxa de Recebimento: ${
      totalPagamentos > 0
        ? ((pagamentosPagos.length / totalPagamentos) * 100).toFixed(1)
        : 0
    }%"`,
  ].join("\n");

  return [cabecalho, ...linhas].join("\n") + "\n" + resumo;
};
