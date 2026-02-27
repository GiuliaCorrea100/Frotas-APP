// PrivateRoute.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { decodeToken } from '../utils/jwtDecodeHelper';
import axiosConnect from '../services/axios/axiosConnect';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';

type PrivateRouteProps = {
  requiredPermission?: boolean;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredPermission = false }) => {
  const { isAuthenticated, administrador, hasCorridaAtiva } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect executado apenas na rota inicial "/" para definir página inicial do usuário de acordo com permisssão e existência de corrida ativa
    if (location.pathname === '/') {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      if (requiredPermission && !administrador) {
        navigate('/unauthorized', { replace: true });
        return;
      }

      if (hasCorridaAtiva) {
        const corridaId = localStorage.getItem('corridaIdAtiva');
        if (corridaId) {
          navigate(`/PainelCorridaMotorista/${corridaId}`, { replace: true });
          return;
        }
      }

      // Dashboard padrão (quando não á corrida ativa): Painel de Corridas para o Administrador ou Histórico de Corridas para o Motorista
      navigate(administrador ? '/Corridas' : '/HistoricoIndividual', { replace: true });
    }

    setLoading(false);
  }, [location.pathname, isAuthenticated, administrador, hasCorridaAtiva]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
