import { useState } from 'react';
import { FaEdit, FaTrash} from 'react-icons/fa';

// Interface para definir como cada coluna vai funcionar
interface Column {
  key: string;           // Nome do campo no objeto (ex: 'nome', 'email')
  label: string;         // Texto que aparece no cabeçalho (ex: 'Nome do Aluno')
  sortable?: boolean;    // Se a coluna pode ser ordenada
  render?: (value: any, row: any) => React.ReactNode; // Função personalizada para renderizar
}

// Interface para as props que o componente vai receber
interface DataTableProps {
  data: any[];                    // Array com os dados para exibir
  columns: Column[];              // Configuração das colunas
  onEdit?: (item: any) => void;   // Função chamada quando clica em editar
  onDelete?: (item: any) => void; // Função chamada quando clica em deletar
  onDeleteSelected?: (items: any[]) => void; // Função para deletar selecionados
  loading?: boolean;              // Se está carregando dados
  selectable?: boolean;           // Se permite seleção múltipla
}

export default function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  onDeleteSelected,
  loading = false,
  selectable = false
}: DataTableProps) {
  // Estados internos do componente
  const [currentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  // Configurações
  const itemsPerPage = 20;

  // Calcular dados da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = data.slice(startIndex, endIndex);

  // Calcular total de páginas
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Funções de seleção
  const isSelected = (item: any) => selectedItems.some(selected => selected.id === item.id);
  
  const handleSelectItem = (item: any) => {
    if (isSelected(item)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentPageData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...currentPageData]);
    }
  };

  const handleDeleteSelected = () => {
    if (onDeleteSelected && selectedItems.length > 0) {
      onDeleteSelected(selectedItems);
      setSelectedItems([]);
    }
  };

  // TODO: Implementar lógica de ordenação

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Barra de ações para itens selecionados */}
      {selectable && selectedItems.length > 0 && (
        <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedItems.length} item(ns) selecionado(s)
            </span>
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-2"
            >
              <FaTrash className="text-xs" />
              Excluir Selecionados
            </button>
          </div>
        </div>
      )}

      {/* Cabeçalho da tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox para selecionar todos */}
              {selectable && (
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={currentPageData.length > 0 && selectedItems.length === currentPageData.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
              )}
              
              {/* Renderizar cada coluna */}
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                  {/* TODO: Adicionar ícones de ordenação se sortable=true */}
                </th>
              ))}
              
              {/* Coluna de ações */}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1)} className="px-3 py-3 text-center text-gray-500 text-sm">
                  Carregando...
                </td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1)} className="px-3 py-3 text-center text-gray-500 text-sm">
                  Nenhum item encontrado
                </td>
              </tr>
            ) : (
              currentPageData.map((item, index) => (
                <tr key={item.id || index} className={`hover:bg-gray-50 ${isSelected(item) ? 'bg-blue-50' : ''}`}>
                  {/* Checkbox individual */}
                  {selectable && (
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected(item)}
                        onChange={() => handleSelectItem(item)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                  )}
                  
                  {/* Renderizar cada coluna */}
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {column.render 
                          ? column.render(item[column.key], item)
                          : item[column.key] || '-'
                        }
                      </div>
                    </td>
                  ))}
                  
                  {/* Coluna de ações */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Editar"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Deletar"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Rodapé com paginação */}
      <div className="bg-white px-3 py-2 border-t border-gray-200 flex items-center justify-between">
        <div className="text-xs text-gray-700">
          Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} resultados
        </div>
        
        <div className="text-xs text-gray-700">
          Página {currentPage} de {totalPages}
          {/* TODO: Adicionar botões Anterior/Próximo */}
        </div>
      </div>
    </div>
  );
}
