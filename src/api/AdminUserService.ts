import api from "../config/axiosConfig";

// DTO combinado com permissao, nome e email
export interface AdminUserDto {
  idUsuario: number;
  idPessoaSingu: number;
  permissao: number;
  nome: string;
  email: string;
}

interface UserDto {
  idUsuario: number;
  idPessoaSingu: number;
  permissao: number;
}

interface UserSinguDto {
  idPessoa: number;
  nome: string;
  email: string;
}

export class AdminUserService {
  static async buscarTodos(): Promise<AdminUserDto[]> {
    const respUsers = await api.get<UserDto[]>("/usuarios");

    const users = respUsers.data.filter((user) => user.permissao === 2);

    const combinados: AdminUserDto[] = await Promise.all(
      users.map(async (user) => {
        try {
          const resp = await api.get<UserSinguDto>(
            `/usersingu/buscar-id/${user.idPessoaSingu}`
          );

          return {
            idUsuario: user.idUsuario,
            idPessoaSingu: user.idPessoaSingu,
            permissao: user.permissao,
            nome: resp.data.nome,
            email: resp.data.email,
          };
        } catch (err) {
          return {
            idUsuario: user.idUsuario,
            idPessoaSingu: user.idPessoaSingu,
            permissao: user.permissao,
            nome: "-",
            email: "-",
          };
        }
      })
    );

    return combinados;
  }

  static async confirmarCadastro(idUsuario: number): Promise<void> {
    try {
      console.log(
        "Enviando PATCH para mudar permissão de idUsuario:",
        idUsuario
      );
      await api.patch(`/usuarios/mudar-permissao/${idUsuario}`);
    } catch (error) {
      console.error("Erro ao confirmar cadastro", error);
      throw error;
    }
  }
}
