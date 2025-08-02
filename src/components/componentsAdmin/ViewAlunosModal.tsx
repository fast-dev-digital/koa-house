import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import { FaTimes, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import type { Turma } from "../../types/turmas";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  turmaId: string;
}

interface ViewAlunosModalProps {
  isOpen: boolean;
  onClose: () => void;
  turma: Turma | null;
}

export default function ViewAlunosModal({
  isOpen,
  onClose,
  turma,
}: ViewAlunosModalProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);

  // CARREGAR ALUNOS DA TURMA
  useEffect(() => {
    const fetchAlunos = async () => {
      if (!turma?.id) return;

      setLoading(true);
      try {
        // BUSCAR ALUNOS QUE ESTÃO NESTA TURMA
        const q = query(
          collection(db, "alunos"),
          where("turmaId", "==", turma.id)
        );
        const querySnapshot = await getDocs(q);

        const alunosData: Aluno[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          alunosData.push({
            id: doc.id,
            nome: data.nome || "",
            email: data.email || "",
            telefone: data.telefone || "",
            turmaId: data.turmaId || "",
          });
        });

        setAlunos(alunosData);
        console.log(
          `👥 ${alunosData.length} alunos encontrados na turma ${turma.nome}`
        );
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && turma) {
      fetchAlunos();
    }
  }, [isOpen, turma]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Alunos da Turma
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {turma?.nome} • {turma?.modalidade} • {turma?.genero}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="p-6">
          {/* ESTATÍSTICAS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                {alunos.length}
              </p>
              <p className="text-sm text-blue-600">Alunos Matriculados</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {turma?.capacidade || 0}
              </p>
              <p className="text-sm text-green-600">Capacidade</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {(turma?.capacidade || 0) - alunos.length}
              </p>
              <p className="text-sm text-yellow-600">Vagas Disponíveis</p>
            </div>
          </div>

          {/* LISTA DE ALUNOS */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando alunos...</p>
            </div>
          ) : alunos.length === 0 ? (
            <div className="text-center py-8">
              <FaUser className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhum aluno matriculado nesta turma
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Os alunos aparecerão aqui quando forem matriculados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 mb-3">
                Lista de Alunos ({alunos.length})
              </h4>
              {alunos.map((aluno) => (
                <div key={aluno.id} className="bg-gray-50 p-4 rounded-lg">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
