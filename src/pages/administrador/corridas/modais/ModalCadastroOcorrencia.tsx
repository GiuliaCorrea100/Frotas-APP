import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { OcorrenciaService } from "../../../../services/OcorrenciaService";
import { CalendarToday, Close, Warning } from "@mui/icons-material";
import { modalStyle } from "../../../../utils/modalStyle";

interface CadastrarOcorrenciaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  chaveEmprestada: boolean;
  onError: (error: any) => void;
  corrida: number;
  dataRegistro?: Date;
}

const CadastrarOcorrencia: React.FC<CadastrarOcorrenciaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida,
}) => {
  const [descricao, setDescricao] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!descricao.trim()) {
      onError("A descrição é obrigatória");
      return;
    }

    if (!dataOcorrencia) {
      onError("A data da ocorrência é obrigatória");
      return;
    }

    setLoading(true);

    try {
      const dadosOcorrencia = {
        descricao: descricao.trim(),
        idCorrida: corrida,
        dataOcorrencia: dataOcorrencia,
      };

      await OcorrenciaService.criar(dadosOcorrencia);

      setSuccessMessage("Ocorrência cadastrada com sucesso!");

      onSuccess("Ocorrência cadastrada com sucesso!");

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao cadastrar ocorrência:", error);

      if (error.response?.status === 401) {
        onError("Sessão expirada. Faça login novamente.");
      } else {
        onError(
          error.response?.data?.message || "Erro ao cadastrar ocorrência",
        );
      }
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
            mb: 0,
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
            <Warning color="primary" sx={{ fontSize: 24, mr: 1 }} />
            Cadastrar ocorrência
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

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            variant="outlined"
            margin="normal"
            error={!descricao.trim() && descricao !== ""}
            helperText={
              !descricao.trim() && descricao !== ""
                ? "Descrição não pode estar vazia"
                : ""
            }
            disabled={!!successMessage || loading}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Data da ocorrência"
            type="date"
            fullWidth
            value={
              dataOcorrencia ? dataOcorrencia.toISOString().slice(0, 10) : ""
            }
            onChange={(e) => {
              const selectedDate = e.target.value;
              if (selectedDate) {
                const date = new Date(selectedDate + "T00:00:00");
                setDataOcorrencia(date);
              } else {
                setDataOcorrencia(null);
              }
            }}
            InputLabelProps={{ shrink: true }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading ||
              !descricao.trim() ||
              !dataOcorrencia ||
              !!successMessage
            }
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CadastrarOcorrencia;
