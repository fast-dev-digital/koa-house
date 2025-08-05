// Interfaces para tipagem segura dos dados do dashboard
export interface AlunoLogado {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  plano: string;
  turmaId?: string; // ID da turma que o aluno está matriculado
  dataMatricula: string;
  // Campos financeiros (simulados por enquanto)
  statusPagamento?: 'em-dia' | 'pendente' | 'atrasado';
  proximoVencimento?: string;
  valorMensalidade?: string;
}

export interface TurmaDashboard {
    id: string;
    nome: string;
    modalidade: string;
    professorNome: string;
    dias: string; 
    horario: string;
    status: 'ativa' | 'inativa';
}
