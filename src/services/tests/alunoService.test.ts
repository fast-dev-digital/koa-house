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

beforeEach(() => {
  __setCacheAlunos(mockAlunos);
  __setUltimaBusca(Date.now());
});

describe("buscarAlunoPorEmail", () => {
  it("retorna aluno correto pelo email", () => {
    const aluno = buscarAlunoPorEmail("joao@email.com");
    expect(aluno?.nome).toBe("João");
  });

  it("retorna null se email não existe", () => {
    const aluno = buscarAlunoPorEmail("naoexiste@email.com");
    expect(aluno).toBeNull();
  });
});

describe("buscarAlunosPorTurma", () => {
  it("retorna alunos da turma correta", () => {
    const alunos = buscarAlunosPorTurma("A");
    expect(alunos.length).toBe(2);
    expect(alunos[0].nome).toBe("João");
    expect(alunos[1].nome).toBe("Pedro");
  });

  it("retorna array vazio se turma não existe", () => {
    const alunos = buscarAlunosPorTurma("Z");
    expect(alunos.length).toBe(0);
  });
});

describe("buscarAlunosAtivos", () => {
  it("retorna apenas alunos ativos", () => {
    const ativos = buscarAlunosAtivos();
    expect(ativos.length).toBe(2);
    expect(ativos.every((a) => a.status === "Ativo")).toBe(true);
  });
});

describe("obterEstatisticasAlunos", () => {
  it("retorna estatísticas corretas", () => {
    const stats = obterEstatisticasAlunos();
    expect(stats.total).toBe(3);
    expect(stats.ativos).toBe(2);
    expect(stats.inativos).toBe(1);
  });

  it("retorna estatísticas zeradas se cache vazio", () => {
    __setCacheAlunos(null);
    const stats = obterEstatisticasAlunos();
    expect(stats.total).toBe(0);
    expect(stats.ativos).toBe(0);
    expect(stats.inativos).toBe(0);
  });
});

describe("cacheEstaValido", () => {
  it("retorna true se cache está válido", () => {
    __setCacheAlunos(mockAlunos);
    __setUltimaBusca(Date.now());
    expect(cacheEstaValido()).toBe(true);
  });

  it("retorna false se cache está vazio", () => {
    __setCacheAlunos(null);
    expect(cacheEstaValido()).toBe(false);
  });

  it("retorna false se cache expirou", () => {
    __setCacheAlunos(mockAlunos);
    __setUltimaBusca(Date.now() - 10 * 60 * 1000); // 10 minutos atrás
    expect(cacheEstaValido()).toBe(false);
  });
});
