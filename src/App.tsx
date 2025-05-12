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

        {/*rotas protegidas*/}
        {/* Rota para pagina de Cadastro */}
        <Route element={<PrivateRoute />}>
        <Route path="/CadastroMotorista" element={<CadastroMotorista />} />
        <Route path="/CadastroMotorista2" element={<CadastroMotorista2 />} />
        <Route path="/CadastroMulta" element={<CadastroMulta />} />
        <Route path="/CadastroCarro" element={<CadastroCarro />} />

        {/* Rotas para pagina de listagem */}
        <Route path="/ListaMultas" element={<ListaMulta />} />
        <Route path="/ListaMotoristas" element={<ListaMotorista />} />
        <Route path="/ListaCarros" element={<ListaCarros />} />

        {/* Rota para o Menu */}
        <Route path="/menu" element={<Menu />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
