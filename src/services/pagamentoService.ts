import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
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
        planoTipo: data.plano || "Mensal", // ✅ Corrigido: era 'plano', deveria ser 'planoTipo'
        mesReferencia: data.mesReferencia || "",
        dataVencimento:
          data.dataVencimento instanceof Timestamp
            ? data.dataVencimento.toDate() // ✅ Corrigido: retornar Date, não string
            : new Date(data.dataVencimento) || new Date(),
        dataPagamento:
          data.dataPagamento instanceof Timestamp
            ? data.dataPagamento.toDate() // ✅ Corrigido: retornar Date, não string
            : data.dataPagamento
            ? new Date(data.dataPagamento)
            : undefined,
        status: data.status || "Pendente",
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate() // ✅ Corrigido: retornar Date, não string
            : new Date(data.createdAt) || new Date(),
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate() // ✅ Corrigido: retornar Date, não string
            : new Date(data.updatedAt) || new Date(),
      });
    });

    console.log(`✅ ${pagamentos.length} pagamentos ativos encontrados`);
    return pagamentos;
  } catch (error) {
    console.error("❌ Erro ao buscar pagamentos ativos:", error);
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
