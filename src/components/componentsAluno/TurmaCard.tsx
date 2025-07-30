// src/components/componentsAluno/ResumoCard.tsx

import { FaClock, FaUser, FaCalendarCheck } from 'react-icons/fa';

type TurmaCardProps = {
    modalidade: string;
    professor: string;
    horario: string;
    proximaAula: string;
    status: 'ativa' | 'inativa';
};

export default function TurmaCard({ modalidade, professor, horario, proximaAula, status }: TurmaCardProps) {
    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{modalidade}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            status === 'ativa' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status === 'ativa' ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400" />
          <span>{professor}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-gray-400" />
          <span>{horario}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarCheck className="text-green-500" />
          <span className="font-medium">Próxima: {proximaAula}</span>
        </div>
      </div>
    </div>
    );
}