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

  console.log(
    `🔍 Buscando reservas entre ${inicioDia.toISOString()} e ${fimDia.toISOString()}`
  );

  const snapshot = await getDocs(
    query(
      collection(db, "reservas"),
      where("data", ">=", Timestamp.fromDate(inicioDia)),
      where("data", "<=", Timestamp.fromDate(fimDia)),
      orderBy("data") // ← Removido orderBy("horarioInicio")
    )
  );

  console.log(`📦 Documentos encontrados: ${snapshot.docs.length}`);

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

    console.log(
      `  📅 Reserva: ${reserva.turmaNome || reserva.tipo} - ${
        reserva.horarioInicio
      } - Quadra: ${reserva.quadraNome}`
    );
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

// ==================== SINCRONIZAÇÃO DE AULAS ====================

/**
 * Busca todas as turmas ativas do sistema
 */
export async function buscarTurmasAtivas(): Promise<Turma[]> {
  const snapshot = await getDocs(
    query(collection(db, "turmas"), where("status", "==", "Ativa"))
  );
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Turma)
  );
}

/**
 * Converte string de dias (ex: "Seg, Qua, Sex" ou "Ter-Qui") em array de números (1, 3, 5)
 */
function converterDiasParaNumeros(diasString: string): number[] {
  const mapaDias: { [key: string]: number } = {
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sáb: 6,
    sab: 6,
  };

  // Substitui hífen por vírgula para tratar "Ter-Qui" como "Ter, Qui"
  return diasString
    .toLowerCase()
    .replace(/-/g, ",") // Substitui todos os hífens por vírgulas
    .split(",")
    .map((d) => d.trim())
    .map((d) => mapaDias[d])
    .filter((n) => n !== undefined);
}

/**
 * Extrai horário de início de uma string e normaliza para formato HH:00
 * Ex: "18h - 19h" => "18:00", "18:00 - 19:00" => "18:00"
 */
function extrairHorarioInicio(horarioString: string): string {
  const inicio = horarioString.split("-")[0].trim();
  // Converte "18h" para "18:00" ou mantém "18:00"
  return inicio.replace("h", ":00").replace(/:00:00$/, ":00");
}

/**
 * Extrai horário de fim de uma string e normaliza para formato HH:00
 * Ex: "18h - 19h" => "19:00", "18:00 - 19:00" => "19:00"
 */
function extrairHorarioFim(horarioString: string): string {
  const fim = horarioString.split("-")[1]?.trim() || "";
  // Converte "19h" para "19:00" ou mantém "19:00"
  return fim.replace("h", ":00").replace(/:00:00$/, ":00");
}

/**
 * Define qual quadra usar baseado no professor e dias da turma
 */
function obterQuadraParaProfessor(
  professorNome: string,
  dias: string,
  quadras: Quadra[]
): Quadra | null {
  const nomeNormalizado = professorNome.toLowerCase().trim();

  // Christian: Quadra 1 (Seg-Qua e Ter-Qui)
  if (nomeNormalizado.includes("christian")) {
    return quadras.find((q) => q.numero === 1) || null;
  }

  // Leonardo Assis e Clebinho: Quadra 2 (Seg-Qua)
  if (
    (nomeNormalizado.includes("leonardo") &&
      nomeNormalizado.includes("assis")) ||
    nomeNormalizado.includes("clebinho")
  ) {
    if (
      dias.toLowerCase().includes("seg") ||
      dias.toLowerCase().includes("qua")
    ) {
      return quadras.find((q) => q.numero === 2) || null;
    }
  }

  // Victor Benatti: Quadra 2 (Ter-Qui)
  if (
    nomeNormalizado.includes("victor") ||
    nomeNormalizado.includes("benatti")
  ) {
    if (
      dias.toLowerCase().includes("ter") ||
      dias.toLowerCase().includes("qui")
    ) {
      return quadras.find((q) => q.numero === 2) || null;
    }
  }

  // Kleber Augusto: Quadra 3 (Seg-Qui)
  if (
    nomeNormalizado.includes("kleber") ||
    nomeNormalizado.includes("augusto")
  ) {
    return quadras.find((q) => q.numero === 3) || null;
  }

  // Leonardo Mello: Quadra 4
  if (
    nomeNormalizado.includes("leonardo") &&
    nomeNormalizado.includes("mello")
  ) {
    return quadras.find((q) => q.numero === 4) || null;
  }

  // Se não encontrar, retorna a primeira quadra disponível
  return quadras[0] || null;
}

/**
 * Sincroniza as aulas das turmas na agenda para uma semana específica
 */
