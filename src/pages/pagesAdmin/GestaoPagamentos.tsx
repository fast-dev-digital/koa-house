import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaCreditCard, FaDownload, FaEdit } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import type { Pagamento } from "../../types/pagamentos";

export default function GestaoPagamentos() {
  // Dados
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState<Pagamento[]>(
    []
  );
  // Loading e controle
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  // Filtros e busca
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Modal e toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      // 1. Pegando referência da coleção
      const pagamentosRef = collection(db, "pagamentos");
      // 2. Buscar Dados
      const snapshot = await getDocs(pagamentosRef);
      // 3. Transformar em um array
      const pagamentosData: Pagamento[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        pagamentosData.push({
          id: doc.id,
          alunoId: data.alunoId || "",
          alunoNome: data.alunoNome || "",
          valor: data.valor || 0,
          mesReferencia: data.mesReferencia || "",
          dataVencimento: data.dataVencimento?.toDate() || new Date(),
          dataPagamento: data.dataPagamento?.toDate() || undefined,
          status: data.status || "Pendente",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      // 4.Atualizar estados
      setPagamentos(pagamentosData);
      console.log("Pagamentos carregados");
    } catch (error) {
      // Add toast de erros
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const calcularEstatisticas = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa

    // Filtrar por status
    const pagamentosPendentes = pagamentos.filter(
      (p) => p.status === "Pendente"
    );
    const pagamentosPagos = pagamentos.filter((p) => p.status === "Pago");

    // Calcular valores
    const totalReceber = pagamentosPendentes.reduce(
      (sum, p) => sum + p.valor,
      0
    );
    const totalRecebido = pagamentosPagos.reduce((sum, p) => sum + p.valor, 0);

    // Pagamentos em atraso (vencimento já passou)
    const emAtraso = pagamentosPendentes.filter((p) => {
      const vencimento = new Date(p.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      return vencimento < hoje;
    });

    return {
      totalReceber,
      totalRecebido,
      quantidadePendente: pagamentosPendentes.length,
      quantidadeEmAtraso: emAtraso.length,
      valorEmAtraso: emAtraso.reduce((sum, p) => sum + p.valor, 0),
    };
  };
  const estatisticas = calcularEstatisticas();
  return (
    <div className="p-6">
      {/* 1. HEADER com título e botão "Exportar CSV" */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaCreditCard className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestão de Pagamentos
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => console.log("Exportar CSV")} // TODO: implementar depois
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* 2. CARDS DE ESTATÍSTICAS - TODO: implementar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total a Receber</h3>
          <p className="text-2xl font-bold text-red-600">
            R${" "}
            {estatisticas.totalReceber.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {estatisticas.quantidadePendente} pagamento(s) pendente(s)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Recebido</h3>
          <p className="text-2xl font-bold text-green-600">
            R${" "}
            {estatisticas.totalRecebido.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {pagamentos.filter((p) => p.status === "Pago").length} pagamento(s)
            realizado(s)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pendentes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {estatisticas.quantidadePendente}
          </p>
          <p className="text-xs text-gray-400 mt-1">No prazo</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Em Atraso</h3>
          <p className="text-2xl font-bold text-red-600">
            {estatisticas.quantidadeEmAtraso}
          </p>
          <p className="text-xs text-red-500 mt-1">
            R${" "}
            {estatisticas.valorEmAtraso.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
