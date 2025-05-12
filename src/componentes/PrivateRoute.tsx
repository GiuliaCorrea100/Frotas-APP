import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
/*
Se o usuário ESTIVER logado (isAuthenticated === true):

Mostra a página solicitada (<Outlet /> representa a rota filha)

Se o usuário NÃO ESTIVER logado:

Redireciona para /login automaticamente
*/
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;