// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PaginaLogin from './pages/PaginaLogin';
import PaginaCadastro from './pages/PaginaCadastro';
import SobreNos from './pages/SobreNos';
import Eventos from './pages/Eventos';
import Professores from './pages/Professores';

function App() {
  return (
    <Routes>
      {/* Cria uma rota "pai" que renderiza o nosso Layout */}
      <Route path="/" element={<Layout />}>
        {/* 3. As rotas "filhas" serão renderizadas dentro do <Outlet /> do Layout */}
        
        {/* A rota de índice (path=""), quando dentro da rota pai, corresponde a "/" */}
        <Route index element={<HomePage />} />
        <Route path="sobre-nos" element={<SobreNos />} />
        <Route path="login" element={<PaginaLogin />} />
        <Route path="cadastro" element={<PaginaCadastro />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="professores" element={<Professores />} />
      </Route> 
    </Routes>
  );
}

export default App