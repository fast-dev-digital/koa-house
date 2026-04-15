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
import type { Reserva } from "../types/agenda";

const assertTenantId = (tenantId: string) => {
  if (!tenantId?.trim()) {
    throw new Error("Tenant ID é obrigatório");
  }
};

const getReservasRef = (tenantId: string) => {
  assertTenantId(tenantId);
  return collection(db, `tenants/${tenantId}/reservas`);
};

const getAgendaRef = (tenantId: string) => {
  assertTenantId(tenantId);
  return collection(db, `tenants/${tenantId}/agenda`);
};

const getReservaDocRef = (tenantId: string, id: string) => {
  assertTenantId(tenantId);
  if (!id?.trim()) {
    throw new Error("ID da reserva é obrigatório");
  }

  return doc(db, `tenants/${tenantId}/reservas`, id);
};

const converterDataUTC = (data: Date | Timestamp): Date => {
  const dataOriginal = data instanceof Date ? data : data.toDate();
  return new Date(
    Date.UTC(
      dataOriginal.getFullYear(),
      dataOriginal.getMonth(),
      dataOriginal.getDate(),
      12,
      0,
      0,
      0,
    ),
  );
};

const mapReservaDoc = (docSnap: any, tenantId: string): Reserva => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    tenantId,
    quadraId: data.quadraId,
    quadraNome: data.quadraNome,
    data: data.data?.toDate ? data.data.toDate() : new Date(data.data),
    horarioInicio: data.horarioInicio,
    horarioFim: data.horarioFim,
    turmaNome: data.turmaNome,
    professorNome: data.professorNome,
    alunos: data.alunos || [],
    tipo: data.tipo,
    status: data.status,
    observacoes: data.observacoes,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt),
  };
};

// ==================== RESERVAS ====================

export async function buscarReservasPorData(
  tenantId: string,
  data: Date,
): Promise<Reserva[]> {
  assertTenantId(tenantId);

  const ano = data.getFullYear();
  const mes = data.getMonth();
  const dia = data.getDate();

  const inicioDia = new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
  const fimDia = new Date(Date.UTC(ano, mes, dia, 23, 59, 59, 999));

  const snapshot = await getDocs(
    query(
      getReservasRef(tenantId),
      where("data", ">=", Timestamp.fromDate(inicioDia)),
      where("data", "<=", Timestamp.fromDate(fimDia)),
      orderBy("data"),
    ),
  );

  const reservas = snapshot.docs.map((docSnap) =>
    mapReservaDoc(docSnap, tenantId),
  );

  return reservas.sort((a, b) =>
    a.horarioInicio.localeCompare(b.horarioInicio),
  );
}

export async function criarReserva(
  tenantId: string,
  reserva: Omit<Reserva, "id" | "createdAt" | "updatedAt" | "tenantId">,
): Promise<string> {
  assertTenantId(tenantId);
  const agora = Timestamp.now();
  const dataUTC = converterDataUTC(reserva.data);

  const docRef = await addDoc(getReservasRef(tenantId), {
    ...reserva,
    tenantId,
    data: Timestamp.fromDate(dataUTC),
    createdAt: agora,
    updatedAt: agora,
  });

  return docRef.id;
}

export async function atualizarReserva(
  tenantId: string,
  id: string,
  reserva: Partial<Reserva>,
): Promise<void> {
  assertTenantId(tenantId);
  const { id: _, createdAt, ...resto } = reserva;
  await updateDoc(getReservaDocRef(tenantId, id), {
    ...resto,
    tenantId,
    ...(resto.data && {
      data: Timestamp.fromDate(converterDataUTC(resto.data)),
    }),
    updatedAt: Timestamp.now(),
  });
}

export async function excluirReserva(
  tenantId: string,
  id: string,
): Promise<void> {
  assertTenantId(tenantId);
  await deleteDoc(getReservaDocRef(tenantId, id));
}

// ==================== HELPERS ====================

export function gerarSlotsHorarios(
  inicio: number = 6,
  fim: number = 23,
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

export async function criarReservaMensal(
  tenantId: string,
  dadosReserva: Omit<
    Reserva,
    "id" | "createdAt" | "updatedAt" | "tenantId" | "data"
  >,
  dataInicial: Date,
  dataFinal: Date,
  diasSemana: number[],
): Promise<number> {
  assertTenantId(tenantId);
  let reservasCriadas = 0;

  for (
    let dia = new Date(dataInicial);
    dia <= dataFinal;
    dia.setDate(dia.getDate() + 1)
  ) {
    const diaSemana = dia.getDay();

    if (diasSemana.includes(diaSemana)) {
      try {
        const reservasExistentes = await buscarReservasPorData(tenantId, dia);
        const jaExiste = reservasExistentes.some(
          (r) =>
            r.quadraId === dadosReserva.quadraId &&
            r.horarioInicio === dadosReserva.horarioInicio &&
            r.horarioFim === dadosReserva.horarioFim,
        );

        if (!jaExiste) {
          await criarReserva(tenantId, {
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

export { getAgendaRef };
