import { useState } from "react";
import { FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

interface LocacaoMensalProps {
  onReservar: (dataInicio: Date, dataFim: Date) => Promise<void>;
}

export default function LocacaoMensal({ onReservar }: LocacaoMensalProps) {
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular quantidade de dias
  const calcularDias = () => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diferenca = fim.getTime() - inicio.getTime();
    return Math.ceil(diferenca / (1000 * 3600 * 24)) + 1;
  };

  const diasSelecionados = calcularDias();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dataInicio || !dataFim) {
      setError("Por favor, selecione as datas de início e fim");
      return;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (fim < inicio) {
      setError("A data de fim deve ser posterior à data de início");
      return;
    }

    // Validar se é realmente mensal (mínimo 28 dias)
    if (diasSelecionados < 28) {
      setError("Locação mensal requer no mínimo 28 dias");
      return;
    }

    try {
      setLoading(true);
      await onReservar(inicio, fim);

      // Resetar formulário
      setDataInicio("");
      setDataFim("");
      alert(`Reserva confirmada para ${diasSelecionados} dias!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao realizar reserva");
    } finally {
      setLoading(false);
    }
  };

  // Data mínima: hoje
  const hoje = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-blue-600" />
        <h2 className="text-lg font-semibold">Locação Mensal</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Data de Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Início
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            min={hoje}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Data de Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Término
          </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            min={dataInicio || hoje}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Resumo */}
        {diasSelecionados > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <FaCheckCircle />
              <span className="font-medium">
                {diasSelecionados} dias selecionados
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {diasSelecionados >= 28
                ? "✓ Período válido para locação mensal"
                : `⚠️ Faltam ${28 - diasSelecionados} dias para completar 1 mês`}
            </p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={loading || diasSelecionados < 28}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processando...
            </>
          ) : (
            <>
              <FaCalendarAlt />
              Confirmar Reserva Mensal
            </>
          )}
        </button>
      </form>
    </div>
  );
}
