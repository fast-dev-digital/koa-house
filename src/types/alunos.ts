export interface Aluno {
  id: string;

  nome: string;
  email: string;
  telefone: string;
  genero?: "Masculino" | "Feminino";

  plano: "Mensal" | "Trimestral" | "Semestral";
  valorMensalidade: number;
  status: "Ativo" | "Inativo" | "Suspenso";
  dataMatricula: string;
  dataFinalMatricula?: string;

  turmas?: string;
  turmasIds?: string[];
  horarios?: string;

  role?: "user" | "admin";
  authCreated?: boolean;
  authUid?: string;

  createdAt?: string;
  updatedAt?: string;
}
