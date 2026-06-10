import axiosConnect from "./axios/axiosConnect";

export interface CorridaVistoriaDto {
  idCorrida: number;
  tipo: "RETIRADA" | "DEVOLUCAO";
  veiculoRecebidoSemAvarias: boolean;
  observacoes?: string;
}

export const CorridaVistoriaService = {
  async verificarVistoriaPendente(idCorrida: number): Promise<{ pendente: boolean }> {
    const response = await axiosConnect.get(`/corrida-vistoria/status-pendente/${idCorrida}`);
    return response.data;
  },

  async registrarVistoria(dto: CorridaVistoriaDto): Promise<any> {
    const response = await axiosConnect.post("/corrida-vistoria", dto);
    return response.data;
  }
};