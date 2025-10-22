import axiosConnect from "../services/axiosConnect";

export interface TipoCombustivel {
  idTipoCombustivel?: number;
  nome: string;
}

export const TipoCombustivelService = {
  // Listar todos
  listar: (): Promise<{ data: TipoCombustivel[] }> =>
    axiosConnect.get("/tipo-combustivel"),

  buscarPorId: (id: number): Promise<{ data: TipoCombustivel }> =>
    axiosConnect.get(`/tipo-combustivel/${id}`),

  // Criar novo
  criar: (dados: TipoCombustivel): Promise<{ data: TipoCombustivel }> =>
    axiosConnect.post("/tipo-combustivel", dados),

  // Atualizar existente
  atualizar: (
    id: number,
    dados: TipoCombustivel
  ): Promise<{ data: TipoCombustivel }> =>
    axiosConnect.put(`/tipo-combustivel/${id}`, dados),

  // Deletar por ID
  deletar: (id: number): Promise<{ data: any }> =>
    axiosConnect.delete(`/tipo-combustivel/${id}`),
};
