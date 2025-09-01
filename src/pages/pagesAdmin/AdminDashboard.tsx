import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import type { Pagamento } from "../../types/pagamentos";
import { listarAlunosComPagamentos } from "../../services/integracaoService";

export default function AdminDashboard() {
  const [nome, setNome] = useState<string>("");
  const [totalAlunos, setTotalAlunos] = useState<number>(0);
  const [totalProfessores, setTotalProfessores] = useState<number>(0);
  const [totalTurmas, setTotalTurmas] = useState<number>(0);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<number>(0);
  const [quadrasReservadas, setQuadrasReservadas] = useState<number>(0);
  const [pagamentosRecentes, setPagamentosRecentes] = useState<Pagamento[]>([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState<boolean>(false);

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

  // Função para buscar pagamentos recentes da nova estrutura
  const fetchPagamentosRecentes = async () => {
    try {
      setLoadingPagamentos(true);
      const alunosComPagamentos = await listarAlunosComPagamentos();
      
      // Converter para formato da tabela e pegar apenas os mais recentes
      const pagamentosFormatados: Pagamento[] = [];
      let totalPendentes = 0;
      
      alunosComPagamentos.forEach((aluno) => {
        aluno.pagamentos.forEach((pagamento) => {
          if (pagamento.status !== "Arquivado") {
            pagamentosFormatados.push({
              id: `${aluno.alunoId}_${pagamento.mesReferencia}`,
              alunoId: aluno.alunoId,
              alunoNome: aluno.nome,
              planoTipo: aluno.plano || "Mensal",
              mesReferencia: pagamento.mesReferencia,
              valor: pagamento.valor,
              dataVencimento: pagamento.dataVencimento,
              status: pagamento.status,
              dataPagamento: pagamento.dataPagamento,
              createdAt: aluno.createdAt,
              updatedAt: aluno.updatedAt,
            });
            
            if (pagamento.status === "Pendente") {
              totalPendentes++;
            }
          }
        });
      });
      
      // Ordenar por data de vencimento e pegar os 5 mais recentes
      const pagamentosOrdenados = pagamentosFormatados
        .sort((a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime())
        .slice(0, 5);
      
      setPagamentosRecentes(pagamentosOrdenados);
      setPagamentosPendentes(totalPendentes);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
    } finally {
      setLoadingPagamentos(false);
    }
  };

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
    // Busca quadras reservadas hoje (exemplo: dataReserva === hoje)
    const hoje = new Date();
    const dataHoje = hoje.toISOString().slice(0, 10);
    getDocs(
      query(collection(db, "reservas"), where("dataReserva", "==", dataHoje))
    ).then((snapshot) => {
      setQuadrasReservadas(snapshot.size);
    });
    
    // Buscar pagamentos recentes
    fetchPagamentosRecentes();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Bem-vindo{nome ? `, ${nome}` : ""}!
        </h1>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
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
        </div>
        {/* Tabela dinâmica de pagamentos recentes */}
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Pagamentos Recentes</h3>
          {loadingPagamentos ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando pagamentos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Nome</th>
                    <th className="py-2 px-4">Plano</th>
                    <th className="py-2 px-4">Mês Referência</th>
                    <th className="py-2 px-4">Vencimento</th>
                    <th className="py-2 px-4">Valor</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentosRecentes.length > 0 ? (
                    pagamentosRecentes.map((pagamento) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case "Pago":
                            return "bg-green-100 text-green-700";
                          case "Pendente":
                            return "bg-yellow-100 text-yellow-700";
                          case "Atrasado":
                            return "bg-red-100 text-red-700";
                          default:
                            return "bg-gray-100 text-gray-700";
                        }
                      };
                      
                      const formatarData = (data: Date) => {
                        return new Date(data).toLocaleDateString("pt-BR");
                      };
                      
                      const formatarValor = (valor: number) => {
                        return new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(valor);
                      };
                      
                      return (
                        <tr key={pagamento.id}>
                          <td className="py-2 px-4">{pagamento.alunoNome}</td>
                          <td className="py-2 px-4">{pagamento.planoTipo}</td>
                          <td className="py-2 px-4">{pagamento.mesReferencia}</td>
                          <td className="py-2 px-4">{formatarData(pagamento.dataVencimento)}</td>
                          <td className="py-2 px-4">{formatarValor(pagamento.valor)}</td>
                          <td className="py-2 px-4">
                            <span className={`${getStatusColor(pagamento.status)} px-3 py-1 rounded-full text-xs`}>
                              {pagamento.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                        Nenhum pagamento encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
