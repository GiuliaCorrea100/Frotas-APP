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

export interface CorridaVistoriaFotoDto {
  idCorridaVistoriaFoto?: number;
  idCorridaVistoria: number;
  dataUpload: Date;
  urlArquivo: string;
  corridaVistoria?: {
    idCorridaVistoria: number;
    tipo: "RETIRADA" | "DEVOLUCAO";
  }

}

export class CorridaVistoriaService  {
  static async verificarVistoriaPendente(idCorrida: number): Promise<{ pendente: boolean }> {
    const response = await axiosConnect.get(`/corrida-vistoria/status-pendente/${idCorrida}`);
    return response.data;
  };

  static async registrarVistoria(vistoria: CorridaVistoriaDto): Promise<any> {
    const response = await axiosConnect.post("/corrida-vistoria", vistoria);
    return response.data;
  };

  static async salvarFotosVistoria( idCorridaVistoria: number, files: FormData, tipo?: string):Promise<any>{
    const response = await axiosConnect.post(
          `/anexo/upload/${idCorridaVistoria}${tipo ? `?tipo=${tipo}` : ''}`,
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
    const response = await axiosConnect.get(`/corrida-vistoria/corrida/${idCorrida}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar vistorias:', error);
    return []; 
  }
  }

  static async buscarFotosVistoria(idCorridaVistoria: number): Promise<CorridaVistoriaFotoDto[]> {
  try {
    const response = await axiosConnect.get(`/corrida-vistoria/fotos/${idCorridaVistoria}`);

    return response.data.map((foto: CorridaVistoriaFotoDto) => ({
      ...foto,
      urlArquivo: `${axiosConnect.defaults.baseURL}${foto.urlArquivo}`,
    }));
  } catch (error) {
    console.error('Erro ao buscar fotos da vistoria:', error);
    return [];
  }
}

};