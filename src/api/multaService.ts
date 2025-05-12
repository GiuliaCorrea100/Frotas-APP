import api from '../config/axiosConfig';

//É como um "formulário" dos dados que precisamos para cadastrar uma multa
interface DadosMultaFrontend {
  codigo: string;
  classificacao: string;
  valor: string;
  placa: string;
  horario: string;
  numeroAuto: string;
}

//Recebe os dados da multa - Envia para o backend - Retorna a resposta
export const cadastrarMulta = async (dados: DadosMultaFrontend) => {
  try {

    //Faz uma requisição POST para a rota /multas - Usa a configuração do axios (api)
    const response = await api.post('/multas', {
      codInfracao: dados.codigo,
      classInfracao: dados.classificacao,
      valor: dados.valor,
      placaVeiculo: dados.placa,
      data: new Date(dados.horario),
      numAutoInfracao: Number(dados.numeroAuto)
    });

    //Retorna o que o backend respondeu
    return response.data;

    //Tenta mostrar o erro específico do backend - Se não conseguir, mostra o erro geral
  } catch (error) {
    if (error instanceof Error && 'response' in error) {
      console.error('Erro ao cadastrar multa:', (error as any).response?.data);
    } else {
      console.error('Erro ao cadastrar multa:', error);
    }
    throw error;
  }
};