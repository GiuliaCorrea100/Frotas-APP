// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
//import jwtDecode from 'jwt-decode';
import { decodeToken } from '../utils/jwtDecodeHelper';


interface AuthContextType {
  isAuthenticated: boolean;
  login: (cpf: string, password: string, administrador: boolean, nome: string, email: string) => void;
  logout: () => void;
  cpf: string | null;
  token: string | null;
  administrador: boolean | null; 
  nome: string | null;
  email: string | null;

}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cpf, setCpf] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [administrador, setAdministrador] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [email, setEmail ] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedCpf = localStorage.getItem('cpf');
    const storedAdministrador = localStorage.getItem('administrador');
    const storedNome = localStorage.getItem('nome');
    const storedEmail = localStorage.getItem('email');

    //manter logado mesmo após refresh
    if (storedToken && storedCpf && storedAdministrador) {
      setToken(storedToken);
      setCpf(storedCpf);
      setAdministrador(storedAdministrador);
      setNome(storedNome);
      setEmail(storedEmail);
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


    const login = (token: string, cpf: string, administrador: string, nome: string, email: string) => {
      localStorage.setItem('token', token);
      localStorage.setItem('cpf', cpf);
      localStorage.setItem('administrador', administrador); 
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
      localStorage.removeItem('token');
      localStorage.removeItem('cpf');
      localStorage.removeItem('administrador');
      localStorage.removeItem('nome');
      localStorage.removeItem('email');

      setToken(null);
      setCpf(null);
      setAdministrador(null);
      setNome(null);
      setEmail(null);
      setIsAuthenticated(false);
  };

    return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, cpf, token, administrador, nome, email }}
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
