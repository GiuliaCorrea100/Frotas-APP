import axios from "axios";

const API_URL = "http://localhost:3000/percurso";

export interface PercursoBackend {
  idPercurso?: number;
  idCorrida: number;
  localDestino: string;
  saidaOdometro: number;
  saidaHora?: Date;
  chegadaHora?: Date;
  chegadaHodometro?: number;
  localOrigem?: string;
}

export const iniciarPercurso = async (data: {
  localDestino: string;
  odometroInicial: number;
  idCorrida: number;
  localOrigem?: string;
}) => {
  if (!data.localDestino || isNaN(data.odometroInicial)) {
    throw new Error("Dados inválidos");
  }

  try {
    const payload = {
      idCorrida: data.idCorrida,
      saidaOdometro: data.odometroInicial,
      localDestino: data.localDestino,
      localOrigem: data.localOrigem || ""
    };

    const response = await axios.post(API_URL, payload);
    return response.data as PercursoBackend;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Erro no servidor";
      throw new Error(errorMessage);
    }
    throw error;
  }
};