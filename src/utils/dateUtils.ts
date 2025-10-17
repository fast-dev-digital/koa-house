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

  try {
    // Normalizar as datas para evitar problemas de timezone
    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth();
    const diaHoje = hoje.getDate();

    // Criar data de hoje normalizada
    const dataHojeNormalizada = new Date(anoHoje, mesHoje, diaHoje);

    // Parse da data de vencimento
    const [ano, mes, dia] = dataFinal.split("-").map(Number);
    const dataVencimentoNormalizada = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11

    const diasRestantes = Math.ceil(
      (dataVencimentoNormalizada.getTime() - dataHojeNormalizada.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diasRestantes < 0) return "text-red-600"; // Vencido
    if (diasRestantes <= 7) return "text-orange-600"; // Vence em 7 dias
    return "text-green-600"; // Normal
  } catch (error) {
    return "text-gray-600"; // Cor neutra em caso de erro
  }
}

export function obterDiasRestantes(dataFinal: string): number | null {
  if (!dataFinal) return null;

  try {
    // Normalizar as datas para evitar problemas de timezone
    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth();
    const diaHoje = hoje.getDate();

    // Criar data de hoje normalizada
    const dataHojeNormalizada = new Date(anoHoje, mesHoje, diaHoje);

    // Parse da data de vencimento
    const [ano, mes, dia] = dataFinal.split("-").map(Number);
    const dataVencimentoNormalizada = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11

    return Math.ceil(
      (dataVencimentoNormalizada.getTime() - dataHojeNormalizada.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  } catch (error) {
    return null;
  }
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
