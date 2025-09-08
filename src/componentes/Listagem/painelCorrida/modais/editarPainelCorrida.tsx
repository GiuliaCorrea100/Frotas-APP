import React, { useState, useEffect } from 'react';
import { 
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import axiosConnect from '../../../../services/axiosConnect';

interface CorridaDto {
  idCorrida?: number;
  dataInicio: Date;
  dataTermino: Date;
  distanciaKm?: string;
  idMotorista: number;
  chaveEmprestada: boolean;
  //idCarros: number;
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
  onError,
  corrida,
}: EditarInfoCorridaProps) {
  const [motorista, setMotorista] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (corrida) {
      setMotorista(corrida.nomeMotorista || '');
      setVeiculo(corrida.placaVeiculo || '');
      setDataInicio(corrida.dataInicio ? new Date(corrida.dataInicio).toISOString().slice(0, 16) : '');
      setDataFim(corrida.dataTermino ? new Date(corrida.dataTermino).toISOString().slice(0, 16) : '');
    }
  }, [corrida]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!corrida) return;

    setLoading(true);
    try {
      let idMotorista = corrida.idMotorista;

      // Verifica alteração de motorista
      if (motorista !== (corrida.nomeMotorista || '')) {
        const resMotorista = await axiosConnect.get(`http://localhost:3000/usuarios/buscar-por-nome/${motorista}`);
        console.log(resMotorista);
          idMotorista = resMotorista.data?.[0]?.idUsuario;
        if (!idMotorista) {
          throw new Error('Motorista não encontrado!');
        }
      }

      const dadosAtualizados: CorridaDto = {
        idCorrida: corrida.idCorrida,
        idMotorista,
        //idCarros,
        dataInicio: dataInicio ? new Date(dataInicio) : corrida.dataInicio,
        dataTermino: dataFim ? new Date(dataFim) : corrida.dataTermino,
        chaveEmprestada: corrida.chaveEmprestada,
      };

      await axiosConnect.put(`/corrida/${corrida.idCorrida}`, dadosAtualizados);

      console.log('Dados enviados:', dadosAtualizados);

      onSuccess('Edições salvas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar edições:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: 2, maxWidth: 500, mx: 'auto', mt: '10%' }}>
        <Typography variant="h6" mb={2}>Editar Corrida</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Motorista"
            value={motorista}
            onChange={(e) => setMotorista(e.target.value)}
            sx={{ mb: 2 }}
          />
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
            <Button onClick={onClose} sx={{ mr: 2 }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
