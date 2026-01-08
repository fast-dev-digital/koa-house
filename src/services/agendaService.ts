// src/services/agendaService.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Reserva, Quadra } from "../types/agenda";
import type { Turma } from "../types/turmas";

// ==================== QUADRAS ====================

export async function buscarQuadras(): Promise<Quadra[]> {
  const snapshot = await getDocs(
    query(collection(db, "quadras"), orderBy("numero"))
  );
  const quadras = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Quadra)
  );
  return quadras;
}

export async function criarQuadra(quadra: Omit<Quadra, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "quadras"), quadra);
  return docRef.id;
}

export async function atualizarQuadra(
  id: string,
  quadra: Partial<Quadra>
): Promise<void> {
  const { id: _, ...resto } = quadra;
  await updateDoc(doc(db, "quadras", id), resto);
}

export async function excluirQuadra(id: string): Promise<void> {
  await deleteDoc(doc(db, "quadras", id));
}

// ==================== RESERVAS ====================

export async function buscarReservasPorData(data: Date): Promise<Reserva[]> {
  // Cria data em UTC para garantir consistência
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const dia = data.getDate();

  const inicioDia = new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
  const fimDia = new Date(Date.UTC(ano, mes, dia, 23, 59, 59, 999));

  const snapshot = await getDocs(
    query(
      collection(db, "reservas"),
      where("data", ">=", Timestamp.fromDate(inicioDia)),
      where("data", "<=", Timestamp.fromDate(fimDia)),
      orderBy("data") // ← Removido orderBy("horarioInicio")
    )
  );

  // Ordena manualmente no código
  const reservas = snapshot.docs.map((doc) => {
    const data = doc.data();
    const reserva = {
      id: doc.id,
      ...data,
      data: data.data?.toDate ? data.data.toDate() : new Date(data.data),
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate()
        : new Date(data.updatedAt),
    } as Reserva;

    return reserva;
  });

  // Ordena por horarioInicio manualmente
  return reservas.sort((a, b) =>
    a.horarioInicio.localeCompare(b.horarioInicio)
  );
}

export async function criarReserva(
  reserva: Omit<Reserva, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const agora = Timestamp.now();

  // Normaliza a data para UTC 12:00 para evitar problemas de timezone
  const dataOriginal =
    reserva.data instanceof Date ? reserva.data : reserva.data.toDate();
  const dataUTC = new Date(
    Date.UTC(
      dataOriginal.getFullYear(),
      dataOriginal.getMonth(),
      dataOriginal.getDate(),
      12,
      0,
      0,
      0
    )
  );

  const docRef = await addDoc(collection(db, "reservas"), {
    ...reserva,
    data: Timestamp.fromDate(dataUTC),
    createdAt: agora,
    updatedAt: agora,
  });
  return docRef.id;
}

export async function atualizarReserva(
  id: string,
  reserva: Partial<Reserva>
): Promise<void> {
  const { id: _, createdAt, ...resto } = reserva;
  await updateDoc(doc(db, "reservas", id), {
    ...resto,
    ...(resto.data && {
      data: Timestamp.fromDate(
        resto.data instanceof Date ? resto.data : resto.data.toDate()
      ),
    }),
    updatedAt: Timestamp.now(),
  });
}

export async function excluirReserva(id: string): Promise<void> {
  await deleteDoc(doc(db, "reservas", id));
}

// ==================== HELPERS ====================

export function gerarSlotsHorarios(
  inicio: number = 6,
  fim: number = 23
): { inicio: string; fim: string; label: string }[] {
  const slots = [];
  for (let h = inicio; h < fim; h++) {
    const horaInicio = h.toString().padStart(2, "0");
    const horaFim = (h + 1).toString().padStart(2, "0");
    slots.push({
      inicio: `${horaInicio}:00`,
      fim: `${horaFim}:00`,
      label: `${horaInicio}:00`,
    });
  }
  return slots;
}

export function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatarDataCurta(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ==================== RESERVAS MENSAIS ====================

/**
 * Cria reservas mensais para dias específicos da semana
 * @param dadosReserva - Dados base da reserva
 * @param dataReferencia - Data de referência (mês que será usado)
 * @param diasSemana - Array com números dos dias da semana (0=Dom, 1=Seg, ..., 6=Sáb)
 * @returns Número total de reservas criadas
 */
export async function criarReservaMensal(
  dadosReserva: Omit<Reserva, "id" | "createdAt" | "updatedAt" | "data">,
  dataReferencia: Date,
  diasSemana: number[]
): Promise<number> {
  const ano = dataReferencia.getFullYear();
  const mes = dataReferencia.getMonth();

  // Primeiro e último dia do mês
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  let reservasCriadas = 0;

  // Itera por todos os dias do mês
  for (
    let dia = new Date(primeiroDia);
    dia <= ultimoDia;
    dia.setDate(dia.getDate() + 1)
  ) {
    const diaSemana = dia.getDay();

    // Se este dia da semana está selecionado, cria a reserva
    if (diasSemana.includes(diaSemana)) {
      try {
        // Verifica se já existe reserva neste horário
        const reservasExistentes = await buscarReservasPorData(dia);
        const jaExiste = reservasExistentes.some(
          (r) =>
            r.quadraId === dadosReserva.quadraId &&
            r.horarioInicio === dadosReserva.horarioInicio &&
            r.horarioFim === dadosReserva.horarioFim
        );

        if (!jaExiste) {
          await criarReserva({
            ...dadosReserva,
            data: new Date(dia),
          });
          reservasCriadas++;
        }
      } catch (error) {
        // Ignora erros silenciosamente
      }
    }
  }

  return reservasCriadas;
}
