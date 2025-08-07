export interface Professor {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: "Futevôlei" | "Beach Tennis";
  status: "Ativo" | "Inativo";
  turmaIds: string[];
}
