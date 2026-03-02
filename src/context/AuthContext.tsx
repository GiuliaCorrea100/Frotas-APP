import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken } from '../utils/jwtDecodeHelper';
import axiosConnect from '../services/axios/axiosConnect'; 

interface AuthContextType {
  isAuthenticated: boolean;
  hasCorridaAtiva: boolean;
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
  const [hasCorridaAtiva, setHasCorridaAtiva] = useState<boolean>(false); 
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

 const login = async (token: string, cpf: string, administrador: boolean, nome: string, email: string) => {

  try {
    localStorage.setItem('token', token);
    localStorage.setItem('cpf', cpf);
    localStorage.setItem('administrador', administrador.toString());
    localStorage.setItem('nome', nome);
    localStorage.setItem('email', email);

    const decoded = decodeToken<{ sub?: number; idUsuario?: number }>(token);
    const idUsuario = decoded.sub ?? decoded.idUsuario;
    
    let hasCorridaAtiva = false;
    let corridaIdAtiva = '';
    
    if (idUsuario) {
      try {
        const res = await axiosConnect.get(`/corrida/motorista-dashboard/${idUsuario}`);
        const corrida = res.data.corridaDeHoje;
        hasCorridaAtiva = !!(corrida && corrida.situacao !== 'FINALIZADA');
        corridaIdAtiva = corrida?.idCorrida?.toString() || '';
        
        localStorage.setItem('hasCorridaAtiva', hasCorridaAtiva.toString());
        localStorage.setItem('corridaIdAtiva', corridaIdAtiva);
      } catch (corridaError) {
        console.log('⚠️ Sem corrida ativa');
      }
    }

    setToken(token);
    setCpf(cpf);
    setAdministrador(administrador);
    setNome(nome);
    setEmail(email);
    setIsAuthenticated(true);
    setHasCorridaAtiva(hasCorridaAtiva);
    
    return { hasCorridaAtiva, corridaIdAtiva, administrador };
  } catch (error) {
    console.error('Erro ao realizar login', error);
    throw error;
  }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setCpf(null);
    setAdministrador(false);
    setNome(null);
    setEmail(null);
    setIsAuthenticated(false);
    setHasCorridaAtiva(false);
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
    <AuthContext.Provider value={{ isAuthenticated, hasCorridaAtiva, login, logout, cpf, token, administrador, nome, email }}>
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