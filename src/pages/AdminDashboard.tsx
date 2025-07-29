import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase-config";


export default function AdminDashboard() {
  const [nome, setNome] = useState<string>("");
  const [totalAlunos, setTotalAlunos] = useState<number>(0);
  const [totalProfessores, setTotalProfessores] = useState<number>(0);
  const [totalTurmas, setTotalTurmas] = useState<number>(0);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<number>(0);
  const [quadrasReservadas, setQuadrasReservadas] = useState<number>(0);

  useEffect(() => {
    // Busca nome do admin
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = collection(db, "admins");
        const docs = await getDocs(docRef);
        docs.forEach((doc) => {
          if (doc.id === user.uid) {
            setNome(doc.data().nome || "");
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Busca total de alunos
    getDocs(collection(db, "Alunos")).then((snapshot) => {
      setTotalAlunos(snapshot.size);
    });
    // Busca total de professores
    getDocs(collection(db, "professores")).then((snapshot) => {
      setTotalProfessores(snapshot.size);
    });
    // Busca total de turmas
    getDocs(collection(db, "turmas")).then((snapshot) => {
      setTotalTurmas(snapshot.size);
    });
    // Busca pagamentos pendentes (exemplo: status === "pendente")
    getDocs(query(collection(db, "pagamentos"), where("status", "==", "pendente"))).then((snapshot) => {
      setPagamentosPendentes(snapshot.size);
    });
    // Busca quadras reservadas hoje (exemplo: dataReserva === hoje)
    const hoje = new Date();
    const dataHoje = hoje.toISOString().slice(0, 10); // "2025-07-29"
    getDocs(query(collection(db, "reservas"), where("dataReserva", "==", dataHoje))).then((snapshot) => {
      setQuadrasReservadas(snapshot.size);
    });
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
     
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Bem-vindo{nome ? `, ${nome}` : ""}!
        </h1>
        <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500">Total Alunos</span>
            <span className="text-2xl font-bold">{totalAlunos}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500">Professores ativos</span>
            <span className="text-2xl font-bold">{totalProfessores}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500">Turmas ativas</span>
            <span className="text-2xl font-bold">{totalTurmas}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500">Pagamentos Pendentes</span>
            <span className="text-2xl font-bold">{pagamentosPendentes}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-gray-500">Quadras reservadas hoje</span>
            <span className="text-2xl font-bold">{quadrasReservadas}</span>
          </div>
        </div>
        {/* Exemplo de tabela estática, substitua por dados reais se quiser */}
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhes de pagamentos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4">Nome</th>
                  <th className="py-2 px-4">Turma</th>
                  <th className="py-2 px-4">Vencimento de matrícula</th>
                  <th className="py-2 px-4">Valor a ser pago</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">Gabriel Gasparetto</td>
                  <td className="py-2 px-4">Turma do Chris Ter-Qui</td>
                  <td className="py-2 px-4">12.09.2019</td>
                  <td className="py-2 px-4">R$ 200,00</td>
                  <td className="py-2 px-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">Pago</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Victor Chianelli</td>
                  <td className="py-2 px-4">Turma do Marre Semp-Qua</td>
                  <td className="py-2 px-4">12.09.2019</td>
                  <td className="py-2 px-4">R$ 200,00</td>
                  <td className="py-2 px-4"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">Pendente</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Vinícius Menicatto</td>
                  <td className="py-2 px-4">Turma do Chris ter-qui</td>
                  <td className="py-2 px-4">12.09.2019</td>
                  <td className="py-2 px-4">R$ 200,00</td>
                  <td className="py-2 px-4"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">Reprovado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}