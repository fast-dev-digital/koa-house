import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { buscarTodosProfessores } from "../../services/professorService";
import {
  buscarTodasTurmas,
  obterEstatisticasTurmas,
} from "../../services/turmaService";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaSchool,
  FaCalendarAlt,
  FaTableTennis,
  FaVolleyballBall,
  FaFutbol,
} from "react-icons/fa";

// ✅ ADICIONAR CACHE DO ALUNO SERVICE
import { buscarTodosAlunos } from "../../services/alunoService";

export default function AdminDashboard() {
  const [nome, setNome] = useState<string>("");
  const [totalAlunos, setTotalAlunos] = useState<number>(0);
  const [totalProfessores, setTotalProfessores] = useState<number>(0);
  const [totalTurmas, setTotalTurmas] = useState<number>(0);

  // ✅ DADOS SIMPLES POR MODALIDADE
  const [beachTennis, setBeachTennis] = useState<number>(0);
  const [volei, setVolei] = useState<number>(0);
  const [futevolei, setFutevolei] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ OTIMIZAR QUERY DO ADMIN (busca direta por ID)
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          if (adminDoc.exists()) {
            setNome(adminDoc.data()?.nome || "Admin");
          }
        } catch (error) {
          console.error("❌ Erro ao buscar admin:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alunosData, professoresData, turmasData, estatisticas] =
          await Promise.all([
            buscarTodosAlunos(), // Cache automático
            buscarTodosProfessores(), // Cache automático
            buscarTodasTurmas(), // Cache automático
            obterEstatisticasTurmas(), // Estatísticas calculadas
          ]);

        // USAR DADOS DOS SERVICES
        setTotalAlunos(alunosData.length);
        setTotalProfessores(professoresData.length);
        setTotalTurmas(turmasData.length);

        setBeachTennis(estatisticas.modalidades?.["Beach Tennis"] || 0);
        setVolei(estatisticas.modalidades?.["Vôlei"] || 0);
        setFutevolei(estatisticas.modalidades?.["Futevôlei"] || 0);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {nome}!
          </h1>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUsers className="text-3xl text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAlunos}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaChalkboardTeacher className="text-3xl text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Professores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProfessores}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaSchool className="text-3xl text-indigo-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Turmas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTurmas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaCalendarAlt className="text-3xl text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Modalidades</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards por modalidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTableTennis className="text-orange-600 text-xl" />
              </div>
              <p className="text-sm text-gray-600">Beach Tennis</p>
              <p className="text-xl font-bold text-orange-600">
                {beachTennis} turmas
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaVolleyballBall className="text-purple-600 text-xl" />
              </div>
              <p className="text-sm text-gray-600">Vôlei</p>
              <p className="text-xl font-bold text-purple-600">
                {volei} turmas
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaFutbol className="text-blue-600 text-xl" />
              </div>
              <p className="text-sm text-gray-600">Futevôlei</p>
              <p className="text-xl font-bold text-blue-600">
                {futevolei} turmas
              </p>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" />
              Resumo Geral
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalAlunos + totalProfessores}
              </p>
              <p className="text-sm text-gray-600">Total de Pessoas</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalTurmas > 0
                  ? Math.round((totalAlunos / totalTurmas) * 10) / 10
                  : 0}
              </p>
              <p className="text-sm text-gray-600">Alunos por Turma (média)</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalTurmas + totalProfessores}
              </p>
              <p className="text-sm text-gray-600">Recursos Ativos</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
