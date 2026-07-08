import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  InputAdornment,
  CircularProgress,
  IconButton,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Close, AddLocationAlt } from "@mui/icons-material";
import {
  atualizarPercurso,
  PercursoDto,
} from "../../../../services/PercursoService";
import { modalStyle } from "../../../../utils/modalStyle";
import { CorridaFrontend } from "../../../../services/CorridaService";

interface EdicaoPercursosModalProps {
  open: boolean;
  percurso: PercursoDto | null;
  corrida: CorridaFrontend;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const EdicaoPercursosModal: React.FC<EdicaoPercursosModalProps> = ({
  open,
  percurso,
  corrida,
  onClose,
  onSuccess,
  onError,
}) => {
  const [saidaHora, setSaidaHora] = useState<string>("");
  const [saidaOdometro, setSaidaOdometro] = useState<string>("");
  const [localDestino, setLocalDestino] = useState("");
  const [chegadaHora, setChegadaHora] = useState<string>("");
  const [chegadaOdometro, setChegadaOdometro] = useState<string>("");
  const [localOrigem, setLocalOrigem] = useState("");
  const [idMotorista, setIdMotorista] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { minDateTimeStr, maxDateTimeStr } = useMemo(() => {
    if (!corrida) {
      return { minDateTimeStr: "", maxDateTimeStr: "" };
    }

    const formatToDateTimeLocal = (dateString: string | Date | null | undefined): string => {
      if (!dateString) return "";
      const d = new Date(dateString);
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    return {
      minDateTimeStr: corrida.dataHoraLiberacaoChave ? formatToDateTimeLocal(corrida.dataHoraLiberacaoChave) : "",
      maxDateTimeStr: corrida.dataHoraRecebimentoChave ? formatToDateTimeLocal(corrida.dataHoraRecebimentoChave) : formatToDateTimeLocal(new Date()),
    };
  }, [corrida]);

  const handleNumericInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(value.replace(/[^\d]/g, ""));
  };

  const formatDateToLocalString = (date: Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (open && percurso) {
      setSaidaHora(formatDateToLocalString(percurso.saidaHora));
      setChegadaHora(formatDateToLocalString(percurso.chegadaHora));
      setSaidaOdometro(percurso.saidaOdometro?.toString() ?? "");
      setChegadaOdometro(percurso.chegadaOdometro?.toString() ?? "");
      setLocalDestino(percurso.localDestino ?? "");
      setLocalOrigem(percurso.localOrigem ?? "");
      setIdMotorista(percurso.idMotorista ?? "");
      setErrors({});
      setSuccessMessage("");
    }
  }, [open, percurso]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localOrigem.trim()) {
      newErrors.localOrigem = "Local de origem é obrigatório";
    }

    if (!saidaOdometro) {
      newErrors.saidaOdometro = "Odômetro de saída é obrigatório";
    } else if (isNaN(Number(saidaOdometro)) || Number(saidaOdometro) < 0) {
      newErrors.saidaOdometro = "Odômetro deve ser um número válido";
    }

    if (!saidaHora) {
      newErrors.saidaHora = "Hora de saída é obrigatória";
    } else {
      const dataSaida = new Date(saidaHora);
      const apenasDataSaida = dataSaida.getTime();

      if (minDateTimeStr && apenasDataSaida < new Date(minDateTimeStr).getTime()) {
        newErrors.saidaHora = `Hora de saída não pode ser anterior à liberação da chave (${new Date(minDateTimeStr).toLocaleString()})`;
      } else if (maxDateTimeStr && apenasDataSaida > new Date(maxDateTimeStr).getTime()) {
        newErrors.saidaHora = `Hora de saída não pode ser posterior ao encerramento da corrida (${new Date(maxDateTimeStr).toLocaleString()})`;
      }
    }

    if (!localDestino.trim()) {
      newErrors.localDestino = "Local de destino é obrigatório";
    }

    if (!chegadaOdometro) {
      newErrors.chegadaOdometro = "Odômetro de chegada é obrigatório";
    } else if (isNaN(Number(chegadaOdometro)) || Number(chegadaOdometro) < 0) {
      newErrors.chegadaOdometro = "Odômetro deve ser um número válido";
    } else if (saidaOdometro && Number(chegadaOdometro) < Number(saidaOdometro)) {
      newErrors.chegadaOdometro = "Odômetro de chegada não pode ser menor que o de saída";
    }

