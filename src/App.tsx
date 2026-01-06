import '@govbr-ds/core/dist/core.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import PaginaDeLogin from './pages/Login';
import Menu from './components/Menu';
import Unauthorized from './pages/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './pages/PrivateRoute';
import Relatorios from './pages/administrador/Relatorios';
import ListaCorrida from './pages/administrador/corridas/Corridas';
import DetalhesRequisicao from './pages/administrador/corridas/Detalhes';
import HistoricoIndividual from './pages/motorista/HistoricoIndividual';
import ListaMulta from './pages/administrador/multas/Multas';
import ListaAdministradores from './pages/administrador/Administradores';
import ListaVeiculos from './pages/administrador/veiculos/ListaVeiculo';
import Boletos from './pages/administrador/Boletos';

const App: React.FC = () => {
  return (    
    <CustomThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota para pagina de login */}
            {/*rota publica*/}
            <Route path="/" element={<PaginaDeLogin />} />

            {/*rotas de administrador*/}
            <Route element={<PrivateRoute requiredPermission={true} />}>
              {/*Paginas de Cadastro*/}
              <Route path="/Relatorios" element={<Relatorios />} />
              <Route path="/Multas" element={<ListaMulta />} />
              <Route path="/Administradores" element={<ListaAdministradores />} />
              <Route path="/Veiculos" element={<ListaVeiculos />} />
              <Route path="/Corridas" element={<ListaCorrida />} />
              <Route path="/DetalhesCorrida/:id" element={< DetalhesRequisicao/>} />
            </Route>

            {/* Rotas usuario comum */}
            <Route path="/HistoricoIndividual" element={<HistoricoIndividual/>} />
            <Route path="/boletos" element={<Boletos />} />

            {/* Rota para acesso negado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Rota para o Menu */}
            <Route path="/menu" element={<Menu />} />
            
            
          </Routes>
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
