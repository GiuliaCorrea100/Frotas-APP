import axiosConnect from "./axios/axiosConnect";

export interface CorridaVistoriaDto {
  idCorrida: number;
  tipo: "RETIRADA" | "DEVOLUCAO";
  veiculoRecebidoSemAvarias: boolean;
  observacoes?: string;
}

export interface CorridaVistoriaFrontend {
  idCorridaVistoria?: number;
  idCorrida: number;
  tipo: "RETIRADA" | "DEVOLUCAO";
  veiculoRecebidoSemAvarias: boolean;
  observacoes: string;
  dataRegistro: Date;
  registradoPor: number;
  usuarioRegistrou?: {
    idUsuario: number;
    nome: string;
  };
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

  static async salvarFotosVistoria( idCorridaVistoria: number, files: FormData):Promise<any>{
    const response = await axiosConnect.post(
          `/anexo/upload/${idCorridaVistoria}`,
          files,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
    return response.data;
  }

  static async buscarVistoria(idCorrida: number): Promise<CorridaVistoriaFrontend[]> {
  try {
    console.log("Buscando vistorias da corrida");
    const response = await axiosConnect.get(`/corrida-vistoria/corrida/${idCorrida}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar vistorias:', error);
    return []; 
  }
}
};