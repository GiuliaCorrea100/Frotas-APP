//É o "mensageiro" o frontend e o backend para:
//Fazer login
//Fazer logout
//Verificar quem está logado

import api from '../config/axiosConfig';

//Define como devem ser os dados de login (CPF e senha)
interface LoginData {
  cpf: string; 
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    idUsuario: number;
    idPessoaSingu: number;
    permissao: string;
  };
}

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  //Envia CPF/senha para o backend
    try {
      const response = await api.post('/auth/login', {  //Faz uma chamada para http://localhost:3000/auth/login
        username: data.cpf,
        password: data.password
      });
  
      const userWithCredentials = {
        ...response.data.user,
        cpf: data.cpf,
        password: data.password
      };
  
      //Se der certo, guarda no localStorage:
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userWithCredentials));
      
      return {
        token: response.data.token, //Se o login for válido, guarda: token (como chave de acesso), user (dados do usuário)
        user: userWithCredentials
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
};

//Simplesmente remove os dados salvos
export const logoutUser = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

//Lê os dados salvos no navegador  
export const getCurrentUser = (): any => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
        return null;
      }
};