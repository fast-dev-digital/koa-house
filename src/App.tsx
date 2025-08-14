// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/componentsAdmin/AdminLayout";
import HomePage from "./pages/HomePage";
import PaginaLogin from "./pages/PaginaLogin";
import SobreNos from "./pages/SobreNos";
import Eventos from "./pages/Eventos";
import Professores from "./pages/Professores";
import Planos from "./pages/Planos";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginProtectedRoute from "./components/LoginProtectedRoute";
import AdminDashboard from "./pages/pagesAdmin/AdminDashboard";
import CadastrarAdmin from "./pages/pagesAdmin/CadastrarAdmin";
import GestaoAlunos from "./pages/pagesAdmin/GestaoAlunosNovo";
import RedefinirSenha from "./pages/ConfirmarSenha";
import EsqueciSenha from "./pages/EsqueciSenha";
import PrimeiroAcesso from "./pages/pagesAdmin/PrimeiroAcesso";

// Imports Aluno
import DashboardAluno from "./pages/pagesAluno/DashboardAluno";
import MeusPagamentos from "./pages/pagesAluno/MeusPagamentos";
import GestaoTurmas from "./pages/pagesAdmin/GestaoTurmas";
import GestaoProfessores from "./pages/pagesAdmin/GestaoProfessores";
import GestaoPagamentos from "./pages/pagesAdmin/GestaoPagamentos";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas com Navbar/Footer */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="sobre-nos" element={<SobreNos />} />
            <Route path="login" element={
              <LoginProtectedRoute>
                <PaginaLogin />
              </LoginProtectedRoute>
            } />
            <Route path="eventos" element={<Eventos />} />
            <Route path="professores" element={<Professores />} />
            <Route path="planos" element={<Planos />} />
            <Route path="redefinir-senha" element={<RedefinirSenha />} />
            <Route path="esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
          </Route>

          {/* Rota de redefinição FORA do Layout */}
          <Route path="/login/redefinir-senha" element={<RedefinirSenha />} />

          {/* Rotas do Aluno */}
          <Route
            path="/aluno/*"
            element={
              <ProtectedRoute requiredRole="user">
                <DashboardAluno />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aluno/pagamentos"
            element={
              <ProtectedRoute requiredRole="user">
                <MeusPagamentos />
              </ProtectedRoute>
            }
          />

          {/* Rotas admin usando AdminLayout + Outlet */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route
            path="/cadastrar-admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CadastrarAdmin />} />
          </Route>
          <Route
            path="/gestao-alunos"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GestaoAlunos />} />
          </Route>
          <Route
            path="/gestao-turmas"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GestaoTurmas />} />
          </Route>
          <Route
            path="/gestao-professores"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GestaoProfessores />} />
          </Route>
          <Route
            path="/gestao-pagamentos"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GestaoPagamentos />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
