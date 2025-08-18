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
  
  // Relacionamentos
  tipo_combustivel: TipoCombustivel; 
  corrida: Corrida;
}

export interface TipoCombustivel {
  id_tipo_combustivel?: number;
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

export class AbastecimentoService {
  private readonly API = "/abastecimento";

  async BuscarTodosAbastecimentos(params?: {
    tipoCombustivel?: string;
    corrida?: string;
    
    expand?: boolean; // <- parâmetro para dizer ao back-end que queremos as relações
  }): Promise<Abastecimento[]> {
    try {
      const response = await api.get(this.API, { params });
    //  console.log("AbastecimentoService - BuscarTodosAbastecimentos", response.data);

      return response.data;

    } catch (error) {
      throw error;
    }
  }

  async BuscarAbastecimentoPorId(
    id: number,
    expand = true // por padrão, já buscar com relação
  ): Promise<Abastecimento> {
    try {
      const response = await api.get(`${this.API}/${id}`, {
        params: expand ? { expand: true } : {}
      });
    //  console.log("AbastecimentoService - BuscarAbastecimentoPorId", response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async cadastrarAbastecimento(
    abastecimento: Omit<Abastecimento, "tipo_combustivel" | "corrida"> & {
      tipo_combustivel: number; // ao cadastrar, envia apenas ID
      corrida: number;
    }
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
    abastecimento: Partial<Abastecimento>
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
