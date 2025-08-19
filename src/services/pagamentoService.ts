import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Pagamento } from "../types/pagamentos";

// Buscar pagamentos ativos (não arquivados)
export async function buscarPagamentosAtivos(): Promise<Pagamento[]> {
  try {
    const pagamentosRef = collection(db, "pagamentos");
    const q = query(pagamentosRef, where("status", "in", ["Pendente", "Pago"]));
    const snapshot = await getDocs(q);

    const pagamentos: Pagamento[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      pagamentos.push({
        id: docSnap.id,
        alunoId: data.alunoId || "",
        alunoNome: data.alunoNome || "",
        valor: data.valor || 0,
        plano: data.plano || "Mensal",
        mesReferencia: data.mesReferencia || "",
        dataVencimento:
          data.dataVencimento instanceof Timestamp
            ? data.dataVencimento.toDate().toLocaleDateString("pt-BR")
            : data.dataVencimento || "",
        dataPagamento:
          data.dataPagamento instanceof Timestamp
            ? data.dataPagamento.toDate().toLocaleDateString("pt-BR")
            : data.dataPagamento || undefined,
        status: data.status || "Pendente",
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toLocaleDateString("pt-BR")
            : data.createdAt || "",
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toLocaleDateString("pt-BR")
            : data.updatedAt || "",
      } as Pagamento);
    });

    console.log(`✅ ${pagamentos.length} pagamentos ativos encontrados`);
    return pagamentos;
  } catch (error) {
    console.error("❌ Erro ao buscar pagamentos ativos:", error);
    throw error;
  }
}

// Buscar pagamentos de um aluno específico (todos, incluindo arquivados)
export async function buscarPagamentosPorAluno(
  alunoId: string
): Promise<Pagamento[]> {
  try {
    const pagamentosRef = collection(db, "pagamentos");
    const q = query(pagamentosRef, where("alunoId", "==", alunoId));
    const snapshot = await getDocs(q);

    const pagamentos: Pagamento[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      pagamentos.push({
        id: docSnap.id,
        alunoId: data.alunoId || "",
        alunoNome: data.alunoNome || "",
        valor: data.valor || 0,
        plano: data.plano || "Mensal",
        mesReferencia: data.mesReferencia || "",
        dataVencimento:
          data.dataVencimento instanceof Timestamp
            ? data.dataVencimento.toDate().toLocaleDateString("pt-BR")
            : data.dataVencimento || "",
        dataPagamento:
          data.dataPagamento instanceof Timestamp
            ? data.dataPagamento.toDate().toLocaleDateString("pt-BR")
            : data.dataPagamento || undefined,
        status: data.status || "Pendente",
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toLocaleDateString("pt-BR")
            : data.createdAt || "",
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toLocaleDateString("pt-BR")
            : data.updatedAt || "",
      } as Pagamento);
    });

    // Ordenar por data de criação
    return pagamentos.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      const dateA = new Date(a.createdAt.split("/").reverse().join("-"));
      const dateB = new Date(b.createdAt.split("/").reverse().join("-"));
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("❌ Erro ao buscar pagamentos do aluno:", error);
    throw error;
  }
}

// Marcar pagamento como pago
export async function marcarPagamentoComoPago(
  pagamentoId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, "pagamentos", pagamentoId), {
      status: "Pago",
      dataPagamento: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("✅ Pagamento marcado como pago");
  } catch (error) {
    console.error("❌ Erro ao marcar pagamento como pago:", error);
    throw error;
  }
}

// Arquivar pagamentos do mês
export async function arquivarPagamentosDoMes(
  mesReferencia: string
): Promise<void> {
  try {
    const pagamentosRef = collection(db, "pagamentos");
    const q = query(
      pagamentosRef,
      where("mesReferencia", "==", mesReferencia),
      where("status", "in", ["Pago", "Pendente"])
    );
    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map((docSnap) =>
      updateDoc(doc(db, "pagamentos", docSnap.id), {
        status: "Arquivado",
        updatedAt: Timestamp.now(),
      })
    );

    await Promise.all(updatePromises);
    console.log(
      `✅ ${snapshot.docs.length} pagamentos arquivados do mês ${mesReferencia}`
    );
  } catch (error) {
    console.error("❌ Erro ao arquivar pagamentos:", error);
    throw error;
  }
}
