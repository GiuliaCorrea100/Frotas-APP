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

  // Função para converter UTC para Local
  const utcToLocal = (utcDate: Date | null): Date | null => {
    if (!utcDate) return null;
    return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
  };

  useEffect(() => {
    if(percurso){
      setChegadaHora(percurso.chegadaHora ? utcToLocal(new Date(percurso.chegadaHora)) : null);
      setSaidaHora(percurso.saidaHora ? utcToLocal(new Date(percurso.saidaHora)) : null);

      setChegadaOdometro(percurso.chegadaOdometro?.toString() ?? "");
      setSaidaOdometro(percurso.saidaOdometro?.toString() ?? "");

      setLocalDestino(percurso.localDestino ?? "");
      setLocalOrigem(percurso.localOrigem ?? "");
    }
  }, [percurso]);

  const handleSalvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if(!percurso) return;

    // Validação dos campos obrigatórios
    if (!saidaOdometro || !chegadaOdometro || !saidaHora || !chegadaHora) {
      onError("Todos os campos marcados com * são obrigatórios");
      return;
    }

    setLoading(true);
    try{
      const dadosAtualizados = {
        saidaHora,
        saidaOdometro: getNumericValue(saidaOdometro),
        localDestino,
        chegadaHora,
        chegadaOdometro: getNumericValue(chegadaOdometro),
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
            <Typography variant="h6" color="text.primary">Edição de Percurso</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Conteúdo */}
        <Box component="form" onSubmit={handleSalvar}>
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