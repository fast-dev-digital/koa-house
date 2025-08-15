// src/pages/pagesAluno/MeusPagamentos.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCreditCard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaWhatsapp
} from 'react-icons/fa';
import ResumoCard from '../../components/componentsAluno/ResumoCard';
import type { Pagamento } from '../../types/pagamentos';

export default function MeusPagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');

  // Dados mockados para demonstração (substituir pela integração real)
  useEffect(() => {
    const mockPagamentos: Pagamento[] = [
      {
        id: '1',
        alunoId: 'aluno1',
        alunoNome: 'João Silva',
        valor: 250,
        mesReferencia: '2025-01',
        dataVencimento: new Date('2025-01-05'),
        dataPagamento: new Date('2025-01-03'),
        status: 'Pago',
        createdAt: new Date('2024-12-01')
      },
      {
        id: '2',
        alunoId: 'aluno1',
        alunoNome: 'João Silva',
        valor: 250,
        mesReferencia: '2024-12',
        dataVencimento: new Date('2024-12-05'),
        dataPagamento: new Date('2024-12-04'),
        status: 'Pago',
        createdAt: new Date('2024-11-01')
      },
      {
        id: '3',
        alunoId: 'aluno1',
        alunoNome: 'João Silva',
        valor: 250,
        mesReferencia: '2025-02',
        dataVencimento: new Date('2025-02-05'),
        status: 'Pendente',
        createdAt: new Date('2025-01-01')
      }
    ];

    // Simular carregamento
    setTimeout(() => {
      setPagamentos(mockPagamentos);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar pagamentos
  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    if (filtroStatus === 'todos') return true;
    return pagamento.status.toLowerCase() === filtroStatus;
  });

  // Calcular estatísticas
  const totalPagamentos = pagamentos.length;
  const pagamentosPagos = pagamentos.filter(p => p.status === 'Pago').length;
  const pagamentosPendentes = pagamentos.filter(p => p.status === 'Pendente').length;
  const valorTotal = pagamentos.reduce((acc, p) => acc + p.valor, 0);

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(data);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusColor = (status: string) => {
    return status === 'Pago' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100';
  };

  const getStatusIcon = (status: string) => {
    return status === 'Pago' ? 
      <FaCheckCircle className="text-green-600" /> : 
      <FaExclamationTriangle className="text-orange-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus pagamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/aluno" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="text-lg" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Meus Pagamentos</h1>
                <p className="text-sm text-gray-600">Histórico financeiro e mensalidades</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
                <FaWhatsapp />
                Suporte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ResumoCard
            icon={<FaCreditCard className="text-blue-600" />}
            title="Total de Pagamentos"
            value={totalPagamentos.toString()}
            subtitle="Histórico completo"
            color="blue"
          />
          
          <ResumoCard
            icon={<FaCheckCircle className="text-green-600" />}
            title="Pagamentos em Dia"
            value={pagamentosPagos.toString()}
            subtitle="Mensalidades pagas"
            color="green"
          />
          
          <ResumoCard
            icon={<FaExclamationTriangle className="text-orange-600" />}
            title="Pendentes"
            value={pagamentosPendentes.toString()}
            subtitle="Aguardando pagamento"
            color="orange"
          />
          
          <ResumoCard
            icon={<FaCalendarAlt className="text-purple-600" />}
            title="Valor Total"
            value={formatarMoeda(valorTotal)}
            subtitle="Investimento total"
            color="purple"
          />
        </div>

        {/* Filtros e Tabela */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header da Tabela */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Pagamentos</h2>
              
              {/* Filtros */}
              <div className="flex items-center gap-4">
                <select 
                  value={filtroStatus} 
                  onChange={(e) => setFiltroStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pago">Pagos</option>
                  <option value="pendente">Pendentes</option>
                </select>
                
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
                  <FaDownload />
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            {pagamentosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FaCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filtroStatus === 'todos' ? 'Nenhum pagamento encontrado' : `Nenhum pagamento ${filtroStatus}`}
                </h3>
                <p className="text-gray-600">
                  {filtroStatus === 'todos' 
                    ? 'Seus pagamentos aparecerão aqui quando forem processados.'
                    : `Altere o filtro para ver outros pagamentos.`
                  }
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mês/Ano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagamentosFiltrados.map((pagamento) => (
                    <tr key={pagamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Intl.DateTimeFormat('pt-BR', { 
                            month: 'long', 
                            year: 'numeric' 
                          }).format(new Date(pagamento.mesReferencia + '-01'))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatarMoeda(pagamento.valor)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatarData(pagamento.dataVencimento)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pagamento.dataPagamento 
                            ? formatarData(pagamento.dataPagamento)
                            : '-'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                          {getStatusIcon(pagamento.status)}
                          {pagamento.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-green-600 hover:text-green-900 transition-colors">
                            <FaEye className="text-sm" />
                          </button>
                          {pagamento.status === 'Pago' && (
                            <button className="text-blue-600 hover:text-blue-900 transition-colors">
                              <FaDownload className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximo Vencimento */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-green-600" />
              Próximo Vencimento
            </h3>
            {pagamentosPendentes > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-semibold">05/02/2025</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold text-green-600">R$ 250,00</span>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Pagar Agora
                </button>
              </div>
            ) : (
              <p className="text-gray-600">Todos os pagamentos estão em dia! 🎉</p>
            )}
          </div>

          {/* Formas de Pagamento */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-blue-600" />
              Formas de Pagamento
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span>PIX (desconto de 5%)</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span>Cartão de Crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span>Boleto Bancário</span>
              </div>
              <div className="mt-4">
                <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                  <FaWhatsapp />
                  Dúvidas sobre pagamento?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}