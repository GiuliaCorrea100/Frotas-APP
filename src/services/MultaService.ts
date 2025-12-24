import axiosConnect from "./axios/axiosConnect";

export interface MultaDto {
  idMulta?: number;
  codigoInfracao: number;
  classificacao: string;
  valorInfracao: number;
  placaVeiculo: string;
  dataInfracao: Date | null;
  autoInfracao: number;
  ativa?: boolean;
  urlArquivo?: string;
  idMotorista?: number;
  nomeMotorista?: string;
  motorista?: {
    idUsuario?: number;
    nome?: string;
    email?: string;
  };
}

export interface MultaBackend {
  codigoInfracao: number;
  classificacao: string;
  valorInfracao: number;
  placaVeiculo: string;
  dataInfracao: Date | null;
  autoInfracao: number;
}

export class MultaService {
  static async listarMultas(): Promise<MultaDto[]> {
    try {
      const response = await axiosConnect.get<MultaDto[]>("/multa");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar multas:", error);
      return [];
    }
  }

  static async criarMulta(dados: MultaBackend): Promise<void> {
    try {
      await axiosConnect.post("/multa", dados);
    } catch (error) {
      console.error("Erro ao cadastrar multa:", error);
      throw error;
    }
  }

  static async criarMultaComArquivo(formData: FormData): Promise<void> {
    try {
      const response = await axiosConnect.post("/multa/com-arquivo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Resposta do servidor:", response.data);
    } catch (error) {
      console.error("Erro ao cadastrar multa com arquivo:", error);
      throw error;
    }
  }

  static async atualizarMulta(
    idMulta: number,
    dados: MultaBackend
  ): Promise<void> {
    try {
      await axiosConnect.put(`/multa/${idMulta}`, dados);
    } catch (error) {
      console.error(`Erro ao atualizar multa ${idMulta}:`, error);
      throw error;
    }
  }

  static async atualizarArquivoMulta(
    idMulta: number,
    formData: FormData
  ): Promise<void> {
    try {
      await axiosConnect.put(`/multa/${idMulta}/arquivo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error(`Erro ao atualizar arquivo da multa ${idMulta}:`, error);
      throw error;
    }
  }

  static async removerMulta(idMulta: number): Promise<void> {
    try {
      await axiosConnect.patch(`/multa/deletar-multa/${idMulta}`);
      console.log(`Multa ${idMulta} marcada como deletada`);
    } catch (error) {
      console.error(`Erro ao deletar multa ${idMulta}:`, error);
      throw error;
    }
  }

  static async buscarMultaPorId(id: number): Promise<MultaDto> {
    try {
      const response = await axiosConnect.get<MultaDto>(`/multa/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar multa ${id}:`, error);
      throw error;
    }
  }

  static async downloadArquivo(fileName: string): Promise<Blob> {
    try {
      const response = await axiosConnect.get(`/anexo/download/${fileName}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao baixar arquivo ${fileName}:`, error);
      throw error;
    }
  }

  static async removerArquivoMulta(idMulta: number): Promise<void> {
    try {
      await axiosConnect.delete(`/multa/${idMulta}/arquivo`);
      console.log(`Arquivo da multa ${idMulta} removido com sucesso`);
    } catch (error) {
      console.error(`Erro ao remover arquivo da multa ${idMulta}:`, error);
      throw error;
    }
  }

  static async deletarArquivoPorUrl(urlArquivo: string): Promise<void> {
    try {
      await axiosConnect.delete('/anexo/remover-por-url', {
        data: { urlArquivo }
      });
    } catch (error) {
      console.error(`Erro ao deletar arquivo por URL:`, error);
      throw error;
    }
  }
}