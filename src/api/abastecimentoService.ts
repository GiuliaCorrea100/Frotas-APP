import api from "../config/axiosConfig";

export interface Abastecimento {
  idAbastecimento?: number;
  litros: number;
  codPagamento: number;
  precoFinal: number;
  dataAbastecimento: string;
  valorUnitarioLitro: number;
  valorMedioLitro: number;
  valorUnitario: number;
  valorMedio: number;
  justificativaAlteracao?: string;
}

export class AbastecimentoService {
  private readonly API = "/abastecimento";

  async BuscarTodosAbastecimentos(params?: {
    tipoCombustivel?: string;
  }): Promise<Abastecimento[]> {
    try {
      const response = await api.get(this.API, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async BuscarAbastecimentoPorId(id: number): Promise<Abastecimento> {
    try {
      const response = await api.get(`${this.API}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async cadastrarAbastecimento(
    abastecimento: Abastecimento
  ): Promise<Abastecimento> {
    try {
      const response = await api.post(this.API, abastecimento);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async AtualizarAbastecimento(
    id: number,
    abastecimento: Abastecimento
  ): Promise<void> {
    try {
      await api.put(`${this.API}/${id}`, abastecimento);
    } catch (error) {
      throw error;
    }
  }

  async DeletarAbastecimento(id: number): Promise<void> {
    try {
      await api.delete(`${this.API}/${id}`);
    } catch (error) {
      throw error;
    }
  }
}

export default new AbastecimentoService();
