// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
//import jwtDecode from 'jwt-decode';
import { decodeToken } from '../utils/jwtDecodeHelper';


interface AuthContextType {
  isAuthenticated: boolean;
  login: (cpf: string, password: string, permissao: string, nome: string) => void;
  logout: () => void;
  cpf: string | null;
  token: string | null;
  permissao: string | null; 
  nome: string | null;

}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cpf, setCpf] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissao, setPermissao] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedCpf = localStorage.getItem('cpf');
    const storedPermissao = localStorage.getItem('permissao');
    const storedNome = localStorage.getItem('nome');

    //manter logado mesmo após refresh
    if (storedToken && storedCpf && storedPermissao) {
      setToken(storedToken);
      setCpf(storedCpf);
      setPermissao(storedPermissao);
      setNome(storedNome);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    const checkToken = () => {
      if (token) {
        const decodedToken = decodeToken<{ exp: number }>(token);
        if (decodedToken) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp < currentTime) {
            logout();
          }
        } else {
          logout();
        }
      }
    };
    
    const interval = setInterval(checkToken, 10000);
    return () => clearInterval(interval);
  }, [token]);


    const login = (token: string, cpf: string, permissao: string, nome: string) => {
      localStorage.setItem('token', token);
      localStorage.setItem('cpf', cpf);
      localStorage.setItem('permissao', permissao); 
      localStorage.setItem('nome', nome);


      setToken(token);
      setCpf(cpf);
      setPermissao(permissao);
      setNome(nome);
      setIsAuthenticated(true);
  };

      const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('cpf');
      localStorage.removeItem('permissao');
      localStorage.removeItem('nome');

      setToken(null);
      setCpf(null);
      setPermissao(null);
      setNome(null);
      setIsAuthenticated(false);
  };

    return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, cpf, token, permissao, nome }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
