import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions
} from "@mui/material";
import { createCorrida } from '../../api/corridaService';
import Menu from "../Menu";

interface CarroInfo {
  idCarro: number;
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
  idUsuario: number;
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
  });

  const [motoristaOptions, setMotoristaOptions] = useState<MotoristaOption[]>([]);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorrida(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const buscarMotoristas = async (nome: string) => {
    if (nome.length < 3) {
      setMotoristaOptions([]);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/usuarios/buscar-por-nome/${nome}`);
      setMotoristaOptions(response.data);
    } catch (error) {
      setMotoristaOptions([]);
    }
  };

  const handleSubmit = async () => {
    if (!corrida.motoristaId) {
      showAlert('Selecione um motorista válido');
      return;
    }

    try {
      const corridaParaEnviar = {
        ...corrida,
        itinerario: '',
        dataInicio: new Date(corrida.dataInicio),
        dataTermino: corrida.dataTermino ? new Date(corrida.dataTermino) : null,
        odometroInicio: corrida.odometroInicio,
        distanciaKm: "0",
        idCarros: carroInfo.idCarro,
        idMotorista: corrida.motoristaId,
        situacao: 'AGENDADA',
      };

      await createCorrida(corridaParaEnviar);
      navigate('/ListaCorrida');

    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        showAlert('Já existe uma corrida agendada para esse usuário nesse dia!');
      } else {
        showAlert(error.message || 'Erro ao cadastrar corrida');
      }
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
              motoristaId: value?.idUsuario || null,
            }));
          }}
          isOptionEqualToValue={(option, value) => option.idUsuario === value.idUsuario}
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

      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <DialogTitle>{alertMessage}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}