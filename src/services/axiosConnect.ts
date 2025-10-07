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
    
    console.log('Enviando requisição:', config.url, 'com token:', !!token);
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
      // Limpa o token e outros dados no localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("cpf");
      localStorage.removeItem("idPermissao");

      // Redireciona o usuário para a página de login
      window.location.href = "/";
    }

    // Propaga o erro para tratamento posterior
    return Promise.reject(error);
  }
);

export default axiosConnect;