export async function sincronizarAulasSemana(
  dataInicio: Date
): Promise<number> {
  const turmas = await buscarTurmasAtivas();
  console.log("🔍 Turmas encontradas:", turmas.length);

  if (turmas.length === 0) {
    console.warn("⚠️ Nenhuma turma ativa encontrada");
    return 0;
  }

  // Busca as quadras uma vez só
  const quadras = await buscarQuadras();
  console.log("🏐 Quadras disponíveis:", quadras.length);

  if (quadras.length === 0) {
    console.warn("⚠️ Nenhuma quadra disponível");
    return 0;
  }

  let aulasAdicionadas = 0;

  // Define o início e fim da semana
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + 6); // 7 dias

  console.log(
    "📅 Sincronizando de",
    dataInicio.toLocaleDateString(),
    "até",
    dataFim.toLocaleDateString()
  );

  // Para cada dia da semana
  for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
    const diaSemana = d.getDay(); // 0=Dom, 1=Seg, 2=Ter, etc

    // Para cada turma
    for (const turma of turmas) {
      // Converte os dias da turma para números
      const diasTurma = converterDiasParaNumeros(turma.dias || "");

      console.log(
        `📋 Turma "${turma.nome}" - Professor: "${turma.professorNome}" - Dias: "${turma.dias}" -> [${diasTurma}], Dia atual: ${diaSemana}`
      );

      // Verifica se a turma tem aula neste dia
      if (diasTurma.includes(diaSemana)) {
        // Obtém a quadra correta baseada no professor e dias
        const quadra = obterQuadraParaProfessor(
          turma.professorNome || "",
          turma.dias || "",
          quadras
        );

        if (!quadra) {
          console.warn(`⚠️ Quadra não encontrada para ${turma.professorNome}`);
          continue;
        }

        const horarioInicio = extrairHorarioInicio(turma.horario);
        const horarioFim = extrairHorarioFim(turma.horario);

        console.log(
          `✅ Turma tem aula na Quadra ${quadra.numero}! Horário: ${horarioInicio} - ${horarioFim}`
        );

        // Verifica se já existe uma reserva para essa aula
        const dataBusca = new Date(d);
        dataBusca.setHours(12, 0, 0, 0);
        const reservasExistentes = await buscarReservasPorData(dataBusca);

        console.log(
          `🔍 Reservas encontradas para ${dataBusca.toLocaleDateString()}: ${
            reservasExistentes.length
          }`
        );

        const aulaJaExiste = reservasExistentes.some(
          (r) =>
            r.tipo === "aula" &&
            r.turmaNome === turma.nome &&
            r.horarioInicio === horarioInicio &&
            r.quadraId === quadra.id
        );

        if (aulaJaExiste) {
          console.log(
            `⏭️ Aula já existe para ${turma.nome} em ${d.toLocaleDateString()}`
          );
        } else {
          console.log(
            `➕ Criando aula para ${turma.nome} na Quadra ${
              quadra.numero
            } em ${d.toLocaleDateString()}`
          );
          try {
            // Normaliza a data (remove horas para comparação correta)
            const dataNormalizada = new Date(d);
            dataNormalizada.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de timezone

            const reservaId = await criarReserva({
              quadraId: quadra.id,
              quadraNome: quadra.nome,
              data: dataNormalizada,
              horarioInicio,
              horarioFim,
              tipo: "aula",
              turmaNome: turma.nome,
              professorNome: turma.professorNome || "",
              status: "confirmada",
              observacoes: `Aula sincronizada automaticamente - ${turma.modalidade}`,
            });
            aulasAdicionadas++;
            console.log(`✅ Aula criada! ID: ${reservaId}`);
          } catch (error) {
            console.error(`❌ Erro ao criar aula:`, error);
          }
        }
      }
    }
  }

  return aulasAdicionadas;
}

/**
 * Sincroniza as aulas para um mês inteiro
 */
export async function sincronizarAulasMes(
  ano: number,
  mes: number
): Promise<number> {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  let totalAulas = 0;

  // Sincroniza semana por semana
  for (
    let d = new Date(primeiroDia);
    d <= ultimoDia;
    d.setDate(d.getDate() + 7)
  ) {
    const aulasAdicionadas = await sincronizarAulasSemana(d);
    totalAulas += aulasAdicionadas;
  }

  return totalAulas;
}

/**
 * Sincroniza todas as aulas até o final de 2028
 */
export async function sincronizarAulasAte2028(): Promise<number> {
  const hoje = new Date();
  const dataFinal = new Date(2026, 11, 31); // 31 de dezembro de 2028
  let totalAulas = 0;

  console.log("📅 Sincronizando aulas até 2028...");

  // Sincroniza mês por mês
  for (
    let data = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    data <= dataFinal;
    data.setMonth(data.getMonth() + 1)
  ) {
    console.log(
      `📆 Sincronizando ${data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })}...`
    );
    const aulasDoMes = await sincronizarAulasMes(
      data.getFullYear(),
      data.getMonth()
    );
    totalAulas += aulasDoMes;
    console.log(`✅ ${aulasDoMes} aulas adicionadas neste mês`);
  }

  console.log(`🎉 Total: ${totalAulas} aulas sincronizadas até 2028!`);
  return totalAulas;
}

/**
 * Remove aulas de uma turma específica em um período
 */
export async function removerAulasTurma(
  turmaNome: string,
  dataInicio: Date,
  dataFim: Date
): Promise<number> {
  const inicio = new Date(dataInicio);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59, 999);

  const snapshot = await getDocs(
    query(
      collection(db, "reservas"),
      where("turmaNome", "==", turmaNome),
      where("data", ">=", Timestamp.fromDate(inicio)),
      where("data", "<=", Timestamp.fromDate(fim))
    )
  );

  const promises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(promises);

  return snapshot.docs.length;
}

/**
 * Remove todas as aulas sincronizadas automaticamente
 */
export async function limparAulasSincronizadas(): Promise<number> {
  console.log("🗑️ Removendo todas as aulas sincronizadas...");

  const snapshot = await getDocs(
    query(collection(db, "reservas"), where("tipo", "==", "aula"))
  );

  const promises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(promises);

  console.log(`✅ ${snapshot.docs.length} aulas removidas`);
  return snapshot.docs.length;
}
