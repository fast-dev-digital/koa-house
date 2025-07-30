// src/pages/pagesAluno/DashboardAluno.tsx

import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"
import {
    FaUser,
    FaCalendarAlt,
    FaCreditCard,
    FaWhatsapp,
    FaBookOpen,
    FaChartLine
} from "react-icons/fa";

// ✅ IMPORTS DOS COMPONENTES
import ResumoCard from "../../components/componentsAluno/ResumoCard";
import TurmaCard from "../../components/componentsAluno/TurmaCard";
import StatusPagamento from "../../components/componentsAluno/StatusPagamento";

export default function DashboardAluno() {
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {currentUser?.displayName || 'Aluno'}! 👋
              </h1>
              <p className="text-gray-600">Bem-vindo à sua área pessoal</p>
            </div>
            <div className="flex space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <FaWhatsapp />
                Contato Rápido
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ResumoCard
            icon={<FaBookOpen className="text-blue-600" />}
            title="Turmas Ativas"
            value="2"
            subtitle="Futevôlei e Beach Tennis"
            color="blue"
          />
          <ResumoCard
            icon={<FaCreditCard className="text-green-600" />}
            title="Pagamentos"
            value="Em dia"
            subtitle="Próximo venc: 15/08"
            color="green"
          />
          <ResumoCard
            icon={<FaCalendarAlt className="text-purple-600" />}
            title="Próxima Aula"
            value="Hoje"
            subtitle="18:00 - Futevôlei"
            color="purple"
          />
          <ResumoCard
            icon={<FaChartLine className="text-orange-600" />}
            title="Frequência"
            value="85%"
            subtitle="Últimos 30 dias"
            color="orange"
          />
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Minhas Turmas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Minhas Turmas</h2>
                <Link 
                  to="/aluno/turmas" 
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="space-y-4">
                <TurmaCard
                  modalidade="Futevôlei"
                  professor="Prof. Carlos"
                  horario="Seg, Qua, Sex - 18:00"
                  proximaAula="Hoje, 18:00"
                  status="ativa"
                />
                <TurmaCard
                  modalidade="Beach Tennis"
                  professor="Prof. Ana"
                  horario="Ter, Qui - 19:00"
                  proximaAula="Amanhã, 19:00"
                  status="ativa"
                />
              </div>
            </div>

            {/* Histórico Recente */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Pagamento confirmado</p>
                    <p className="text-xs text-gray-500">Mensalidade de Julho - há 2 dias</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Aula realizada</p>
                    <p className="text-xs text-gray-500">Futevôlei - Ontem às 18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status de Pagamento */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Financeiro</h3>
              <StatusPagamento
                status="em-dia"
                proximoVencimento="15/08/2025"
                valor="R$ 250,00"
              />
              <Link 
                to="/aluno/pagamentos"
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center block transition-colors"
              >
                Ver Histórico
              </Link>
            </div>

            {/* Acesso Rápido */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h3>
              <div className="space-y-3">
                <Link 
                  to="/aluno/perfil"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaUser className="mr-3 text-gray-400" />
                  Meu Perfil
                </Link>
                <Link 
                  to="/aluno/turmas"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaBookOpen className="mr-3 text-gray-400" />
                  Minhas Turmas
                </Link>
                <button className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left">
                  <FaWhatsapp className="mr-3 text-green-500" />
                  Suporte WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}