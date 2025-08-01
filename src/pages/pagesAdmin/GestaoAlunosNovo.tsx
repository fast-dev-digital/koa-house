import { useState, useEffect, useMemo} from "react";
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
  plano: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  turmas: 'Seg-Qua' | 'Ter-Qui';
  horarios: '18:00' | '19:00' | '20:00' | '21:00';
  dataMatricula: string;
}

// Configuração das colunas da tabela
const alunosColumns = [
  {
    key: 'nome',
    label: 'Nome',
    sortable: true
  },
  {
    key: 'email', 
    label: 'Email',
    sortable: true
  },
  {
    key: 'telefone',
    label: 'Telefone'
  },
  {
    key: 'plano',
    label: 'Plano',
    sortable: true
  },
  {
    key: 'turmas',
    label: 'Turmas',
    sortable: true
  },
  {
    key: 'horarios', 
    label: 'Horários',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: string) => {
      const colors = {
        ativo: 'bg-green-100 text-green-700',
        inativo: 'bg-gray-100 text-gray-700', 
        suspenso: 'bg-red-100 text-red-700'
      };
      return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[value as keyof typeof colors] || colors.inativo}`}>
          {value || 'inativo'}
        </span>
      );
    }
  }
];

export default function GestaoAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para baixar cvs
  const [csvLoading, setCsvLoading] = useState(false);
  // Estados para busca e filtros
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [turmasFilter, setTurmasFilter] = useState('');
  const [horariosFilter, setHorariosFilter] = useState('');

  // ⚡ REATIVO - recalcula automaticamente quando algo muda
const alunosFiltrados = useMemo(() => {
  return alunos.filter(aluno => {
    const filtroNome = aluno.nome.toLowerCase().includes(searchText.toLowerCase());
    const filtroStatus = !statusFilter || aluno.status === statusFilter;
    const filtroTurmas = !turmasFilter || aluno.turmas === turmasFilter;
    const filtroHorarios = !horariosFilter || aluno.horarios === horariosFilter;
    
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
        if (data && typeof data === 'object') {
          alunosData.push({
            id: doc.id,
            nome: data.nome || '',
            email: data.email || '',
            telefone: data.telefone || '',
            plano: data.plano || '',
            status: data.status || 'inativo',
            turmas: data.turmas || 'Seg-Qua',
            horarios: data.horarios || '19:00',
            dataMatricula: data.dataMatricula || ''
          } as Aluno);
        }
      });
      
      setAlunos(alunosData);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  // Estados do Modal de Confirmação de Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState<Aluno | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Estados do Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  // Função helper para mostrar toast
  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Funções de callback para o DataTable
  const handleEdit = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setModalMode('edit');
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
      
      // 1. Deletar do Firestore
      await deleteDoc(doc(db, "Alunos", alunoToDelete.id));
     

      // 2. Tentar deletar do Firebase Auth (se existir)
      // Nota: Só é possível deletar o próprio usuário logado no Firebase Auth
      // Para deletar outros usuários, seria necessário usar Admin SDK no backend
      // Por agora, vamos apenas remover do Firestore
      ('ℹ️ Usuário removido do Firestore. Auth mantido para segurança.');

      // 3. Atualizar a lista local
      setAlunos(alunos.filter(aluno => aluno.id !== alunoToDelete.id));
      
      // 4. Fechar modal
      setIsDeleteModalOpen(false);
      setAlunoToDelete(null);

      // 5. Mostrar toast de sucesso
      showToastMessage(`Aluno "${alunoToDelete.nome}" foi excluído com sucesso!`, 'success');

    } catch (error: any) {
      console.error('❌ Erro ao excluir aluno:', error);
      showToastMessage(`Erro ao excluir aluno: ${error.message}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Função para deletar múltiplos alunos
  const handleDeleteSelected = async (selectedAlunos: Aluno[]) => {
    if (selectedAlunos.length === 0) return;

    // Confirmar a ação
    const confirmMessage = `Tem certeza que deseja excluir ${selectedAlunos.length} aluno(s) selecionado(s)? Esta ação não pode ser desfeita.`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      (`🗑️ Iniciando exclusão de ${selectedAlunos.length} alunos`);

      // Deletar todos os alunos selecionados do Firestore
      const deletePromises = selectedAlunos.map(aluno => 
        deleteDoc(doc(db, "Alunos", aluno.id))
      );
      
      await Promise.all(deletePromises);
      ('Todos os alunos foram removidos do Firestore');

      // Atualizar a lista local removendo os alunos excluídos
      const deletedIds = selectedAlunos.map(aluno => aluno.id);
      setAlunos(alunos.filter(aluno => !deletedIds.includes(aluno.id)));

      // Mostrar toast de sucesso
      showToastMessage(`${selectedAlunos.length} aluno(s) excluído(s) com sucesso!`, 'success');

    } catch (error) {
      console.error(' Erro ao excluir alunos:', error);
      showToastMessage('Erro ao excluir alguns alunos!', 'error');
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

  const handleView = (aluno: Aluno) => {
    console.log(aluno);
    // TODO: Implementar modal de visualização
  };

  // Função para abrir modal de criação
  const handleCreateAluno = () => {
    setSelectedAluno(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
  };

  // Função de sucesso do modal
  const handleModalSuccess = () => {
    ('🔄 Modal success - atualizando lista de alunos...');
    setIsModalOpen(false);
    setSelectedAluno(null);
    fetchAlunos(); // Recarrega a lista de alunos
    
    // Mostrar toast de sucesso
    const action = modalMode === 'create' ? 'cadastrado' : 'atualizado';
    showToastMessage(`Aluno ${action} com sucesso!`, 'success');
    
    ('✅ Lista de alunos atualizada com sucesso');
  };
  const handleExportarCSV = async () => {
    try {
      setCsvLoading(true);
      showToastMessage('Iniciando exportação CSV... ', 'success');
      
      await exportarAlunosCSV();

    }
    catch(erro) {
      showToastMessage('Erro ao exportar arquivo', 'error');
    } finally {
      setCsvLoading(false);
    }
  }
  return (
    <div className="p-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gestão de Alunos</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportarCSV}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
            disabled={alunos.length === 0 || csvLoading}
          >
            <FaDownload className={`text-xs${csvLoading ? 'animate-spin' : ''}`} /> Exportar CSV
          </button>
          <button
            onClick={handleCreateAluno}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
          >
            <FaPlus className="text-xs" /> Novo Aluno
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600">Total de Alunos</p>
              <p className="text-lg font-bold text-gray-900">{alunosFiltrados.length}</p>
            </div>
            <div className="ml-3">
              <div className="bg-blue-100 rounded-full p-2">
                <FaUser className="text-blue-600 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600">Alunos Ativos</p>
              <p className="text-lg font-bold text-green-600">
                {alunosFiltrados.filter(a => a.status === 'ativo').length}
              </p>
            </div>
            <div className="ml-3">
              <div className="bg-green-100 rounded-full p-2">
                <FaUser className="text-green-600 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600">Alunos Inativos</p>
              <p className="text-lg font-bold text-gray-600">
                {alunosFiltrados.filter(a => a.status === 'inativo').length}
              </p>
            </div>
            <div className="ml-3">
              <div className="bg-gray-100 rounded-full p-2">
                <FaUser className="text-gray-600 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600">Alunos Suspensos</p>
              <p className="text-lg font-bold text-red-600">
                {alunosFiltrados.filter(a => a.status === 'suspenso').length}
              </p>
            </div>
            <div className="ml-3">
              <div className="bg-red-100 rounded-full p-2">
                <FaUser className="text-red-600 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Busca e Filtros */}
      <SearchAndFilters
        searchValue={searchText}
        statusFilter={statusFilter}
        turmasFilter={turmasFilter}
        horariosFilter={horariosFilter}
        onSearchChange={setSearchText}
        onStatusChange={setStatusFilter}
        onTurmasChange={setTurmasFilter}
        onHorariosChange={setHorariosFilter}
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
        aluno={alunoToDelete}
        loading={deleteLoading}
      />
      
      {/* DataTable */}
      <DataTable
        data={alunosFiltrados}
        columns={alunosColumns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onView={handleView}
        selectable={true}
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
