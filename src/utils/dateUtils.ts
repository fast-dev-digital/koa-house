// Funções utilitárias para manipulação de datas relacionadas às matrículas

export function calcularDataFinalMatricula(
  dataMatricula: string,
  plano: string
): string {
  if (!dataMatricula || !plano) return "";

  try {
    const dataInicio = new Date(dataMatricula);
    let dataFinal = new Date(dataInicio);

    switch (plano) {
      case "Mensal":
        dataFinal.setMonth(dataFinal.getMonth() + 1);
        break;
      case "Trimestral":
        dataFinal.setMonth(dataFinal.getMonth() + 3);
        break;
      case "Semestral":
        dataFinal.setMonth(dataFinal.getMonth() + 6);
        break;
      default:
        return "";
    }

    return dataFinal.toISOString().split("T")[0];
  } catch (error) {
    console.error("Erro ao calcular data final:", error);
    return "";
  }
}

export function formatarDataBR(data: string): string {
  if (!data) return "Não informado";
  try {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  } catch {
    return data;
  }
}

export function verificarStatusVencimento(dataFinal: string): string {
  if (!dataFinal) return "";

  const hoje = new Date();
  const dataVencimento = new Date(dataFinal);
  const diasRestantes = Math.ceil(
    (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes < 0) return "text-red-600"; // Vencido
  if (diasRestantes <= 7) return "text-orange-600"; // Vence em 7 dias
  return "text-green-600"; // Normal
}

export function obterDiasRestantes(dataFinal: string): number | null {
  if (!dataFinal) return null;

  const hoje = new Date();
  const dataVencimento = new Date(dataFinal);
  return Math.ceil(
    (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// Verifica se o plano deve mostrar data final (apenas Trimestral e Semestral)
export function planoTemDataFinal(plano: string): boolean {
  return plano === "Trimestral" || plano === "Semestral";
}

// Converte data do formato YYYY-MM-DD para formato de input (YYYY-MM-DD)
export function formatarDataParaInput(data: string): string {
  if (!data) return "";
  // Se já está no formato correto, retorna
  if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return data;
  }
  // Se está no formato DD/MM/YYYY, converte
  if (data.includes("/")) {
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }
  return data;
}
