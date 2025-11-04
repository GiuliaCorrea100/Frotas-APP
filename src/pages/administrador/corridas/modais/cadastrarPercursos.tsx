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
  IconButton,
} from "@mui/material";
import {
  LocalGasStation,
  AttachMoney,
  CalendarToday,
  Close,
  AddLocationAlt,
} from "@mui/icons-material";
import { inserirPercursoCompleto } from "../../../../api/percursoService";

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
  const [saidaOdometro, setSaidaOdometro] = useState<number>(0);
  const [localDestino, setLocalDestino] = useState("");
  const [chegadaHora, setChegadaHora] = useState<Date | null>(null);
  const [chegadaOdometro, setChegadaOdometro] = useState<number>(0);
  const [localOrigem, setLocalOrigem] = useState("");

  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (open) {
      setSaidaHora(null);
      setSaidaOdometro(0);
      setLocalDestino("");
      setChegadaHora(null);
      setChegadaOdometro(0);
      setLocalOrigem("");
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const dadosPercurso = {
        saidaHora,
        saidaOdometro,
        localDestino,
        chegadaHora,
        chegadaOdometro,
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
            <Typography variant="h6">Cadastro de Percurso</Typography>
          </Box>
        </Box>

        {/* Conteúdo */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Informações de Saída */}
          <Typography variant="subtitle1" gutterBottom>
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
              type="number"
              value={saidaOdometro}
              onChange={(e) => setSaidaOdometro(Number(e.target.value))}
              required
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
            />
          </Box>
          <TextField
            label="Hora de Saída"
            type="datetime-local"
            fullWidth
            value={saidaHora ? saidaHora.toISOString().slice(0, 16) : ""}
            onChange={(e) => setSaidaHora(new Date(e.target.value))}
            InputLabelProps={{ shrink: true }}
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
          <Typography variant="subtitle1" gutterBottom>
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
              type="number"
              value={chegadaOdometro}
              onChange={(e) => setChegadaOdometro(Number(e.target.value))}
              required
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
            />
          </Box>
          <TextField
            label="Hora de Chegada"
            type="datetime-local"
            fullWidth
            value={chegadaHora ? chegadaHora.toISOString().slice(0, 16) : ""}
            onChange={(e) => setChegadaHora(new Date(e.target.value))}
            InputLabelProps={{ shrink: true }}
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
