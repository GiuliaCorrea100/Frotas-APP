import React, { useState } from 'react';
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
import { PercursoBackend } from '../../../services/PercursoService';

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
  const [mostrarAlertaOdometro, setMostrarAlertaOdometro] = useState(false);

  const handleConfirm = () => {
    // Converte para número decimal para comparação
    const odometroFinalNum = parseFloat(odometroFinal);
    const saidaOdometroNum = parseFloat(percursoAtual?.saidaOdometro?.toString() || '0');
    
    // Verifica se o odômetro final é menor que o de saída
    if (odometroFinalNum < saidaOdometroNum) {
      setMostrarAlertaOdometro(true);
      return; // Impede a confirmação
    }
    
    // Se passar na validação, remove o alerta e executa a confirmação
    setMostrarAlertaOdometro(false);
    onConfirm();
  };

  const handleClose = () => {
    setMostrarAlertaOdometro(false); // Limpa o alerta ao fechar
    onClose();
  };

  const handleOdometroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOdometroFinal(value);
    
    // Remove o alerta quando o usuário começa a digitar novamente
    // (opcional - mantém o alerta apenas após tentativa de confirmação)
    setMostrarAlertaOdometro(false);
  };

  // Função para formatar o número com separadores de milhar e manter decimais
  const formatarOdometro = (valor: string | number | undefined) => {
    if (!valor && valor !== 0) return '0';
    
    const num = parseFloat(valor.toString());
    if (isNaN(num)) return '0';
    
    // Verifica se tem casas decimais
    const temDecimais = num % 1 !== 0;
    
    if (temDecimais) {
      // Para números decimais, mostra com separador de milhar e mantém as casas decimais
      const partes = num.toFixed(2).split('.');
      return `${parseInt(partes[0]).toLocaleString()},${partes[1]}`;
    } else {
      // Para números inteiros, apenas o separador de milhar
      return num.toLocaleString();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        <Typography component="div" fontWeight="bold" color="text.primary" sx={{ fontSize: "1.25rem" }}>
          Finalizar Percurso
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {mostrarAlertaOdometro && (
            <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
              Odômetro inválido! Valor menor que o registrado para o veículo
            </Typography>
          )}
          <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
            <strong>Fim do percurso em:</strong> {percursoAtual?.localDestino || "Destino não encontrado"}
          </Typography>
          <TextField
            label="Odômetro Final"
            value={odometroFinal}
            onChange={handleOdometroChange}
            fullWidth
            type="number"
            inputProps={{ 
              min: percursoAtual?.saidaOdometro || 0,
              step: "any" // Permite números decimais
            }}
            helperText={`Odômetro de saída: ${formatarOdometro(percursoAtual?.saidaOdometro)}`}
            error={mostrarAlertaOdometro}
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
          sx={{ 
            py: 1.5, 
            fontWeight: "bold", 
            fontSize: "1.1rem"
          }}
          onClick={handleConfirm}
          disabled={!odometroFinal}
        >
          FINALIZAR PERCURSO
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

export default ModalFinalizarPercurso;