import api from "../config/axiosConfig";

export interface TipoCombustivel {
  id_tipo_combustivel?: number;
  nome: string;
}

export const TipoCombustivelService = {
  // Listar todos
  listar: (): Promise<{ data: TipoCombustivel[] }> =>
    api.get("/tipo-combustivel"),

  // Buscar por ID
  buscarPorId: (id: number): Promise<{ data: TipoCombustivel }> =>
    api.get(`/tipo-combustivel/${id}`),

  // Criar novo
  criar: (dados: TipoCombustivel): Promise<{ data: TipoCombustivel }> =>
    api.post("/tipo-combustivel", dados),

  // Atualizar existente
  atualizar: (
    id: number,
    dados: TipoCombustivel
  ): Promise<{ data: TipoCombustivel }> =>
    api.put(`/tipo-combustivel/${id}`, dados),

  // Deletar por ID
  deletar: (id: number): Promise<{ data: any }> =>
    api.delete(`/tipo-combustivel/${id}`),
};
