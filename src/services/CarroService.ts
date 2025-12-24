import axiosConnect from "./axios/axiosConnect";

// Definição do tipo de dados do carro (DTO)
export interface CarroDto {
  idCarro?: number;
  tombo: number;
  qrCode: string;
  placa: string;
  odometro: string;
  modelo: string;
  ano: number;

  //adicionei as colunas
  localidadeFisica: string;
  situacao?: string;
  ativo: boolean; // Adicionando campo ativo
  idTipoCombustivel: number | TipoCombustivel; // Pode ser um número, um objeto TipoCombustivel ou null
  nomeTipoCombustivel?: string;
}
export interface TipoCombustivel {
  idTipoCombustivel?: number;
  nome: string;
}

// Parâmetros de busca (filtros opcionais)
export interface ParametrosBusca {
  modelo: string;
  ano: number;
}

// Serviço para lidar com requisições relacionadas a carros
export class CarroService {
  // Buscar todos os carros com filtros opcionais
  static async buscarTodos(
    params?: Partial<ParametrosBusca>
  ): Promise<CarroDto[]> {
    const resposta = await axiosConnect.get<CarroDto[]>(`/carro`, { params });

    return resposta.data;
  }
  // Buscar um carro por ID
  static async buscarPorId(idCarro: number): Promise<CarroDto> {
    const resposta = await axiosConnect.get<CarroDto>(`/carro/${idCarro}`);
    return resposta.data;
  }

  static async buscarPorPlaca(placa: string): Promise<any> {
    const resposta = await axiosConnect.get<CarroDto>(`/carro/buscar-placa/${placa}`);
    console.log(resposta);
    return resposta.data;
  }

  // Criar um novo carro
  static async criar(carro: CarroDto): Promise<CarroDto> {
    const carroCompleto = {
      ...carro,
      situacao: carro.situacao || "DISPONIVEL", // Se não vier, usa DISPONIVEL
    };
    const resposta = await axiosConnect.post<CarroDto>(`/carro`, carroCompleto);
    return resposta.data;
  }

  // Atualizar um carro existente
  static async atualizar(id: number, carro: CarroDto): Promise<CarroDto> {
    const resposta = await axiosConnect.put<CarroDto>(`/carro/${id}`, carro);
    return resposta.data;
  }

  static async atualizarSituacaoCarro(idCarro: number, situacao: string): Promise<void> {
    try {
      const response = await axiosConnect.patch(`/carro/${idCarro}/situacao`, { situacao });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar situação do carro:', error);
      throw error;
    }
  }

  static async atualizarOdometro(idCarro: number, odometro: number){
    try {
      const response = await axiosConnect.patch(`/carro/atualizar-odometro/${idCarro}`, { odometro });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar odometro do carro:', error);
      throw error;
    }
  }

  // Inativar um carro (define ativo = false)
  static async inativar(idCarro: number): Promise<CarroDto> {
    const resposta = await axiosConnect.patch<CarroDto>(`/carro/${idCarro}/inativar`);
    return resposta.data;
  }

  static async deletar(idCarro: number): Promise<void> {
    await axiosConnect.delete(`/carro/${idCarro}`);
  }
}
