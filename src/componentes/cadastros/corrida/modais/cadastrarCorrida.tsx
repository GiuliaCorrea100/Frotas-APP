import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosConnect from "../../../../services/axiosConnect";
import { Button, Box, TextField, Typography, Modal, Autocomplete, Dialog, DialogTitle, DialogActions } from "@mui/material";
import axios, { AxiosError } from 'axios';
import { createCorrida } from '../../../../api/corridaService';
import { CarroService } from '../../../../api/CarroService';

interface MotoristaDTO {
  idUsuario: number;
  nome: string;
  cpf: string;
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
    localDeSaida: '',
    distanciaKm: '0',
    chaveEmprestada: false,
    situacao: 'AGENDADA',
    motoristaId: null as number | null,
  });
  
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState<MotoristaDTO[]>([]);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<any>(null);
  const [carrosDisponiveis, setCarrosDisponiveis] = useState<any[]>([]);
  const [errors, setErrors] = useState({
    carro: false,
    dataInicio: false,
    dataTermino: false,
    motorista: false,
    localDeSaida: false
  });
  
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [authMode, setAuthMode] = useState<string>('SIGAA');

  const navigate = useNavigate();

  // Buscar o modo de autenticação na inicialização
  useEffect(() => {
    const fetchAuthMode = async () => {
      try {
        const response = await axiosConnect.get('/auth/mode');
        setAuthMode(response.data.mode);
      } catch (error) {
        console.error('Erro ao buscar modo de autenticação:', error);
        setAuthMode('SIGAA');
      }
    };
    fetchAuthMode();
  }, []);

  const buscarCarro = async (modeloPlaca: string) => {

    if (modeloPlaca.length < 3) {
      setCarrosDisponiveis([]);
      return;
    }
    try {
      const response = await axiosConnect.get(`/carro/buscar-modelo-placa/${modeloPlaca}`);
      setCarrosDisponiveis(response.data);
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
      setMotoristasDisponiveis([]);
      return;
    }

     try {
      setLoading(true);
      
      if (authMode === 'MOCK') {
        // Lista estática de motoristas no modo TEST
        const motoristasTeste: MotoristaDTO[] = [
          {
            idUsuario: 1,
            nome: 'ADMINISTRADOR FROTAS',
            cpf: '11111111111',
          },
          {
            idUsuario: 2,
            nome: 'MOTORISTA FROTAS',
            cpf: '22222222222',
          },
        ];
        // Filtrar motoristas com base no nome digitado
        const filteredMotoristas = motoristasTeste.filter(motorista =>
          motorista.nome.toLowerCase().includes(nome.toLowerCase())
        );
        setMotoristasDisponiveis(filteredMotoristas);
      } else {
        // Busca no endpoint /usuarioSigaa no modo SIGAA
        const response = await axiosConnect.get(`/usuarioSigaa?nome=${nome}`);
        const usuariosRetornados = response.data;
        const uniqueUsuariosMap = new Map();
        usuariosRetornados.forEach((user: any) => {
          uniqueUsuariosMap.set(user.idPessoaSigaa, user);
        });
        const usuariosUnicosEOrdenados = Array.from(uniqueUsuariosMap.values());

        //console.log('Motoristas: ', usuariosUnicosEOrdenados);
        setMotoristasDisponiveis(usuariosUnicosEOrdenados);
      }

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setMotoristasDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {

    let hasError = false;
    const newErrors = {
      carro: false,
      dataInicio: false,
      dataTermino: false,
      motorista: false,
      localDeSaida: false
    };

    if (!carro) {
      newErrors.carro = true;
      hasError = true;
    }

    if (!motoristaSelecionado) {
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

    if (!corrida.localDeSaida) {
      newErrors.localDeSaida = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (new Date(corrida.dataTermino) < new Date(corrida.dataInicio)) {
      showAlert('A data de término não pode ser anterior à data de início');
      setErrors(prev => ({ ...prev, dataTermino: true }));
      return;
    }

    try {
      // No modo MOCK, usar diretamente o idUsuario do motorista selecionado
      let idUsuarioMotorista: number;
      if (authMode === 'MOCK') {
        idUsuarioMotorista = motoristaSelecionado.idUsuario;
      } else {
        // No modo SIGAA, consultar o endpoint /usuario/consultaCadastro
        const response = await axiosConnect.get(`/usuario/consultaCadastro/${motoristaSelecionado.idPessoaSigaa}`, {
          params: {
            nome: motoristaSelecionado.nome
          }
        });
        idUsuarioMotorista = response.data.idUsuario;
      }

      const corridaParaEnviar = {
        dataInicio: new Date(corrida.dataInicio),
        dataTermino: new Date(corrida.dataTermino),
        localDeSaida: corrida.localDeSaida,
        distanciaKm: "",
        idMotorista: idUsuarioMotorista,
        situacao: "AGENDADA",
        chaveEmprestada: false,
        idCarro: carro.idCarro,
      };

      await CarroService.atualizarSituacaoCarro(carro.idCarro, "RESERVADO");
      
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
              options={carrosDisponiveis}
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
              isOptionEqualToValue={(option, value) => option.idCarro === value.idCarro} 
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
                name="localDeSaida"
                label="Local de Saída"
                value={corrida.localDeSaida}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setCorrida(prev => ({
                    ...prev,
                    localDeSaida: value
                  }));
                  setErrors(prev => ({ ...prev, localDeSaida: false }));
                }}
                fullWidth
                required
                error={errors.localDeSaida}
                helperText={errors.localDeSaida ? "Informe o local de saída" : ""}
                sx={{ mb: 2 }}
              />

              <Autocomplete
                options={motoristasDisponiveis}
                getOptionLabel={(option) => {
                  if (option.nome && option.cpf) {
                    return `${option.nome} (${option.cpf})`;
                  }
                  return option.nome || ''; 
                }}
                onInputChange={(_, value) => buscarMotoristas(value)}
                onChange={(_, value) => {
                  setMotoristaSelecionado(value);
                  setCorrida(prev => ({
                    ...prev,
                    motoristaId: value?.idUsuario || null,
                  }));
                  setErrors(prev => ({ ...prev, motorista: false }));
                }}
                isOptionEqualToValue={(option, value) => option.cpf === value.cpf}
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