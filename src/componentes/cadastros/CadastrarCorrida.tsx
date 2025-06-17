import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography
} from "@mui/material";
import { createCorrida } from '../../api/corridaService';
import Menu from "../Menu";

interface CarroInfo {
  placa: string;
  odometro: string;
  modelo: string;
  ano: number;
  tombo: string;
}

interface LocationState {
  carroInfo: CarroInfo;
}

interface MotoristaOption {
  idPessoa: number;
  nome: string;
}

export default function CadastrarCorrida() {
  const navigate = useNavigate();
  const location = useLocation();
  const { carroInfo } = location.state as LocationState;

  const [corrida, setCorrida] = useState({
    dataInicio: '',
    dataTermino: '',
    odometroInicio: carroInfo.odometro || '',
    motoristaId: null as number | null,
    motoristaNome: ''
  });

  const [motoristaOptions, setMotoristaOptions] = useState<MotoristaOption[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorrida(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const buscarMotoristas = async (nome: string) => {
    console.log("função");
    if (nome.length < 3) {
      setMotoristaOptions([]);
      return;
    }

    try {
  const response = await axios.get(`http://localhost:3000/usersingu/buscarPorNome/${nome}`);
      setMotoristaOptions(response.data);
    } catch (error) {
      setMotoristaOptions([]);
    }
  };

  const handleSubmit = async () => {
    if (!corrida.motoristaId) {
      alert('Selecione um motorista válido');
      return;
    }

    try {
      const corridaParaEnviar = {
        ...corrida,
        itinerario: '',
        tombo_carro: carroInfo.tombo,
        dataInicio: new Date(corrida.dataInicio),
        dataTermino: corrida.dataTermino ? new Date(corrida.dataTermino) : null,
        odometroInicio: corrida.odometroInicio,
        distanciaKm: "0",
        numeroIdMotorista: corrida.motoristaId
      };

      await createCorrida(corridaParaEnviar);
      navigate('/ListaCorrida');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao cadastrar corrida');
    }
  };

  return (
    <>
      <Menu />
      <Box sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
        <h1>Cadastrar Nova Corrida</h1>

        <Box sx={{ mb: 3, border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
          <Typography variant="h6">Informações do Carro</Typography>
          <p><strong>Tombo:</strong> {carroInfo.tombo}</p>
          <p><strong>Placa:</strong> {carroInfo.placa}</p>
          <p><strong>Odômetro Atual:</strong> {carroInfo.odometro}</p>
          <p><strong>Modelo:</strong> {carroInfo.modelo}</p>
          <p><strong>Ano:</strong> {carroInfo.ano}</p>
        </Box>

        <Autocomplete
          options={motoristaOptions}
          getOptionLabel={(option) => `${option.nome}`}
          onInputChange={(_, value) => buscarMotoristas(value)}
          onChange={(_, value) => {
            setCorrida(prev => ({
              ...prev,
              motoristaId: value?.idPessoa || null,
              motoristaNome: value?.nome || ''
            }));
          }}
          isOptionEqualToValue={(option, value) => option.idPessoa === value.idPessoa}
          noOptionsText="Digite pelo menos 3 caracteres para buscar"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Motorista"
              required
              sx={{ mb: 2 }}
            />
          )}
        />

        <TextField
          name="dataInicio"
          label="Data/Hora Início"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={corrida.dataInicio}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          name="dataTermino"
          label="Data/Hora Término"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={corrida.dataTermino}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          size="large"
          sx={{ mt: 2 }}
        >
          Cadastrar Corrida
        </Button>
      </Box>
    </>
  );
}
