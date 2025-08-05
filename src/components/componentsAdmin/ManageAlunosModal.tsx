import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTrash,
  FaPlus,
} from "react-icons/fa"; // ✅ Adicionado FaTrash
import type { Turma } from "../../types/turmas";
import SearchInput from "./SearchInput";
import Toast from "./Toast";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  // ✅ SISTEMA ATUAL - Array de turmaIds (múltiplas turmas)
  turmasIds?: string[]; // Array de turmaIds para relacionamento
  // ⚠️ LEGADO - turmaId mantido apenas para dados antigos
  turmaId?: string; // DEPRECATED: usar turmasIds[]
  genero?: string;
  status?: string;
  plano?: string;
  role?: string;
  horarios?: string;
}

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
  // ✅ FUNÇÕES AUXILIARES PARA MÚLTIPLAS TURMAS
  const migrarTurmaIdParaArray = (alunoData: any) => {
    // Migração automática: turmaId → turmasIds[]
    if (alunoData.turmaId && !alunoData.turmasIds) {
      return {
        ...alunoData,
        turmasIds: [alunoData.turmaId],
      };
    }
    return alunoData;
  };

  const alunoEstaNaTurma = (aluno: Aluno, turmaId: string) => {
    // Verificar se aluno está em uma turma específica
    const turmasArray =
      aluno.turmasIds || (aluno.turmaId ? [aluno.turmaId] : []);
    return turmasArray.includes(turmaId);
  };

  const alunoTemModalidade = async (aluno: Aluno, modalidade: string) => {
    // Verificar se aluno já está em turma da mesma modalidade
    if (!aluno.turmasIds?.length && !aluno.turmaId) return false;

    const turmasArray =
      aluno.turmasIds || (aluno.turmaId ? [aluno.turmaId] : []);

    // Buscar modalidades das turmas do aluno
    const turmasQuery = query(
      collection(db, "turmas"),
      where("__name__", "in", turmasArray)
    );

    try {
      const turmasSnapshot = await getDocs(turmasQuery);
      return turmasSnapshot.docs.some(
        (doc) => doc.data().modalidade === modalidade
      );
    } catch (error) {
      console.error("Erro ao verificar modalidades:", error);
      return false;
    }
  };

  const [activeTab, setActiveTab] = useState<"matriculados" | "disponiveis">(
    "matriculados"
  );
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDisponiveis, setLoadingDisponiveis] = useState(false);
  const [loadingRemover, setLoadingRemover] = useState<string | null>(null); // ✅ Novo estado
  const [searchText, setSearchText] = useState("");
  const [selectedAlunosIds, setSelectedAlunosIds] = useState<string[]>([]);

  // Toast states
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  // FUNÇÃO PARA REMOVER ALUNO DA TURMA
  const removerAlunoDaTurma = async (aluno: Aluno) => {
    if (!turma?.id || !aluno.id) return;

    const confirmMessage = `Tem certeza que deseja remover ${aluno.nome} desta turma?`;
    if (!confirm(confirmMessage)) return;

    setLoadingRemover(aluno.id);
    try {
      console.log(`Removendo aluno ${aluno.nome} da turma ${turma.nome}`);

      // ✅ NOVA LÓGICA - Remover da array de turmas
      const turmasArray =
        aluno.turmasIds || (aluno.turmaId ? [aluno.turmaId] : []);
      const novasTurmas = turmasArray.filter((id: string) => id !== turma.id);

      // 1. Atualizar array de turmas do aluno
      const alunoRef = doc(db, "Alunos", aluno.id);
      await updateDoc(alunoRef, {
        turmasIds: novasTurmas,
        // ❌ DEPRECATED - Limpar turmaId se array ficar vazio
        ...(novasTurmas.length === 0 && { turmaId: "" }),
      });

      // 2. Decrementar contador da turma
      const novoContador = Math.max(0, alunos.length - 1);
      const turmaRef = doc(db, "turmas", turma.id);
      await updateDoc(turmaRef, {
        alunosInscritos: novoContador,
      });

      console.log(
        `✅ Aluno removido e contador atualizado: ${turma.alunosInscritos} → ${novoContador}`
      );

      // 3. Atualizar estado local
      setAlunos((alunosMatriculados) =>
        alunosMatriculados.filter((a) => a.id !== aluno.id)
      );

      // 4. Recarregar dados
      await fetchAlunosDisponiveis();
      onSuccess(); //  Notificar parent para recarregar

      showToast(`${aluno.nome} foi removido da turma com sucesso!`, "success");
    } catch (error) {
      console.error("❌ Erro ao remover aluno:", error);
      showToast("Erro ao remover aluno da turma", "error");
    } finally {
      setLoadingRemover(null);
    }
  };

  // Buscar alunos matriculados na turma
  const fetchAlunos = async () => {
    if (!turma?.id) return;

    setLoading(true);
    try {
      console.log("🔍 Buscando alunos matriculados na turma:", turma.nome);

      // ✅ NOVA LÓGICA - Buscar por array de turmas OU turmaId (compatibilidade)
      const alunosQuery = collection(db, "Alunos");
      const querySnapshot = await getDocs(alunosQuery);

      const alunosData: Aluno[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();

        // ✅ MIGRAÇÃO AUTOMÁTICA
        const alunoMigrado = migrarTurmaIdParaArray(docData);

        // Verificar se está na turma atual
        const turmasArray =
          alunoMigrado.turmasIds ||
          (alunoMigrado.turmaId ? [alunoMigrado.turmaId] : []);
        const estaNaTurma = turmasArray.includes(turma.id);

        if (estaNaTurma) {
          console.log("👤 Aluno matriculado encontrado:", doc.id, alunoMigrado);

          alunosData.push({
            id: doc.id,
            nome: alunoMigrado.nome || "",
            email: alunoMigrado.email || "",
            telefone: alunoMigrado.telefone || "",
            turmasIds: alunoMigrado.turmasIds || [],
            turmaId: alunoMigrado.turmaId || "", // Compatibilidade
            genero: alunoMigrado.genero || "",
            status: alunoMigrado.status || "",
            plano: alunoMigrado.plano || "",
            role: alunoMigrado.role || "",
            horarios: alunoMigrado.horarios || "",
          });
        }
      });

      setAlunos(alunosData);
      console.log(`✅ ${alunosData.length} alunos matriculados encontrados`);
    } catch (error) {
      console.error("❌ Erro ao carregar alunos matriculados:", error);
      showToast("Erro ao carregar alunos matriculados", "error");
    } finally {
      setLoading(false);
    }
  };

  // Buscar alunos disponíveis para matrícula
  const fetchAlunosDisponiveis = async () => {
    if (!turma?.id || typeof turma.id !== "string") return;

    setLoadingDisponiveis(true);
    try {
      console.log("🔍 Buscando alunos disponíveis para turma:", turma.nome);

      const alunosQuery = query(
        collection(db, "Alunos"),
        where("status", "==", "ativo")
      );

      const querySnapshot = await getDocs(alunosQuery);
      const todosAlunos: Aluno[] = [];

      // ✅ STEP 1: Buscar todas as turmas para verificar modalidades
      const todasTurmasSnapshot = await getDocs(collection(db, "turmas"));
      const turmasMap = new Map();
      todasTurmasSnapshot.forEach((doc) => {
        turmasMap.set(doc.id, doc.data());
      });

      querySnapshot.forEach((doc) => {
        const docData = doc.data();

        // ✅ MIGRAÇÃO AUTOMÁTICA
        const alunoMigrado = migrarTurmaIdParaArray(docData);

        console.log("👤 Aluno ativo encontrado:", doc.id, {
          nome: alunoMigrado.nome,
          genero: alunoMigrado.genero,
          turmasIds: alunoMigrado.turmasIds,
          turmaId: alunoMigrado.turmaId, // compatibilidade
          status: alunoMigrado.status,
        });

        todosAlunos.push({
          id: doc.id,
          nome: alunoMigrado.nome || "",
          email: alunoMigrado.email || "",
          telefone: alunoMigrado.telefone || "",
          genero: alunoMigrado.genero || "",
          status: alunoMigrado.status || "",
          turmasIds: alunoMigrado.turmasIds || [],
          turmaId: alunoMigrado.turmaId || "", // compatibilidade
          plano: alunoMigrado.plano || "",
          role: alunoMigrado.role || "",
          horarios: alunoMigrado.horarios || "",
        });
      });

      console.log(`📊 Total de alunos ativos: ${todosAlunos.length}`);

      // ✅ STEP 2: Filtrar por gênero (EXCETO Beach Tennis E Teens)
      let alunosPorGenero = todosAlunos;
      if (turma.modalidade !== "Beach Tennis" && turma.genero !== "Teens") {
        alunosPorGenero = todosAlunos.filter((aluno) => {
          const generoMatch = aluno.genero === turma.genero;
          console.log(
            `🔍 ${aluno.nome}: genero=${aluno.genero}, turmaGenero=${turma.genero}, match=${generoMatch}`
          );
          return generoMatch;
        });
        console.log(
          `👥 Alunos do gênero ${turma.genero}: ${alunosPorGenero.length}`
        );
      } else {
        console.log("🏖️ Beach Tennis ou Teens aceita todos os gêneros");
      }

      // ✅ STEP 3: NOVA REGRA - Filtrar por modalidade
      const disponíveis = alunosPorGenero.filter((aluno) => {
        // Verificar se já está nesta turma específica
        const turmasArray =
          aluno.turmasIds || (aluno.turmaId ? [aluno.turmaId] : []);
        const jaNestaTurma = turmasArray.includes(turma.id!);

        if (jaNestaTurma) {
          console.log(`❌ ${aluno.nome}: já está nesta turma`);
          return false;
        }

        // ✅ NOVA REGRA: Verificar se já tem turma da mesma modalidade
        const jaTemModalidade = turmasArray.some((turmaId: string) => {
          const turmaData = turmasMap.get(turmaId);
          return turmaData?.modalidade === turma.modalidade;
        });

        if (jaTemModalidade) {
          console.log(`❌ ${aluno.nome}: já tem turma de ${turma.modalidade}`);
          return false;
        }

        console.log(`✅ ${aluno.nome}: disponível para ${turma.modalidade}`);
        return true;
      });

      setAlunosDisponiveis(disponíveis);
      console.log(
        `✅ RESULTADO FINAL: ${disponíveis.length} alunos disponíveis`
      );
      console.log(
        "📋 Alunos disponíveis:",
        disponíveis.map((a) => a.nome)
      );
    } catch (error) {
      console.error("❌ Erro ao buscar alunos disponíveis:", error);
      showToast("Erro ao buscar alunos disponíveis", "error");
    } finally {
      setLoadingDisponiveis(false);
    }
  };

  // Adicionar alunos selecionados na turma
  const adicionarAlunosNaTurma = async () => {
    if (!turma?.id || selectedAlunosIds.length === 0) return;

    // Verificar capacidade da turma
    const vagasDisponiveis = (turma.capacidade || 0) - alunos.length;
    if (selectedAlunosIds.length > vagasDisponiveis) {
      showToast(
        ` Turma tem apenas ${vagasDisponiveis} vaga(s) disponível(eis)`,
        "error"
      );
      return;
    }

    setLoadingDisponiveis(true);
    try {
      console.log(
        ` Adicionando ${selectedAlunosIds.length} alunos na turma ${turma.nome}`
      );

      // ✅ NOVA LÓGICA - Atualizar array de turmas de cada aluno
      const updatePromises = selectedAlunosIds.map(async (alunoId) => {
        const alunoRef = doc(db, "Alunos", alunoId);

        // Buscar dados atuais do aluno
        const alunoDoc = await getDoc(alunoRef);
        if (alunoDoc.exists()) {
          const alunoData = alunoDoc.data();
          const alunoMigrado = migrarTurmaIdParaArray(alunoData);

          const turmasArray =
            alunoMigrado.turmasIds ||
            (alunoMigrado.turmaId ? [alunoMigrado.turmaId] : []);
          const novasTurmas = [...turmasArray, turma.id!];

          await updateDoc(alunoRef, {
            turmasIds: novasTurmas,
            // ✅ Manter turmaId para compatibilidade (primeira turma)
            turmaId: novasTurmas[0] || "",
          });

          console.log(`✅ Aluno ${alunoId} matriculado na turma ${turma.id}`);
        }
      });

      await Promise.all(updatePromises);

      // Atualizar contador na turma
      const turmaRef = doc(db, "turmas", turma.id);
      await updateDoc(turmaRef, {
        alunosInscritos: alunos.length + selectedAlunosIds.length,
      });

      showToast(
        `🎉 ${selectedAlunosIds.length} aluno(s) adicionado(s) com sucesso!`,
        "success"
      );

      setSelectedAlunosIds([]);
      await fetchAlunos();
      await fetchAlunosDisponiveis();
      setActiveTab("matriculados");
      onSuccess();
    } catch (error) {
      console.error("❌ Erro ao adicionar alunos:", error);
      showToast("❌ Erro ao adicionar alunos. Tente novamente.", "error");
    } finally {
      setLoadingDisponiveis(false);
    }
  };

  // Filtrar alunos disponíveis por busca
  const alunosDisponiveisFiltrados = alunosDisponiveis.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // Toggle seleção de aluno
  const toggleAlunoSelection = (alunoId: string) => {
    setSelectedAlunosIds((prev) =>
      prev.includes(alunoId)
        ? prev.filter((id) => id !== alunoId)
        : [...prev, alunoId]
    );
  };

  // Efeitos
  useEffect(() => {
    if (isOpen && turma) {
      fetchAlunos();
      fetchAlunosDisponiveis();
      setActiveTab("matriculados");
      setSearchText("");
      setSelectedAlunosIds([]);
    }
  }, [isOpen, turma]);

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

                        {/* ✅ BOTÃO REMOVER */}
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
              {/* Busca e ações */}
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

              {/* Lista de alunos disponíveis */}
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

        {/* Footer com informações */}
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

      {/* Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
