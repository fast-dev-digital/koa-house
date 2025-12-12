import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import type { DadosEditaveisAluno } from "../../types/pagamentos";
import type { AlunoComPagamentos } from "../../services/integracaoService";
interface EditarAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: AlunoComPagamentos | null;
  onSave: (dados: DadosEditaveisAluno) => Promise<void>;
  loading?: boolean;
}

export default function EditarAlunoModal({
  isOpen,
  onClose,
  aluno,
  onSave,
}: EditarAlunoModalProps) {
  // ✅ ESTADOS
  const [plano, setPlano] = useState("");
  const [valorMensalidade, setValorMensalidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataFinalMatricula, setDataFinalMatricula] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // ✅ CARREGAR DADOS DO ALUNO QUANDO MODAL ABRE
  useEffect(() => {
    if (isOpen && aluno) {
      setPlano(aluno.plano || "");
      setValorMensalidade(String(aluno.valorMensalidade || ""));
      setTelefone(aluno.telefone || "");

      // Converter Date para formato YYYY-MM-DD para input
      if (aluno.dataFinalMatricula) {
        let date: Date;

        // Tratar Timestamp do Firestore
        if (
          typeof aluno.dataFinalMatricula === "object" &&
          "seconds" in aluno.dataFinalMatricula
        ) {
          date = new Date((aluno.dataFinalMatricula as any).seconds * 1000);
        } else if (aluno.dataFinalMatricula instanceof Date) {
          date = aluno.dataFinalMatricula;
        } else {
          date = new Date(aluno.dataFinalMatricula);
        }

        if (!isNaN(date.getTime())) {
          const ano = date.getFullYear();
          const mes = String(date.getMonth() + 1).padStart(2, "0");
          const dia = String(date.getDate()).padStart(2, "0");
          setDataFinalMatricula(`${ano}-${mes}-${dia}`);
        } else {
          setDataFinalMatricula("");
        }
      } else {
        setDataFinalMatricula("");
      }

      setErro("");
    }
  }, [isOpen, aluno]);

  // ✅ VALIDAR DADOS
  const validarDados = (): boolean => {
    if (!plano.trim()) {
      setErro("Plano não pode estar vazio");
      return false;
    }

    const valor = parseFloat(valorMensalidade);
    if (isNaN(valor) || valor <= 0) {
      setErro("Valor da mensalidade deve ser maior que 0");
      return false;
    }

    if (dataFinalMatricula) {
      const date = new Date(dataFinalMatricula);
      if (isNaN(date.getTime())) {
        setErro("Data final inválida");
        return false;
      }
    }

    setErro("");
    return true;
  };

  // ✅ HANDLE SALVAR
  const handleSalvar = async () => {
    if (!validarDados() || !aluno) return;

    try {
      setSalvando(true);
      const dadosEditaveis: DadosEditaveisAluno = {
        plano: plano.trim(),
        valorMensalidade: parseFloat(valorMensalidade),
        telefone: telefone.trim(),
        dataFinalMatricula: dataFinalMatricula
          ? new Date(dataFinalMatricula)
          : undefined,
      };

      await onSave(dadosEditaveis);
      setSalvando(false);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setErro("Erro ao salvar dados. Tente novamente.");
      setSalvando(false);
    }
  };

  if (!isOpen || !aluno) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Editar Dados - {aluno.nome}
          </h2>
          <button
            onClick={onClose}
            disabled={salvando}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* FORMULÁRIO */}
        <div className="space-y-4">
          {/* PLANO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plano
            </label>
            <select
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              disabled={salvando}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Selecionar plano...</option>
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
            </select>
          </div>

          {/* VALOR MENSALIDADE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Mensalidade (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valorMensalidade}
              onChange={(e) => setValorMensalidade(e.target.value)}
              disabled={salvando}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* TELEFONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              disabled={salvando}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* DATA FINAL MATRÍCULA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final da Matrícula (Opcional)
            </label>
            <input
              type="date"
              value={dataFinalMatricula}
              onChange={(e) => setDataFinalMatricula(e.target.value)}
              disabled={salvando}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* ERRO */}
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{erro}</p>
            </div>
          )}
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={salvando}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
