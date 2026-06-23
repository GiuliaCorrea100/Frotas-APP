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
    const response = await axiosConnect.post("/corrida-vistoria", vistoria);
    console.log(response);
    return response.data;
  };

  static async salvarFotosVistoria(idCorridaVistoria: number, files: FormData): Promise<any> {
    const response = await axiosConnect.post(
      `/corrida-vistoria/${idCorridaVistoria}/fotos/retirada`,
      files,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}