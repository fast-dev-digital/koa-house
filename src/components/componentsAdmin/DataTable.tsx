import { useState } from "react";
import { FaEdit, FaTrash, FaUsers } from "react-icons/fa";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  onDeleteSelected?: (items: any[]) => void;
  loading?: boolean;
  selectable?: boolean;
  title?: string;
  emptyMessage?: string;
  itemsPerPage?: number;
}

export default function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onDeleteSelected,
  loading = false,
  selectable = false,
  title,
  emptyMessage = "Nenhum item encontrado",
  itemsPerPage = 20,
}: DataTableProps) {
  // ✅ DEBUG DAS PROPS
  console.log("🎯 DataTable props:", {
    onEdit: !!onEdit,
    onDelete: !!onDelete,
    onView: !!onView,
  });

  const [currentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const isSelected = (item: any) =>
    selectedItems.some((selected) => selected.id === item.id);

  const handleSelectItem = (item: any) => {
    if (isSelected(item)) {
      setSelectedItems(
        selectedItems.filter((selected) => selected.id !== item.id)
      );
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}

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

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      currentPageData.length > 0 &&
                      selectedItems.length === currentPageData.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}

              {/* ✅ VERIFICAR SE MOSTRA COLUNA AÇÕES */}
              {(onEdit || onDelete || onView) && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (onEdit || onDelete || onView ? 1 : 0)
                  }
                  className="px-3 py-8 text-center text-gray-500 text-sm"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (onEdit || onDelete || onView ? 1 : 0)
                  }
                  className="px-3 py-8 text-center text-gray-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentPageData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={`hover:bg-gray-50 transition-colors ${
                    isSelected(item) ? "bg-blue-50" : ""
                  }`}
                >
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

                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-2 whitespace-nowrap"
                    >
                      <div className="text-xs text-gray-900">
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key] || "-"}
                      </div>
                    </td>
                  ))}

                  {/* ✅ BOTÕES DE AÇÃO COM DEBUG COMPLETO */}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        {onView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("👁️ Botão Visualizar clicado!");
                              console.log("👁️ Item:", item);
                              console.log("👁️ onView function:", onView);
                              onView(item);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors hover:bg-blue-50"
                            title="Gerenciar Alunos"
                          >
                            <FaUsers className="text-xs" />
                          </button>
                        )}

                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("✏️ Botão Editar clicado!");
                              console.log("✏️ Item:", item);
                              console.log("✏️ onEdit function:", onEdit);
                              onEdit(item);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors hover:bg-yellow-50"
                            title="Editar"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("🗑️ Botão Deletar clicado!");
                              console.log("🗑️ Item:", item);
                              console.log("🗑️ Item ID:", item.id);
                              console.log("🗑️ Item nome:", item.nome);
                              console.log("🗑️ onDelete function:", onDelete);
                              console.log("🗑️ Chamando onDelete...");
                              onDelete(item);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors hover:bg-red-50"
                            title="Deletar"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white px-3 py-2 border-t border-gray-200 flex items-center justify-between">
        <div className="text-xs text-gray-700">
          Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de{" "}
          {data.length} resultados
        </div>
        <div className="text-xs text-gray-700">
          Página {currentPage} de {totalPages}
        </div>
      </div>
    </div>
  );
}
