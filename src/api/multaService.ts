import axiosConnect from "../services/axiosConnect";

// DTO vindo do backend
export interface MultaDto {
  idMulta?: number;
  codigoInfracao: number;
  classificacao: string;
  valorInfracao: number;
  placaVeiculo: string;
  dataInfracao: Date | null;
  autoInfracao: number;
  deletada?: boolean;
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
      const response = await axiosConnect.get<MultaDto[]>("/multas");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar multas:", error);
      return [];
    }
  }

  static async criarMulta(dados: MultaBackend): Promise<void> {
    try {
      await axiosConnect.post("/multas", dados);
    } catch (error) {
      console.error("Erro ao cadastrar multa:", error);
      throw error;
    }
  }

  static async atualizarMulta(
    idMulta: number,
    dados: MultaBackend
  ): Promise<void> {
    try {
      console.log(idMulta);
      await axiosConnect.put(`/multas/${idMulta}`, dados);
    } catch (error) {
      console.error(`Erro ao atualizar multa ${idMulta}:`, error);
      throw error;
    }
  }

  static async removerMulta(idMulta: number): Promise<void> {
    try {
      await axiosConnect.patch(`/multas/deletar-multa/${idMulta}`);
      console.log(`Multa ${idMulta} marcada como deletada`);
    } catch (error) {
      console.error(`Erro ao deletar multa ${idMulta}:`, error);
      throw error;
    }
  }
}
