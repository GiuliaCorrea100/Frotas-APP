import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  InputAdornment,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  CalendarToday,
  AddLocationAlt,
} from "@mui/icons-material";
import { inserirPercursoCompleto } from "../../../../services/PercursoService";

interface CadastrarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
  corrida: number;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 800,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const CadastrarPercursosModal: React.FC<CadastrarModalProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida,
}) => {
  const [saidaHora, setSaidaHora] = useState<Date | null>(null);
  const [saidaOdometro, setSaidaOdometro] = useState<string>("");
  const [localDestino, setLocalDestino] = useState("");
  const [chegadaHora, setChegadaHora] = useState<Date | null>(null);
  const [chegadaOdometro, setChegadaOdometro] = useState<string>("");
  const [localOrigem, setLocalOrigem] = useState("");

  const [loading, setLoading] = useState(false);

  // Função para permitir apenas números
  const handleNumericInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    // Remove qualquer caractere que não seja número
    const numericValue = value.replace(/[^\d]/g, '');
    setter(numericValue);
  };

  // Função para converter string para número (para envio)
  const getNumericValue = (value: string): number => {
    return value ? parseInt(value, 10) : 0;
  };

  useEffect(() => {
    if (open) {
      setSaidaHora(null);
      setSaidaOdometro("");
      setLocalDestino("");
      setChegadaHora(null);
      setChegadaOdometro("");
      setLocalOrigem("");
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!saidaOdometro || !chegadaOdometro || !saidaHora || !chegadaHora) {
      onError("Todos os campos marcados com * são obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const dadosPercurso = {
        saidaHora,
        saidaOdometro: getNumericValue(saidaOdometro),
        localDestino,
        chegadaHora,
        chegadaOdometro: getNumericValue(chegadaOdometro),
        localOrigem,
      };

      await inserirPercursoCompleto(corrida, dadosPercurso);
      onSuccess("Percurso cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar percurso:", error);
      onError(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle}>
        {/* Cabeçalho */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <AddLocationAlt color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="text.primary">Cadastro de Percurso</Typography>
          </Box>
        </Box>

        {/* Conteúdo */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Informações de Saída */}
          <Typography variant="subtitle1" color="text.primary" gutterBottom>
            Informações de Saída
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField
              label="Local de Origem"
              value={localOrigem}
              onChange={(e) => setLocalOrigem(e.target.value.toUpperCase())}
              required
              sx={{ flex: "1 1 200px" }}
            />
            <TextField
              label="Odômetro de Saída"
              value={saidaOdometro}
              onChange={(e) => handleNumericInput(e.target.value, setSaidaOdometro)}
              required
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
              placeholder="Apenas números"
              helperText="Digite apenas números"
            />
          </Box>
          <TextField
            label="Hora de Saída"
            type="datetime-local"
            fullWidth
            value={saidaHora ? saidaHora.toISOString().slice(0, 16) : ""}
            onChange={(e) => setSaidaHora(new Date(e.target.value))}
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

          <Divider sx={{ my: 2 }} />

          {/* Informações de Chegada */}
          <Typography variant="subtitle1" color="text.primary" gutterBottom>
            Informações de Chegada
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField
              label="Local de Destino"
              value={localDestino}
              onChange={(e) => setLocalDestino(e.target.value.toUpperCase())}
              required
              sx={{ flex: "1 1 200px" }}
            />
            <TextField
              label="Odômetro de Chegada"
              value={chegadaOdometro}
              onChange={(e) => handleNumericInput(e.target.value, setChegadaOdometro)}
              required
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
              placeholder="Apenas números"
              helperText="Digite apenas números"
            />
          </Box>
          <TextField
            label="Hora de Chegada"
            type="datetime-local"
            fullWidth
            value={chegadaHora ? chegadaHora.toISOString().slice(0, 16) : ""}
            onChange={(e) => setChegadaHora(new Date(e.target.value))}
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

          {/* Botões */}
          <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
            <Button onClick={onClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Cadastrar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default CadastrarPercursosModal;