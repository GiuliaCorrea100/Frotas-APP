import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

type PrivateRouteProps = {
  requiredPermission?: boolean; // Ex: false = usuário, true = admin
};

const PrivateRoute = ({ requiredPermission }: PrivateRouteProps) => {
  const { isAuthenticated, administrador } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (
    requiredPermission !== undefined &&
    administrador < requiredPermission
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
