//Configura como as requisições serão feitas - Adiciona automaticamente o token de autenticação - Trata erros de forma centralizada
//Enviar/receber dados do backend

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', //// Endereço do backend
  headers: {
    'Content-Type': 'application/json', //// Sempre envia como JSON
  },
});

api.interceptors.response.use(
  (response) => response, //// Se a resposta for boa, só repassa
  (error) => {
    console.error('Erro na requisição:', error.response?.data || error.message);
    return Promise.reject(error); //// Rejeita a promessa com o erro
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Adiciona o token
  }
  return config; // Retorna a configuração modificada
});

export default api;

/*
Quando você faz login:

O token é salvo no localStorage

Todas as próximas requisições vão levar automaticamente esse token
*/