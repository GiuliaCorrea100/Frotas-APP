import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from "@mui/icons-material";
import { atualizarPercurso, PercursoDto } from "../../../../services/PercursoService";


interface EdicaoPercursosModalProps {
  open: boolean;
  percurso: PercursoDto | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
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


const EdicaoPercursosModal: React.FC<EdicaoPercursosModalProps> = ({
  open,
  percurso,
  onClose,
  onSuccess,
  onError,
}) => {
  const [saidaHora, setSaidaHora] = useState<Date | null>(null);
  const [saidaOdometro, setSaidaOdometro] = useState<number>(0);
  const [localDestino, setLocalDestino] = useState("");
  const [chegadaHora, setChegadaHora] = useState<Date | null>(null);
  const [chegadaOdometro, setChegadaOdometro] = useState<number>(0);
  const [localOrigem, setLocalOrigem] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para converter UTC para Local
  const utcToLocal = (utcDate: Date | null): Date | null => {
    if (!utcDate) return null;
    return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
  };

  useEffect(() => {
    if(percurso){
      setChegadaHora(percurso.chegadaHora ? utcToLocal(new Date(percurso.chegadaHora)) : null);
      setSaidaHora(percurso.saidaHora ? utcToLocal(new Date(percurso.saidaHora)) : null);

      setChegadaOdometro(percurso.chegadaOdometro ?? 0);
      setSaidaOdometro(percurso.saidaOdometro ?? 0);

      setLocalDestino(percurso.localDestino ?? "");
      setLocalOrigem(percurso.localOrigem ?? "");


    }
  }, [percurso]);

  const handleSalvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if(!percurso) return;

    setLoading(true);
    try{

      const dadosAtualizados = {
        saidaHora,
        saidaOdometro,
        localDestino,
        chegadaHora,
        chegadaOdometro,
        localOrigem,
      }

      await atualizarPercurso(percurso.idPercurso!, dadosAtualizados);

      onSuccess("Percurso atualizado com sucesso!");
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
            <LocalGasStation color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Edição de Percurso</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Conteúdo */}
        <Box component="form" onSubmit={handleSalvar}>
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
              startIcon={!loading && <AttachMoney />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Atualizar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};


export default EdicaoPercursosModal;