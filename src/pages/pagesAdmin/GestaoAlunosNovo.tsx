import { useState, useEffect, useMemo, useCallback } from "react";
import { FaPlus, FaDownload, FaUser } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import AlunoModal from "../../components/componentsAdmin/AlunoModal";
import Toast from "../../components/componentsAdmin/Toast";
import { exportarAlunosCSV } from "../../utils/exportarCsv";
import { useAuth } from "../../contexts/AuthContext";
import { buscarTodosAlunos } from "../../services/alunoService";
import {
  formatarDataBR,
  verificarStatusVencimento,
  obterDiasRestantes,
  planoTemDataFinal,
} from "../../utils/dateUtils";
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
  {
    key: "dataMatricula",
    label: "Data Início",
    sortable: true,
    render: (value: string) => {
      if (!value) return "Não informado";
      try {
        if (value.includes("T")) {
          const date = new Date(value);
          return date.toLocaleDateString("pt-BR");
        }
        if (value.includes("-") && value.length === 10) {
          return formatarDataBR(value);
        }
        return value;
      } catch (error) {
        console.error("Erro ao formatar data de matricula");
        return value;
      }
    },
  },
  {
    key: "dataFinalMatricula",
    label: "Data Final",
    sortable: true,
    render: (value: string, item: Aluno) => {
      // Só mostrar data final para planos Trimestral e Semestral
      if (!planoTemDataFinal(item.plano)) {
        return <span className="text-gray-500 text-xs">N/A (Mensal)</span>;
      }

      if (!value)
        return <span className="text-gray-500 text-xs">Não calculado</span>;

      const statusClass = verificarStatusVencimento(value);
      const diasRestantes = obterDiasRestantes(value);

      let statusText = "";
      if (diasRestantes !== null) {
        if (diasRestantes < 0) statusText = " (Vencido)";
        else if (diasRestantes <= 7) statusText = ` (${diasRestantes}d)`;
      }

      return (
        <span className={statusClass}>
          {formatarDataBR(value)}
          {statusText}
        </span>
      );
    },
  },
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
  const { currentTenantId } = useAuth();
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
  // Normaliza possíveis Timestamp do Firestore para strings legíveis
  const normalizeDate = (value: any): string => {
    if (!value) return "";
    try {
      if (typeof value === "object" && value && "seconds" in value) {
        const d = new Date(value.seconds * 1000);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        return "";
      }
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return String(value);
    } catch {
      return "";
    }
  };

  const fetchAlunos = useCallback(async () => {
    try {
      if (!currentTenantId) {
        setAlunos([]);
        return;
      }

      setLoading(true);
      const alunosTenant = await buscarTodosAlunos(currentTenantId);
      const alunosData: Aluno[] = [];

      alunosTenant.forEach((aluno) => {
        const data = aluno as any;
        if (data && typeof data === "object") {
          const normalizado = {
            id: aluno.id,
            ...DEFAULT_ALUNO_VALUES,
            ...data,
          } as any;

          // Normalizar campos de data que podem vir como Timestamp
          normalizado.dataMatricula = normalizeDate(normalizado.dataMatricula);
          normalizado.dataFinalMatricula = normalizeDate(
            normalizado.dataFinalMatricula,
          );
          // Garantir tipos básicos
          normalizado.telefone = normalizado.telefone || "";

          alunosData.push(normalizado as Aluno);
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
  }, [currentTenantId]);

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
    [alunosFiltrados],
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

  const handleModalSuccess = useCallback(async () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
    await fetchAlunos();

    const action = modalMode === "create" ? "cadastrado" : "atualizado";
    showToastMessage(`Aluno ${action} com sucesso!`, "success");
  }, [modalMode, fetchAlunos, showToastMessage]);

  // 📤 EXPORTAR CSV
  const handleExportarCSV = useCallback(async () => {
    try {
      if (!currentTenantId) {
        showToastMessage("Tenant não encontrado na sessão", "error");
        return;
      }

      setCsvLoading(true);
      showToastMessage("Iniciando exportação CSV...", "success");
      await exportarAlunosCSV(currentTenantId);
    } catch (erro) {
      console.error("Erro ao exportar CSV:", erro);
      showToastMessage("Erro ao exportar arquivo", "error");
    } finally {
      setCsvLoading(false);
    }
  }, [currentTenantId, showToastMessage]);

  //  CONFIGURAÇÃO DOS FILTROS
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
    [statusFilter, turmasFilter, horariosFilter],
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
            <span>{csvLoading ? "Exportando..." : "Exportar CSV"}</span>
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
