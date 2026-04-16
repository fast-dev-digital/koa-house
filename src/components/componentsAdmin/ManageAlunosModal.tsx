import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  buscarTodosAlunos,
  atualizarAluno,
  recarregarCache,
} from "../../services/alunoService";
import {
  buscarTodasTurmas,
  atualizarTurma,
  type TurmaUpdate,
} from "../../services/turmaService";
import type { Aluno } from "../../types/alunos";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import type { Turma } from "../../types/turmas";
import SearchInput from "./SearchInput";
import Toast from "./Toast";

interface ManageAlunosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  turma: Turma | null;
}

export default function ManageAlunosModal({
  isOpen,
  onClose,
  onSuccess,
  turma,
}: ManageAlunosModalProps) {
  const { currentTenantId } = useAuth();
  // ✅ ESTADOS CONSOLIDADOS
  const [activeTab, setActiveTab] = useState<"matriculados" | "disponiveis">(
    "matriculados",
  );
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [, setAlunosDisponiveis] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDisponiveis, setLoadingDisponiveis] = useState(false);
  const [loadingRemover, setLoadingRemover] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedAlunosIds, setSelectedAlunosIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // ✅ CACHE GLOBAL - Uma única query para todos os dados
  const [todosAlunos, setTodosAlunos] = useState<Aluno[]>([]);
  const [todasTurmas, setTodasTurmas] = useState<Map<string, any>>(new Map());

  // ✅ HELPER - Toast
  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  // ✅ HELPER - Migração automática
  const migrarTurmaId = (alunoData: any) => ({
    ...alunoData,
    turmasIds:
      alunoData.turmasIds || (alunoData.turmaId ? [alunoData.turmaId] : []),
  });

  // Carregar todos os dados
  const carregarDadosCompletos = async () => {
    if (!currentTenantId) {
      showToast("Tenant não encontrado na sessão", "error");
      return;
    }

    if (todosAlunos.length > 0 && todasTurmas.size > 0) return; // Cache já carregado

    try {
      setLoading(true);
      ("📡 Carregando dados completos com SERVICES...");

      const [alunosData, turmasData] = await Promise.all([
        buscarTodosAlunos(currentTenantId), // ✅ SERVICE COM CACHE
        buscarTodasTurmas(currentTenantId), // ✅ SERVICE COM CACHE
        recarregarCache(currentTenantId), // ✅ FORÇA ATUALIZAÇÃO DO CACHE (opcional, dependendo da validade do cache)
      ]);

      const alunosAtivos = alunosData.filter(
        (aluno) => aluno.status === "Ativo",
      );

      const alunosProcessados = alunosAtivos.map((aluno) =>
        migrarTurmaId(aluno),
      );

      const turmasMap = new Map();
      turmasData.forEach((turma) => {
        turmasMap.set(turma.id, turma);
      });

      setTodosAlunos(alunosProcessados);
      setTodasTurmas(turmasMap);
      `✅ Cache carregado: ${alunosProcessados.length} alunos ativos, ${turmasMap.size} turmas`;
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      showToast("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO - Filtrar alunos matriculados (do cache)
  const calcularAlunosMatriculados = () => {
    if (!turma?.id) return [];

    return todosAlunos.filter((aluno) => aluno.turmasIds?.includes(turma.id!));
  };

  // ✅ FUNÇÃO - Filtrar alunos disponíveis (do cache)
  const calcularAlunosDisponiveis = () => {
    if (!turma?.id) return [];

    return todosAlunos.filter((aluno) => {
      // Já está nesta turma?
      const jaNestaTurma = aluno.turmasIds?.includes(turma.id!);
      if (jaNestaTurma) return false;

      // Filtro por gênero (exceto Beach Tennis, Teens e Vôlei)
      if (
        turma.modalidade !== "Beach Tennis" &&
        turma.genero !== "Teens" &&
        turma.modalidade !== "Vôlei" &&
        aluno.genero !== turma.genero
      ) {
        return false;
      }

      // Já tem turma da mesma modalidade?
      const turmasDoAluno = aluno.turmasIds || [];
      const jaTemModalidade = turmasDoAluno.some((turmaId) => {
        const turmaData = todasTurmas.get(turmaId);
        return turmaData?.modalidade === turma.modalidade;
      });

      return !jaTemModalidade;
    });
  };

  // ✅ SUBSTITUIR removerAlunoDaTurma - MANTER LÓGICAS DE VALIDAÇÃO
  const removerAlunoDaTurma = async (aluno: Aluno) => {
    if (!currentTenantId) {
      showToast("Tenant não encontrado na sessão", "error");
      return;
    }

    if (
      !turma?.id ||
      !confirm(`Tem certeza que deseja remover ${aluno.nome} desta turma?`)
    )
      return;

    setLoadingRemover(aluno.id);
    try {
      // ✅ MANTER LÓGICA DE FILTRO
      const novasTurmas = (aluno.turmasIds || []).filter(
        (id) => id !== turma.id,
      );

      // ✅ USAR SERVICES (SEM BATCH MANUAL)
      await Promise.all([
        // Atualizar aluno via service
        atualizarAluno(
          aluno.id,
          {
            turmasIds: novasTurmas,
            ...(novasTurmas.length === 0 && { turmaId: "" }),
          },
          currentTenantId,
        ),
        // Atualizar contador da turma via service
        atualizarTurma(currentTenantId, turma.id, {
          alunosInscritos: Math.max(0, alunos.length - 1),
        } as TurmaUpdate),
      ]);

      // ✅ MANTER LÓGICA DE CACHE LOCAL
      setTodosAlunos((prev) =>
        prev.map((a) =>
          a.id === aluno.id
            ? {
                ...a,
                turmasIds: novasTurmas,
                ...(novasTurmas.length === 0 && { turmaId: "" }),
              }
            : a,
        ),
      );

      showToast(`${aluno.nome} foi removido da turma com sucesso!`, "success");
      onSuccess();
    } catch (error) {
      console.error("❌ Erro ao remover aluno:", error);
      showToast("Erro ao remover aluno da turma", "error");
    } finally {
      setLoadingRemover(null);
    }
  };

  // ✅ FUNÇÃO - Adicionar alunos (otimizada com batch)
  const adicionarAlunosNaTurma = async () => {
    if (!currentTenantId) {
      showToast("Tenant não encontrado na sessão", "error");
      return;
    }

    if (!turma?.id || selectedAlunosIds.length === 0) return;

    const vagasDisponiveis = (turma.capacidade || 0) - alunos.length;
    if (selectedAlunosIds.length > vagasDisponiveis) {
      showToast(
        `Turma tem apenas ${vagasDisponiveis} vaga(s) disponível(eis)`,
        "error",
      );
      return;
    }

    setLoadingDisponiveis(true);
    try {
      // ✅ USAR SERVICES EM VEZ DE BATCH MANUAL
      const alunosParaAtualizar = selectedAlunosIds.map(async (alunoId) => {
        const aluno = todosAlunos.find((a) => a.id === alunoId);
        if (aluno) {
          const novasTurmas = [...(aluno.turmasIds || []), turma.id!];
          return atualizarAluno(
            alunoId,
            {
              turmasIds: novasTurmas,
            },
            currentTenantId,
          );
        }
      });

      // ✅ EXECUTAR TODAS AS ATUALIZAÇÕES EM PARALELO
      await Promise.all([
        ...alunosParaAtualizar,
        // Atualizar contador da turma via service
        atualizarTurma(currentTenantId, turma.id, {
          alunosInscritos: alunos.length + selectedAlunosIds.length,
        } as TurmaUpdate),
      ]);

      // ✅ ATUALIZAR CACHE LOCAL
      setTodosAlunos((prev) =>
        prev.map((aluno) => {
          if (selectedAlunosIds.includes(aluno.id)) {
            const novasTurmas = [...(aluno.turmasIds || []), turma.id!];
            return {
              ...aluno,
              turmasIds: novasTurmas,
              turmaId: novasTurmas[0] || "",
            };
          }
          return aluno;
        }),
      );

      showToast(
        `🎉 ${selectedAlunosIds.length} aluno(s) adicionado(s) com sucesso!`,
        "success",
      );
      setSelectedAlunosIds([]);
      setActiveTab("matriculados");
      onSuccess();
    } catch (error) {
      console.error("❌ Erro ao adicionar alunos:", error);
      showToast("❌ Erro ao adicionar alunos. Tente novamente.", "error");
    } finally {
      setLoadingDisponiveis(false);
    }
  };

  // ✅ FUNÇÃO - Toggle seleção
  const toggleAlunoSelection = (alunoId: string) => {
    setSelectedAlunosIds((prev) =>
      prev.includes(alunoId)
        ? prev.filter((id) => id !== alunoId)
        : [...prev, alunoId],
    );
  };

  // ✅ COMPUTED - Dados filtrados (do cache)
  const alunosMatriculados = calcularAlunosMatriculados();
  const alunosDisponiveisCompletos = calcularAlunosDisponiveis();
  const alunosDisponiveisFiltrados = alunosDisponiveisCompletos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ✅ EFFECTS OTIMIZADOS
  useEffect(() => {
    if (isOpen && turma) {
      carregarDadosCompletos();
      setActiveTab("matriculados");
      setSearchText("");
      setSelectedAlunosIds([]);
    }
  }, [isOpen, turma]);

  // ✅ EFFECT - Atualizar estados quando cache mudar
  useEffect(() => {
    setAlunos(alunosMatriculados);
    setAlunosDisponiveis(alunosDisponiveisCompletos);
  }, [todosAlunos, turma?.id]);

  if (!isOpen || !turma) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Gerenciar Alunos - {turma.nome}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {turma.modalidade} • {turma.genero} • {alunos.length}/
              {turma.capacidade || 0} alunos
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("matriculados")}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === "matriculados"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Alunos Matriculados ({alunos.length})
          </button>
          <button
            onClick={() => setActiveTab("disponiveis")}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === "disponiveis"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Adicionar Alunos ({alunosDisponiveisFiltrados.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === "matriculados" ? (
            <div>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : alunos.length === 0 ? (
                <div className="text-center py-12">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nenhum aluno matriculado
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Esta turma ainda não possui alunos matriculados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alunos.map((aluno) => (
                    <div key={aluno.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {aluno.nome}
                            </h5>
                            <div className="flex items-center space-x-4 mt-1">
                              {aluno.email && (
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <FaEnvelope className="text-xs" />
                                  <span>{aluno.email}</span>
                                </div>
                              )}
                              {aluno.telefone && (
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <FaPhone className="text-xs" />
                                  <span>{aluno.telefone}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              {aluno.plano && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {aluno.plano}
                                </span>
                              )}
                              {aluno.genero && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {aluno.genero}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removerAlunoDaTurma(aluno)}
                          disabled={loadingRemover === aluno.id}
                          className="ml-3 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {loadingRemover === aluno.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              <span>Removendo...</span>
                            </>
                          ) : (
                            <>
                              <FaTrash className="text-xs" />
                              <span>Remover</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <SearchInput
                  value={searchText}
                  onChange={setSearchText}
                  placeholder="Buscar alunos por nome ou email..."
                  className="flex-1 mr-4"
                />
                {selectedAlunosIds.length > 0 && (
                  <button
                    onClick={adicionarAlunosNaTurma}
                    disabled={loadingDisponiveis}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FaPlus />
                    <span>Adicionar ({selectedAlunosIds.length})</span>
                  </button>
                )}
              </div>

              {loadingDisponiveis ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : alunosDisponiveisFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nenhum aluno disponível
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchText
                      ? "Nenhum aluno encontrado com esse termo de busca."
                      : "Todos os alunos compatíveis já estão matriculados em outras turmas."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alunosDisponiveisFiltrados.map((aluno) => (
                    <div
                      key={aluno.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAlunosIds.includes(aluno.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => toggleAlunoSelection(aluno.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedAlunosIds.includes(aluno.id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {aluno.nome}
                          </h5>
                          <div className="flex items-center space-x-4 mt-1">
                            {aluno.email && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <FaEnvelope className="text-xs" />
                                <span>{aluno.email}</span>
                              </div>
                            )}
                            {aluno.telefone && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <FaPhone className="text-xs" />
                                <span>{aluno.telefone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            {aluno.plano && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {aluno.plano}
                              </span>
                            )}
                            {aluno.genero && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {aluno.genero}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Capacidade: {alunos.length}/{turma.capacidade || 0} alunos
            </div>
            <div>
              Vagas disponíveis:{" "}
              {Math.max(0, (turma.capacidade || 0) - alunos.length)}
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
