import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  item?: any; // Item genérico
  itemType?: string; // "aluno", "turma", "professor"
  title?: string; // Título customizável
  message?: string; // Mensagem customizável
  confirmText?: string; // Texto do botão confirmar
  cancelText?: string; // Texto do botão cancelar
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  item,
  itemType = "item",
  title,
  message,
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  // Gera título automático se não fornecido
  const modalTitle = title || `Excluir ${itemType}`;

  // Gera mensagem automática se não fornecida
  const modalMessage =
    message ||
    `Tem certeza que deseja excluir este ${itemType}? Esta ação não pode ser desfeita.`;

  // Tenta extrair nome do item para exibir
  const itemName =
    item?.nome || item?.professorNome || item?.email || `${itemType}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 relative z-[10000] border-2 border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900">
              {modalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-600 mb-4">{modalMessage}</p>

          {item && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">{itemName}</p>
              {item.email && (
                <p className="text-sm text-gray-600">{item.email}</p>
              )}
              {item.modalidade && (
                <p className="text-sm text-gray-600">
                  {item.modalidade} - {item.genero}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Excluindo...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
