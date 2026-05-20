import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import { Close, Warning } from "@mui/icons-material";
import { OcorrenciaDto } from "../../../../services/OcorrenciaService";
import axiosConnect from "../../../../services/axios/axiosConnect";
import { modalStyle } from "../../../../utils/modalStyle";

interface ModalEditarOcorrenciaProps {
  open: boolean;
  ocorrencia: OcorrenciaDto | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const ModalEditarOcorrencia: React.FC<ModalEditarOcorrenciaProps> = ({
  open,
  ocorrencia,
  onClose,
  onSuccess,
  onError,
}) => {
  const [descricao, setDescricao] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (ocorrencia) {
      setDescricao(ocorrencia.descricao || "");

      if (ocorrencia.dataOcorrencia) {
        if (typeof ocorrencia.dataOcorrencia === "string") {
          const dateString = ocorrencia.dataOcorrencia.includes("T")
            ? ocorrencia.dataOcorrencia.split("T")[0] + "T00:00:00"
            : ocorrencia.dataOcorrencia + "T00:00:00";
          setDataOcorrencia(new Date(dateString));
        } else {
          setDataOcorrencia(ocorrencia.dataOcorrencia);
        }
      } else {
        setDataOcorrencia(null);
      }
    }
  }, [ocorrencia]);

  const formatarDataParaEnvio = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!ocorrencia) return;

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
      const dadosAtualizados = {
        descricao: descricao.trim(),
        dataOcorrencia: formatarDataParaEnvio(dataOcorrencia),
      };

      await axiosConnect.patch(
        `/ocorrencia/${ocorrencia.idOcorrencia}`,
        dadosAtualizados,
      );

      const mensagem = "Ocorrência atualizada com sucesso!";
      onSuccess(mensagem);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao editar ocorrência:", error);

      if (error.response?.status === 401) {
        onError("Sessão expirada. Faça login novamente.");
      } else if (error.response?.status === 400) {
        onError(error.response?.data?.message || "Dados inválidos");
      } else {
        onError(error.response?.data?.message || "Erro ao editar ocorrência");
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
            Editar ocorrência
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
            disabled={!!successMessage || loading}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading || !!successMessage}
          >
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

export default ModalEditarOcorrencia;
