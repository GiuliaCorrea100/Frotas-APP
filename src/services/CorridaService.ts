import axiosConnect from "./axios/axiosConnect";

export interface CorridaBackend {
  idCorrida?: number;
  dataInicio: string | Date;
  dataTermino: string | Date | null;
  distanciaKm?: string | null;
  idMotoristaPrincipal: number;
  situacao: string;
  chaveEmprestada: boolean;
  idCarro: number;
  dataHoraRecebimentoChave: string | Date;
  dataHoraLiberacaoChave: string | Date;
  motoristasIds?: number[];
  motoristas?: { idMotorista: number; nome: string }[];
}

export interface CorridaFrontend {
  idCorrida: number;
  dataInicio: string;
  dataTermino: string | null;
  distanciaKm: string;
  idMotoristaPrincipal: number;
  nomeMotoristaPrincipal?: string;
  placaVeiculo?: string;
  situacao?: string;
  chaveEmprestada: boolean;
  idCarro: number;
  dataHoraRecebimentoChave?: string | null;
  dataHoraLiberacaoChave?: string | null;
  motoristas?: { idMotorista: number; nome: string }[];
}

export interface CorridaDto {
  idCorrida: number;
  dataInicio: Date;
  dataTermino: Date | null;
  distanciaKm: string;
  idMotoristaPrincipal: number;
  nomeMotoristaPrincipal?: string;
  placaVeiculo?: string;
  situacao?: string;
  chaveEmprestada: boolean;
  idCarro: number;
  motoristasIds?: number[];
  motoristas?: { idMotorista: number; nome: string }[];
}

export const createCorrida = async (
  corridaData: Omit<CorridaBackend, "idCorrida">
) => {
  try {
    const payload = corridaData;
    const response = await axiosConnect.post(`/corrida`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCorridaById = async (
  idCorrida: number
): Promise<CorridaFrontend> => {
  try {
    const response = await axiosConnect.get<CorridaBackend>(`/corrida/${idCorrida}`);
    return formatCorrida(response.data);
  } catch (error) {
    throw error;
  }
};

export const getCorridas = async (): Promise<CorridaFrontend[]> => {
  try {
    const response = await axiosConnect.get<CorridaBackend[]>(`/corrida`);
    return response.data.map(formatCorrida);
  } catch (error) {
    throw error;
  }
};

export const buscarCorridaPorId = async (
  idCorrida: number
): Promise<CorridaBackend> => {
  try {
    const response = await axiosConnect.get(`/corrida/${idCorrida}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar corrida:", error);
    throw error;
  }
};

export const getRelatorioCorridas = async (
  ano: number
) => {
  const { data } = await axiosConnect.get('/corrida/relatorio/corridas-geral', {
      params: { ano },
    });
    return data;
}

export const getRelatorioVisaoGeral = async (
  ano: number
) => {
  const { data } = await axiosConnect.get('/corrida/relatorio/visao-geral', {
      params: { ano },
    });
    return data;
}

export const atualizarSituacaoCorrida = async (
  idCorrida: number,
  situacao: string
): Promise<void> => {
  try {
    console.log("situacao: ", situacao, "id: ", idCorrida);
    await axiosConnect.patch(`/corrida/${idCorrida}/situacao`, { situacao });
    
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
    dataHoraLiberacaoChave:
      corrida.dataHoraLiberacaoChave instanceof Date
        ? corrida.dataHoraLiberacaoChave.toISOString()
        : corrida.dataHoraLiberacaoChave || null,
    dataHoraRecebimentoChave:
    corrida.dataHoraRecebimentoChave instanceof Date
      ? corrida.dataHoraRecebimentoChave.toISOString()
      : corrida.dataHoraRecebimentoChave || null,
    distanciaKm: corrida.distanciaKm || "0",
    idMotoristaPrincipal: corrida.idMotoristaPrincipal,
    nomeMotoristaPrincipal: (corrida as any).nomeMotoristaPrincipal || (corrida as any).nomeMotorista || "Desconhecido",
    chaveEmprestada: corrida.chaveEmprestada ?? false,
    placaVeiculo: (corrida as any).placaVeiculo || "Não informada",
    situacao: corrida.situacao || "Desconhecida",
    idCarro: corrida.idCarro,
    motoristas: (corrida as any).motoristas || undefined,
  };
}

export class CorridaService {
  static async confirmarLiberarChave(
    idCorrida: number,
    idMotorista: number,
    senha: string
  ): Promise<void> {
    try {
      const { data } = await axiosConnect.get(`/usuario/buscar-usuario/${idMotorista}`);

      const idSigaa = data.idPessoaSigaa;

      const { data: senhaValida } = await axiosConnect.get(
        `/usuarioSigaa/conferir-senha/${idSigaa}/${senha}`
      );

      if (senhaValida === true) {
        await axiosConnect.patch(`/corrida/emprestar-chave/${idCorrida}`);
      } else {
        console.error("Senha inválida!");
        throw new Error("Senha inválida!");
      }
    } catch (error) {
      console.error("Erro ao emprestar chave", error);
      throw error;
    }
  }

  static async confirmarLiberarChaveMock(
    idCorrida: number,
    idMotorista: number
  ): Promise<void> {
    try {
      await axiosConnect.patch(`/corrida/emprestar-chave/${idCorrida}`);
    } catch (error) {
      console.error("Erro ao liberar chave no modo MOCK:", error);
      throw error;
    }
  }

  static async confirmarReceberChave(idCorrida: number): Promise<void> {
    try {
      await axiosConnect.patch(`/corrida/emprestar-chave/${idCorrida}`);
    } catch (error) {
      console.error("Erro ao emprestar chave", error);
      throw error;
    }
  }

  static async cancelarCorrida(idCorrida: number): Promise<void> {
    try {
      await axiosConnect.patch(`/corrida/cancelar/${idCorrida}`);
    } catch (error) {
      console.error("Erro ao cancelar corrida", error);
      throw error;
    }
  }
}
