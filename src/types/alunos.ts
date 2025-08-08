export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
  plano: string;
  status: "ativo" | "inativo" | "suspenso";
  turmas: "Seg-Qua" | "Ter-Qui";
  horarios: "18:00" | "19:00" | "20:00" | "21:00";
  dataMatricula: string;
  turmasIds: string[];
}
