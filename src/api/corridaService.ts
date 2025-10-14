import api from "../config/axiosConfig";

export interface CorridaBackend {
  idCorrida?: number;
  dataInicio: string | Date;
  dataTermino: string | Date | null;
  distanciaKm?: string | null;
  idMotorista: number;
  situacao: string;
  chaveEmprestada: boolean;
  idCarro: number;
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

    const response = await api.post(`/corrida`, payload);
    return response.data;
  } catch (error) {
    //
    throw error;
  }
};

export const getCorridaById = async (
  idCorrida: number
): Promise<CorridaFrontend> => {
  try {
    const response = await api.get<CorridaBackend>(`/corrida/${idCorrida}`);
    return formatCorrida(response.data);
  } catch (error) {
    throw error;
  }
};

export const getCorridas = async (): Promise<CorridaFrontend[]> => {
  try {
    const response = await api.get<CorridaBackend[]>(`/corrida`);
    return response.data.map(formatCorrida);
  } catch (error) {
    throw error;
  }
};

export const buscarCorridaPorId = async (
  idCorrida: number
): Promise<CorridaBackend> => {
  try {
    const response = await api.get(`/corrida/${idCorrida}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar corrida:", error);
    throw error;
  }
};

export const atualizarSituacaoCorrida = async (
  idCorrida: number,
  situacao: string
): Promise<void> => {
  try {
    await api.patch(`/corrida/${idCorrida}/situacao`, { situacao });
  } catch (error) {
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

      const { data: senhaValida } = await api.get(
        `/usersingu/conferir-senha/${idSingu}/${senha}`
      );

      if (senhaValida === true) {
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
      await api.patch(`/corrida/emprestar-chave/${idCorrida}`);
      console.log("chave emprestada com sucesso APP");
    } catch (error) {
      console.error("Erro ao emprestar chave", error);
      throw error;
    }
  }

  static async cancelarCorrida(idCorrida: number): Promise<void> {
    try {
      await api.patch(`/corrida/cancelar/${idCorrida}`);
      console.log("corrida cancelada com sucesso - APP");
    } catch (error) {
      console.error("Erro ao cancelar corrida", error);
      throw error;
    }
  }
}
