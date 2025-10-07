import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../config/axiosConfig';
import { Button, Box, TextField, Typography, Modal, Autocomplete, Dialog, DialogTitle, DialogActions } from "@mui/material";
import axios, { AxiosError } from 'axios';
import { createCorrida } from '../../../../api/corridaService';

interface MotoristaOption {
  idUsuario: number;
  nome: string;
}

interface CadastrarCorridaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const CadastrarCorrida: React.FC<CadastrarCorridaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
})=> {
  const [modeloPlaca, setModeloPlaca] = useState<string>('');
  const [carro, setCarro] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
  const [carrosOptions, setCarrosOptions] = useState<any[]>([]);
  const [errors, setErrors] = useState({
    carro: false,
    dataInicio: false,
    dataTermino: false,
    motorista: false,
    local_de_saida: false
  });
  
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const navigate = useNavigate();

  const buscarCarro = async (modeloPlaca: string) => {

    if (modeloPlaca.length < 3) {
      setCarrosOptions([]);
      return;
    }
    try {
      const response = await api.get(`/carros/buscar-modelo-placa/${modeloPlaca}`);
      setCarrosOptions(response.data);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setError('Veículo não encontrado.');
      } else {
        setError('Erro ao buscar informações do veículo');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

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
      carro: false,
      dataInicio: false,
      dataTermino: false,
      motorista: false,
      local_de_saida: false
    };

    if (!carro) {
      newErrors.carro = true;
      hasError = true;
    }

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
        idCarros: carro.idCarros,
      };

      await atualizarSituacaoCarro(carro.idCarros, "RESERVADO");
      
      await createCorrida(corridaParaEnviar);
      
      setTimeout(() => {
          navigate('/ListaCorrida');
      }, 1500);

      onSuccess('Corrida cadastrada com sucesso!');
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          if (error.response.data.message.includes('carro')) {
            showAlert("Este carro já está agendado para outra corrida nesse período.");
          } else {
            showAlert("Usuário já tem corrida agendada para essa data.");
          }
        } else {
          const errorMessage = error.response.data?.message || 'Erro ao cadastrar a corrida.';
          showAlert(errorMessage);
        }
      } else {
        console.error('Erro ao cadastrar a corrida:', error);
        onError(error);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 4,
            borderRadius: 2,
            backgroundColor: 'white',
            width: { xs: '90%', sm: '500px' },
            maxWidth: '500px', 
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: 24,
          }}>
          <Typography variant="h6" mb={2} gutterBottom>
            AGENDAR CORRIDA
          </Typography>

          {error && <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>}
            <Autocomplete
              options={carrosOptions}
              getOptionLabel={(option) => {
                if (option.modelo && option.placa) {
                  return `${option.modelo} Placa: ${option.placa}`;
                }
                return option.modelo || option.placa || ''; 
              }}
              onInputChange={(_, value) => buscarCarro(value)}
              onChange={(_, newValue) => {
                setCarro(newValue); 
                setErrors(prev => ({ ...prev, carro: false }));
              }}
              isOptionEqualToValue={(option, value) => option.idCarros === value.idCarros} 
              noOptionsText="Digite pelo menos 3 caracteres para buscar"
              sx={{ 
                width: '100%',
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Veículo"
                  required
                  sx={{ mb: 2 }}
                  error={errors.carro}
                  helperText={errors.carro ? "Selecione um veículo" : ""}
                />
              )}
            />

              <TextField
                name="local_de_saida"
                label="Local de Saída"
                value={corrida.local_de_saida}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setCorrida(prev => ({
                    ...prev,
                    local_de_saida: value
                  }));
                  setErrors(prev => ({ ...prev, local_de_saida: false }));
                }}
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

            <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
              <DialogTitle>{alertMessage}</DialogTitle>
              <DialogActions>
                <Button onClick={() => setAlertOpen(false)}>OK</Button>
              </DialogActions>
            </Dialog>
        </Box>
    </Modal>
  );
};

export default CadastrarCorrida;