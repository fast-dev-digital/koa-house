import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

interface ReservaData {
  alunoId: string;
  alunoNome: string;
  dataInicio: Date;
  dataFim: Date;
  tipoLocacao: "mensal";
  status: "ativa" | "pendente" | "cancelada";
  createdAt: Date;
}

export async function criarReservaMensal(
  alunoId: string,
  alunoNome: string,
  dataInicio: Date,
  dataFim: Date,
): Promise<void> {
  try {
    // Verificar se já existe reserva neste período
    const reservasRef = collection(db, "reservas");
    const q = query(
      reservasRef,
      where("alunoId", "==", alunoId),
      where("status", "==", "ativa"),
    );

    const snapshot = await getDocs(q);

    // Verificar conflitos de data
    for (const doc of snapshot.docs) {
      const reserva = doc.data();
      const reservaInicio = reserva.dataInicio.toDate();
      const reservaFim = reserva.dataFim.toDate();

      // Verificar sobreposição de datas
      if (
        (dataInicio >= reservaInicio && dataInicio <= reservaFim) ||
        (dataFim >= reservaInicio && dataFim <= reservaFim) ||
        (dataInicio <= reservaInicio && dataFim >= reservaFim)
      ) {
        throw new Error("Você já possui uma reserva ativa neste período");
      }
    }

    // Criar a reserva mensal
    const reservaData: ReservaData = {
      alunoId,
      alunoNome,
      dataInicio,
      dataFim,
      tipoLocacao: "mensal",
      status: "ativa",
      createdAt: new Date(),
    };

    await addDoc(collection(db, "reservas"), reservaData);

    // Opcional: Criar entradas individuais para cada dia
    const diasReservados = [];
    const dataAtual = new Date(dataInicio);

    while (dataAtual <= dataFim) {
      diasReservados.push(new Date(dataAtual));
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // Salvar dias individuais (útil para controle diário)
    const batch = [];
    for (const dia of diasReservados) {
      batch.push(
        addDoc(collection(db, "agenda"), {
          alunoId,
          alunoNome,
          data: dia,
          tipo: "locacao_mensal",
          status: "reservado",
          createdAt: new Date(),
        }),
      );
    }

    await Promise.all(batch);
  } catch (error) {
    console.error("Erro ao criar reserva mensal:", error);
    throw error;
  }
}
