import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";

// ✅ INTERFACES
interface AlunoData {
  id: string;
  nome: string;
  plano: string;
  valorMensalidade: number;
  status: string;
  dataMatricula?: string;
}

interface PagamentoExistente {
  id: string;
  alunoId: string;
  alunoNome: string;
  dataVencimento: Date;
  valor: number;
}

// ✅ FUNÇÃO 1 - Gerar primeiro pagamento para aluno novo
export async function gerarPagamentoParaAluno(
  alunoData: AlunoData
): Promise<void> {
  try {
    if (alunoData.status !== "ativo") {
      console.log(
        `⏸️ Aluno ${alunoData.nome} não está ativo, não gerando pagamento`
      );
      return;
    }

    const pagamentosExistentes = await getDocs(
      query(
        collection(db, "pagamentos"),
        where("alunoId", "==", alunoData.id),
        where("status", "in", ["Pendente", "Pago"])
      )
    );

    if (!pagamentosExistentes.empty) {
      console.log(`⏸️ Aluno ${alunoData.nome} já possui pagamento ativo`);
      return;
    }

    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const diaVencimento = 5;
    let dataVencimento = new Date(hoje);

    if (diaHoje <= 5) {
      dataVencimento.setDate(5);
    } else {
      dataVencimento.setDate(20);
    }

    const mesReferencia = dataVencimento.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });

    console.log(`📅 Gerando primeiro pagamento para ${alunoData.nome}:`);
    console.log(`   • Plano: ${alunoData.plano}`);
    console.log(`   • Cadastrado dia: ${diaHoje}`);
    console.log(
      `   • Próximo vencimento: ${dataVencimento.toLocaleDateString("pt-BR")}`
    );
    console.log(`   • Valor: R$ ${alunoData.valorMensalidade.toFixed(2)}`);

    await addDoc(collection(db, "pagamentos"), {
      alunoId: alunoData.id,
      alunoNome: alunoData.nome,
      valor: alunoData.valorMensalidade,
      planoTipo: alunoData.plano,
      mesReferencia,
      dataVencimento: Timestamp.fromDate(dataVencimento),
      status: "Pendente",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Primeiro pagamento gerado para ${alunoData.nome}`);
  } catch (error) {
    console.error("❌ Erro ao gerar pagamento:", error);
    throw error;
  }
}

// ✅ FUNÇÃO 2 - Gerar próximo pagamento
export async function gerarProximoPagamento(
  pagamentoAtual: PagamentoExistente
): Promise<void> {
  try {
    const pagamentosExistentes = await getDocs(
      query(
        collection(db, "pagamentos"),
        where("alunoId", "==", pagamentoAtual.alunoId),
        where("status", "==", "Pendente")
      )
    );

    if (!pagamentosExistentes.empty) {
      console.log(
        `⏸️ ${pagamentoAtual.alunoNome} já possui pagamento pendente`
      );
      return;
    }

    const alunoDoc = await getDoc(doc(db, "Alunos", pagamentoAtual.alunoId));
    if (!alunoDoc.exists()) {
      throw new Error("Aluno não encontrado");
    }

    const aluno = alunoDoc.data();
    if (aluno.status !== "ativo") {
      console.log(`⏸️ Aluno ${aluno.nome} não está mais ativo`);
      return;
    }

    const proximoVencimento = new Date(pagamentoAtual.dataVencimento);
    proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);

    const mesReferencia = proximoVencimento.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });

    await addDoc(collection(db, "pagamentos"), {
      alunoId: pagamentoAtual.alunoId,
      alunoNome: pagamentoAtual.alunoNome,
      valor: aluno.valorMensalidade || pagamentoAtual.valor,
      planoTipo: aluno.plano || "Mensal",
      mesReferencia,
      dataVencimento: Timestamp.fromDate(proximoVencimento),
      status: "Pendente",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(
      `✅ Próximo pagamento gerado para ${
        aluno.nome
      } - Vencimento: ${proximoVencimento.toLocaleDateString("pt-BR")}`
    );
  } catch (error) {
    console.error("❌ Erro ao gerar próximo pagamento:", error);
    throw error;
  }
}

// ✅ FUNÇÃO 3 - CORRIGIDA com tipagem adequada
export async function arquivarPagamentosMesAtual(): Promise<{
  arquivados: number;
  gerados: number;
  erro?: string;
}> {
  try {
    console.log("🔍 Iniciando fechamento do mês atual...");

    const hoje = new Date();
    const mesReferenciaAtual = hoje.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });

    console.log(`📅 Fechando mês: ${mesReferenciaAtual}`);

    const pagamentosQuery = query(
      collection(db, "pagamentos"),
      where("mesReferencia", "==", mesReferenciaAtual)
    );

    const pagamentosSnapshot = await getDocs(pagamentosQuery);

    if (pagamentosSnapshot.empty) {
      console.log(
        `⚠️ Nenhum pagamento encontrado para o mês ${mesReferenciaAtual}`
      );
      return {
        arquivados: 0,
        gerados: 0,
        erro: `Nenhum pagamento do mês ${mesReferenciaAtual} encontrado`,
      };
    }

    console.log(
      `📊 Encontrados ${pagamentosSnapshot.size} pagamento(s) do mês atual`
    );

    // ✅ CORREÇÃO: Tipagem explícita dos arrays
    const pagamentosParaArquivar: any[] = [];
    const pagamentosPendentesParaProximo: PagamentoExistente[] = [];

    pagamentosSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      if (data.status !== "Arquivado") {
        const pagamento = {
          id: docSnapshot.id,
          ref: docSnapshot.ref,
          ...data,
        };

        pagamentosParaArquivar.push(pagamento);

        if (data.status === "Pendente") {
          pagamentosPendentesParaProximo.push({
            id: docSnapshot.id,
            alunoId: data.alunoId,
            alunoNome: data.alunoNome,
            dataVencimento: data.dataVencimento?.toDate() || new Date(),
            valor: data.valor,
          });
        }
      }
    });

    console.log(
      `📊 ${pagamentosParaArquivar.length} pagamento(s) para arquivar`
    );
    console.log(
      `📊 ${pagamentosPendentesParaProximo.length} pagamento(s) pendente(s) precisam de próximo`
    );

    if (pagamentosParaArquivar.length > 0) {
      const batch = writeBatch(db);

      pagamentosParaArquivar.forEach((pagamento) => {
        batch.update(pagamento.ref, {
          status: "Arquivado",
          arquivadoEm: Timestamp.now(),
          updatedAt: Timestamp.now(),
          statusAnterior: pagamento.status,
        });
      });

      await batch.commit();
      console.log(
        `✅ ${pagamentosParaArquivar.length} pagamento(s) arquivados com sucesso`
      );
    }

    let novosGerados = 0;

    for (const pagamentoPendente of pagamentosPendentesParaProximo) {
      try {
        await gerarProximoPagamento(pagamentoPendente);
        novosGerados++;
        console.log(
          `✅ Próximo pagamento gerado para: ${pagamentoPendente.alunoNome}`
        );
      } catch (error) {
        console.error(
          `❌ Erro ao gerar próximo para ${pagamentoPendente.alunoNome}:`,
          error
        );
      }
    }

    console.log(`🎉 Fechamento concluído:`);
    console.log(`   • ${pagamentosParaArquivar.length} pagamentos arquivados`);
    console.log(`   • ${novosGerados} novos pagamentos gerados`);

    return {
      arquivados: pagamentosParaArquivar.length,
      gerados: novosGerados,
    };
  } catch (error: any) {
    console.error("❌ Erro crítico ao fechar mês:", error);
    return {
      arquivados: 0,
      gerados: 0,
      erro: `Erro crítico: ${error?.message || "Erro desconhecido"}`,
    };
  }
}
