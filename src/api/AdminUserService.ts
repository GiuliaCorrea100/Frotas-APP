import api from "../config/axiosConfig";

// DTO combinado com administrador, nome e email
export interface AdminUserDto {
  idUsuario: number;
  idPessoaSigaa: number;
  administrador: boolean;
  nome: string;
}

interface UserDto {
  idUsuario: number;
  idPessoaSigaa: number;
  administrador: boolean;
  nome: string;
}

export class AdminUserService {
  static async buscarTodos(): Promise<AdminUserDto[]> {
    const respUsers = await api.get<UserDto[]>("/usuarios", {
      params: {
        administrador: true
      }
    });

    const users = respUsers.data;

    const combinados: AdminUserDto[] = await Promise.all(
      users.map(async (user) => {
           return {
            idUsuario: user.idUsuario,
            idPessoaSigaa: user.idPessoaSigaa,
            administrador: user.administrador,
            nome: user.nome,
          };
      })
    );

    return combinados;
  }

  static async confirmarCadastro(idUsuario: number): Promise<void> {
    try {
      await api.patch(`/usuarios/mudar-permissao/${idUsuario}`);
    } catch (error) {
      console.error("Erro ao confirmar cadastro", error);
      throw error;
    }
  }
}
