import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaPlus, FaDownload, FaChalkboardTeacher } from "react-icons/fa";
import DataTable from "../../components/componentsAdmin/DataTable";
import SearchAndFilters from "../../components/componentsAdmin/SearchAndFilters";
import Toast from "../../components/componentsAdmin/Toast";
import ProfessorModal from "../../components/componentsAdmin/ProfessorModal";
import { exportarProfessoresCSV } from "../../utils/exportarCsv";
import type { Professor } from "../../types/professor";

export default function GestaoProfessores() {
  const [listProf, setListProf] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(
    null
  );
  const [professorToDelete, setProfessorToDelete] = useState<Professor | null>(
    null
  );
  const [isModalDeleteOpen, setIsDeleteModalOpen] = useState(false);
  // Modal para mensagens Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [especialidadeFilter, setEspecialidadeFilter] = useState("");

  // Estado para exportar CSV
  const [csvLoading, setCsvLoading] = useState(false);

  // Configuração das colunas
  const columns = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "telefone", label: "Telefone" },
    { key: "especialidade", label: "Especialidade" },
    { key: "status", label: "Status" },
  ];

  // Configuração dos filtros
  const searchFilters = [
    {
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
      ],
    },
    {
      label: "Especialidade",
      value: especialidadeFilter,
      onChange: setEspecialidadeFilter,
      options: [
        { value: "Futevôlei", label: "Futevôlei" },
        { value: "Beach Tennis", label: "Beach Tennis" },
      ],
    },
  ];

  const professoresFiltrados = useMemo(() => {
    return listProf.filter((professor) => {
      // Filtro por texto de busca (nome ou email)
      const matchSearch =
        searchText === "" ||
        professor.nome.toLowerCase().includes(searchText.toLowerCase()) ||
        professor.email.toLowerCase().includes(searchText.toLowerCase());

      // Filtro por status
      const matchStatus =
        statusFilter === "" || professor.status === statusFilter;

      // Filtro por especialidade
      const matchEspecialidade =
        especialidadeFilter === "" ||
        professor.especialidade === especialidadeFilter;

      return matchSearch && matchStatus && matchEspecialidade;
    });
  }, [listProf, searchText, statusFilter, especialidadeFilter]);

  // Buscar Professores
  const fetchProfessores = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "professores"));
      const professoresData: Professor[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data && typeof data === "object") {
          professoresData.push({
            id: doc.id,
            nome: data.nome || "",
            email: data.email || "",
            telefone: data.telefone || "",
            status: data.status || "inativo",
            especialidade: data.especialidade || "Futevôlei",
            turmaIds: data.turmaIds || [],
          } as Professor);
        }
      });

      setListProf(professoresData);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      setToastMessage("Erro ao carregar professores");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfessores();
  }, []);

  const handleEditProf = (professor: Professor) => {
    setIsModalOpen(true);
    setSelectedProfessor(professor);
    setModalMode("edit");
  };

  const handleExportarCSV = async () => {
    try {
      setCsvLoading(true);
      setToastMessage("Iniciando exportação CSV...");
      setToastType("success");
      setShowToast(true);

      await exportarProfessoresCSV();

      setToastMessage("CSV exportado com sucesso!");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      setToastMessage("Erro ao exportar CSV. Tente novamente.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setCsvLoading(false);
    }
  };
  return (
    <div className="p-6">
      {/* 1. HEADER com título e botão "Novo Professor" */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaChalkboardTeacher className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestão de Professores
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportarCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={professoresFiltrados.length === 0}
          >
            <FaDownload />
            Exportar CSV
          </button>
          <button
            onClick={() => {
              setModalMode("create");
              setIsModalOpen(true);
              setSelectedProfessor(null);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Novo Professor
          </button>
        </div>
      </div>

      {/* 2. ÁREA DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaChalkboardTeacher className="text-2xl text-blue-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total de Professores
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {listProf.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaChalkboardTeacher className="text-2xl text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ativos</h3>
              <p className="text-2xl font-bold text-gray-900">
                {listProf.filter((prof) => prof.status === "Ativo").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaChalkboardTeacher className="text-2xl text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Inativos</h3>
              <p className="text-2xl font-bold text-gray-900">
                {listProf.filter((prof) => prof.status === "Inativo").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaChalkboardTeacher className="text-2xl text-purple-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Especialidades
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(listProf.map((prof) => prof.especialidade)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*SEARCHANDFILTERS*/}
      <SearchAndFilters
        searchValue={searchText}
        onSearchChange={setSearchText}
        filters={searchFilters}
        searchPlaceholder="Buscar por nome ou email..."
        searchLabel="Buscar Professor"
      />
      {/* DATATABLE */}
      <DataTable
        columns={columns}
        data={professoresFiltrados} // Use os dados filtrados
        loading={loading}
        onEdit={handleEditProf}
        title="Lista de Professores"
        emptyMessage="Nenhum professor encontrado. Cadastre o primeiro professor!"
        itemsPerPage={10}
      />

      {/* TOAST*/}

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* MODAL DO PROFESSOR */}
      {isModalOpen && (
        <ProfessorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProfessor(null);
            setModalMode("create");
          }}
          onSuccess={() => {
            fetchProfessores();
            setToastMessage(
              modalMode === "create"
                ? "Professor cadastrado com sucesso!"
                : "Professor atualizado com sucesso!"
            );
            setToastType("success");
            setShowToast(true);
          }}
          mode={modalMode}
          professorData={selectedProfessor}
        />
      )}
    </div>
  );
}
