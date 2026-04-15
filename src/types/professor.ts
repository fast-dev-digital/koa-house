export interface Professor {
  id: string;
  tenantId?: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: "Futevôlei" | "Beach Tennis" | "Vôlei";
  status: "Ativo" | "Inativo";
  turmaIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
