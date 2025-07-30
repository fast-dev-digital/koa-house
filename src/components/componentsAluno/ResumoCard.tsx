// src/components/componentsAluno/ResumoCard.tsx

type ResumoCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
};

const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',      // ✅ Corrigido
    green: 'bg-green-50 border-green-200',   // ✅ Corrigido
    purple: 'bg-purple-50 border-purple-200', // ✅ Corrigido
    orange: 'bg-orange-50 border-orange-200', // ✅ Corrigido
};

export default function ResumoCard({ icon, title, value, subtitle, color }: ResumoCardProps) {
    return (
        <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{icon}</div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
    );
}