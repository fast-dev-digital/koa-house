type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

function Modal({ isOpen, onClose, children}: ModalProps) {
    // Se a prop 'isOpen' for falsa, o componente não renderiza nada
    if (!isOpen) {
        return null;
    }

    return (
    // O Fundo (Overlay)
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose} // Fecha o modal ao clicar no fundo
    >
      {/* A Caixa de Conteúdo do Modal */}
      <div 
        className="bg-white rounded-lg shadow-xl p-6 relative max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // Impede que o clique DENTRO do modal o feche
      >
        {/* O Botão de Fechar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* O Conteúdo Personalizado */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;