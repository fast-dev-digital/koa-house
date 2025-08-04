import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaPlus, FaDownload, FaUser } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import AlunoModal from "../../components/componentsAdmin/AlunoModal";
import DeleteConfirmModal from "../../components/componentsAdmin/DeleteConfirmModal";
import Toast from "../../components/componentsAdmin/Toast";
import { exportarAlunosCSV } from "../../utils/exportarCsv";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
  plano: string;
  status: "ativo" | "inativo" | "suspenso";
  turmas: "Seg-Qua" | "Ter-Qui";
  horarios: "18:00" | "19:00" | "20:00" | "21:00";
  dataMatricula: string;
}

// Configuração das colunas da tabela
const alunosColumns = [
  {
    key: "nome",
    label: "Nome",
    sortable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
  },
  {
    key: "telefone",
    label: "Telefone",
  },
  {
    key: "plano",
    label: "Plano",
    sortable: true,
  },
  {
    key: "turmas",
    label: "Turmas",
    sortable: true,
  },
  {
    key: "horarios",
    label: "Horários",
    sortable: true,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => {
      const colors = {
        ativo: "bg-green-100 text-green-700",
        inativo: "bg-gray-100 text-gray-700",
        suspenso: "bg-red-100 text-red-700",
      };
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            colors[value as keyof typeof colors] || colors.inativo
          }`}
        >
          {value || "inativo"}
        </span>
      );
    },
  },
];

export default function GestaoAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);

  // Estados para busca e filtros
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [turmasFilter, setTurmasFilter] = useState("");
  const [horariosFilter, setHorariosFilter] = useState("");

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  // Estados do Modal de Confirmação de Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState<Aluno | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Estados do Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  // ⚡ REATIVO - recalcula automaticamente quando algo muda
  const alunosFiltrados = useMemo(() => {
    return alunos.filter((aluno) => {
      const filtroNome = aluno.nome
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const filtroStatus = !statusFilter || aluno.status === statusFilter;
      const filtroTurmas = !turmasFilter || aluno.turmas === turmasFilter;
      const filtroHorarios =
        !horariosFilter || aluno.horarios === horariosFilter;

      return filtroNome && filtroStatus && filtroTurmas && filtroHorarios;
    });
  }, [alunos, searchText, statusFilter, turmasFilter, horariosFilter]);

  // Buscar alunos do Firestore
  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "Alunos"));
      const alunosData: Aluno[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("🔥 DOCUMENTO RAW:", doc.id, data); // ← ADICIONE

        if (data && typeof data === "object") {
          alunosData.push({
            id: doc.id,
            nome: data.nome || "",
            email: data.email || "",
            telefone: data.telefone || "",
            genero: data.genero || "Masculino",
            plano: data.plano || "",
            status: data.status || "inativo",
            turmas: data.turmas || "Seg-Qua",
            horarios: data.horarios || "19:00",
            dataMatricula: data.dataMatricula || "",
          } as Aluno);
          console.log("🔥 ALUNO PROCESSADO:", alunosData); // ← ADICIONE
        }
      });

      setAlunos(alunosData);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      showToastMessage("Erro ao carregar alunos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  // Função helper para mostrar toast
  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Funções de callback para o DataTable
  const handleEdit = (aluno: Aluno) => {
    console.log("🎯 ALUNO SELECIONADO PARA EDIÇÃO:", aluno); // ← ADICIONE
    console.log("🎯 GÊNERO DO ALUNO:", aluno.genero); // ← ADICIONE
    setSelectedAluno(aluno);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = (aluno: Aluno) => {
    setAlunoToDelete(aluno);
    setIsDeleteModalOpen(true);
  };

  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!alunoToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "Alunos", alunoToDelete.id));

      // Atualizar a lista local
      setAlunos(alunos.filter((aluno) => aluno.id !== alunoToDelete.id));

      // Fechar modal
      setIsDeleteModalOpen(false);
      setAlunoToDelete(null);

      // Mostrar toast de sucesso
      showToastMessage(
        `Aluno "${alunoToDelete.nome}" foi excluído com sucesso!`,
        "success"
      );
    } catch (error: any) {
      console.error("❌ Erro ao excluir aluno:", error);
      showToastMessage(`Erro ao excluir aluno: ${error.message}`, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Função para deletar múltiplos alunos
  const handleDeleteSelected = async (selectedAlunos: Aluno[]) => {
    if (selectedAlunos.length === 0) return;

    const confirmMessage = `Tem certeza que deseja excluir ${selectedAlunos.length} aluno(s) selecionado(s)? Esta ação não pode ser desfeita.`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const deletePromises = selectedAlunos.map((aluno) =>
        deleteDoc(doc(db, "Alunos", aluno.id))
      );

      await Promise.all(deletePromises);

      // Atualizar a lista local removendo os alunos excluídos
      const deletedIds = selectedAlunos.map((aluno) => aluno.id);
      setAlunos(alunos.filter((aluno) => !deletedIds.includes(aluno.id)));

      showToastMessage(
        `${selectedAlunos.length} aluno(s) excluído(s) com sucesso!`,
        "success"
      );
    } catch (error) {
      console.error("Erro ao excluir alunos:", error);
      showToastMessage("Erro ao excluir alguns alunos!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAlunoToDelete(null);
  };

  // Função para fechar toast
  const handleCloseToast = () => {
    setShowToast(false);
  };

  // Função para abrir modal de criação
  const handleCreateAluno = () => {
    setSelectedAluno(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
  };

  // Função de sucesso do modal
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
    fetchAlunos();

    const action = modalMode === "create" ? "cadastrado" : "atualizado";
    showToastMessage(`Aluno ${action} com sucesso!`, "success");
  };

  const handleExportarCSV = async () => {
    try {
      setCsvLoading(true);
      showToastMessage("Iniciando exportação CSV...", "success");

      await exportarAlunosCSV();
    } catch (erro) {
      showToastMessage("Erro ao exportar arquivo", "error");
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <FaUser className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Alunos</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportarCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={alunos.length === 0 || csvLoading}
          >
            <FaDownload className={csvLoading ? "animate-spin" : ""} />
            <span>Exportar</span>
          </button>
          <button
            onClick={handleCreateAluno}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUser className="text-2xl text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-gray-900">
                {alunosFiltrados.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUser className="text-2xl text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Alunos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {alunosFiltrados.filter((a) => a.status === "ativo").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUser className="text-2xl text-gray-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Alunos Inativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {alunosFiltrados.filter((a) => a.status === "inativo").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUser className="text-2xl text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Alunos Suspensos</p>
              <p className="text-2xl font-bold text-gray-900">
                {alunosFiltrados.filter((a) => a.status === "suspenso").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Busca e Filtros */}
      <SearchAndFilters
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Digite o nome do aluno..."
        searchLabel="Buscar Alunos"
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: "Todos os Status",
            options: [
              { value: "ativo", label: "Ativo" },
              { value: "inativo", label: "Inativo" },
              { value: "suspenso", label: "Suspenso" },
            ],
          },
          {
            label: "Turmas",
            value: turmasFilter,
            onChange: setTurmasFilter,
            placeholder: "Todas as Turmas",
            options: [
              { value: "Seg-Qua", label: "Segunda e Quarta" },
              { value: "Ter-Qui", label: "Terça e Quinta" },
            ],
          },
          {
            label: "Horários",
            value: horariosFilter,
            onChange: setHorariosFilter,
            placeholder: "Todos os Horários",
            options: [
              { value: "18:00", label: "18:00" },
              { value: "19:00", label: "19:00" },
              { value: "20:00", label: "20:00" },
              { value: "21:00", label: "21:00" },
            ],
          },
        ]}
      />

      {/* DataTable */}
      <DataTable
        data={alunosFiltrados}
        columns={alunosColumns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        selectable={true}
        title="Lista de Alunos"
        emptyMessage="Nenhum aluno encontrado. Cadastre o primeiro aluno!"
        itemsPerPage={15}
      />

      {/* Modal de Aluno - CREATE e UPDATE */}
      <AlunoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        alunoData={selectedAluno}
      />

      {/* Modal de Confirmação de Delete */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        item={alunoToDelete}
        itemType="aluno"
        title="Excluir Aluno"
        message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
      />

      {/* Toast de Notificação */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={handleCloseToast}
      />
    </div>
  );
}
