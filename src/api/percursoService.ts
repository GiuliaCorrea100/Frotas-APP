import axios from "axios";
import axiosConnect from "../services/axiosConnect";

const API_URL = "http://localhost:3000/percurso";

export interface PercursoBackend {
  idPercurso?: number;
  idCorrida: number;
  localDestino: string;
  saidaOdometro: number;
  saidaHora?: Date;
  chegadaHora?: Date | null;
  chegadaodometro?: number;
  localOrigem?: string;
}

export interface PercursoDto {
  idPercurso?: number;
  saidaHora?: Date | null;
  saidaOdometro: number;
  localDestino: string;
  chegadaHora?: Date | null | undefined;
  chegadaodometro?: number;
  localOrigem?: string;
}

export const iniciarPercurso = async (
  idCorrida: number,
  data: {
    localDestino: string;
    odometro_inicial: number;
    localOrigem?: string;
  }
) => {
  try {
    const payload = {
      idCorrida: idCorrida,
      saidaOdometro: data.odometro_inicial,
      localDestino: data.localDestino,
      localOrigem: data.localOrigem || null,
    };

    const response = await axios.post(API_URL, payload);
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro no servidor";
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao iniciar percurso");
  }
};

export const finalizarPercurso = async (
  idPercurso: number,
  data: {
    chegadaOdometro: number;
  }
) => {
  try {
    const response = await axios.put(`${API_URL}/${idPercurso}/finalizar`, {
      chegadaOdometro: data.chegadaOdometro,
    });
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro no servidor";
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao finalizar percurso");
  }
};

export const buscarUltimoPercursoFinalizado = async (
  idCorrida: number
): Promise<PercursoBackend | null> => {
  try {
    const response = await axios.get(
      `${API_URL}/corrida/${idCorrida}/ultimo-finalizado`
    );
    return response.data as PercursoBackend;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error("Erro ao buscar último percurso finalizado:", error);
    throw error;
  }
};

export const buscarPercursoAtivo = async (
  idCorrida: number
): Promise<PercursoBackend | null> => {
  try {
    const response = await axios.get(`${API_URL}/corrida/${idCorrida}/ativo`);
    return response.data as PercursoBackend;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error("Erro ao buscar percurso ativo:", error);
    throw error;
  }
};

export const buscarPercursosDaCorrida = async (
  idCorrida: number
): Promise<PercursoBackend[]> => {
  try {
    const response = await axios.get(`${API_URL}/corrida/${idCorrida}`);

    console.log(response);
    return response.data as PercursoBackend[];
  } catch (error) {
    console.error("Erro ao buscar percursos da corrida:", error);
    return [];
  }
};

export const atualizarPercurso = async (
  idPercurso: number,
  dados: Partial<PercursoDto>
): Promise<any> => {
  try {
    console.log(dados);
    const response = await axiosConnect.patch(
      `${API_URL}/${idPercurso}/percurso`,
      dados
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar percurso: ", error);
    throw error;
  }
};

export const inserirPercursoCompleto = async (
  idCorrida: number,
  data: {
    localDestino: string;
    chegadaOdometro: number;
    localOrigem?: string;
    saidaOdometro: number;
    saidaHora: Date | null;
    chegadaHora: Date | null;
  }
) => {
  try {
    const payload = {
      idCorrida: idCorrida,
      saidaOdometro: data.saidaOdometro,
      chegadaOdometro: data.chegadaOdometro,
      localDestino: data.localDestino,
      localOrigem: data.localOrigem,
      saidaHora: data.saidaHora,
      chegadaHora: data.chegadaHora,
    };

    console.log(payload);
    const response = await axios.post(
      `${API_URL}/percurso-completo/${idCorrida}`,
      payload
    );
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro no servidor";
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao cadastrar percurso");
  }
};