    if (!chegadaHora) {
      newErrors.chegadaHora = "Hora de chegada é obrigatória";
    } else {
      const dataChegada = new Date(chegadaHora);
      const apenasDataChegada = dataChegada.getTime();

      if (minDateTimeStr && apenasDataChegada < new Date(minDateTimeStr).getTime()) {
        newErrors.chegadaHora = `Hora de chegada não pode ser anterior à liberação da chave (${new Date(minDateTimeStr).toLocaleString()})`;
      } else if (maxDateTimeStr && apenasDataChegada > new Date(maxDateTimeStr).getTime()) {
        newErrors.chegadaHora = `Hora de chegada não pode ser posterior ao encerramento da corrida (${new Date(maxDateTimeStr).toLocaleString()})`;
      } else if (saidaHora && apenasDataChegada < new Date(saidaHora).getTime()) {
        newErrors.chegadaHora = "Hora de chegada não pode ser anterior à hora de saída";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!percurso) return;

    if (!validateForm()) return;

    setLoading(true);
    try {
      const dadosAtualizados = {
        saidaHora: new Date(saidaHora),
        saidaOdometro: Number(saidaOdometro),
        localDestino: localDestino.trim().toUpperCase(),
        chegadaHora: new Date(chegadaHora),
        chegadaOdometro: Number(chegadaOdometro),
        localOrigem: localOrigem.trim().toUpperCase(),
        idMotorista: idMotorista === "" ? undefined : idMotorista,
      };

      await atualizarPercurso(percurso.idPercurso!, dadosAtualizados);

      const mensagem = "Percurso atualizado com sucesso!";
      setSuccessMessage(mensagem);

      setTimeout(() => {
        setSuccessMessage("");
        onSuccess(mensagem);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao salvar percurso:", error);
      setErrors({
        submit: error.response?.data?.message || "Erro ao atualizar percurso"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    switch (field) {
      case "localOrigem":
        setLocalOrigem(value.toUpperCase());
        break;
      case "saidaOdometro":
        handleNumericInput(value, setSaidaOdometro);
        break;
      case "saidaHora":
        setSaidaHora(value);
        break;
      case "localDestino":
        setLocalDestino(value.toUpperCase());
        break;
      case "chegadaOdometro":
        handleNumericInput(value, setChegadaOdometro);
        break;
      case "chegadaHora":
        setChegadaHora(value);
        break;
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
            Editar Percurso
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
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
            onChange={(e) => handleFieldChange("localOrigem", e.target.value)}
            required
            error={!!errors.localOrigem}
            helperText={errors.localOrigem}
            disabled={loading || !!successMessage}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Odômetro de Saída"
            value={saidaOdometro}
            onChange={(e) => handleFieldChange("saidaOdometro", e.target.value)}
            required
            error={!!errors.saidaOdometro}
            helperText={errors.saidaOdometro}
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
            disabled={loading || !!successMessage}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Hora de Saída"
            type="datetime-local"
            fullWidth
            value={saidaHora}
            onChange={(e) => handleFieldChange("saidaHora", e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: minDateTimeStr,
              max: maxDateTimeStr,
            }}
            required
            error={!!errors.saidaHora}
            helperText={errors.saidaHora}
            disabled={loading || !!successMessage}
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
            onChange={(e) => handleFieldChange("localDestino", e.target.value)}
            required
            error={!!errors.localDestino}
            helperText={errors.localDestino}
            disabled={loading || !!successMessage}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Odômetro de Chegada"
            value={chegadaOdometro}
            onChange={(e) => handleFieldChange("chegadaOdometro", e.target.value)}
            required
            error={!!errors.chegadaOdometro}
            helperText={errors.chegadaOdometro}
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
            disabled={loading || !!successMessage}
            sx={{ flex: 1 }}
          />

          <TextField
            label="Hora de Chegada"
            type="datetime-local"
            fullWidth
            value={chegadaHora}
            onChange={(e) => handleFieldChange("chegadaHora", e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: minDateTimeStr,
              max: maxDateTimeStr,
            }}
            required
            error={!!errors.chegadaHora}
            helperText={errors.chegadaHora}
            disabled={loading || !!successMessage}
            sx={{ flex: 1 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="motorista-label">Motorista Responsável</InputLabel>
            <Select
              labelId="motorista-label"
              value={idMotorista}
              onChange={(e) => setIdMotorista(e.target.value as number | "")}
              label="Motorista Responsável"
              disabled={loading || !!successMessage}
            >
              <MenuItem value="">
                <em>Selecione o motorista</em>
              </MenuItem>
              {corrida.motoristas?.map((m) => (
                <MenuItem key={m.idMotorista} value={m.idMotorista}>
                  {m.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading || !!successMessage}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !!successMessage}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EdicaoPercursosModal;