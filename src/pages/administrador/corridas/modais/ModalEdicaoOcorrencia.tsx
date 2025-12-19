import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { OcorrenciaDto } from '../../../../services/OcorrenciaService';
import axiosConnect from '../../../../services/axios/axiosConnect';

interface ModalEditarOcorrenciaProps {
  open: boolean;
  ocorrencia: OcorrenciaDto | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const ModalEditarOcorrencia: React.FC<ModalEditarOcorrenciaProps> = ({
  open,
  ocorrencia,
  onClose,
  onSuccess,
  onError,
}) => {
  const [descricao, setDescricao] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (ocorrencia) {
      setDescricao(ocorrencia.descricao || '');
      
      if (ocorrencia.dataOcorrencia) {
        if (typeof ocorrencia.dataOcorrencia === 'string') {
          const dateString = ocorrencia.dataOcorrencia.includes('T') 
            ? ocorrencia.dataOcorrencia.split('T')[0] + 'T00:00:00'
            : ocorrencia.dataOcorrencia + 'T00:00:00';
          setDataOcorrencia(new Date(dateString));
        } else {
          setDataOcorrencia(ocorrencia.dataOcorrencia);
        }
      } else {
        setDataOcorrencia(null);
      }
    }
  }, [ocorrencia]);

  const resetForm = () => {
    if (ocorrencia) {
      setDescricao(ocorrencia.descricao || '');
      if (ocorrencia.dataOcorrencia) {
        if (typeof ocorrencia.dataOcorrencia === 'string') {
          const dateString = ocorrencia.dataOcorrencia.includes('T') 
            ? ocorrencia.dataOcorrencia.split('T')[0] + 'T00:00:00'
            : ocorrencia.dataOcorrencia + 'T00:00:00';
          setDataOcorrencia(new Date(dateString));
        } else {
          setDataOcorrencia(ocorrencia.dataOcorrencia);
        }
      } else {
        setDataOcorrencia(null);
      }
    }
    setSuccessMessage('');
  };

  const formatarDataParaEnvio = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!ocorrencia) return;

    if (!descricao.trim()) {
      onError('A descrição é obrigatória');
      return;
    }

    if (!dataOcorrencia) {
      onError('A data da ocorrência é obrigatória');
      return;
    }

    setLoading(true);

    try {
      const dadosAtualizados = {
        descricao: descricao.trim(),
        dataOcorrencia: formatarDataParaEnvio(dataOcorrencia),
      };

      await axiosConnect.patch(`/ocorrencia/${ocorrencia.idOcorrencia}`, dadosAtualizados);
      
      setSuccessMessage('Ocorrência atualizada com sucesso!');
      onSuccess('Ocorrência atualizada com sucesso!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Erro ao atualizar ocorrência:', error);
      
      if (error.response?.status === 401) {
        onError('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 400) {
        onError(error.response?.data?.message || 'Dados inválidos');
      } else {
        onError(error.response?.data?.message || 'Erro ao atualizar ocorrência');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" mb={2} fontWeight="bold">
          Editar Ocorrência
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <TextField
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          fullWidth
          required
          multiline
          rows={3}
          variant="outlined"
          margin="normal"
          error={!descricao.trim() && descricao !== ''}
          helperText={!descricao.trim() && descricao !== '' ? "Descrição não pode estar vazia" : ""}
          disabled={!!successMessage || loading}
        />

        <TextField
          label="Data da ocorrência"
          type="date"
          fullWidth
          value={dataOcorrencia ? dataOcorrencia.toISOString().slice(0, 10) : ""}
          onChange={(e) => {
            const selectedDate = e.target.value;
            if (selectedDate) {
              const date = new Date(selectedDate + 'T00:00:00');
              setDataOcorrencia(date);
            } else {
              setDataOcorrencia(null);
            }
          }}
          InputLabelProps={{ shrink: true }}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          disabled={!!successMessage || loading}
        />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button 
            variant="outlined" 
            onClick={handleClose} 
            disabled={loading || !!successMessage}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !descricao.trim() || !dataOcorrencia || !!successMessage}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalEditarOcorrencia;