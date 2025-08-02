import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaPlus, FaDownload, FaUsers } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import DeleteConfirmModal from "../../components/componentsAdmin/DeleteConfirmModal";
import Toast from "../../components/componentsAdmin/Toast";
import TurmasModal from "../../components/componentsAdmin/TurmasModal";
import type { Turma } from "../../types/turmas";
import ViewAlunosModal from "../../components/componentsAdmin/ViewAlunosModal";

const colunasTurmas = [
  {
    key: "professorNome",
    label: "Professor",
    sortable: true,
  },
  {
    key: "modalidade",
    label: "Modalidade",
    sortable: true,
  },
  {
    key: "genero",
    label: "Gênero",
    sortable: true,
  },
  {
    key: "nivel",
    label: "Nível",
    sortable: true,
  },
  {
    key: "dias",
    label: "Dias",
  },
  {
    key: "horario",
    label: "Horário",
    sortable: true,
  },
  {
    key: "alunosInscritos",
    label: "Alunos",
    render: (value: number, row: Turma) => {
      return (
        <span className="text-sm">
          {value || 0}/{row.capacidade || 0}
        </span>
      );
    },
  },
];

export default function GestaoTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  // Estados de Filtros de busca
  const [searchText, setSearchText] = useState("");
  const [modalidadeFilter, setModalidadeFilter] = useState("");
  const [professorFilter, setProfessorFilter] = useState("");
  const [generoFilter, setGeneroFilter] = useState("");
  // Estado do modal para delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // Estado Delete turmas
  const [turmaToDelete, setTurmaToDelete] = useState<Turma | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Estado Toast Message
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  // Estados para visualizar alunos nas turmas
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [turmaToView, setTurmaToView] = useState<Turma | null>(null);

  // Função helper para mostrar toast
  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "turmas"));
      const turmasData: Turma[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && typeof data === "object") {
          turmasData.push({
            id: doc.id, // ✅ ID sempre presente do Firebase
            nome: data.nome || "",
            modalidade: data.modalidade || "Futevôlei",
            genero: data.genero || "Masculino",
            nivel: data.nivel || "Estreante",
            dias: data.dias || "",
            horario: data.horario || "",
            professorId: data.professorId || "",
            professorNome: data.professorNome || "",
            capacidade: data.capacidade || 0,
            alunosInscritos: data.alunosInscritos || 0,
          } as Turma);
        }
      });

      setTurmas(turmasData);
    } catch (erro) {
      console.log("Erro ao listar turmas", erro);
      showToastMessage("Erro ao carregar turmas", "error");
    } finally {
      setLoading(false);
    }
  };

  const turmasFiltradas = useMemo(() => {
    return turmas.filter((turma) => {
      const matchSearch =
        (turma.nome || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (turma.professorNome || "")
          .toLowerCase()
          .includes(searchText.toLowerCase());
      const matchModalidade =
        !modalidadeFilter || turma.modalidade === modalidadeFilter;
      const matchGenero = !generoFilter || turma.genero === generoFilter;
      const matchProfessor =
        !professorFilter || turma.professorNome === professorFilter;

      return matchSearch && matchModalidade && matchGenero && matchProfessor;
    });
  }, [turmas, searchText, modalidadeFilter, generoFilter, professorFilter]);

  useEffect(() => {
    fetchTurmas();
  }, []);

  const handleCreateTurma = () => {
    setSelectedTurma(null);
    setModalMode("create");
    setIsModalOpen(true);
    console.log("era pra abrir o modal");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTurma(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedTurma(null);
    fetchTurmas();

    const action = modalMode === "create" ? "criada" : "atualizada";
    showToastMessage(`Turma ${action} com sucesso!`, "success");
  };

  const handleEdit = (turma: Turma) => {
    setSelectedTurma(turma);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = (turma: Turma) => {
    setTurmaToDelete(turma);
    setIsDeleteModalOpen(true);
  };

  // FUNÇÃO CORRIGIDA
  const handleConfirmDelete = async () => {
    if (!turmaToDelete?.id) return; // ✅ VERIFICAR SE ID EXISTE

    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "turmas", turmaToDelete.id));

      // Atualizar lista local
      setTurmas(turmas.filter((turma) => turma.id !== turmaToDelete.id));

      // Fechar modal
      setIsDeleteModalOpen(false);
      setTurmaToDelete(null);

      showToastMessage(
        `Turma "${turmaToDelete.modalidade} - ${turmaToDelete.professorNome}" excluída com sucesso!`,
        "success"
      );
    } catch (error) {
      console.error("Erro ao excluir turma:", error);
      showToastMessage("Erro ao excluir turma", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  //  FUNÇÃO CORRIGIDA
  const handleDeleteSelected = async (selectedTurmas: Turma[]) => {
    if (selectedTurmas.length === 0) return;

    const confirmMessage = `Tem certeza que deseja excluir ${selectedTurmas.length} turma(s) selecionada(s)? Esta ação não pode ser desfeita.`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      //  FILTRAR APENAS TURMAS COM ID VÁLIDO
      const turmasComId = selectedTurmas.filter((turma) => turma.id);

      if (turmasComId.length === 0) {
        showToastMessage("Nenhuma turma válida para exclusão!", "error");
        setLoading(false);
        return;
      }

      const deletePromises = turmasComId.map(
        (turma) => deleteDoc(doc(db, "turmas", turma.id!)) //  ! garante que ID existe
      );

      await Promise.all(deletePromises);

      // Atualizar lista local - usar apenas IDs válidos
      const deletedIds = turmasComId.map((turma) => turma.id);
      setTurmas(turmas.filter((turma) => !deletedIds.includes(turma.id)));

      showToastMessage(
        `${turmasComId.length} turma(s) excluída(s) com sucesso!`,
        "success"
      );
    } catch (error) {
      console.error("Erro ao excluir turmas:", error);
      showToastMessage("Erro ao excluir algumas turmas!", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleView = (turma: Turma) => {
    console.log("Vendo Alunos");
    setTurmaToView(turma);
    setIsViewModalOpen(true);
  };
  const handleExportCSV = () => {
    console.log("Exportar turmas - funcionalidade será implementada");
    showToastMessage(
      "Funcionalidade de exportação será implementada em breve",
      "success"
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <FaUsers className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Turmas</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaDownload />
            <span>Exportar</span>
          </button>
          <button
            onClick={handleCreateTurma}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaPlus />
            <span>Nova Turma</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total de Turmas</p>
              <p className="text-2xl font-bold text-gray-900">
                {turmasFiltradas.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Futevôlei</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  turmasFiltradas.filter((t) => t.modalidade === "Futevôlei")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Beach Tennis</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  turmasFiltradas.filter((t) => t.modalidade === "Beach Tennis")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-2xl text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Alunos</p>
              <p className="text-2xl font-bold text-gray-900">
                {turmasFiltradas.reduce(
                  (total, turma) => total + (turma.alunosInscritos || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <SearchAndFilters
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Buscar por professor ou modalidade..."
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
        ]}
      />

      <TurmasModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        turmaData={selectedTurma}
      />

      <DataTable
        data={turmasFiltradas}
        columns={colunasTurmas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onDeleteSelected={handleDeleteSelected}
        loading={loading}
        title="Lista de Turmas"
        emptyMessage="Nenhuma turma encontrada. Crie sua primeira turma!"
        itemsPerPage={15}
        selectable={true}
      />
      <ViewAlunosModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        turma={turmaToView}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTurmaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        item={turmaToDelete}
        itemType="turma"
        title="Excluir Turma"
        message="Tem certeza que deseja excluir esta turma? Todos os alunos matriculados serão desvinculados."
      />

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
