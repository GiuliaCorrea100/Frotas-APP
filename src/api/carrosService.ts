import api from "../config/axiosConfig";

// Definição do tipo de dados do carro (DTO)
export interface CarrosDto {
  idCarros?: number;
  tombo: number;
  qrCode: string;
  placa: string;
  odometro: string;
  modelo: string;
  ano: number;

  //adicionei as colunas
  localidade_fisica: string;
  situacao?: string;
  ativo: boolean; // Adicionando campo ativo
  tipo_combustivel: number | TipoCombustivel; // Pode ser um número, um objeto TipoCombustivel ou null
  nomeTipoCombustivel?: string;
}
export interface TipoCombustivel {
  id_tipo_combustivel?: number;
  nome: string;
}

// Parâmetros de busca (filtros opcionais)
export interface ParametrosBusca {
  modelo: string;
  ano: number;
}

// Serviço para lidar com requisições relacionadas a carros
export class CarrosService {
  // Buscar todos os carros com filtros opcionais
  static async buscarTodos(
    params?: Partial<ParametrosBusca>
  ): Promise<CarrosDto[]> {
    const resposta = await api.get<CarrosDto[]>(`/carros`, { params });

    return resposta.data;
  }
  // Buscar um carro por ID
  static async buscarPorId(idCarros: number): Promise<CarrosDto> {
    const resposta = await api.get<CarrosDto>(`/carros/${idCarros}`);
    return resposta.data;
  }

  // Criar um novo carro
  static async criar(carro: CarrosDto): Promise<CarrosDto> {
    const carroCompleto = {
      ...carro,
      situacao: carro.situacao || "DISPONIVEL", // Se não vier, usa DISPONIVEL
    };
    const resposta = await api.post<CarrosDto>(`/carros`, carroCompleto);
    return resposta.data;
  }

  // Atualizar um carro existente
  static async atualizar(id: number, carro: CarrosDto): Promise<CarrosDto> {
    const resposta = await api.put<CarrosDto>(`/carros/${id}`, carro);
    return resposta.data;
  }
  // Inativar um carro (define ativo = false)
  static async inativar(idCarros: number): Promise<CarrosDto> {
    const resposta = await api.patch<CarrosDto>(`/carros/${idCarros}/inativar`);
    return resposta.data;
  }

  static async deletar(idCarros: number): Promise<void> {
    await api.delete(`/carros/${idCarros}`);
  }
}
