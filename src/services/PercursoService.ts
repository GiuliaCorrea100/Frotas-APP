import axiosConnect from "./axios/axiosConnect";

export interface PercursoBackend {
  idPercurso?: number;
  idCorrida: number;
  localDestino: string;
  saidaOdometro: number;
  saidaHora?: Date;
  chegadaHora?: Date | null;
  chegadaOdometro?: number;
  localOrigem?: string;
  ativo?: boolean;
  idMotorista?: number;
}

export interface PercursoDto {
  idPercurso?: number;
  saidaHora?: Date | null;
  saidaOdometro: number;
  localDestino: string;
  chegadaHora?: Date | null | undefined;
  chegadaOdometro?: number;
  localOrigem?: string;
  ativo?: boolean;
  idMotorista?: number;
  nomeMotorista?: string;
}

export const iniciarPercurso = async (
  idCorrida: number,
  data: {
    localDestino: string;
    odometro_inicial: number;
    localOrigem?: string;
  },
) => {
  try {
    const payload = {
      idCorrida: idCorrida,
      saidaOdometro: data.odometro_inicial,
      localDestino: data.localDestino,
      localOrigem: data.localOrigem || null,
    };

    const response = await axiosConnect.post(`/percurso`, payload);
    return response.data as PercursoBackend;
  } catch (error: unknown) {
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
  },
) => {
  try {
    const response = await axiosConnect.put(
      `/percurso/${idPercurso}/finalizar`,
      {
        chegadaOdometro: data.chegadaOdometro,
      },
    );
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao finalizar percurso");
  }
};

export const buscarUltimoPercursoFinalizado = async (
  idCorrida: number,
): Promise<PercursoBackend | null> => {
  try {
    const response = await axiosConnect.get(
      `percurso/corrida/${idCorrida}/ultimo-finalizado`,
    );
    return response.data as PercursoBackend;
  } catch (error) {
    console.error("Erro ao buscar último percurso finalizado:", error);
    throw error;
  }
};

export const buscarPercursoAtivo = async (
  idCorrida: number,
): Promise<PercursoBackend | null> => {
  try {
    const response = await axiosConnect.get(
      `percurso/corrida/${idCorrida}/ativo`,
    );
    return response.data as PercursoBackend;
  } catch (error) {
    console.error("Erro ao buscar percurso ativo:", error);
    throw error;
  }
};

export const buscarPercursosDaCorrida = async (
  idCorrida: number,
): Promise<PercursoBackend[]> => {
  try {
    const response = await axiosConnect.get(`percurso/corrida/${idCorrida}`);

    // Ordena os percursos por ID em ordem crescente
    const percursosOrdenados = (response.data as PercursoBackend[]).sort(
      (a, b) => (a.idPercurso ?? 0) - (b.idPercurso ?? 0),
    );

    const percursosAtivos = percursosOrdenados.filter(
      (percurso) => percurso.ativo === true,
    );

    return percursosAtivos;
  } catch (error) {
    console.error("Erro ao buscar percursos da corrida:", error);
    return [];
  }
};

export const atualizarPercurso = async (
  idPercurso: number,
  data: {
    localDestino: string;
    chegadaOdometro: number;
    localOrigem?: string;
    saidaOdometro: number;
    saidaHora: Date | null;
    chegadaHora: Date | null;
    idMotorista?: number;
  },
): Promise<any> => {
  try {
    const payload = {
      saidaOdometro: data.saidaOdometro,
      chegadaOdometro: data.chegadaOdometro,
      localDestino: data.localDestino,
      localOrigem: data.localOrigem,
      saidaHora: data.saidaHora,
      chegadaHora: data.chegadaHora,
      idMotorista: data.idMotorista,
    };

    const response = await axiosConnect.patch(
      `/percurso/${idPercurso}/atualizar-percurso`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar percurso: ", error);
    throw error;
  }
};

export const removerPercurso = async (idPercurso: number): Promise<any> => {
  try {
    await axiosConnect.patch(`/percurso/deletar-percurso/${idPercurso}`);
  } catch (error) {
    console.error(`Erro ao deletar percurso ${idPercurso}:`, error);
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
    idMotorista?: number;
  },
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
      idMotorista: data.idMotorista,
    };

    const response = await axiosConnect.post(
      `/percurso/percurso-completo/${idCorrida}`,
      payload,
    );
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao cadastrar percurso");
  }
};
