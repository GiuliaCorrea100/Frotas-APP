import '@govbr-ds/core/dist/core.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import PaginaDeLogin from './pages/Login';
import CadastroCarro from './components/cadastros/CadastroCarro';
import ListaCarros from './pages/painelCorridaMotorista/Listagem/veiculos/ListaCarros';
import ListaMulta from './pages/painelCorridaMotorista/Listagem/multas/ListaMulta';
import Menu from './components/Menu';
import Unauthorized from './pages/Unauthorized';
import ListaAdministrador from './components/Administradores';
import { AuthProvider } from './context/AuthContext';
import Relatorios  from './components/Relatorios/Relatorios';
import PrivateRoute from './pages/PrivateRoute';
import ListaCorrida from './pages/administrador/ListaCorrida';
import DetalhesRequisicao from './pages/painelCorridaMotorista/Listagem/painelCorrida/detalhes';
import HistoricoIndividual from './pages/painelCorridaMotorista/Listagem/HistoricoIndividual';

const App: React.FC = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* Rota para pagina de login */}
        {/*rota publica*/}
        <Route path="/" element={<PaginaDeLogin />} />

        {/*rotas de administrador*/}
        <Route element={<PrivateRoute requiredPermission={true} />}>
          {/*Paginas de Cadastro*/}
          <Route path="/CadastroCarro" element={<CadastroCarro />} />
          <Route path="/Relatorios" element={<Relatorios />} />
          <Route path="/ListaMultas" element={<ListaMulta />} />
          <Route path="/Administradores" element={<ListaAdministrador />} />
          <Route path="/ListaCarros" element={<ListaCarros />} />
          <Route path="/ListaCorrida" element={<ListaCorrida />} />
          <Route path="/DetalhesCorrida/:id" element={< DetalhesRequisicao/>} />
        </Route>

        {/* Rotas usuario comum */}
        <Route path="/HistoricoIndividual" element={<HistoricoIndividual/>} />

        {/* Rota para acesso negado */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rota para o Menu */}
        <Route path="/menu" element={<Menu />} />
        
        
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
