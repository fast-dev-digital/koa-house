import { FaSearch } from 'react-icons/fa';

// Interface para as props do componente
interface SearchAndFiltersProps {
  // 📥 ENTRADAS (valores atuais)
  searchValue: string;           
  statusFilter: string;          
  turmasFilter: string;          
  horariosFilter: string;        
  
  // 📤 SAÍDAS (funções de callback)
  onSearchChange: (value: string) => void;      
  onStatusChange: (value: string) => void;      
  onTurmasChange: (value: string) => void;      
  onHorariosChange: (value: string) => void;    
}

export default function SearchAndFilters({
  searchValue,
  statusFilter,
  turmasFilter,
  horariosFilter,
  onSearchChange,
  onStatusChange,
  onTurmasChange,
  onHorariosChange
}: SearchAndFiltersProps) {
  
  return (
    <div className="bg-white rounded-lg shadow p-3 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        
        {/* 🔍 CAMPO DE BUSCA */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Buscar por Nome
          </label>
          <div className="relative">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" style={{fontSize: '10px'}} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Digite o nome do aluno..."
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 🎛️ FILTRO POR STATUS */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="suspenso">Suspenso</option>
          </select>
        </div>

        {/* 🎛️ FILTRO POR TURMAS */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Turmas
          </label>
          <select
            value={turmasFilter}
            onChange={(e) => onTurmasChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas as Turmas</option>
            <option value="Seg-Qua">Segunda e Quarta</option>
            <option value="Ter-Qui">Terça e Quinta</option>
          </select>
        </div>

        {/* 🎛️ FILTRO POR HORÁRIOS */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Horários
          </label>
          <select
            value={horariosFilter}
            onChange={(e) => onHorariosChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os Horários</option>
            <option value="18:00">18:00</option>
            <option value="19:00">19:00</option>
            <option value="20:00">20:00</option>
            <option value="21:00">21:00</option>
          </select>
        </div>

      </div>
    </div>
  );
}
