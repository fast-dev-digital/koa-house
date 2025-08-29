import { Link } from "react-router-dom";
import {
  FaCreditCard,
  FaWhatsapp,
  FaBookOpen,
  FaSignOutAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import type { AlunoLogado, TurmaDashboard } from "../../types/dashboard";

// Componentes
import ResumoCard from "../../components/componentsAluno/ResumoCard";
import TurmaCard from "../../components/componentsAluno/TurmaCard";
import HistoricoModal from "../../components/HistoricoModal";

export default function DashboardAluno() {
  const [nome, setNome] = useState<string>("");
  const [alunoData, setAlunoData] = useState<AlunoLogado | null>(null);
  const [turmas, setTurmas] = useState<TurmaDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  const navigate = useNavigate();

  // Componente do botão de logout reutilizável
  const LogoutButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoggingOut ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Saindo...
        </>
      ) : (
        <>
          <FaSignOutAlt />
          Sair
        </>
      )}
    </button>
  );

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmLogout = window.confirm("Você tem certeza que deseja sair?");
    if (!confirmLogout) return;

    try {
      setIsLoggingOut(true);
      await signOut(auth);

      localStorage.removeItem("userData");
      sessionStorage.clear();

      navigate("/");
    } catch (error) {
      alert("Erro ao fazer logout. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isMounted) {
          setAlunoData(null);
          setTurmas([]);
          setLoading(false);
          setNome("");
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        // Buscar dados do aluno por email
        const alunosQuery = query(
          collection(db, "Alunos"),
          where("email", "==", user.email)
        );

        const querySnapshot = await getDocs(alunosQuery);

        if (querySnapshot.empty) {
          throw new Error("Dados do aluno não encontrados no Firebase");
        }

        const alunoDoc = querySnapshot.docs[0];
        const alunoInfo = alunoDoc.data() as AlunoLogado;
        alunoInfo.id = alunoDoc.id;

        // ✅ BUSCAR TURMAS BASEADO NO ARRAY turmasIds
        let turmasAluno: TurmaDashboard[] = [];

        // Verificar se o aluno tem turmasIds (array de strings)
        if (
          alunoInfo.turmasIds &&
          Array.isArray(alunoInfo.turmasIds) &&
          alunoInfo.turmasIds.length > 0
        ) {
          console.log("TurmasIds encontradas:", alunoInfo.turmasIds); // DEBUG

          // Buscar cada turma no Firestore
          for (const turmaId of alunoInfo.turmasIds) {
            if (turmaId && turmaId.trim()) {
              try {
                const turmaDoc = await getDoc(doc(db, "turmas", turmaId));

                if (turmaDoc.exists()) {
                  const turmaData = turmaDoc.data();

                  const turmaDashboard: TurmaDashboard = {
                    id: turmaDoc.id,
                    nome:
                      turmaData.nome ||
                      `${turmaData.modalidade} - ${turmaData.professorNome}`,
                    modalidade: turmaData.modalidade,
                    professorNome: turmaData.professorNome,
                    dias: turmaData.dias,
                    horario: turmaData.horario,
                    status: "ativa",
                  };

                  turmasAluno.push(turmaDashboard);
                }
              } catch (error) {}
            }
          }
        }
        // ✅ FALLBACK: Se não tem turmasIds, usar a lógica antiga com turmaId único
        else if (alunoInfo.turmaId) {
          try {
            const turmaDoc = await getDoc(doc(db, "turmas", alunoInfo.turmaId));

            if (turmaDoc.exists()) {
              const turmaData = turmaDoc.data();

              const turmaDashboard: TurmaDashboard = {
                id: turmaDoc.id,
                nome:
                  turmaData.nome ||
                  `${turmaData.modalidade} - ${turmaData.professorNome}`,
                modalidade: turmaData.modalidade,
                professorNome: turmaData.professorNome,
                dias: turmaData.dias,
                horario: turmaData.horario,
                status: "ativa",
              };

              turmasAluno.push(turmaDashboard);
            }
          } catch (error) {}
        }

        if (isMounted) {
          setAlunoData(alunoInfo);
          setTurmas(turmasAluno);
          setNome(alunoInfo.nome || "");
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Erro ao carregar dados"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seus dados...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Erro:</strong> {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold">
                Bem-vindo{nome ? `, ${nome}` : ""}!
              </h1>
              <p className="text-sm text-gray-600">
                {alunoData?.email || "Bem-vindo à sua área pessoal"}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm">
                <FaWhatsapp />
                Contato
              </button>

              <LogoutButton className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div
          className={`grid grid-cols-1 ${
            turmas.length >= 2 ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-6 mb-8`}
        >
          {/* Card 1: Turmas Ativas */}
          <ResumoCard
            icon={<FaBookOpen className="text-blue-600" />}
            title="Turmas Ativas"
            value={turmas.length.toString()}
            subtitle={
              turmas.length === 0
                ? "Nenhuma turma"
                : turmas.length === 1
                ? turmas[0].modalidade
                : `${turmas[0].modalidade} ${
                    turmas.length > 1 ? `+${turmas.length - 1} mais` : ""
                  }`
            }
            color="blue"
          />

          {/* Card 3: Múltiplas Turmas - SÓ APARECE SE TIVER 2+ TURMAS */}
          {turmas.length >= 2 && (
            <ResumoCard
              icon={<FaBookOpen className="text-purple-600" />}
              title="Modalidades"
              value={turmas.length.toString()}
              subtitle={
                turmas.length === 2
                  ? `${turmas[0].modalidade} e ${turmas[1].modalidade}`
                  : `${turmas[0].modalidade}, ${turmas[1].modalidade} +${
                      turmas.length - 2
                    }`
              }
              color="purple"
            />
          )}
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Minhas Turmas - DADOS DINÂMICOS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Minhas Turmas
                </h2>
                {turmas.length > 0 && (
                  <Link
                    to="/aluno/turmas"
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Ver todas →
                  </Link>
                )}
              </div>

              {/* Renderização dinâmica das turmas */}
              {turmas.length === 0 ? (
                <div className="text-center py-8">
                  <FaBookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma turma encontrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não está matriculado em nenhuma turma.
                  </p>
                  <Link
                    to="/planos"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <FaBookOpen />
                    Ver Planos Disponíveis
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {turmas.map((turma) => (
                    <TurmaCard
                      key={turma.id}
                      modalidade={turma.modalidade}
                      professor={turma.professorNome}
                      horario={`${turma.dias} - ${turma.horario}`}
                      status={turma.status}
                    />
                  ))}

                  {/* Mostrar apenas se houver turmas */}
                  {turmas.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Dica:</strong> Acesse "Ver Histórico" para
                        acompanhar seus pagamentos
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status de Pagamento - DADOS DINÂMICOS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status Financeiro
              </h3>
              <button
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center block transition-colors"
                onClick={() => setShowHistorico(true)}
                disabled={!alunoData}
              >
                Ver Histórico
              </button>
            </div>

            {/* Acesso Rápido */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acesso Rápido
              </h3>
              <div className="space-y-3">
                <button className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left">
                  <FaWhatsapp className="mr-3 text-green-500" />
                  Suporte WhatsApp
                </button>

                <LogoutButton className="flex items-center p-3 text-red-700 hover:bg-red-50 rounded-lg w-full text-left" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal do Histórico */}
      {alunoData && (
        <HistoricoModal
          isOpen={showHistorico}
          onClose={() => setShowHistorico(false)}
          alunoId={alunoData.id}
          userType="aluno"
        />
      )}
    </div>
  );
}
