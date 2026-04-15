export interface Quadra {
  id?: string;
  tenantId?: string;
  nome: string;
  numero: number;
  localizacao: string; // Ex: "Bloco A", "Área Externa"
  tipo: "Descoberta" | "Coberta";
  tamanho: string; // Ex: "20x40m"
  superficie: "Terra" | "Saibra" | "Concreto" | "PVC";
  iluminacao: "Sim" | "Não";
  ativa: boolean;
  cor: string; // Ex: "blue.100", "green.100", "yellow.100", "orange.100"
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}
