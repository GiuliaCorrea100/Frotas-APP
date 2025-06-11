// src/App.tsx
import '@govbr-ds/core/dist/core.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import PaginaDeLogin from './componentes/PaginaDeLogin';

import CadastroCarro from './componentes/cadastros/CadastroCarro';
import CadastroMotorista from './componentes/cadastros/CadastroMotorista';
import CadastroMotorista2 from './componentes/cadastros/CadastroMotorista2';
import CadastroMulta from './componentes/cadastros/CadastroMulta';

import ListaCarros from './componentes/Listagem/ListaCarros';
import ListaMotorista from './componentes/Listagem/ListaMotorista';
import ListaMulta from './componentes/Listagem/ListaMulta';

import Menu from './componentes/Menu';

import Unauthorized from './componentes/Unauthorized';

import ListaAdministrador from './componentes/Administradores';

import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './componentes/PrivateRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* Rota para pagina de login */}
        {/*rota publica*/}
        <Route path="/" element={<PaginaDeLogin />} />

        {/*rotas de administrador*/}
        <Route element={<PrivateRoute requiredPermission={2} />}>
          <Route path="/CadastroMotorista" element={<CadastroMotorista />} />
          <Route path="/CadastroMotorista2" element={<CadastroMotorista2 />} />
          <Route path="/CadastroMulta" element={<CadastroMulta />} />
          <Route path="/CadastroCarro" element={<CadastroCarro />} />
          <Route path="/ListaMultas" element={<ListaMulta />} />
          <Route path="/ListaMotoristas" element={<ListaMotorista />} />
        </Route>


        {/* Rotas usuario comum */}
        <Route path="/ListaCarros" element={<ListaCarros />} />
        <Route path="/Administradores" element={<ListaAdministrador />} />

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
