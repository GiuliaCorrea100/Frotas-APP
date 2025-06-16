import axios from "axios";

const API_URL = "http://localhost:3000/corrida";

interface CorridaBackend {
  idCorrida?: number;
  dataInicio: string | Date;
  dataTermino: string | Date | null;
  distanciaKm?: string | null;
  itinerario: string;
  tombo_carro: string;
  odometroInicio?: string;
  odometroFim?: number | null;
  numeroIdMotorista: number;
  nomeMotorista?: string;
}

export interface CorridaFrontend {
  idCorrida: number;
  dataInicio: string;
  dataTermino: string | null;
  distanciaKm: string;
  itinerario: string;
  tomboCarro: string;
  numeroIdMotorista: number;
  nomeMotorista?: string;
  placaVeiculo?: string;
  modeloVeiculo?: string;
}

export const createCorrida = async (
  corridaData: Omit<CorridaBackend, "idCorrida">
) => {
  try {
    const payload = {
      ...corridaData,
      tomboCarro: corridaData.tombo_carro,
      dataInicio:
        corridaData.dataInicio instanceof Date
          ? corridaData.dataInicio.toISOString()
          : corridaData.dataInicio,
      dataTermino:
        corridaData.dataTermino instanceof Date
          ? corridaData.dataTermino.toISOString()
          : corridaData.dataTermino,
      numeroIdMotorista: corridaData.numeroIdMotorista,
    };

    console.log("Enviando para o backend:", payload);
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const getCorridaById = async (
  idCorrida: number
): Promise<CorridaFrontend> => {
  try {
    const response = await axios.get<CorridaBackend>(`${API_URL}/${idCorrida}`);
    return formatCorrida(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

export const getCorridas = async (): Promise<CorridaFrontend[]> => {
  try {
    const response = await axios.get<CorridaBackend[]>(API_URL);
    return response.data.map(formatCorrida);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

function formatCorrida(corrida: CorridaBackend): CorridaFrontend {
  return {
    idCorrida: corrida.idCorrida || 0,
    itinerario: corrida.itinerario,
    tomboCarro: corrida.tombo_carro,
    dataInicio:
      corrida.dataInicio instanceof Date
        ? corrida.dataInicio.toISOString()
        : corrida.dataInicio,
    dataTermino:
      corrida.dataTermino instanceof Date
        ? corrida.dataTermino.toISOString()
        : corrida.dataTermino,
    distanciaKm: corrida.distanciaKm || "0",
    numeroIdMotorista: corrida.numeroIdMotorista,

    nomeMotorista: (corrida as any).nomeMotorista || "Desconhecido",
    placaVeiculo: (corrida as any).placaVeiculo || "Não informada",
    modeloVeiculo: (corrida as any).modeloVeiculo || "Não informado",
  };
}
