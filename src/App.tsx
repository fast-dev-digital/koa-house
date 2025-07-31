// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/componentsAdmin/AdminLayout';
import HomePage from './pages/HomePage';
import PaginaLogin from './pages/PaginaLogin';
import SobreNos from './pages/SobreNos';
import Eventos from './pages/Eventos';
import Professores from './pages/Professores';
import Planos from './pages/Planos';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/pagesAdmin/AdminDashboard';
import CadastrarAdmin from './pages/pagesAdmin/CadastrarAdmin';
import GestaoAlunos from './pages/pagesAdmin/GestaoAlunosNovo';
import RedefinirSenha from './pages/ConfirmarSenha';
import EsqueciSenha from './pages/EsqueciSenha';

// Imports Aluno
import DashboardAluno from './pages/pagesAluno/DashboardAluno';
import MinhasTurmas from './pages/pagesAluno/MinhasTurmas';
import MeusPagamentos from './pages/pagesAluno/MeusPagamentos';
import MeuPerfil from './pages/pagesAluno/MeuPerfil';

function App() {
  return (
    <Routes>
      {/* Rotas públicas com Navbar/Footer */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="sobre-nos" element={<SobreNos />} />
        <Route path="login" element={<PaginaLogin />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="professores" element={<Professores />} />
        <Route path="planos" element={<Planos />} />
        <Route path="redefinir-senha" element={<RedefinirSenha />} />
        <Route path='/esqueci-senha' element={<EsqueciSenha /> } />

        {/* Rotas de redefinir senha - ambas funcionam */}    
      </Route>


      
      {/* Rota de redefinição FORA do Layout para URLs do Firebase */}
      <Route path="/login/redefinir-senha" element={<RedefinirSenha />} />
    
      {/* Rotas do Aluno - SEM Layout (sem navbar/footer) - APENAS USUÁRIOS */}
      <Route
        path="/aluno/*"
        element={
          <ProtectedRoute requireRole="user">
            <Routes>
              <Route index element={<DashboardAluno />} />
              <Route path="turmas" element={<MinhasTurmas />} />
              <Route path="pagamentos" element={<MeusPagamentos />} />
              <Route path="perfil" element={<MeuPerfil />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Rotas admin com Sidebar - APENAS ADMINS */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requireRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="cadastrar" element={<CadastrarAdmin />} />
      </Route>

      {/* Rota para gestão de alunos */}
      <Route
        path="/gestao-alunos"
        element={
          <ProtectedRoute requireRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GestaoAlunos />} />
      </Route>
    </Routes>
  );
}

export default App;