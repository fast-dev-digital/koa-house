import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Quadra } from "../types/quadra";

export async function buscarQuadras(): Promise<Quadra[]> {
  const snapshot = await getDocs(
    query(collection(db, "quadras"), orderBy("numero")),
  );
  const quadras = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Quadra,
  );
  return quadras;
}

export async function criarQuadra(quadra: Omit<Quadra, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "quadras"), quadra);
  return docRef.id;
}

export async function atualizarQuadra(
  id: string,
  quadra: Partial<Quadra>,
): Promise<void> {
  const { id: _, ...resto } = quadra;
  await updateDoc(doc(db, "quadras", id), resto);
}

export async function excluirQuadra(id: string): Promise<void> {
  await deleteDoc(doc(db, "quadras", id));
}
