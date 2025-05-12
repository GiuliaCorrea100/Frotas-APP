//Controlar o estado de autenticação
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { loginUser as apiLogin, logoutUser as apiLogout, getCurrentUser } from '../api/authService';

interface AuthContextType {
  user: any;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

//Cria uma "caixa" onde vamos guardar os dados de autenticação
const AuthContext = createContext<AuthContextType>(null!);

//Guarda o usuário em um estado (user)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);

  //Quando a página carrega, verifica se já tem alguém logado
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUser(user);
    }
  }, []);

  //login: Faz o login e guarda o usuário
  //logout: Faz logout e limpa o usuário
  const login = async (cpf: string, password: string) => {
    const { user } = await apiLogin({ cpf, password });
    setUser(user);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  //Disponibiliza tudo para os componentes filhos
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

//Permite que qualquer componente acesse os dados de autenticação
export function useAuth() {
  return useContext(AuthContext);
}

//Usuário faz login → dados são guardados no AuthContext
//Qualquer componente pode acessar esses dados com useAuth()
//Quando faz logout → limpa os dados