import React, { useState, useEffect } from 'react';
import { 
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete, // Importe o componente Alert do Material-UI
} from '@mui/material';
import api from '../../../../config/axiosConfig';

interface CorridaDto {
  idCorrida?: number;
  dataInicio: Date;
  dataTermino: Date;
  distanciaKm?: string;
  idMotorista: number;
  chaveEmprestada: boolean;
  idCarros: number;
  nomeMotorista?: string;
  placaVeiculo?: string;
  situacao?: string;
}

interface EditarInfoCorridaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
  corrida: CorridaDto | null;
}

export default function EditarInfoCorrida({
  open,
  onClose,
  onSuccess,
  //onError,
  corrida,
}: EditarInfoCorridaProps) {
  const [motorista, setMotorista] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(''); // Estado para a mensagem de erro de validação
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<any[]>([]);
  const [loadingMotorista, setLoadingMotorista] = useState(false);
  const [selectedMotorista, setSelectedMotorista] = useState<any>(null);

  useEffect(() => {
    if (corrida) {
      setMotorista(corrida.nomeMotorista || '');
      setVeiculo(corrida.placaVeiculo || '');
      setDataInicio(corrida.dataInicio ? new Date(corrida.dataInicio).toISOString().slice(0, 16) : '');
      setDataFim(corrida.dataTermino ? new Date(corrida.dataTermino).toISOString().slice(0, 16) : '');
    }
  }, [corrida]);

  const buscarUsuario = async (nome: string) => {
      if (nome.length < 3) {
        setUsuariosDisponiveis([]);
        return;
      }
  
      try {
        setLoadingMotorista(true);
        const response = await api.get(`usersingu/buscar-nome/${nome}`);
        setUsuariosDisponiveis(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setUsuariosDisponiveis([]);
      } finally {
        setLoadingMotorista(false);
      }
  };

  const handleSelecionarUsuario = (usuario: any) => {
    if (!usuario) {
      setSelectedMotorista(null);
      return;
    }
    setSelectedMotorista(usuario);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!corrida) return;

    if (!motorista.trim() || !veiculo.trim() || !dataInicio.trim()) {
      setValidationError('Por favor, preencha todos os campos obrigatórios: Motorista, Veículo e Data de Início.');
      return; 
    }

    setValidationError(''); 

    setLoading(true);
    try {
      let idMotorista = corrida.idMotorista;
      let idCarros = corrida.idCarros;
      
      // Verifica alteração de motorista
      if (motorista !== (corrida.nomeMotorista || '')) {
        const resMotorista = await api.get(`/usuarios/buscar-por-nome/${motorista}`);
        idMotorista = resMotorista.data?.[0]?.idUsuario;
        if (!idMotorista) {
          throw new Error('Motorista não encontrado!');
        }
      }

      // Verifica alteração de placa
      if (veiculo !== (corrida.placaVeiculo || '')){
        const resVeiculo = await api.get(`/carros/buscar-placa/${veiculo}`);
        idCarros = resVeiculo.data?.[0]?.idCarros;
        if (!idCarros){
          throw new Error('Carro não encontrado!');
        }
      }

      const dadosAtualizados: CorridaDto = {
        idCorrida: corrida.idCorrida,
        idMotorista,
        idCarros,
        dataInicio: dataInicio ? new Date(dataInicio) : corrida.dataInicio,
        dataTermino: dataFim ? new Date(dataFim) : corrida.dataTermino,
        chaveEmprestada: corrida.chaveEmprestada,
      };

      await api.patch(`/corrida/salvar-edicao-adm/${corrida.idCorrida}`, dadosAtualizados);

      onSuccess('Edições salvas com sucesso!');
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar edições.';
      setValidationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: 2, maxWidth: 500, mx: 'auto', mt: '10%' }}>
        <Typography variant="h6" mb={2}>Editar Corrida</Typography>
        <form onSubmit={handleSubmit}>
          {validationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}


          <Autocomplete
            options={usuariosDisponiveis}
            getOptionLabel={(option) => option.nome || ''}
            isOptionEqualToValue={(option, value) => option.idPessoa === value.idPessoa}
            loading={loadingMotorista}
            onInputChange={(_, value) => {
              setMotorista(value);
              buscarUsuario(value);
            }}
            onChange={(_, value) => handleSelecionarUsuario(value)}
            filterOptions={(x) => x}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Buscar motorista"
                placeholder="Digite pelo menos 3 caracteres"
                value={motorista}
                sx={{ mb: 2 }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingMotorista ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}

          />



          {/* <TextField
            fullWidth
            label="Motorista"
            value={motorista}
            onChange={(e) => setMotorista(e.target.value)}
            sx={{ mb: 2 }}
          /> */}

          <TextField
            fullWidth
            label="Veículo"
            value={veiculo}
            onChange={(e) => setVeiculo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Data Início"
            type="datetime-local"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Data Fim"
            type="datetime-local"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 2}}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}