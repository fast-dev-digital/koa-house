// AlunoService
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase-config";
import type { Aluno } from "../types/alunos";

// Buscar todos os alunos
export async function buscarTodosAlunos(): Promise<Aluno[]> {
  try {
    const alunosRef = collection(db, "Alunos");
    const snapshot = await getDocs(alunosRef);

    const alunos: Aluno[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      alunos.push({
        id: doc.id,
        ...data,
      } as Aluno);
    });

    return alunos;
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    throw error;
  }
}

// Buscar aluno por email
export async function buscarAlunoPorEmail(
  email: string
): Promise<Aluno | null> {
  try {
    const alunosRef = collection(db, "Alunos");
    const q = query(alunosRef, where("email", "==", email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Aluno;
  } catch (error) {
    console.error("Erro ao buscar aluno por email:", error);
    throw error;
  }
}
