// src/services/axiosConnect.ts
import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosConnect = axios.create({
  baseURL: "http://localhost:3000", // Defina a URL base da sua API
  timeout: 10000, // Defina um tempo limite se necessário
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para capturar erros de autenticação
axiosConnect.interceptors.response.use(
  (response) => response, // Retorna a resposta normalmente, se não houver erro
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
