import React, { useState, useEffect } from 'react';
import { 
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import axiosConnect from "../../../../services/axiosConnect";

interface CorridaDto {
  idCorrida?: number;
  dataInicio: Date;
  dataTermino: Date;
  distanciaKm?: string;
  idMotorista: number;
  chaveEmprestada: boolean;
  idCarro: number;
  nomeMotorista?: string;
  placaVeiculo?: string;
  situacao?: string;
}

interface EditarInfoCorridaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  corrida: CorridaDto | null;
}

interface Usuario {
  idUsuario: number;
  idPessoaSigaa: number;
  nome: string;
  cpf: string;
}

interface Veiculo {
  idCarro: number;
  modelo: string;
  placa: string;
}

export default function EditarInfoCorrida({
  open,
  onClose,
  onSuccess,
  corrida,
}: EditarInfoCorridaProps) {
  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: ''
  });
  const [selectedMotorista, setSelectedMotorista] = useState<Usuario | null>(null);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState<Usuario[]>([]);
  const [carrosDisponiveis, setCarrosDisponiveis] = useState<Veiculo[]>([]);
  const [loadingMotorista, setLoadingMotorista] = useState(false);
  const [loadingVeiculo, setLoadingVeiculo] = useState(false);
  const [authMode, setAuthMode] = useState<string>('SIGAA');


  useEffect(() => {
    const fetchAuthMode = async () => {
      try {
        const response = await axiosConnect.get('/auth/mode');
        setAuthMode(response.data.mode);
      } catch (error) {
        console.error('Erro ao buscar modo de autenticação:', error);
        setAuthMode('SIGAA'); // Fallback para SIGAA
      }
    };
    fetchAuthMode();
  }, []);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      if (!open || !corrida) return;

      try {
        // Buscar dados do motorista atual
        if (corrida.idMotorista) {
          setLoadingMotorista(true);
          if (authMode === 'TEST') {
            // No modo TEST, buscar na lista estática
            const motoristasTeste: Usuario[] = [
              {
                idUsuario: 1,
                idPessoaSigaa: 999998,
                nome: 'ADMINISTRADOR FROTAS',
                cpf: '11111111111',
              },
              {
                idUsuario: 2,
                idPessoaSigaa: 999999,
                nome: 'MOTORISTA FROTAS',
                cpf: '22222222222',
              },
            ];
            const motorista = motoristasTeste.find(m => m.idUsuario === corrida.idMotorista);
            if (motorista) {
              setSelectedMotorista(motorista);
            } else {
              setError('Motorista não encontrado na lista de teste.');
            }
          } else {
            // No modo SIGAA, buscar no endpoint
            const response = await axiosConnect.get(`/usuario/buscar-usuario/${corrida.idMotorista}`);
            if (response.data) {
              setSelectedMotorista(response.data);
            }
          }
        }

        // Buscar dados do veículo atual
        if (corrida.idCarro) {
          setLoadingVeiculo(true);
          const response = await axiosConnect.get(`/carros/${corrida.idCarro}`);
          if (response.data) {
            setSelectedVeiculo(response.data);
          }
        }

        // Configurar datas
        setFormData({
          dataInicio: corrida.dataInicio ? new Date(corrida.dataInicio).toISOString().split('T')[0] : '',
          dataFim: corrida.dataTermino ? new Date(corrida.dataTermino).toISOString().split('T')[0] : ''
        });

      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoadingMotorista(false);
        setLoadingVeiculo(false);
      }
    };

    carregarDadosIniciais();
  }, [open, corrida]);

  const buscarUsuario = async (nome: string) => {
    if (nome.length < 3) {
      setMotoristasDisponiveis([]);
      return;
    }

    try {
      setLoadingMotorista(true);
      if (authMode === 'TEST') {
        // Lista estática de motoristas no modo TEST
        const motoristasTeste: Usuario[] = [
          {
            idUsuario: 1,
            idPessoaSigaa: 999998,
            nome: 'ADMINISTRADOR FROTAS',
            cpf: '11111111111',
          },
          {
            idUsuario: 2,
            idPessoaSigaa: 999999,
            nome: 'MOTORISTA FROTAS',
            cpf: '22222222222',
          },
        ];
        const filteredMotoristas = motoristasTeste.filter(motorista =>
          motorista.nome.toLowerCase().includes(nome.toLowerCase())
        );
        setMotoristasDisponiveis(filteredMotoristas);
      } else {
        // Busca no endpoint /usuarioSigaa no modo SIGAA
        const response = await axiosConnect.get(`/usuarioSigaa?nome=${nome}`);
        const usuariosRetornados = response.data;
        const uniqueUsuariosMap = new Map<number, Usuario>();
        usuariosRetornados.forEach((user: any) => {
          uniqueUsuariosMap.set(user.idPessoaSigaa, user);
        });
        const usuariosUnicosEOrdenados = Array.from(uniqueUsuariosMap.values());
        setMotoristasDisponiveis(usuariosUnicosEOrdenados);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setMotoristasDisponiveis([]);
    } finally {
      setLoadingMotorista(false);
    }
  };

  const buscarVeiculo = async (modeloPlaca: string) => {
    if (modeloPlaca.length < 3) {
      setCarrosDisponiveis([]);
      return;
    }
    try {
      setLoadingVeiculo(true);
      const response = await axiosConnect.get(`/carros/buscar-modelo-placa/${modeloPlaca}`);
      setCarrosDisponiveis(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      setCarrosDisponiveis([]);
    } finally {
      setLoadingVeiculo(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!corrida?.idCorrida) return;

    if (!selectedMotorista || !selectedVeiculo || !formData.dataInicio) {
      setError('Por favor, preencha todos os campos obrigatórios: Motorista, Veículo e Data de Início.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let idUsuarioMotorista: number;
      if (authMode === 'TEST') {
        idUsuarioMotorista = selectedMotorista.idUsuario;
      } else {
        const response = await axiosConnect.get(`/usuario/consultaCadastro/${selectedMotorista.idPessoaSigaa}`, {
          params: {
            nome: selectedMotorista.nome
          }
        });
    
        idUsuarioMotorista = response.data.idUsuario;      
      }      

      const dadosAtualizados = {
        idMotorista: idUsuarioMotorista,
        idCarro: selectedVeiculo.idCarro,
        dataInicio: new Date(formData.dataInicio),
        dataTermino: formData.dataFim ? new Date(formData.dataFim) : corrida.dataTermino,
        chaveEmprestada: corrida.chaveEmprestada,
      };

      await axiosConnect.patch(`/corrida/salvar-edicao-adm/${corrida.idCorrida}`, dadosAtualizados);
      onSuccess('Corrida atualizada com sucesso!');
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Erro ao salvar edições.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        p: 4, 
        backgroundColor: 'white', 
        borderRadius: 2, 
        maxWidth: 500, 
        mx: 'auto', 
        mt: '10%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <Typography variant="h6" mb={2}>
          Editar Corrida
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Autocomplete Motorista */}
          <Autocomplete
            options={motoristasDisponiveis}
            value={selectedMotorista}
            getOptionLabel={(option) => {
              if (option.cpf) {
                return `${option.nome} (${option.cpf})`;
              }
              return option.nome || '';
            }}
            isOptionEqualToValue={(option, value) => option.idPessoaSigaa === value?.idPessoaSigaa}
            onInputChange={(_, value) => {
              buscarUsuario(value);
            }}
            onChange={(_, novoValor) => {
              setSelectedMotorista(novoValor);
            }}
            loading={loadingMotorista}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Motorista"
                required
                sx={{ mb: 2 }}
                placeholder={loadingMotorista ? "Carregando..." : "Digite para buscar"}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingMotorista && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Autocomplete Veículo */}
          <Autocomplete
            options={carrosDisponiveis}
            value={selectedVeiculo}
            getOptionLabel={(option) => `${option.modelo} Placa: ${option.placa}`}
            isOptionEqualToValue={(option, value) => option.idCarro === value?.idCarro}
            onInputChange={(_, value) => {
              buscarVeiculo(value);
            }}
            onChange={(_, novoValor) => {
              setSelectedVeiculo(novoValor);
            }}
            loading={loadingVeiculo}
            noOptionsText="Digite pelo menos 3 caracteres para buscar"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Veículo"
                required
                sx={{ mb: 2 }}
                placeholder={loadingVeiculo ? "Carregando..." : "Digite para buscar"}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingVeiculo && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            fullWidth
            label="Data Início"
            type="date"
            value={formData.dataInicio}
            onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
            required
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Data Fim"
            type="date"
            value={formData.dataFim}
            onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}