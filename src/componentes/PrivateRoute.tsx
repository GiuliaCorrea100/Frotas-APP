import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

type PrivateRouteProps = {
  requiredPermission?: number; // Ex: 1 = usuário, 2 = admin
};

const PrivateRoute = ({ requiredPermission }: PrivateRouteProps) => {
  const { isAuthenticated, permissao } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    requiredPermission !== undefined &&
    Number(permissao) < requiredPermission
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
