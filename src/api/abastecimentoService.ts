import api from "../config/axiosConfig";

// Tipagem padronizada com camelCase
export interface TipoCombustivel {
  idTipoCombustivel?: number;
  nome: string;
}

export interface Corrida {
  idCorrida?: number;
  dataInicio: string | Date;
  dataTermino: string | Date | null;
  distanciaKm?: string | null;
  idMotorista: number;
  situacao: string; // "PENDENTE", "CONCLUIDA"
  chaveEmprestada: boolean;
  idCarros: number;
}

export interface Abastecimento {
  idAbastecimento?: number;
  litros: number;
  codPagamento: number;
  precoFinal: number;
  dataAbastecimento: string;
  valorUnitarioLitro?: number;
  valorMedioLitro?: number;
  valorUnitario?: number;
  valorMedio?: number;
  justificativaAlteracao?: string;

  // Relacionamentos
  tipoCombustivel: TipoCombustivel;
  corrida: Corrida;
}

// Interface para o corpo da requisição de cadastro/atualização
export interface AbastecimentoRequest {
  litros: number;
  codPagamento: number;
  precoFinal: number;
  dataAbastecimento: string;
  valorUnitarioLitro?: number;
  valorMedioLitro?: number;
  valorUnitario?: number;
  valorMedio?: number;
  justificativaAlteracao?: string;
  tipoCombustivel: number;
  idCorrida: number;
}

export class AbastecimentoService {
  private readonly API = "/abastecimento";

  async buscarTodosAbastecimentos(params?: {
    tipoCombustivel?: string;
    corrida?: string;
    expand?: boolean;
  }): Promise<Abastecimento[]> {
    try {
      const response = await api.get(this.API, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async buscarAbastecimentoPorId(
    id: number,
    expand = true
  ): Promise<Abastecimento> {
    try {
      const response = await api.get(`${this.API}/${id}`, {
        params: expand ? { expand: true } : {},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async buscarPorCorrida(idCorrida: number): Promise<Abastecimento[]> {
    try {
      const response = await api.get<Abastecimento[]>(
        `${this.API}/buscar-por-corrida/${idCorrida}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async cadastrarAbastecimento(
    abastecimento: AbastecimentoRequest
  ): Promise<Abastecimento> {
    try {
      const response = await api.post(this.API, abastecimento);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async atualizarAbastecimento(
    id: number,
    abastecimento: Partial<AbastecimentoRequest>
  ): Promise<void> {
    try {
      await api.put(`${this.API}/${id}`, abastecimento);
    } catch (error) {
      throw error;
    }
  }

  async deletarAbastecimento(id: number): Promise<void> {
    try {
      await api.delete(`${this.API}/${id}`);
    } catch (error) {
      throw error;
    }
  }
}

// Criando uma única instância e exportando-a
const abastecimentoService = new AbastecimentoService();
export default abastecimentoService;
