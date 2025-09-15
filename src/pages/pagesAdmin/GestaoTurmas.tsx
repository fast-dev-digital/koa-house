import { useState, useEffect, useMemo } from "react";
import { FaPlus, FaDownload, FaUsers } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import {
  buscarTodasTurmas,
  obterEstatisticasTurmas,
} from "../../services/turmaService";
import Toast from "../../components/componentsAdmin/Toast";
import TurmasModal from "../../components/componentsAdmin/TurmasModal";
import type { Turma } from "../../types/turmas";
import ManageAlunosModal from "../../components/componentsAdmin/ManageAlunosModal";
import { exportarTurmasCSV } from "../../utils/exportarCsv";

//  COLUNAS Turmas
const colunasTurmas = [
  {
    key: "nome",
    label: "Nome da Turma",
    sortable: true,
    render: (value: string) => (
      <div className="font-medium text-gray-900">{value || "Sem nome"}</div>
    ),
  },
  {
    key: "professorNome",
    label: "Professor",
    sortable: true,
    render: (value: string) => value || "Não definido",
  },
  {
    key: "modalidade",
    label: "Modalidade",
    sortable: true,
    render: (value: string) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          value === "Futevôlei"
            ? "bg-blue-100 text-blue-800"
            : value === "Beach Tennis"
            ? "bg-pink-100 text-pink-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    key: "genero",
    label: "Gênero",
    sortable: true,
    render: (value: string) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          value === "Masculino"
            ? "bg-blue-100 text-blue-800"
            : value === "Feminino"
            ? "bg-pink-100 text-pink-800"
            : "bg-purple-100 text-purple-800"
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    key: "nivel",
    label: "Nível",
    sortable: true,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          value === "Ativa"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    key: "dias",
    label: "Dias",
    render: (value: string) => value || "A definir",
  },
  {
    key: "horario",
    label: "Horário",
    sortable: true,
    render: (value: string) => value || "A definir",
  },
  {
    key: "alunosInscritos",
    label: "Alunos",
    render: (value: number, row: Turma) => (
      <div className="text-center">
        <span className="text-sm font-medium">
          {value || 0}/{row.capacidade || 0}
        </span>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{
              width: `${((value || 0) / (row.capacidade || 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    ),
  },
];

export default function GestaoTurmas() {
  // ESTADOS PRINCIPAIS
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState<any>(null);

  // ESTADOS DOS MODAIS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [turmaToView, setTurmaToView] = useState<Turma | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // ESTADOS DE CONTROLE

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  // ESTADOS DOS FILTROS
  const [searchText, setSearchText] = useState("");
  const [modalidadeFilter, setModalidadeFilter] = useState("");
  const [professorFilter, setProfessorFilter] = useState("");
  const [generoFilter, setGeneroFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [, setCsvLoading] = useState(false); //  ESTADO FALTANTE ADICIONADO

  // FUNÇÃO HELPER PARA TOAST
  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  //  CARREGAR TURMAS COM DEBUG
  const fetchTurmas = async () => {
    try {
      setLoading(true);

      const turmasData = await buscarTodasTurmas();

      // ✅ FORÇAR NOVA REFERÊNCIA COM SPREAD
      setTurmas([...turmasData]); // Força React a detectar mudança

      const estatisticasData = await obterEstatisticasTurmas();
      setEstatisticas({ ...estatisticasData }); // Spread nas estatísticas também

      setRefreshKey((prev) => prev + 1);
    } catch (erro) {
      showToastMessage("Erro ao carregar turmas", "error");
    } finally {
      setLoading(false);
    }
  };

  // FILTRAR TURMAS
  const turmasFiltradas = useMemo(() => {
    return turmas.filter((turma) => {
      const matchSearch =
        (turma.nome || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (turma.professorNome || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (turma.modalidade || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (turma.status || "").toLowerCase().includes(searchText.toLowerCase());

      const matchModalidade =
        !modalidadeFilter || turma.modalidade === modalidadeFilter;
      const matchGenero = !generoFilter || turma.genero === generoFilter;
      const matchProfessor =
        !professorFilter || turma.professorNome === professorFilter;
      const matchStatus = !statusFilter || turma.status === statusFilter;

      return (
        matchSearch &&
        matchModalidade &&
        matchGenero &&
        matchProfessor &&
        matchStatus
      );
    });
  }, [
    turmas,
    searchText,
    modalidadeFilter,
    generoFilter,
    professorFilter,
    statusFilter,
  ]);

  // CARREGAR DADOS NA INICIALIZAÇÃO
  useEffect(() => {
    fetchTurmas();
  }, []);

  // ✅ FUNÇÃO CREATE CORRIGIDA
  const handleCreateTurma = () => {
    setSelectedTurma(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // ✅ FUNÇÃO EDIT CORRIGIDA
  const handleEdit = (turma: Turma) => {
    setSelectedTurma(turma);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // ✅ FUNÇÃO VIEW CORRIGIDA
  const handleManageAlunos = (turma: Turma) => {
    setTurmaToView(turma);
    setIsViewModalOpen(true);
  };

  // ✅ FUNÇÃO FECHAR MODAL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTurma(null);
  };

  // ✅ FUNÇÃO SUCCESS MODAL
  const handleModalSuccess = () => {
    ("🎯 handleModalSuccess EXECUTADO - Modal chamou onSuccess!");
    setIsModalOpen(false);
    setSelectedTurma(null);
    fetchTurmas();

    const action = modalMode === "create" ? "criada" : "atualizada";
    showToastMessage(`Turma ${action} com sucesso!`, "success");
  };

  // ✅ FUNÇÃO EXPORTAR CSV
  const handleExportCSV = async () => {
    try {
      setCsvLoading(true);
      showToastMessage("Preparando exportação...", "success");

      await exportarTurmasCSV();

      showToastMessage(`Turma(s) exportada(s) com sucesso!`, "success");
    } catch (error: any) {
      showToastMessage("Erro ao exportar turmas", "error");
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <FaUsers className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Turmas</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleCreateTurma}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus />
            <span>Nova Turma</span>
          </button>
        </div>
      </div>

      {/* ESTATÍSTICAS - VERSÃO COM CACHE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total de Turmas Ativas */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-emerald-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Turmas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas?.turmasAtivas ||
                  turmasFiltradas.filter((t) => t.status === "Ativa").length}
              </p>
            </div>
          </div>
        </div>

        {/* Futevôlei */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Futevôlei</p>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas?.modalidades?.["Futevôlei"] ||
                  turmasFiltradas.filter((t) => t.modalidade === "Futevôlei")
                    .length}
              </p>
            </div>
          </div>
        </div>

        {/* Beach Tennis */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Beach Tennis</p>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas?.modalidades?.["Beach Tennis"] ||
                  turmasFiltradas.filter((t) => t.modalidade === "Beach Tennis")
                    .length}
              </p>
            </div>
          </div>
        </div>

        {/* NOVA ESTATÍSTICA - VÔLEI */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Vôlei</p>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas?.modalidades?.["Vôlei"] ||
                  turmasFiltradas.filter((t) => t.modalidade === "Vôlei")
                    .length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <SearchAndFilters
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Buscar por nome, professor ou modalidade..."
        searchLabel="Buscar Turmas"
        filters={[
          {
            label: "Modalidade",
            value: modalidadeFilter,
            onChange: setModalidadeFilter,
            placeholder: "Todas as Modalidades",
            options: [
              { value: "Futevôlei", label: "Futevôlei" },
              { value: "Beach Tennis", label: "Beach Tennis" },
              { value: "Vôlei", label: "Vôlei" },
            ],
          },
          {
            label: "Gênero",
            value: generoFilter,
            onChange: setGeneroFilter,
            placeholder: "Todos os Gêneros",
            options: [
              { value: "Masculino", label: "Masculino" },
              { value: "Feminino", label: "Feminino" },
              { value: "Teens", label: "Teens" },
            ],
          },
          {
            label: "Professor",
            value: professorFilter,
            onChange: setProfessorFilter,
            placeholder: "Todos os Professores",
            options: [
              ...new Set(turmas.map((t) => t.professorNome).filter(Boolean)),
            ].map((prof) => ({
              value: prof,
              label: prof,
            })),
          },
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: "Todos os Status",
            options: [
              { value: "Ativa", label: "Ativa" },
              { value: "Inativa", label: "Inativa" },
            ],
          },
        ]}
      />

      {/* MODAL DE TURMAS */}
      <TurmasModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        turmaData={selectedTurma}
      />

      {/* TABELA */}
      <DataTable
        key={refreshKey}
        data={turmasFiltradas}
        columns={colunasTurmas}
        onEdit={handleEdit}
        onView={handleManageAlunos}
        loading={loading}
        title="Lista de Turmas"
        emptyMessage="Nenhuma turma encontrada. Crie sua primeira turma!"
        itemsPerPage={15}
      />

      {/* MODAL DE VISUALIZAÇÃO DE ALUNOS */}
      <ManageAlunosModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSuccess={() => {
          fetchTurmas(); // Recarregar turmas para atualizar contadores
          showToastMessage("Alunos gerenciados com sucesso!", "success");
        }}
        turma={turmaToView}
      />

      {/* TOAST */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
        isVisible={showToast}
      />
    </div>
  );
}
