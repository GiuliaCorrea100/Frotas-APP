import axiosConnect from "./axios/axiosConnect";

export interface OcorrenciaDto {
  idOcorrencia: number;
  descricao: string;
  idCorrida: number;
  //dataRegistro: String;
  dataOcorrencia: Date;
  ativa?: boolean;
  idMotorista: number;
  nomeMotorista?: string;
}

interface OcorrenciaBackend {
  idOcorrencia?: number;
  descricao: string;
  idCorrida: number;
  dataOcorrencia: Date;
  //dataRegistro: Date;
  ativa?: boolean;
}

export class OcorrenciaService {
  static async buscarTodos(): Promise<OcorrenciaDto[]> {
    try {
      const token = localStorage.getItem("token");
      const respOcorrencias = await axiosConnect.get<OcorrenciaDto[]>(
        "/ocorrencia",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return respOcorrencias.data;
    } catch (err) {
      console.error("Erro ao buscar ocorrências:", err);
      return [];
    }
  }

  // static async criar(dados: OcorrenciaBackend): Promise<void> {
  //   try {
  //     const token = localStorage.getItem("token");
  //     await axiosConnect.post("/ocorrencia", dados, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //   } catch (err) {
  //     console.error("Erro ao salvar ocorrência:", err);
  //     throw err;
  //   }
  // }

  static async criar(payload: any): Promise<any> {
  try {
    const response = await axiosConnect.post("/ocorrencia", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar ocorrencia: ", error);
    throw error;
  }
}

  static async salvarArquivosOcorrencia( idOcorrencia: number, FormData: FormData):Promise<any>{
    const response = await axiosConnect.post(
          `/ocorrencia/upload/${idOcorrencia}`,
          FormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
    return response.data;
  }

  static async buscarPorCorrida(idCorrida: number): Promise<OcorrenciaDto[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosConnect.get<OcorrenciaDto[]>(
        `/ocorrencia/buscar-por-corrida/${idCorrida}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const ocorrenciasAtivas = response.data.filter(
        (ocorrencia) => ocorrencia.ativa == true,
      );

      return ocorrenciasAtivas;
    } catch (error) {
      console.error(
        `Erro ao buscar ocorrências para corrida ${idCorrida}:`,
        error,
      );
      return [];
    }
  }

  static async atualizarDescricao(
    id: number,
    descricao: string,
  ): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      await axiosConnect.patch(
        `/ocorrencia/${id}/descricao`,
        { descricao },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error(`Erro ao atualizar ocorrência ${id}:`, error);
      throw error;
    }
  }

  static async excluir(idOcorrencia: number): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      await axiosConnect.delete(`/ocorrencia/${idOcorrencia}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error(`Erro ao excluir ocorrência ${idOcorrencia}:`, error);
      throw error;
    }
  }

  static async excluirOcorrencia(idOcorrencia: number): Promise<any> {
    try {
      await axiosConnect.patch(
        `/ocorrencia/deletar-ocorrencia/${idOcorrencia}`,
      );
      console.log(`ocorrencia ${idOcorrencia} marcada como deletada`);
    } catch (error) {
      console.error(`Erro ao deletar ocorrência ${idOcorrencia}:`, error);
      throw error;
    }
  }
}
