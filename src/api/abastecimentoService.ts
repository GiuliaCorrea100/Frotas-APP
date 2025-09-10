import api from "../config/axiosConfig";
import axiosConnect from "../services/axiosConnect";

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

export interface AbastecimentoUpdate {
  idAbastecimento: number;
  litros: number;
  precoFinal: number;
  valorUnitario: number;
  idTipoCombustivel?: number;
}

export class AbastecimentoService {
  async buscarTodosAbastecimentos(params?: {
    tipoCombustivel?: string;
    corrida?: string;
    expand?: boolean;
  }): Promise<Abastecimento[]> {
    try {
      const response = await api.get(`/abastecimento`, { params });
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
      const response = await api.get(`/abastecimento/${id}`, {
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
        `/abastecimento/buscar-por-corrida/${idCorrida}`
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
      const response = await api.post(`/abastecimento`, abastecimento);
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
      await api.put(`/abastecimento/${id}`, abastecimento);
    } catch (error) {
      throw error;
    }
  }

  async atualizarAbastecimentoPatch(
    idAbastecimento: number,
    dados: Partial<Abastecimento>
  ): Promise<any> {
    try {
      const response = await axiosConnect.patch(
        `/abastecimento/${idAbastecimento}/abastecimento`,
        dados
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar abastecimento: ", error);
      throw error;
    }
  }

  async deletarAbastecimento(id: number): Promise<void> {
    try {
      await api.delete(`/abastecimento/${id}`);
    } catch (error) {
      throw error;
    }
  }
}

// Criando uma única instância e exportando-a
const abastecimentoService = new AbastecimentoService();
export default abastecimentoService;
