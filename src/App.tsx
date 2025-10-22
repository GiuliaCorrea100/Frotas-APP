import '@govbr-ds/core/dist/core.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import PaginaDeLogin from './componentes/PaginaDeLogin';
import CadastroCarro from './componentes/cadastros/CadastroCarro';
import ListaCarros from './componentes/Listagem/veiculos/ListaCarros';
import ListaMulta from './componentes/Listagem/multas/ListaMulta';
import Menu from './componentes/Menu';
import Unauthorized from './componentes/Unauthorized';
import ListaAdministrador from './componentes/Administradores';
import { AuthProvider } from './context/AuthContext';
import Relatorios  from './componentes/Relatorios/Relatorios';
import PrivateRoute from './componentes/PrivateRoute';
import ListaCorrida from './componentes/Listagem/painelCorrida/ListaCorrida';
import DetalhesRequisicao from './componentes/Listagem/painelCorrida/detalhes';
import HistoricoIndividual from './componentes/Listagem/HistoricoIndividual';

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
