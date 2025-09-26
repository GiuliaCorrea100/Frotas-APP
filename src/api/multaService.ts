import api from "../config/axiosConfig";

//É como um "formulário" dos dados que precisamos para cadastrar uma multa
export interface MultaDto {
  idMulta?: number;
  codigoInfracao: number;
  classificacao: string;
  valorInfracao: number;
  placaVeiculo: string;
  dataInfracao: Date;
  autoInfracao: number;
}

//Recebe os dados da multa - Envia para o backend - Retorna a resposta
export const cadastrarMulta = async (dados: {
  codigoInfracao: number;
  classificacao: string;
  valorInfracao: number;
  placaVeiculo: string;
  dataInfracao: Date | null;
  autoInfracao: number;
}) => {
  try {
    const response = await api.post("/multas", {
      codInfracao: dados.codigoInfracao,
      classInfracao: dados.classificacao,
      valorInfracao: dados.valorInfracao,
      placaVeiculo: dados.placaVeiculo,
      dataInfracao: dados.dataInfracao,
      numAutoInfracao: dados.autoInfracao,
    });

    //Retorna o que o backend respondeu
    return response.data;

    //Tenta mostrar o erro específico do backend - Se não conseguir, mostra o erro geral
  } catch (error) {
    if (error instanceof Error && "response" in error) {
      console.error("Erro ao cadastrar multa:", (error as any).response?.data);
    } else {
      console.error("Erro ao cadastrar multa:", error);
    }
    throw error;
  }
};

// Função para buscar todas as multas
export const listarMultas = async () => {
  try {
    const response = await api.get("/multas");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar multas:", error);
    throw error;
  }
};

//IMPLEMENTAR ISSO AQUI
export const atualizarMulta = async (idMulta: number, data: MultaDto) => {
  try {
    const response = await api.get("/multas");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar multas:", error);
    throw error;
  }
};
