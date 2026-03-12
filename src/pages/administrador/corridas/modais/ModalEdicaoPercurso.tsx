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
  Alert,
} from "@mui/material";
import {
  LocalGasStation,
  CalendarToday,
  Close,
  Numbers,
  AddLocationAlt,
} from "@mui/icons-material";
import {
  atualizarPercurso,
  PercursoDto,
} from "../../../../services/PercursoService";
import { modalStyle } from "../../../../utils/modalStyle";

interface EdicaoPercursosModalProps {
  open: boolean;
  percurso: PercursoDto | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const toLocalDateTimeInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNumericInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(value.replace(/[^\d]/g, ""));
  };

  const utcToLocal = (utcDate: Date | null): Date | null => {
    if (!utcDate) return null;
    return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
  };

  useEffect(() => {
    if (percurso) {
      setSaidaHora(
        percurso.saidaHora ? utcToLocal(new Date(percurso.saidaHora)) : null,
      );

      setChegadaHora(
        percurso.chegadaHora
          ? utcToLocal(new Date(percurso.chegadaHora))
          : null,
      );

      setSaidaOdometro(percurso.saidaOdometro?.toString() ?? "");
      setChegadaOdometro(percurso.chegadaOdometro?.toString() ?? "");
      setLocalDestino(percurso.localDestino ?? "");
      setLocalOrigem(percurso.localOrigem ?? "");
    }
  }, [percurso]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!percurso) return;

    if (!saidaOdometro || !chegadaOdometro || !saidaHora || !chegadaHora) {
      onError("Todos os campos marcados com * são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const dadosAtualizados = {
        saidaHora,
        saidaOdometro: Number(saidaOdometro),
        localDestino,
        chegadaHora,
        chegadaOdometro: Number(chegadaOdometro),
        localOrigem,
      };

      await atualizarPercurso(percurso.idPercurso!, dadosAtualizados);
      setSuccessMessage("Percurso cadastrado com sucesso!");

      setTimeout(() => {
        setSuccessMessage("");
        onSuccess("Percurso cadastrado com sucesso!");
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar percurso:", error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              pt: 1,
            }}
          >
            <AddLocationAlt color="primary" sx={{ mr: 1 }} />
            Editar de Percurso
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <TextField
            label="Local de Origem"
            value={localOrigem}
            onChange={(e) => setLocalOrigem(e.target.value.toUpperCase())}
            required
            sx={{ flex: 1 }}
          />

          <TextField
            label="Odômetro de Saída"
            value={saidaOdometro}
            onChange={(e) =>
              handleNumericInput(e.target.value, setSaidaOdometro)
            }
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Hora de Saída"
            type="datetime-local"
            fullWidth
            value={saidaHora ? toLocalDateTimeInputValue(saidaHora) : ""}
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
            sx={{ flex: 1 }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <TextField
            label="Local de Destino"
            value={localDestino}
            onChange={(e) => setLocalDestino(e.target.value.toUpperCase())}
            required
            sx={{ flex: 1 }}
          />

          <TextField
            label="Odômetro de Chegada"
            value={chegadaOdometro}
            onChange={(e) =>
              handleNumericInput(e.target.value, setChegadaOdometro)
            }
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Hora de Chegada"
            type="datetime-local"
            fullWidth
            value={chegadaHora ? toLocalDateTimeInputValue(chegadaHora) : ""}
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
            sx={{ flex: 1 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            disabled={loading || !!successMessage}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !!successMessage}
          >
            {loading ? <CircularProgress size={24} /> : "Atualizar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EdicaoPercursosModal;
