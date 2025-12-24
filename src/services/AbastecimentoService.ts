// /src/services/AbastecimentoService.ts
import axiosConnect from "./axios/axiosConnect";

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
  idCarro: number;
}

export interface Abastecimento {
  idAbastecimento?: number;
  quantidade: number;
  codigoPagamento: string;
  valorTotal: number;
  dataAbastecimento: Date; //MUDEI AQUI, TAVA string antes
  valorUnitario?: number;
  justificativaAlteracao?: string;
  idTipoCombustivel?: number;
  nomeTipoCombustivel?: string;
  ativo?: boolean;

  // Relacionamentos
  tipoCombustivel: TipoCombustivel;
  corrida: Corrida;
}

// Interface para o corpo da requisição de cadastro/atualização
export interface AbastecimentoRequest {
  quantidade: number;
  codigoPagamento: string;
  valorTotal: number;
  dataAbastecimento: Date; //MUDEI AQUI, TAVA string antes
  valorUnitario?: number;
  justificativaAlteracao?: string;
  idTipoCombustivel: number;
  idCorrida: number;
}

export interface AbastecimentoUpdate {
  idAbastecimento: number;
  quantidade: number;
  valorTotal: number;
  valorUnitario: number;
  idTipoCombustivel?: number;
}

export class AbastecimentoService {
  async ConsumoPorCampus(): Promise<{ campus: string; litrosTotal: number }[]> {
    try {
      const response = await axiosConnect.get("abastecimento/consumoPorCampus/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar consumo por campus:", error);
      throw error;
    }
  }

  async buscarTodosAbastecimentos(params?: {
    tipoCombustivel?: string;
    corrida?: string;
    expand?: boolean;
  }): Promise<Abastecimento[]> {
    try {
      const response = await axiosConnect.get(`/abastecimento`, { params });

      const abastecimentosAtivos = response.data.filter((abastecimento: { ativo: boolean; }) => abastecimento.ativo === true )
      return abastecimentosAtivos;
    } catch (error) {
      throw error;
    }
  }

  async buscarAbastecimentoPorId(
    id: number,
    expand = true
  ): Promise<Abastecimento> {
    try {
      const response = await axiosConnect.get(`/abastecimento/${id}`, {
        params: expand ? { expand: true } : {},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async buscarPorCorrida(idCorrida: number): Promise<Abastecimento[]> {
    try {
      const response = await axiosConnect.get<Abastecimento[]>(
        `/abastecimento/buscar-por-corrida/${idCorrida}`
      );

      const abastecimentosAtivos = response.data.filter(abastecimento => abastecimento.ativo === true )

      return abastecimentosAtivos;
    } catch (error) {
      throw error;
    }
  }

  async cadastrarAbastecimento(data: {
    idCorrida: number;
    quantidade: number;
    codigoPagamento: string;
    valorTotal: number;
    dataAbastecimento: Date;
    valorUnitario?: number;
    justificativaAlteracao?: string;
    tipoCombustivel: number;
  }): Promise<Abastecimento> {
    try {
      const payload: AbastecimentoRequest = {
        idCorrida: data.idCorrida,
        quantidade: data.quantidade,
        codigoPagamento: data.codigoPagamento,
        valorTotal: data.valorTotal,
        dataAbastecimento: data.dataAbastecimento,
        valorUnitario: data.valorUnitario,
        justificativaAlteracao: data.justificativaAlteracao,
        idTipoCombustivel: data.tipoCombustivel,
      };

      console.log("Payload de cadastro de abastecimento:", payload);

      const response = await axiosConnect.post(`/abastecimento`, payload);
      return response.data as Abastecimento;
    } catch (error: unknown) {
      console.error("Erro ao cadastrar abastecimento:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao cadastrar abastecimento");
    }
  }

  async atualizarAbastecimento(
    id: number,
    abastecimento: Partial<AbastecimentoRequest>
  ): Promise<void> {
    try {
      await axiosConnect.put(`/abastecimento/${id}`, abastecimento);
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
        `/abastecimento/edicao-abastecimento/${idAbastecimento}`,
        dados
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar abastecimento: ", error);
      throw error;
    }
  }

  async excluirAbastecimento(idAbastecimento: number): Promise<any> {
    try {
      await axiosConnect.patch(`/abastecimento/deletar-abastecimento/${idAbastecimento}`);
      console.log(`abastecimento ${idAbastecimento} marcado como deletado`);
    } catch (error) {
      console.error(`Erro ao deletar abastecimento ${idAbastecimento}:`, error);
      throw error;
    }
  }

  async buscarGastosPorCampus(): Promise<GastoPorCampus[]> {
    try {
      const response = await axiosConnect.get(`/abastecimento/gastos-por-campus`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Criando uma única instância e exportando-a
const abastecimentoService = new AbastecimentoService();
export default abastecimentoService;
