jest.mock("../../firebase-config", () => ({
  db: {},
}));

import {
  buscarAlunoPorEmail,
  buscarAlunosPorTurma,
  buscarAlunosAtivos,
  obterEstatisticasAlunos,
  cacheEstaValido,
  __setCacheAlunos,
  __setUltimaBusca,
  __clearCacheCompleto,
} from "../alunoService";

import type { Aluno } from "../../types/alunos";

const mockAlunos: Aluno[] = [
  {
    id: "1",
    nome: "João",
    email: "joao@email.com",
    status: "Ativo",
    turmas: "A",
    telefone: "11999999999",
    plano: "Mensal", // <-- valor literal permitido
    valorMensalidade: 100,
    dataMatricula: "2025-01-01",
  },
  {
    id: "2",
    nome: "Maria",
    email: "maria@email.com",
    status: "Inativo",
    turmas: "B",
    telefone: "11988888888",
    plano: "Mensal",
    valorMensalidade: 100,
    dataMatricula: "2025-01-01",
  },
  {
    id: "3",
    nome: "Pedro",
    email: "pedro@email.com",
    status: "Ativo",
    turmas: "A",
    telefone: "11977777777",
    plano: "Trimestral", // <-- valor literal permitido
    valorMensalidade: 100,
    dataMatricula: "2025-01-01",
  },
];

const TENANT_TESTE = "tenant_teste";

beforeEach(() => {
  __clearCacheCompleto();
  __setCacheAlunos(TENANT_TESTE, mockAlunos);
  __setUltimaBusca(TENANT_TESTE, Date.now());
});

describe("buscarAlunoPorEmail", () => {
  it("retorna aluno correto pelo email", () => {
    const aluno = buscarAlunoPorEmail(TENANT_TESTE, "joao@email.com");
    expect(aluno?.nome).toBe("João");
  });

  it("retorna null se email não existe", () => {
    const aluno = buscarAlunoPorEmail(TENANT_TESTE, "naoexiste@email.com");
    expect(aluno).toBeNull();
  });
});

describe("buscarAlunosPorTurma", () => {
  it("retorna alunos da turma correta", () => {
    const alunos = buscarAlunosPorTurma(TENANT_TESTE, "A");
    expect(alunos.length).toBe(2);
    expect(alunos[0].nome).toBe("João");
    expect(alunos[1].nome).toBe("Pedro");
  });

  it("retorna array vazio se turma não existe", () => {
    const alunos = buscarAlunosPorTurma(TENANT_TESTE, "Z");
    expect(alunos.length).toBe(0);
  });
});

describe("buscarAlunosAtivos", () => {
  it("retorna apenas alunos ativos", () => {
    const ativos = buscarAlunosAtivos(TENANT_TESTE);
    expect(ativos.length).toBe(2);
    expect(ativos.every((a) => a.status === "Ativo")).toBe(true);
  });
});

describe("obterEstatisticasAlunos", () => {
  it("retorna estatísticas corretas", () => {
    const stats = obterEstatisticasAlunos(TENANT_TESTE);
    expect(stats.total).toBe(3);
    expect(stats.ativos).toBe(2);
    expect(stats.inativos).toBe(1);
  });

  it("retorna estatísticas zeradas se cache vazio", () => {
    __setCacheAlunos(TENANT_TESTE, null);
    const stats = obterEstatisticasAlunos(TENANT_TESTE);
    expect(stats.total).toBe(0);
    expect(stats.ativos).toBe(0);
    expect(stats.inativos).toBe(0);
  });
});

describe("cacheEstaValido", () => {
  it("retorna true se cache está válido", () => {
    __setCacheAlunos(TENANT_TESTE, mockAlunos);
    __setUltimaBusca(TENANT_TESTE, Date.now());
    expect(cacheEstaValido(TENANT_TESTE)).toBe(true);
  });

  it("retorna false se cache está vazio", () => {
    __setCacheAlunos(TENANT_TESTE, null);
    expect(cacheEstaValido(TENANT_TESTE)).toBe(false);
  });

  it("retorna false se cache expirou", () => {
    __setCacheAlunos(TENANT_TESTE, mockAlunos);
    __setUltimaBusca(TENANT_TESTE, Date.now() - 10 * 60 * 1000); // 10 minutos atrás
    expect(cacheEstaValido(TENANT_TESTE)).toBe(false);
  });
});
