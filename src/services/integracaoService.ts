import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../firebase-config";

export async function gerarPagamentoParaAluno(alunoData: {
  id: string;
  nome: string;
  plano: string;
  valorMensalidade: number; // Valor que o admin definiu
  status: string;
  dataMatricula?: string;
}): Promise<void> {
  try {
    // Só gera pagamento se aluno estiver ativo
    if (alunoData.status !== "ativo") {
      console.log(
        `⏸️ Aluno ${alunoData.nome} não está ativo, não gerando pagamento`
      );
      return;
    }

    const hoje = new Date();
    const diaHoje = hoje.getDate();

    // 🎯 LÓGICA DO DIA DE VENCIMENTO
    // Se cadastrado antes do dia 5 → vencimento dia 5
    // Se cadastrado após o dia 5 → vencimento dia 20
    const diaVencimento = diaHoje <= 5 ? 5 : 20;

    // 🎯 LÓGICA DOS MESES BASEADA NO PLANO (SÓ INTERVALO)
    let mesesParaProximoPagamento = 1;

    switch (alunoData.plano.toLowerCase()) {
      case "Mensal":
        mesesParaProximoPagamento = 1; // Próximo pagamento daqui 1 mês
        break;
      case "Trimestral":
        mesesParaProximoPagamento = 3; // Próximo pagamento daqui 3 meses
        break;
      case "Semestral":
        mesesParaProximoPagamento = 6; // Próximo pagamento daqui 6 meses
        break;
      default:
        console.warn(
          `⚠️ Plano não reconhecido: ${alunoData.plano}, usando mensal`
        );
        mesesParaProximoPagamento = 1;
    }

    // 🎯 CALCULAR DATA DE VENCIMENTO
    let dataVencimento = new Date(hoje);

    // Se já passou do dia de vencimento neste mês, vai para o próximo período
    if (diaHoje > diaVencimento) {
      dataVencimento.setMonth(
        dataVencimento.getMonth() + mesesParaProximoPagamento
      );
    }

    // Definir o dia correto
    dataVencimento.setDate(diaVencimento);

    // 🎯 CALCULAR MÊS DE REFERÊNCIA
    const mesReferencia = `${dataVencimento.getFullYear()}-${String(
      dataVencimento.getMonth() + 1
    ).padStart(2, "0")}`;

    // 🎯 VALOR É SEMPRE O QUE O ADMIN DEFINIU (SEM MULTIPLICAÇÃO)
    const valorPagamento = alunoData.valorMensalidade;

    console.log(`📅 Gerando pagamento para ${alunoData.nome}:`);
    console.log(`   • Plano: ${alunoData.plano}`);
    console.log(`   • Cadastrado dia: ${diaHoje}`);
    console.log(`   • Dia de vencimento: ${diaVencimento}`);
    console.log(
      `   • Próximo vencimento: ${dataVencimento.toLocaleDateString("pt-BR")}`
    );
    console.log(
      `   • Valor: R$ ${valorPagamento.toFixed(2)} (definido pelo admin)`
    );
    console.log(
      `   • Próximo pagamento em: ${mesesParaProximoPagamento} meses`
    );

    // 🎯 CRIAR PAGAMENTO NO FIREBASE
    await addDoc(collection(db, "pagamentos"), {
      alunoId: alunoData.id,
      alunoNome: alunoData.nome,
      valor: valorPagamento, // Valor exato que admin definiu
      plano: alunoData.plano,
      mesReferencia,
      dataVencimento: Timestamp.fromDate(dataVencimento),
      status: "Pendente",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // 🎯 CAMPOS EXTRAS PARA CONTROLE
      diaVencimentoPadrao: diaVencimento, // Para futuros pagamentos
      mesesIntervalo: mesesParaProximoPagamento, // Para renovações automáticas
    });

    console.log(
      `✅ Pagamento gerado para ${alunoData.nome} - R$ ${valorPagamento.toFixed(
        2
      )} - Vence: ${dataVencimento.toLocaleDateString("pt-BR")}`
    );
  } catch (error) {
    console.error("❌ Erro ao gerar pagamento:", error);
    throw error;
  }
}
