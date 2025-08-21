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

//import ListaCorridas from './componentes/Listagem/ListaCorridas';
import CadastrarCorrida from './componentes/cadastros/corrida/CadastrarCorrida';
import IniciarCorrida from './componentes/cadastros/corrida/IniciarCorrida';
import NaCorrida from './componentes/cadastros/corrida/NaCorrida';
import ColocarTombo from './componentes/cadastros/corrida/ColocarTombo';

import Menu from './componentes/Menu';

import Unauthorized from './componentes/Unauthorized';

import ListaAdministrador from './componentes/Administradores';
import Ocorrencias from        './componentes/Ocorrencias';

import { AuthProvider } from './context/AuthContext';

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
        <Route element={<PrivateRoute requiredPermission={2} />}>
          {/*Paginas de Cadastro*/}
          <Route path="/CadastroMotorista" element={<CadastroMotorista />} />
          <Route path="/CadastroMotorista2" element={<CadastroMotorista2 />} />
          <Route path="/CadastroMulta" element={<CadastroMulta />} />
          <Route path="/CadastroCarro" element={<CadastroCarro />} />
          <Route path="/CadastrarCorrida" element={<CadastrarCorrida />} />

          {/*Paginas de Cadastro*/}
          <Route path="/ListaMultas" element={<ListaMulta />} />
          <Route path="/ListaMotoristas" element={<ListaMotorista />} />
          <Route path="/Administradores" element={<ListaAdministrador />} />
          <Route path="/ListaCarros" element={<ListaCarros />} />
          <Route path="/ListaCorrida" element={<ListaCorrida />} />
          <Route path="/DetalhesCorrida/:id" element={< DetalhesRequisicao/>} />
          
          {/*Paginas de Corridas */}
          {/*ALTERAR DEPOIS, PARA QUE NAO POSSAM SER ACESSADOS VIA URL*/}
          <Route path="/IniciarCorrida" element={<IniciarCorrida />} />
          <Route path="/NaCorrida" element={<NaCorrida />} />
          <Route path="/ColocarTombo" element={<ColocarTombo />} />
          <Route path="/Ocorrencias" element={<Ocorrencias/>} />
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
