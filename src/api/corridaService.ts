import axios from "axios";
import api from "../config/axiosConfig";

const API_URL = "http://localhost:3000/corrida";

export interface CorridaBackend {
  idCorrida?: number;
  dataInicio: string | Date;
  dataTermino: string | Date | null;
  distanciaKm?: string | null;
  
  idMotorista: number;
  situacao: string;
  chaveEmprestada: boolean;
  idCarros: number;
}

export interface CorridaFrontend {
  idCorrida: number;
  dataInicio: string;
  dataTermino: string | null;
  distanciaKm: string;
  idMotorista: number;
  nomeMotorista?: string;
  placaVeiculo?: string;
  situacao?: string;
  chaveEmprestada: boolean;
}

export interface CorridaDto {
  idCorrida: number;
  dataInicio: Date;
  dataTermino: Date | null;
  distanciaKm: string;
  itinerario: string;
  idMotorista: number;
  nomeMotorista?: string;
  placaVeiculo?: string;
  situacao?: string;
  chaveEmprestada: boolean;
}

export const createCorrida = async (
  corridaData: Omit<CorridaBackend, "idCorrida">
) => {
  try {
    const payload = {
      ...corridaData,
      dataInicio:
        corridaData.dataInicio instanceof Date
          ? corridaData.dataInicio.toISOString().split("T")[0]
          : corridaData.dataInicio.split("T")[0],
      dataTermino: corridaData.dataTermino
        ? corridaData.dataTermino instanceof Date
          ? corridaData.dataTermino.toISOString().split("T")[0]
          : corridaData.dataTermino.split("T")[0]
        : null,
    };

    console.log("Enviando para o backend:", payload);
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
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

export const buscarCorridaPorId = async (idCorrida: number): Promise<CorridaBackend> => {
  try {
    const response = await axios.get(`${API_URL}/${idCorrida}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar corrida:", error);
    throw error;
  }
};

export const atualizarSituacaoCorrida = async (idCorrida: number, situacao: string): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/${idCorrida}/situacao`, { situacao });
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
    dataInicio:
      corrida.dataInicio instanceof Date
        ? corrida.dataInicio.toISOString()
        : corrida.dataInicio,
    dataTermino:
      corrida.dataTermino instanceof Date
        ? corrida.dataTermino.toISOString()
        : corrida.dataTermino,
    distanciaKm: corrida.distanciaKm || "0",
    idMotorista: corrida.idMotorista,
    nomeMotorista: (corrida as any).nomeMotorista || "Desconhecido",
    chaveEmprestada: corrida.chaveEmprestada ?? false,
    placaVeiculo: (corrida as any).placaVeiculo || "Não informada",
    situacao: corrida.situacao || "Desconhecida",
  };
}

export class CorridaService {
  static async confirmarLiberarChave(
    idCorrida: number,
    idMotorista: number,
    senha: string
  ): Promise<void> {
    try {
      console.log("buscando pessoa no banco singu");
      const { data } = await api.get(`/usuarios/buscar-singu/${idMotorista}`);

      const idSingu = data;
      console.log("idSingu:", idSingu);

      console.log("enviando senha e id para ver se são compatíveis");
      const { data: senhaValida } = await api.get(
        `/usersingu/conferir-senha/${idSingu}/${senha}`
      );

      if (senhaValida === true) {
        console.log("enviando patch para mudar o estado da chave");
        await api.patch(`/corrida/emprestar-chave/${idCorrida}`);
        console.log("chave emprestada com sucesso APP");
      } else {
        console.error("Senha inválida!");
        throw new Error("Senha inválida!");
      }
    } catch (error) {
      console.error("Erro ao emprestar chave", error);
      throw error;
    }
  }

  static async confirmarReceberChave(idCorrida: number): Promise<void> {
    try {
      console.log("enviando patch para mudar o estado da chave");
      await api.patch(`/corrida/emprestar-chave/${idCorrida}`);
      console.log("chave emprestada com sucesso APP");
    } catch (error) {
      console.error("Erro ao emprestar chave", error);
      throw error;
    }
  }
}