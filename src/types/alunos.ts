// ...existing code...
export interface Aluno {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
  dataMatricula: Date;
  turmas: string;
  horarios: string;
  plano: "Mensal" | "Trimestral" | "Semestral";
  valorMensalidade?: number; // Novo campo
  status: "Ativo" | "Inativo" | "Suspenso";
  createdAt?: string;
  updatedAt?: string;
}
