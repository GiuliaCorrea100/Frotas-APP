import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';
import { PercursoBackend } from '../../../api/percursoService';

interface ModalFinalizarPercursoProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  odometroFinal: string;
  setOdometroFinal: (value: string) => void;
  percursoAtual: PercursoBackend | null;
}

const ModalFinalizarPercurso: React.FC<ModalFinalizarPercursoProps> = ({
  open,
  onClose,
  onConfirm,
  odometroFinal,
  setOdometroFinal,
  percursoAtual
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Typography component="div" fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
          Finalizar Percurso
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Fim do percurso em:</strong> {percursoAtual?.localDestino || "Destino não encontrado"}
          </Typography>
          <TextField
            label="Odômetro Final"
            value={odometroFinal}
            onChange={(e) => setOdometroFinal(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: percursoAtual?.saidaOdometro || 0 }}
            helperText={`Odômetro de saída: ${percursoAtual?.saidaOdometro || 0}`}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, px: 3, pb: 2 }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
          onClick={onConfirm}
          disabled={!odometroFinal}
        >
          FINALIZAR PERCURSO
        </Button>
        <Button
          color="inherit"
          size="small"
          onClick={onClose}
          sx={{ textTransform: "none" }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalFinalizarPercurso;