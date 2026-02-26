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

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  requiredPermission = false,
}) => {
  const { isAuthenticated, administrador } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      if (requiredPermission && !administrador) {
        navigate('/unauthorized', { replace: true });
        setLoading(false);
        return;
      }

      // Verifica corrida ativa
      const token = localStorage.getItem('token');
      if (!token) {
        if (administrador) navigate('/Corridas', { replace: true });
        else navigate('/HistoricoIndividual', { replace: true });
        setLoading(false);
        return;
      }

      const decoded = decodeToken<{ sub?: number; idUsuario?: number }>(token);
      const idUsuario = decoded?.sub ?? decoded?.idUsuario;

      if (!idUsuario) {
        if (administrador) navigate('/Corridas', { replace: true });
        else navigate('/HistoricoIndividual', { replace: true });
        setLoading(false);
        return;
      }

      try {
        const res = await axiosConnect.get(`/corrida/motorista-dashboard/${idUsuario}`);
        const corrida = res.data.corridaDeHoje;

        if (corrida && corrida.situacao !== 'FINALIZADA') {
          navigate(`/PainelCorridaMotorista/${corrida.idCorrida}`, { replace: true });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Erro dashboard:', error);
      }

      if (administrador) {
        navigate('/Corridas', { replace: true });
      } else {
        navigate('/HistoricoIndividual', { replace: true });
      }
      setLoading(false);
    };

    if (location.pathname === '/menu') {
      handleRedirect();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, administrador, navigate, location.pathname]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
