import type { AlunoComPagamentos } from "../services/integracaoService";

export type { AlunoComPagamentos };

export interface Pagamento {
  id?: string;
  alunoId: string; // Referência ao aluno
  alunoNome: string; // Nome para facilitar exibição
  valor: number; // Valor do plano
  mesReferencia: string; // "2025-01" (ano-mês)
  dataVencimento: Date; // Calculada pela regra dia 5
  dataPagamento?: Date; // Quando foi pago
  status: "Pendente" | "Pago" | "Atrasado" | "Arquivado";
  planoTipo: string; // Tipo do plano (ex: "Mensal", "Trimestral")
  createdAt?: Date;
  updatedAt?: Date;
  arquivadoEm?: Date;
  dataFinalMatricula?: Date;
}

export interface DadosEditaveisAluno {
  plano: string;
  valorMensalidade: number;
  telefone: string;
  dataFinalMatricula?: Date;
}

export interface EditarAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: AlunoComPagamentos;
  onSave: (dados: DadosEditaveisAluno) => Promise<void>;
}
