// src/components/componentsAluno/ResumoCard.tsx

import { FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';

type StatusPagamentoProps = {
    status: 'em-dia' | 'pendente' | 'atrasado';
    proximoVencimento: string;
    valor: string;
};

const statusConfig = {
    'em-dia': {
        icon: <FaCheckCircle className="text-green-500" />,
        text: 'Em dia',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
    },
    'pendente': {
        icon: <FaExclamationCircle className="text-yellow-500" />,
        text: 'Pendente',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
    },
    'atrasado': {
        icon: <FaTimesCircle className="text-red-500" />,
        text: 'Atrasado',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
    }
};

export default function StatusPagamento({ status, proximoVencimento, valor }: StatusPagamentoProps) {
    const config = statusConfig[status];

    return (
        <div className={`p-4 rounded-lg border ${config.bgColor}`}>
            <div className="flex items-center gap-2 mb-2">
                {config.icon}
                <span className={`font-medium ${config.textColor}`}>{config.text}</span>
            </div>
            <div className="text-sm text-gray-600">
                <div>Próximo Vencimento: {proximoVencimento}</div>
                <div>Valor: {valor}</div>
            </div>
        </div>
    );
}