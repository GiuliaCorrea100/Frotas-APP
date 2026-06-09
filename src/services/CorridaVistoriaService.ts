import axiosConnect from "./axios/axiosConnect";

export interface CreateCorridaVistoriaDto {
  idCorrida: number;
  tipo: "ENTRADA" | "SAIDA";
  veiculoRecebidoSemAvarias: boolean;
  observacoes?: string;
}

export const CorridaVistoriaService = {
  async verificarVistoriaPendente(idCorrida: number): Promise<{ pendente: boolean }> {
    const response = await axiosConnect.get(`/corrida-vistoria/status-pendente/${idCorrida}`);
    return response.data;
  },

  async registrarVistoria(dto: CreateCorridaVistoriaDto): Promise<any> {
    const response = await axiosConnect.post("/corrida-vistoria", dto);
    return response.data;
  }
};