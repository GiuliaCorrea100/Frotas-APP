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

interface ModalIniciarPercursoProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  destino: string;
  setDestino: (value: string) => void;
  odometro: string;
  setOdometro: (value: string) => void;
  ultimoDestino: string;
  percursosAtivosCount?: number;
}

const ModalIniciarPercurso: React.FC<ModalIniciarPercursoProps> = ({
  open,
  onClose,
  onConfirm,
  destino,
  setDestino,
  odometro,
  setOdometro,
  ultimoDestino,
  percursosAtivosCount = 0
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Typography component="div" fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
          Iniciar Novo Percurso
        </Typography>
        {percursosAtivosCount > 0 && (
          <Typography variant="body2" color="warning.main">
            Existe(m) {percursosAtivosCount} percurso(s) ativo(s) nesta corrida
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Local de Saída"
            value={ultimoDestino || "Não informado"}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            label="Local de Destino"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Odômetro"
            value={odometro}
            onChange={(e) => setOdometro(e.target.value)}
            fullWidth
            type="number"
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
          disabled={!destino || !odometro}
        >
          INICIAR
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

export default ModalIniciarPercurso;