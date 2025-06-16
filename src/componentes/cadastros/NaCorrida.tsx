import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Menu from "../Menu";

interface CarroInfo {
  modelo: string;
  placa: string;
  odometro?: string;
  ano?: number;
}

interface CorridaInfo {
  carro: CarroInfo;
  dataInicio: string;
}

const NaCorrida: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [corridaInfo, setCorridaInfo] = useState<CorridaInfo>(() => {
    // Verifica se os dados foram passados pelo estado de navegação
    if (location.state?.corridaInfo) {
      return location.state.corridaInfo;
    } else {
      // Valores padrão caso não tenha dados
      const now = new Date();
      return {
        carro: {
          modelo: 'Modelo não informado',
          placa: 'Placa não informada'
        },
        dataInicio: now.toISOString()
      };
    }
  });

  const [abastecimentos, setAbastecimentos] = useState<number>(0);

  const handleAbastecer = () => {
    setAbastecimentos(prev => prev + 1);
    alert(`Abastecimento registrado! Total: ${abastecimentos + 1}`);
  };

  const handleFinalizar = () => {
    const now = new Date();
    const corridaData = {
      ...corridaInfo,
      dataFim: now.toISOString(),
      abastecimentos
    };

    console.log('Dados da corrida:', corridaData);
    alert(`Corrida finalizada!\nVeículo: ${corridaInfo.carro.modelo} - ${corridaInfo.carro.placa}\nInício: ${new Date(corridaInfo.dataInicio).toLocaleString()}\nFim: ${now.toLocaleString()}\nAbastecimentos: ${abastecimentos}`);
    navigate('/IniciarCorrida');
  };

  return (
    <>
      <Menu />
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h1>Corrida em Andamento</h1>

        <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
          <h3>Informações da Corrida</h3>
          <p><strong>Veículo:</strong> {corridaInfo.carro.modelo} - {corridaInfo.carro.placa}</p>
          <p><strong>Início:</strong> {new Date(corridaInfo.dataInicio).toLocaleString()}</p>
          <p><strong>Abastecimentos:</strong> {abastecimentos}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button
            onClick={handleAbastecer}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            Abastecer
          </button>

          <button
            onClick={handleFinalizar}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            Finalizar
          </button>
        </div>
      </div>
    </>
  );
};

export default NaCorrida;
