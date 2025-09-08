import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

interface ModalConfirmacaoUltimoPercursoProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (confirmado: boolean) => void;
  localOrigem: string;
}

const ModalConfirmacaoUltimoPercurso: React.FC<ModalConfirmacaoUltimoPercursoProps> = ({
  open,
  onClose,
  onConfirm,
  localOrigem
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography component="div" fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
          Confirmar Percurso
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Este é seu último percurso de volta para
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
            "{localOrigem}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ao confirmar, o destino será automaticamente preenchido com o local de origem.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => onConfirm(false)}
          sx={{ minWidth: 100 }}
        >
          Não
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => onConfirm(true)}
          sx={{ minWidth: 100 }}
        >
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalConfirmacaoUltimoPercurso;