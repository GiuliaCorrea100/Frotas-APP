import React, { useState } from 'react';
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
import { OcorrenciaService } from '../../../../services/OcorrenciaService';
import { CalendarToday } from '@mui/icons-material';

interface CadastrarOcorrenciaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  chaveEmprestada: boolean;
  onError: (error: any) => void;
  corrida: number;
  dataRegistro?: Date;
}

const CadastrarOcorrencia: React.FC<CadastrarOcorrenciaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida
}) => {
  const [descricao, setDescricao] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setDescricao('');
    setDataOcorrencia(null);
    setSuccessMessage('');
  };

  // const formatDateForBackend = (date: Date | null): string | null => {
  //   if (!date) return null;
    
  //   // Formata como YYYY-MM-DD (apenas data)
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
    
  //   return `${year}-${month}-${day}`;
  // };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
      const dadosOcorrencia = {
        descricao: descricao.trim(),
        idCorrida: corrida,
        dataOcorrencia: dataOcorrencia, 
      };

      await OcorrenciaService.criar(dadosOcorrencia);
      console.log(dadosOcorrencia);
      
      setSuccessMessage('Ocorrência cadastrada com sucesso!');
      
      onSuccess('Ocorrência cadastrada com sucesso!');
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
      
    } catch (error: any) {
      console.error('Erro ao cadastrar ocorrência:', error);
      
      if (error.response?.status === 401) {
        onError('Sessão expirada. Faça login novamente.');
      } else {
        onError(error.response?.data?.message || 'Erro ao cadastrar ocorrência');
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
        <Typography variant="h6" component="h2" mb={2} fontWeight="bold" color="text.primary">
          Nova Ocorrência
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
              // Cria uma data com hora fixa (meia-noite)
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
        />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button 
            variant="outlined" 
            onClick={handleClose} 
            disabled={loading}
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

export default CadastrarOcorrencia;