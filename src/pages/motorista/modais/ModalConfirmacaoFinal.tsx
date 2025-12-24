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

interface ModalConfirmacaoFinalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  localOrigem: string;
}

const ModalConfirmacaoFinal: React.FC<ModalConfirmacaoFinalProps> = ({
  open,
  onClose,
  onConfirm,
  localOrigem
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography component="div" fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
          Confirmação do Último Percurso
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="warning.main">
            ATENÇÃO
          </Typography>
          <Typography variant="body1" gutterBottom>
            Você confirmou que este é o <strong>ÚLTIMO PERCURSO</strong>.
          </Typography>
          <Typography variant="body1" gutterBottom>
            O destino será definido automaticamente como:
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            "{localOrigem}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Após confirmar, o campo de destino será bloqueado e não poderá ser alterado.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={onClose}
          sx={{ minWidth: 100 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onConfirm}
          sx={{ minWidth: 100 }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalConfirmacaoFinal;