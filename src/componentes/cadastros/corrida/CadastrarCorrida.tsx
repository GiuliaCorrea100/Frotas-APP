import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../config/axiosConfig';
import axios from "axios";
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
import { createCorrida } from '../../../api/corridaService';
import Menu from "../../Menu";

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
    local_de_saida: '',
    distanciaKm: '0',
    chaveEmprestada: false,
    situacao: 'AGENDADA',
    motoristaId: null as number | null,
  });

  const [motoristaOptions, setMotoristaOptions] = useState<MotoristaOption[]>([]);
  const [errors, setErrors] = useState({
    dataInicio: false,
    dataTermino: false,
    motorista: false,
    local_de_saida: false
  });

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
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const buscarMotoristas = async (nome: string) => {
    if (nome.length < 3) {
      setMotoristaOptions([]);
      return;
    }

    try {
      const response = await api.get(`/usuarios/buscar-por-nome/${nome}`);
      setMotoristaOptions(response.data);
    } catch (error) {
      console.error("Erro ao buscar motoristas:", error);
      setMotoristaOptions([]);
    }
  };

  const atualizarSituacaoCarro = async (idCarro: number, situacao: string) => {
    try {
      const carroAtual = await api.get(`/carros/${idCarro}`);
      
      const dadosAtualizados = {
        ...carroAtual.data,
        situacao: situacao
      };

      await api.put(`/carros/${idCarro}`, dadosAtualizados);
    } catch (error) {
      console.error("Erro ao atualizar situação do carro:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    let hasError = false;
    const newErrors = {
      dataInicio: false,
      dataTermino: false,
      motorista: false,
      local_de_saida: false
    };

    if (!corrida.motoristaId) {
      newErrors.motorista = true;
      hasError = true;
    }

    if (!corrida.dataInicio) {
      newErrors.dataInicio = true;
      hasError = true;
    }

    if (!corrida.dataTermino) {
      newErrors.dataTermino = true;
      hasError = true;
    }

    if (!corrida.local_de_saida) {
      newErrors.local_de_saida = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      showAlert('Preencha todos os campos obrigatórios: Local de Saida, Motorista, Data Início e Data Término');
      return;
    }

    if (new Date(corrida.dataTermino) < new Date(corrida.dataInicio)) {
      showAlert('A data de término não pode ser anterior à data de início');
      setErrors(prev => ({ ...prev, dataTermino: true }));
      return;
    }

    try {
      const corridaParaEnviar = {
        dataInicio: new Date(corrida.dataInicio),
        dataTermino: new Date(corrida.dataTermino),
        local_de_saida: corrida.local_de_saida,
        distanciaKm: "",
        idMotorista: corrida.motoristaId!,
        situacao: "AGENDADA",
        chaveEmprestada: false,
        idCarros: carroInfo.idCarro,
      };

      await atualizarSituacaoCarro(carroInfo.idCarro, "RESERVADO");
      await createCorrida(corridaParaEnviar);

      showAlert("Corrida cadastrada com sucesso!");
      setTimeout(() => navigate("/ListaCorrida"), 1500);

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          if (error.response.data?.message?.includes("carro")) {
            showAlert("Este carro já está agendado para outra corrida nesse período.");
          } else {
            showAlert("Usuário já tem corrida agendada para essa data.");
          }
        } else {
          const errorMessage = error.response?.data?.message || "Erro ao cadastrar a corrida.";
          showAlert(errorMessage);
        }
      } else {
        showAlert("Ocorreu um erro de comunicação. Tente novamente mais tarde.");
        console.error("Erro não relacionado à API:", error);
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

        <TextField
          name="local_de_saida"
          label="Local de Saída"
          value={corrida.local_de_saida}
          onChange={handleChange}
          fullWidth
          required
          error={errors.local_de_saida}
          helperText={errors.local_de_saida ? "Informe o local de saída" : ""}
          sx={{ mb: 2 }}
        />

        <Autocomplete
          options={motoristaOptions}
          getOptionLabel={(option) => `${option.nome}`}
          onInputChange={(_, value) => buscarMotoristas(value)}
          onChange={(_, value) => {
            setCorrida(prev => ({
              ...prev,
              motoristaId: value?.idUsuario || null,
            }));
            setErrors(prev => ({ ...prev, motorista: false }));
          }}
          isOptionEqualToValue={(option, value) => option.idUsuario === value.idUsuario}
          noOptionsText="Digite pelo menos 3 caracteres para buscar"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Motorista"
              required
              error={errors.motorista}
              helperText={errors.motorista ? "Selecione um motorista" : ""}
              sx={{ mb: 2 }}
            />
          )}
        />

        <TextField
          name="dataInicio"
          label="Data Início"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={corrida.dataInicio}
          onChange={handleChange}
          fullWidth
          required
          error={errors.dataInicio}
          helperText={errors.dataInicio ? "Informe a data de início" : ""}
          sx={{ mb: 2 }}
          inputProps={{
            min: new Date().toISOString().split('T')[0]
          }}
        />

        <TextField
          name="dataTermino"
          label="Data Término"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={corrida.dataTermino}
          onChange={handleChange}
          fullWidth
          required
          error={errors.dataTermino}
          helperText={errors.dataTermino ? "Informe a data de término" : ""}
          sx={{ mb: 2 }}
          inputProps={{
            min: corrida.dataInicio || new Date().toISOString().split('T')[0]
          }}
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