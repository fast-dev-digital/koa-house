// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import PaginaLogin from './components/PaginaLogin'
import PaginaCadastro from './components/PaginaCadastro'

function App() {
  return (
    <Routes>
      {/* A rota principal (/) será a de login */}
      <Route path="/" element={<PaginaLogin />} /> 

      {/* A rota /login também levará para a página de login */}
      <Route path="/login" element={<PaginaLogin />} />

      {/* A rota /cadastro levará para a página de cadastro */}
      <Route path="/cadastro" element={<PaginaCadastro />} />
    </Routes>
  );
}

export default App