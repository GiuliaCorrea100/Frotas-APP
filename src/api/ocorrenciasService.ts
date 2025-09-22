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
}

export class OcorrenciaService {
  static async buscarTodos(): Promise<OcorrenciaDto[]> {
    try {
      const respOcorrencias = await api.get<OcorrenciaDto[]>("/ocorrencias");

      return respOcorrencias.data;
    } catch (err) {
      console.error("Erro ao buscar ocorrências:", err);
      return [];
    }
  }

  static async criar(dados: OcorrenciaBackend): Promise<void> {
    try {
      await api.post("/ocorrencias", dados);
    } catch (err) {
      console.error("Erro ao salvar ocorrência:", err);
      throw err;
    }
  }

  static async buscarPorCorrida(idCorrida: number): Promise<OcorrenciaDto[]> {
    try {
      const response = await api.get<OcorrenciaDto[]>(
        `/ocorrencias/buscar-por-corrida/${idCorrida}`
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
}
