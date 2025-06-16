import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import Menu from "../Menu";
import { Button, Box, TextField, Typography } from "@mui/material";

interface CarroInfo {
  placa: string;
  odometro: string;
  modelo: string;
  ano: number;
  tombo: string;
}

const ColocarTombo: React.FC = () => {
  const [tombo, setTombo] = useState<string>('');
  const [carro, setCarro] = useState<CarroInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const buscarCarro = async () => {
    if (!tombo) {
      setError('Por favor, insira o tombo do carro');
      return;
    }

    setLoading(true);
    setError(null);
    setCarro(null);

    try {
      const response = await axios.get(`http://localhost:3000/carros/por-tombo/${tombo}`);
      const carroEncontrado = response.data;
      
      setCarro({
        placa: carroEncontrado.placa,
        odometro: carroEncontrado.odometro,
        modelo: carroEncontrado.modelo,
        ano: carroEncontrado.ano,
        tombo: tombo
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

  const handleCadastrarCorrida = () => {
    if (carro) {
      navigate('/CadastrarCorrida', { 
        state: { 
          carroInfo: carro 
        } 
      });
    }
  };

  return (
    <>
      <Menu />
      <Box sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
        <h1>Qual carro voce deseja cadastrar?</h1>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Número do Tombo"
            type="number"
            value={tombo}
            onChange={(e) => setTombo(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="Ex: 10676"
          />
          <Button 
            variant="contained" 
            onClick={buscarCarro}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Buscando...' : 'Buscar Carro'}
          </Button>
        </Box>

        {error && <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>}

        {carro && (
          <Box sx={{ mb: 3, border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
            <Typography variant="h6">Informações do Carro</Typography>
            <p><strong>Placa:</strong> {carro.placa}</p>
            <p><strong>Odômetro:</strong> {carro.odometro}</p>
            <p><strong>Modelo:</strong> {carro.modelo}</p>
            <p><strong>Ano:</strong> {carro.ano}</p>
            
            <Typography paragraph sx={{ mt: 2 }}>Cadastrar corrida nesse carro?</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCadastrarCorrida}
              fullWidth
              sx={{ mb: 2 }}
            >
              Cadastrar!
            </Button>
            
            <Button
              variant="contained"
              color="success"
              onClick={handleIniciarCorrida}
              fullWidth
            >
              Iniciar Corrida
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ColocarTombo;