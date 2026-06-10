import axiosConnect from "./axios/axiosConnect";

export interface CorridaVistoriaDto {
  idCorrida: number;
  tipo: "RETIRADA" | "DEVOLUCAO";
  veiculoRecebidoSemAvarias: boolean;
  observacoes?: string;
}

export class CorridaVistoriaService  {
  static async verificarVistoriaPendente(idCorrida: number): Promise<{ pendente: boolean }> {
    const response = await axiosConnect.get(`/corrida-vistoria/status-pendente/${idCorrida}`);
    return response.data;
  };

  static async registrarVistoria(vistoria: CorridaVistoriaDto): Promise<any> {
    console.log("entrando");
    const response = await axiosConnect.post("/corrida-vistoria", vistoria);
    console.log(response);
    return response.data;
  };
};