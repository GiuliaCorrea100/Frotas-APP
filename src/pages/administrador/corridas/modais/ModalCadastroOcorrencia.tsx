import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { OcorrenciaService } from '../../../../services/OcorrenciaService';

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
  chaveEmprestada,
  onError,
  corrida
}) => {
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarAlertaChave, setMostrarAlertaChave] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setDescricao('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!descricao.trim()) {
      onError('A descrição é obrigatória');
      return;
    }

    setLoading(true);

    try {
      const dadosOcorrencia = {
        descricao: descricao.trim(),
        idCorrida: corrida,
        dataRegistro: new Date(),
      };

      await OcorrenciaService.criar(dadosOcorrencia);
      
      // Exibe a mensagem de sucesso igual ao AbastecimentoModal
      setSuccessMessage('Ocorrência cadastrada com sucesso!');
      
      // Limpa o formulário
      setDescricao('');
      
      // Chama o onSuccess para notificar o componente pai
      onSuccess('Ocorrência cadastrada com sucesso!');
      
      // Fecha o modal automaticamente após 1.5 segundos (igual ao AbastecimentoModal)
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
        <Typography variant="h6" component="h2" mb={2} fontWeight="bold">
          Nova Ocorrência
        </Typography>

        {/* Alert de Sucesso - IGUAL AO ABASTECIMENTOMODAL */}
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
            disabled={loading || !descricao.trim() || !!successMessage}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CadastrarOcorrencia;