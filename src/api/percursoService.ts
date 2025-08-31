import axios from "axios";

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

export const iniciarPercurso = async (idCorrida: number, data: {
  localDestino: string;
  odometro_inicial: number;
  localOrigem?: string;
}) => {
  try {
    const payload = {
      idCorrida: idCorrida,
      saidaOdometro: data.odometro_inicial,
      localDestino: data.localDestino,
      localOrigem: data.localOrigem || null
    };

    const response = await axios.post(API_URL, payload);
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Erro no servidor";
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao iniciar percurso");
  }
};

export const finalizarPercurso = async (idPercurso: number, data: {
  chegadaOdometro: number;
}) => {
  try {
    const response = await axios.put(`${API_URL}/${idPercurso}/finalizar`, {
      chegadaOdometro: data.chegadaOdometro
    });
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Erro no servidor";
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao finalizar percurso");
  }
};

export const buscarUltimoPercursoFinalizado = async (idCorrida: number): Promise<PercursoBackend | null> => {
  try {
    const response = await axios.get(`${API_URL}/corrida/${idCorrida}/ultimo-finalizado`);
    return response.data as PercursoBackend;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error("Erro ao buscar último percurso finalizado:", error);
    throw error;
  }
};

export const buscarPercursoAtivo = async (idCorrida: number): Promise<PercursoBackend | null> => {
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

export const buscarPercursosDaCorrida = async (idCorrida: number): Promise<PercursoBackend[]> => {
  try {
    const response = await axios.get(`${API_URL}/corrida/${idCorrida}`);
    return response.data as PercursoBackend[];
  } catch (error) {
    console.error("Erro ao buscar percursos da corrida:", error);
    return [];
  }
};