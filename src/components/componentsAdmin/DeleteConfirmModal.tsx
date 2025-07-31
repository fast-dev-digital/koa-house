import { FaTimes, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

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

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  aluno: Aluno | null;
  loading: boolean;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, aluno, loading }: DeleteConfirmModalProps) {
  if (!isOpen || !aluno) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600" />
            <h2 className="text-lg font-bold text-red-800">Confirmar Exclusão</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <FaTrash className="text-red-600 text-xl" />
            </div>
            <p className="text-gray-700 text-sm mb-2">
              Tem certeza que deseja excluir o aluno?
            </p>
          </div>

          {/* Informações do aluno */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="space-y-1">
              <p className="text-sm"><span className="font-semibold">Nome:</span> {aluno.nome}</p>
              <p className="text-sm"><span className="font-semibold">Email:</span> {aluno.email}</p>
              <p className="text-sm"><span className="font-semibold">Plano:</span> {aluno.plano}</p>
              <p className="text-sm"><span className="font-semibold">Status:</span> {aluno.status}</p>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-xs text-center">
              ⚠️ Esta ação não pode ser desfeita. O aluno será removido permanentemente do sistema.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {loading ? (
                'Excluindo...'
              ) : (
                <>
                  <FaTrash className="text-xs" />
                  Excluir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
