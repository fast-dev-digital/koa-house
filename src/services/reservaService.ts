import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";

const assertTenantId = (tenantId: string) => {
  if (!tenantId?.trim()) {
    throw new Error("Tenant ID é obrigatório");
  }
};

export async function criarReservaMensal(
  tenantId: string,
  alunoId: string,
  alunoNome: string,
  dataInicio: Date,
  dataFim: Date,
): Promise<void> {
  assertTenantId(tenantId);

  try {
    const reservasRef = collection(db, `tenants/${tenantId}/reservas`);
    const q = query(
      reservasRef,
      where("alunoId", "==", alunoId),
      where("status", "==", "ativa"),
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const reserva = docSnap.data();
      const reservaInicio = reserva.dataInicio.toDate();
      const reservaFim = reserva.dataFim.toDate();

      if (
        (dataInicio >= reservaInicio && dataInicio <= reservaFim) ||
        (dataFim >= reservaInicio && dataFim <= reservaFim) ||
        (dataInicio <= reservaInicio && dataFim >= reservaFim)
      ) {
        throw new Error("Você já possui uma reserva ativa neste período");
      }
    }

    const reservaData = {
      tenantId,
      alunoId,
      alunoNome,
      dataInicio,
      dataFim,
      tipoLocacao: "mensal",
      status: "ativa",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDoc(reservasRef, reservaData);

    const diasReservados = [];
    const dataAtual = new Date(dataInicio);

    while (dataAtual <= dataFim) {
      diasReservados.push(new Date(dataAtual));
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    const batch = [];
    const agendaRef = collection(db, `tenants/${tenantId}/agenda`);
    for (const dia of diasReservados) {
      batch.push(
        addDoc(agendaRef, {
          tenantId,
          alunoId,
          alunoNome,
          data: Timestamp.fromDate(dia),
          tipo: "locacao_mensal",
          status: "reservado",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    await Promise.all(batch);
  } catch (error) {
    console.error("Erro ao criar reserva mensal:", error);
    throw error;
  }
}
