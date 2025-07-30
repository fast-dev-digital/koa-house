// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import PaginaLogin from './pages/PaginaLogin';
import SobreNos from './pages/SobreNos';
import Eventos from './pages/Eventos';
import Professores from './pages/Professores';
import Planos from './pages/Planos';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import CadastrarAdmin from './pages/CadastrarAdmin';
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

        {/* Rotas do Aluno - Protegidas */}
        <Route
          path="/aluno/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route index element={<DashboardAluno />} />
                <Route path="turmas" element={<MinhasTurmas />} />
                <Route path="pagamentos" element={<MeusPagamentos />} />
                <Route path="perfil" element={<MeuPerfil />} />
              </Routes>
            </ProtectedRoute>
          }
        />
        {/* Rotas de redefinir senha - ambas funcionam */}    
      </Route>


      
      {/* Rota de redefinição FORA do Layout para URLs do Firebase */}
      <Route path="/login/redefinir-senha" element={<RedefinirSenha />} />
    
      {/* Rotas admin com Sidebar */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="cadastrar" element={<CadastrarAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;