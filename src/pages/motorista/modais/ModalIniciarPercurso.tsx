import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';

interface ModalIniciarPercursoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onConfirm: () => void;
  destino: string;
  setDestino: (value: string) => void;
  odometro: string;
  setOdometro: (value: string) => void;
  odometroAtual: String;
  ultimoDestino: string;
  percursosAtivosCount?: number;
  chaveEmprestada: boolean;
  isUltimoPercurso: boolean; 
  localOrigemCorrida: string; 
  onConfirmacaoUltimoPercurso?: () => void;
}

const ModalIniciarPercurso: React.FC<ModalIniciarPercursoProps> = ({
  open,
  onClose,
  onSuccess,
  onConfirm,
  destino,
  setDestino,
  odometro,
  odometroAtual,
  setOdometro,
  ultimoDestino,
  percursosAtivosCount = 0,
  chaveEmprestada,
  isUltimoPercurso,
  localOrigemCorrida,
  onConfirmacaoUltimoPercurso 
}) => {
  const [mostrarAlertaChave, setMostrarAlertaChave] = useState(false);
  const [mostrarAlertaOdometro, setMostrarAlertaOdometro] = useState(false);
  const [confirmacaoUltimoPercurso, setConfirmacaoUltimoPercurso] = useState(false);

  

  useEffect(() => {
    if (isUltimoPercurso && open) {
      setConfirmacaoUltimoPercurso(true);
      setDestino(localOrigemCorrida);
      
    }
  }, [isUltimoPercurso, open, localOrigemCorrida, setDestino]);

  const handleConfirm = () => {

    if (!chaveEmprestada) {
      setMostrarAlertaChave(true);
      return;
    }
    
    if (Number(odometroAtual) > Number(odometro)) {
      setMostrarAlertaOdometro(true);
      return;
    }
    
    if (isUltimoPercurso && !confirmacaoUltimoPercurso && onConfirmacaoUltimoPercurso) {
      onConfirmacaoUltimoPercurso();
    } else {
      onConfirm();
    }

    const mensagem = "Percurso iniciado com sucesso!";
        

    onSuccess(mensagem);
  };

  const handleClose = () => {
    setMostrarAlertaChave(false);
    setConfirmacaoUltimoPercurso(false);
    setMostrarAlertaOdometro(false);
    onClose();
  };

  const handleDestinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUltimoPercurso || !confirmacaoUltimoPercurso) {
      setDestino(e.target.value.toUpperCase());
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography component="div" fontWeight="bold" color="text.primary" sx={{ fontSize: "1.25rem" }}>
          Iniciar Percurso
        </Typography>
        {percursosAtivosCount > 0 && (
          <Typography variant="body2" color="warning.main">
            Existe(m) {percursosAtivosCount} percurso(s) ativo(s) nesta corrida
          </Typography>
        )}
        {isUltimoPercurso && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Último percurso - Destino: {localOrigemCorrida}
          </Alert>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {mostrarAlertaChave && (
            <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
              Você precisa pegar a chave para iniciar este percurso!
            </Typography>
          )}

          {mostrarAlertaOdometro && (
            <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
              Odometro inválido! Valor menor que o registrado para o veículo
            </Typography>
          )}

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
            onChange={handleDestinoChange}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="Digite o destino do percurso"
            InputProps={{
              readOnly: isUltimoPercurso && confirmacaoUltimoPercurso,
            }}
            helperText={isUltimoPercurso && confirmacaoUltimoPercurso ? 
              "Destino bloqueado para último percurso" : ""}
          />

          <TextField
            label="Odômetro"
            value={odometro}
            onChange={(e) => setOdometro(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ min: 0 }}
            helperText={`Odômetro atual: ${Number(odometroAtual || 0).toLocaleString()}`}

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
          onClick={handleConfirm}
          disabled={!destino || !odometro}
        >
          {isUltimoPercurso && !confirmacaoUltimoPercurso ? 
            "CONFIRMAR ÚLTIMO PERCURSO" : "INICIAR PERCURSO"}
        </Button>
        <Button
          color="inherit"
          size="small"
          onClick={handleClose}
          sx={{ textTransform: "none" }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalIniciarPercurso;