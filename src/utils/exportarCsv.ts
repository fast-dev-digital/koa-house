import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';

// Interface para definir o tipo de dados do aluno
interface Aluno {
  id: string;
  nome?: string;
  email?: string;
  turmas?: string;
  horarios?: string;
  plano?: string;
  telefone?: string;
}

// Função principal para exportar CSV dos alunos
export const exportarAlunosCSV = async () => {
  try {
    console.log('🔄 Iniciando exportação dos alunos...');
    
    // Passo 1: Buscar todos os alunos do Firestore
    const alunosRef = collection(db, 'Alunos');
    const snapshot = await getDocs(alunosRef);
    
    console.log(`📊 Encontrados ${snapshot.size} alunos`);
    
    if (snapshot.empty) {
      alert('⚠️ Nenhum aluno encontrado para exportar!');
      return;
    }
    
    // Passo 2: Converter documentos em array de objetos
    const alunos: Aluno[] = [];
    snapshot.forEach((doc) => {
      alunos.push({
        id: doc.id,
        ...doc.data()
      } as Aluno);
    });
    
    // Passo 3: Converter para CSV
    const csvContent = converterAlunosParaCSV(alunos);
    
    // Passo 4: Criar e disparar download
    const nomeArquivo = gerarNomeArquivoComData('alunos');
    baixarCSV(csvContent, nomeArquivo);
    
    console.log('✅ Exportação concluída!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao exportar:', error);
    alert('❌ Erro ao exportar dados. Verifique o console para mais detalhes.');
    throw error;
  }
};

// Função para converter array de alunos em string CSV
const converterAlunosParaCSV = (alunos: Aluno[]): string => {
  if (alunos.length === 0) {
    return 'Nenhum aluno encontrado';
  }
  
  // Definir cabeçalho das colunas (exatamente os campos que você quer)
  const cabecalho = [
    'Nome',
    'Email', 
    'Turma',
    'Horário',
    'Plano',
    'Telefone'
  ].join(',');
  
  // Converter cada aluno em linha CSV
  const linhas = alunos.map(aluno => {
    return [
      `"${aluno.nome || ''}"`,
      `"${aluno.email || ''}"`,
      `"${aluno.turmas || ''}"`,
      `"${aluno.horarios || ''}"`,
      `"${aluno.plano || ''}"`,
      `"${aluno.telefone || ''}"`
    ].join(',');
  });
  
  // Juntar cabeçalho + linhas
  return [cabecalho, ...linhas].join('\n');
};

// Função para criar e disparar o download
const baixarCSV = (csvContent: string, nomeArquivo: string) => {
  // Adicionar BOM para suporte a acentos no Excel
  const BOM = '\uFEFF';
  const csvComBOM = BOM + csvContent;
  
  // Criar blob com o conteúdo CSV
  const blob = new Blob([csvComBOM], { type: 'text/csv;charset=utf-8;' });
  
  // Criar URL temporária
  const url = URL.createObjectURL(blob);
  
  // Criar elemento <a> temporário para download
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.style.display = 'none';
  
  // Disparar download
  document.body.appendChild(link);
  link.click();
  
  // Limpar após pequeno delay
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

// Função auxiliar para gerar nome de arquivo com data/hora
export const gerarNomeArquivoComData = (prefixo: string = 'alunos'): string => {
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');
  return `${prefixo}_${data}_${hora}.csv`;
};