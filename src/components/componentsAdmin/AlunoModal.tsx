import { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';

// Definindo interface do Aluno
interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  plano: string;
  status: string;
  turmas: string;
  horarios: string;
  dataMatricula: string;
}

interface AlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  alunoData?: Aluno | null; // Dados do aluno para edição
}

export default function AlunoModal({ isOpen, onClose, onSuccess, mode, alunoData }: AlunoModalProps) {
  // Estados dos campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [plano, setPlano] = useState('');
  const [status, setStatus] = useState('ativo');
  const [turmas, setTurmas] = useState('Seg-Qua' );
  const [horarios, setHorarios] = useState('19:00');
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // useEffect para preencher dados quando em modo de edição
  useEffect(() => {
    if (mode === 'edit' && alunoData) {
      setNome(alunoData.nome);
      setEmail(alunoData.email);
      setTelefone(alunoData.telefone);
      setPlano(alunoData.plano);
      setStatus(alunoData.status);
      setTurmas(alunoData.turmas);
      setHorarios(alunoData.horarios);
    } else {
      limparFormulario();
    }
  }, [mode, alunoData, isOpen]);

  // Função para limpar o formulário
  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setPlano('');
    setStatus('ativo');
    setTurmas('Seg-Qua');
    setHorarios('19:00');
    setError('');
    setSuccessMessage('');
  };

  // Função para fechar modal
  const handleClose = () => {
    limparFormulario();
    onClose();
  };

  // Função para salvar aluno (Create ou Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validação: plano deve ser selecionado
    if (!plano) {
      setError('Selecione um plano');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        console.log('🚀 Criando aluno apenas no Firestore:', email);
        
        // SOLUÇÃO DEFINITIVA: Apenas salvar no Firestore
        // O usuário será criado no Auth quando fizer login pela primeira vez
        
        // Criar ID único para o aluno
        const alunoId = `aluno_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Salvar dados no Firestore
        await setDoc(doc(db, "Alunos", alunoId), {
          nome,
          email,
          telefone,
          plano,
          status,
          turmas,
          horarios,
          dataMatricula: new Date().toISOString(),
          authCreated: false // Indica que ainda precisa criar conta no Auth
        });
        console.log('✅ Dados salvos no Firestore');

        setSuccessMessage(`✅ Aluno cadastrado! 

Instruções para o aluno:
1. Acessar: ${window.location.origin}/login
2. Clicar em "Esqueci minha senha"
3. Digitar o email: ${email}
4. Seguir instruções do email recebido`);
        console.log('✅ Aluno cadastrado com sucesso!');
        
        // Atualizar lista de alunos imediatamente
        onSuccess();
        
        // Mostrar mensagem de sucesso e fechar após um breve delay
        setTimeout(() => {
          handleClose();
        }, 1000);
        
      } else {
        // Modo de edição - APENAS atualizar dados no Firestore (não mexer no Auth)
        if (!alunoData?.id) {
          throw new Error('ID do aluno não encontrado');
        }

        await updateDoc(doc(db, "Alunos", alunoData.id), {
          nome,
          telefone, // Email NÃO é atualizado
          plano,
          status,
          turmas,
          horarios
          // Não atualizamos email e dataMatricula na edição
        });

        console.log('✅ Aluno atualizado com sucesso!');
        setSuccessMessage('Aluno atualizado com sucesso!');
        
        // Atualizar lista de alunos imediatamente
        onSuccess();
        
        // Fechar modal após breve delay
        setTimeout(() => {
          handleClose();
        }, 1000);
      }

      // Remover o timeout geral que estava causando problemas
      
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      console.error('Stack do erro:', error.stack);
      
      // Mensagens de erro mais específicas
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado no sistema');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        setError('Senha muito fraca');
      } else if (error.code === 'auth/user-not-found') {
        setError('Usuário não encontrado para envio de email');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde');
      } else {
        setError(`Erro: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">
            {mode === 'create' ? 'Cadastrar Novo Aluno' : 'Editar Aluno'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={mode === 'edit'} // Não permite editar email
              required
            />
            {mode === 'edit' && (
              <p className="text-xs text-gray-500 mt-1">
                Email não pode ser alterado após cadastro
              </p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Planos */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Plano
            </label>
            <select
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Selecione um plano</option>
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo' | 'suspenso')}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="suspenso">Suspenso</option>
            </select>
          </div>

          {/* Turmas */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Turmas
            </label>
            <select
              value={turmas}
              onChange={(e) => setTurmas(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="Seg-Qua">Segunda e Quarta</option>
              <option value="Ter-Qui">Terça e Quinta</option>
            </select>
          </div>

          {/* Horários */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Horários
            </label>
            <select
              value={horarios}
              onChange={(e) => setHorarios(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
            </select>
          </div>

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="text-green-600 text-xs bg-green-50 p-2 rounded-lg border border-green-200">
              {successMessage}
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="text-red-600 text-xs">{error}</div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {loading ? (
                mode === 'create' ? 'Cadastrando...' : 'Salvando...'
              ) : (
                <>
                  <FaSave className="text-xs" />
                  {mode === 'create' ? 'Cadastrar' : 'Salvar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
