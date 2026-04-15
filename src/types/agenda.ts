// src/types/agenda.ts
import { Timestamp } from "firebase/firestore";

export interface Reserva {
  id?: string;
  tenantId?: string;
  quadraId: string;
  quadraNome: string;
  data: Date | Timestamp;
  horarioInicio: string; // "18:00"
  horarioFim: string; // "19:00"

  // OPCIONAIS - Pode ter ou não
  turmaNome?: string; // Nome da turma (se for aula de turma)
  professorNome?: string; // Nome do professor (se tiver)
  alunos?: string[]; // Array de nomes digitados manualmente
  tipo: "aula" | "experimental" | "livre" | "personal";
  status: "confirmada" | "pendente" | "cancelada";
  observacoes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface SlotHorario {
  inicio: string;
  fim: string;
  label: string;
}
