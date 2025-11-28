// context/AuthContext.tsx - VERSÃO CORRIGIDA
import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken } from '../utils/jwtDecodeHelper';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, cpf: string, administrador: boolean, nome: string, email: string) => void;
  logout: () => void;
  cpf: string | null;
  token: string | null;
  administrador: boolean;
  nome: string | null;
  email: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cpf, setCpf] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [administrador, setAdministrador] = useState<boolean>(false);
  const [nome, setNome] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedCpf = localStorage.getItem('cpf');
      const storedAdministrador = localStorage.getItem('administrador');
      const storedNome = localStorage.getItem('nome');
      const storedEmail = localStorage.getItem('email');


      if (storedToken && storedCpf) {
        try {
          const decodedToken = decodeToken<{ exp: number }>(storedToken);
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (decodedToken && decodedToken.exp > currentTime) {
            //Converter o valor do administrador
            const isAdmin = storedAdministrador === 'true';
            

            setToken(storedToken);
            setCpf(storedCpf);
            setAdministrador(isAdmin);
            setNome(storedNome);
            setEmail(storedEmail);
            setIsAuthenticated(true);
            
          } else {
            console.log('❌ Token expirado');
            logout();
          }
        } catch (error) {
          console.error('❌ Erro ao decodificar token:', error);
          logout();
        }
      } else {
        console.log('❌ Sem token ou CPF no localStorage');
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, cpf: string, administrador: boolean, nome: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('cpf', cpf);
    localStorage.setItem('administrador', administrador.toString()); // ← CONVERTE PARA STRING
    localStorage.setItem('nome', nome);
    localStorage.setItem('email', email);

    setToken(token);
    setCpf(cpf);
    setAdministrador(administrador);
    setNome(nome);
    setEmail(email);
    setIsAuthenticated(true);
    
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setCpf(null);
    setAdministrador(false);
    setNome(null);
    setEmail(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Carregando autenticação...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, cpf, token, administrador, nome, email }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export { AuthProvider, useAuth };