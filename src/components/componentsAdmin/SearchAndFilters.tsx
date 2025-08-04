import { FaSearch } from "react-icons/fa";

// Interface para configuração de cada filtro
interface FilterConfig {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Interface para as props do componente
interface SearchAndFiltersProps {
  // 📥 BUSCA
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;

  // 📥 FILTROS DINÂMICOS
  filters: FilterConfig[];
}

export default function SearchAndFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Digite para buscar...",
  searchLabel = "Buscar",
  filters,
}: SearchAndFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3 mb-3">
      <div
        className={`grid grid-cols-1 md:grid-cols-${Math.min(
          filters.length + 1,
          4
        )} gap-2`}
      >
        {/* 🔍 CAMPO DE BUSCA */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {searchLabel}
          </label>
          <div className="relative">
            <FaSearch
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              style={{ fontSize: "10px" }}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 🎛️ FILTROS DINÂMICOS */}
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                {filter.placeholder || `Todos(as) ${filter.label}`}
              </option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
