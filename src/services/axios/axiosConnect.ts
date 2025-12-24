// src/services/axiosConnect.ts
import axios from "axios";

const axiosConnect = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosConnect.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem("token");

    // Se existir token, adiciona no header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para capturar erros de autenticação
axiosConnect.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Verifica se é uma requisição de login (não deve redirecionar)
      const isLoginRequest = error.config.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        // Remove dados de autenticação do localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("cpf");
        localStorage.removeItem("administrador");
        localStorage.removeItem("nome");
        localStorage.removeItem("email");

        // Verifica se já estamos na página de login para evitar loop
        if (window.location.pathname !== '/') {
          window.location.href = "/";
        }
      }
    }

    // Propaga o erro para tratamento posterior
    return Promise.reject(error);
  }
);

export default axiosConnect;
