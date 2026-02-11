// src/services/axiosConnect.ts
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosConnect = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cache para evitar renovações em requisições muito próximas
const RENEWAL_COOLDOWN = 5000; // 5 segundos
let lastRenewalTime = 0;

interface JwtPayload {
  exp: number;
  sub: number;
  login: string;
  administrador: boolean;
  iat: number;
  nome: string;
  email: string;
  idUsuario: number;
}

// Função para renovar o token
const renewToken = async (currentToken: string): Promise<string> => {
  const now = Date.now();
  
  // Verifica cooldown
  if (now - lastRenewalTime < RENEWAL_COOLDOWN) {
    return currentToken; // Retorna token atual se ainda está em cooldown
  }

  try {
    //console.log("Renovando token...");
    lastRenewalTime = now;
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/renew-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );

    const { token: newToken } = response.data;
    
    // Salva apenas o novo token (mantém outros dados do localStorage)
    localStorage.setItem("token", newToken);
    
    // Decodifica para obter tempo de expiração
    const decoded = jwtDecode<JwtPayload>(newToken);
    
    // Calcula novo tempo de expiração
    const expiresAt = decoded.exp * 1000;
    localStorage.setItem("tokenExpiresAt", expiresAt.toString());
    
    // Dispara evento para notificar componentes
    window.dispatchEvent(new CustomEvent("tokenRenewed", {
      detail: { 
        token: newToken, 
        expiresAt,
        timestamp: Date.now()
      }
    }));

    //console.log("Token renovado com sucesso");
    return newToken;
  } catch (error: any) {
    console.error("Falha ao renovar token:", error.response?.data || error.message);
    lastRenewalTime = 0; // Reseta cooldown em caso de erro
    
    // Se erro 401, faz logout
    if (error.response?.status === 401) {
      // Limpa localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiresAt");
      
      // Redireciona para login se não estiver já lá
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    
    throw error;
  }
};

// Interceptor de requisição - Renova em cada requisição
axiosConnect.interceptors.request.use(
  async (config) => {
    // Não renovar para endpoints de autenticação
    if (config.url?.includes("/auth/")) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return config;
    }

    try {
      // Tenta renovar o token a cada requisição
      const newToken = await renewToken(token);
      config.headers.Authorization = `Bearer ${newToken}`;
      return config;
    } catch (error) {
      // Se falhou na renovação, usa o token atual
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta
axiosConnect.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se erro 401, faz logout
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiresAt");
      
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosConnect;