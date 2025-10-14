import api from "../config/axiosConfig";

export interface OcorrenciaDto {
  idOcorrencia: number;
  descricao: string;
  idCorrida: number;
  dataRegistro: String;
}

interface OcorrenciaBackend {
  idOcorrencia?: number;
  descricao: string;
  idCorrida: number;
  dataRegistro: Date;
}

export class OcorrenciaService {
  static async buscarTodos(): Promise<OcorrenciaDto[]> {
    try {
      const token = localStorage.getItem("token");
      const respOcorrencias = await api.get<OcorrenciaDto[]>("/ocorrencia", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return respOcorrencias.data;
    } catch (err) {
      console.error("Erro ao buscar ocorrências:", err);
      return [];
    }
  }

  static async criar(dados: OcorrenciaBackend): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      await api.post("/ocorrencia", dados, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Erro ao salvar ocorrência:", err);
      throw err;
    }
  }

  static async buscarPorCorrida(idCorrida: number): Promise<OcorrenciaDto[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get<OcorrenciaDto[]>(
        `/ocorrencia/buscar-por-corrida/${idCorrida}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erro ao buscar ocorrências para corrida ${idCorrida}:`,
        error
      );
      return [];
    }
  }

  static async atualizarDescricao(
    id: number,
    descricao: string
  ): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/ocorrencia/${id}/descricao`,
        { descricao },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(`Erro ao atualizar ocorrência ${id}:`, error);
      throw error;
    }
  }

  static async excluir(idOcorrencia: number): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/ocorrencia/${idOcorrencia}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error(`Erro ao excluir ocorrência ${idOcorrencia}:`, error);
      throw error;
    }
  }
}
