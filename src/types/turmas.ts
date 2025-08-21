export interface Turma {
  id?: string;
  nome: string;
  modalidade: "Futevôlei" | "Beach Tennis";
  genero: "Masculino" | "Feminino" | "Teens";
  nivel: "Estreante" | "Iniciante" | "Intermediário";
  dias: string;
  horario: string;
  professorId: string;
  status: "Ativa" | "Inativa";
  professorNome: string;
  capacidade: number;
  alunosInscritos: number;
  createdAt: Date;
  updatedAt: Date;
}
