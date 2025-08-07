import React, { useState } from 'react';
import { 
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  //useTheme
} from '@mui/material';
import axiosConnect from '../../../../services/axiosConnect';

interface CadastrarOcorrenciaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
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
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setDescricao('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const dadosOcorrencia = {
        descricao,
        idCorrida: corrida,
        dataRegistro: new Date(),
        
      };

      await axiosConnect.post('/ocorrencias', dadosOcorrencia);
      resetForm();
      onSuccess('Ocorrência cadastrada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar ocorrência:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
        />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !descricao.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CadastrarOcorrencia;
