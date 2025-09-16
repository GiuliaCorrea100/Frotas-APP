import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axiosConfig';
import Menu from "../Menu";
import { AxiosError } from "axios";

interface CarroInfo {
  placa: string;
  odometro: string;
  modelo: string;
  ano: number;
}

const IniciarCorrida: React.FC = () => {
  const [tombo, setTombo] = useState<string>('');
  const [carro, setCarro] = useState<CarroInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarCarro = async () => {
    if (!tombo) {
      setError('Por favor, insira o tombo do carro');
      return;
    }

    setLoading(true);
    setError(null);
    setCarro(null);

    try {
      const response = await api.get(`/carros/por-tombo/${tombo}`);
      const carroEncontrado = response.data;
      
      setCarro({
        placa: carroEncontrado.placa,
        odometro: carroEncontrado.odometro,
        modelo: carroEncontrado.modelo,
        ano: carroEncontrado.ano
      });

    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setError('Carro não encontrado com este tombo');
      } else {
        setError('Erro ao buscar informações do carro');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleIniciarCorrida = () => {
    const now = new Date();
    const corridaInfo = {
      carro: {
        modelo: carro?.modelo || '',
        placa: carro?.placa || '',
        odometro: carro?.odometro || '',
        ano: carro?.ano
      },
      dataInicio: now.toISOString()
    };
    
    navigate('/NaCorrida', { state: { corridaInfo } });
  };

  return (
    <>
      <Menu />
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h1>Iniciar Corrida</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="tombo" style={{ display: 'block', marginBottom: '5px' }}>
            Número do Tombo:
          </label>
          <input
            id="tombo"
            type="number"
            value={tombo}
            onChange={(e) => setTombo(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Ex: 10676"
          />
          <button 
            onClick={buscarCarro}
            disabled={loading}
            style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? 'Buscando...' : 'Buscar Carro'}
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

        {carro && (
          <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <h3>Informações do Carro</h3>
            <p><strong>Placa:</strong> {carro.placa}</p>
            <p><strong>Odômetro:</strong> {carro.odometro}</p>
            <p><strong>Modelo:</strong> {carro.modelo}</p>
            <p><strong>Ano:</strong> {carro.ano}</p>
          </div>
        )}

        {carro && (
          <button
            onClick={handleIniciarCorrida}
            style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px' }}
          >
            Iniciar Corrida
          </button>
        )}
      </div>
    </>
  );
};

export default IniciarCorrida;
