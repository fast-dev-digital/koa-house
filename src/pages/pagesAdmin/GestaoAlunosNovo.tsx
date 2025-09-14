import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaPlus, FaDownload, FaUser } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import AlunoModal from "../../components/componentsAdmin/AlunoModal";
import Toast from "../../components/componentsAdmin/Toast";
import { exportarAlunosCSV } from "../../utils/exportarCsv";
import type { Aluno } from "../../types/alunos";

type StatusType = "Ativo" | "Inativo" | "Suspenso";
type ToastType = "success" | "error";
type ModalMode = "create" | "edit";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
}

// 🎨 CONSTANTES
const STATUS_COLORS: Record<StatusType, string> = {
  Ativo: "bg-green-100 text-green-700",
  Inativo: "bg-gray-100 text-gray-700",
  Suspenso: "bg-red-100 text-red-700",
};

// ✅ CORRIGIDO - SEM 'as const' PARA EVITAR CONFLITOS
const DEFAULT_ALUNO_VALUES = {
  nome: "",
  email: "",
  telefone: "",
  genero: "Masculino",
  plano: "",
  valorMensalidade: 150,
  status: "Inativo",
  turmas: "",
  turmasIds: [],
  horarios: "",
  dataMatricula: "",
  createdAt: "",
  updatedAt: "",
};

const FILTER_OPTIONS = {
  STATUS: [
    { value: "Ativo", label: "Ativo" },
    { value: "Inativo", label: "Inativo" },
  ],
};

const createAlunosColumns = () => [
  { key: "nome", label: "Nome", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "telefone", label: "Telefone" },
  { key: "plano", label: "Plano", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => {
      const colorClass =
        STATUS_COLORS[
          ["Ativo", "Inativo", "Suspenso"].includes(value)
            ? (value as StatusType)
            : "Inativo"
        ] || "bg-gray-100 text-gray-700";
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}
        >
          {value}
        </span>
      );
    },
  },
];

// 🎨 COMPONENTE DE ESTATÍSTICA
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  iconColor: string;
}

const StatCard = ({ icon, title, value, iconColor }: StatCardProps) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center">
      <div className={`text-2xl ${iconColor} mr-3`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// 🎯 COMPONENTE PRINCIPAL
export default function GestaoAlunos() {
  // 📊 ESTADOS PRINCIPAIS
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);

  // 🔍 ESTADOS DE FILTROS
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [turmasFilter] = useState("");
  const [horariosFilter] = useState("");

  // 🎭 ESTADOS DO MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  // 🔔 ESTADOS DO TOAST
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [showToast, setShowToast] = useState(false);

  // 🔔 FUNÇÕES DO TOAST
  const showToastMessage = useCallback((message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // ✅ CORRIGIDO - REMOVIDO showToastMessage DAS DEPENDÊNCIAS
  const fetchAlunos = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "Alunos"));
      const alunosData: Aluno[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && typeof data === "object") {
          alunosData.push({
            id: doc.id,
            ...DEFAULT_ALUNO_VALUES,
            ...data,
          } as Aluno);
        }
      });

      setAlunos(alunosData);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      setToastMessage("Erro ao carregar alunos");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ SEM DEPENDÊNCIAS PARA EVITAR LOOPS

  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  // ⚡ FILTROS REATIVOS - MEMOIZAÇÃO PARA PERFORMANCE
  const alunosFiltrados = useMemo(() => {
    return alunos.filter((aluno) => {
      const matchesSearch = aluno.nome
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus = !statusFilter || aluno.status === statusFilter;
      const matchesTurmas = !turmasFilter || aluno.turmas === turmasFilter;
      const matchesHorarios =
        !horariosFilter || aluno.horarios === horariosFilter;

      return matchesSearch && matchesStatus && matchesTurmas && matchesHorarios;
    });
  }, [alunos, searchText, statusFilter, turmasFilter, horariosFilter]);

  // 📊 ESTATÍSTICAS REATIVAS
  const stats = useMemo(
    () => ({
      total: alunosFiltrados.length,
      ativos: alunosFiltrados.filter((a) => a.status === "Ativo").length,
      inativos: alunosFiltrados.filter((a) => a.status === "Inativo").length,
      suspensos: alunosFiltrados.filter((a) => a.status === "Suspenso").length,
    }),
    [alunosFiltrados]
  );

  // 📋 COLUNAS DA TABELA
  const alunosColumns = useMemo(() => createAlunosColumns(), []);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // 🎭 FUNÇÕES DO MODAL
  const handleCreateAluno = useCallback(() => {
    setSelectedAluno(null);
    setModalMode("create");
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((aluno: Aluno) => {
    setSelectedAluno(aluno);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAluno(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAluno(null);
    fetchAlunos();

    const action = modalMode === "create" ? "cadastrado" : "atualizado";
    showToastMessage(`Aluno ${action} com sucesso!`, "success");
  }, [modalMode, fetchAlunos, showToastMessage]);

  // 📤 EXPORTAR CSV
  const handleExportarCSV = useCallback(async () => {
    try {
      setCsvLoading(true);
      showToastMessage("Iniciando exportação CSV...", "success");
      await exportarAlunosCSV();
    } catch (erro) {
      console.error("Erro ao exportar CSV:", erro);
      showToastMessage("Erro ao exportar arquivo", "error");
    } finally {
      setCsvLoading(false);
    }
  }, [showToastMessage]);

  // 🔧 CONFIGURAÇÃO DOS FILTROS
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        label: "Status",
        value: statusFilter,
        onChange: setStatusFilter,
        placeholder: "Todos os Status",
        options: FILTER_OPTIONS.STATUS,
      },
    ],
    [statusFilter, turmasFilter, horariosFilter]
  );

  return (
    <div className="p-6">
      {/* 🎯 CABEÇALHO */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <FaUser className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Alunos</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportarCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={alunos.length === 0 || csvLoading}
          >
            <FaDownload className={csvLoading ? "animate-spin" : ""} />
            <span>{csvLoading ? "Exportando..." : "Exportar"}</span>
          </button>
          <button
            onClick={handleCreateAluno}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* 📊 ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaUser />}
          title="Total de Alunos"
          value={stats.total}
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<FaUser />}
          title="Alunos Ativos"
          value={stats.ativos}
          iconColor="text-green-600"
        />
        <StatCard
          icon={<FaUser />}
          title="Alunos Inativos"
          value={stats.inativos}
          iconColor="text-gray-600"
        />
      </div>

      {/* 🔍 BUSCA E FILTROS */}
      <SearchAndFilters
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Digite o nome do aluno..."
        searchLabel="Buscar Alunos"
        filters={filterConfigs}
      />

      {/* 📊 TABELA DE DADOS */}
      <DataTable
        data={alunosFiltrados}
        columns={alunosColumns}
        loading={loading}
        onEdit={handleEdit}
        title="Lista de Alunos"
        itemsPerPage={20}
        emptyMessage="Nenhum aluno encontrado. Cadastre o primeiro aluno!"
      />

      {/* 🎭 MODAL DE ALUNO */}
      <AlunoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        alunoData={selectedAluno}
      />

      {/* 🔔 TOAST DE NOTIFICAÇÃO */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={handleCloseToast}
      />
    </div>
  );
}
