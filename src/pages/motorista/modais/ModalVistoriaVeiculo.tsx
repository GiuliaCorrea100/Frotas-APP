import React, { useState } from "react";
import {
  Button,
  Box,
  TextField,
  Typography,
  Modal,
  CircularProgress,
  Divider,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { CorridaVistoriaService } from "../../../services/CorridaVistoriaService";
import { modalStyle } from "../../../utils/modalStyle";

interface ModalVistoriaVeiculoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  idCorrida: number;
  nomeMotorista?: string;
}

export default function ModalVistoriaVeiculo({
  open,
  idCorrida,
  onSuccess,
  onClose,
  nomeMotorista
}: ModalVistoriaVeiculoProps) {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<
    "sem_avarias" | "com_observacoes"
  >("sem_avarias");

  const [observacoes, setObservacoes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmarRecebimento = async () => {
    setIsProcessing(true);
    setError(null);

    const semAvariasBool = opcaoSelecionada === "sem_avarias";

    if (!semAvariasBool && !observacoes.trim()) {
      setError(
        "Por favor, preencha o campo de observações relatando as avarias."
      );
      setIsProcessing(false);
      return;
    }

    try {
      await CorridaVistoriaService.registrarVistoria({
        idCorrida,
        tipo: "ENTRADA",
        veiculoRecebidoSemAvarias: semAvariasBool,
        observacoes: semAvariasBool ? undefined : observacoes.trim()
      });

      onSuccess("Vistoria enviada com sucesso! Boa viagem.");
      onClose();

    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Erro ao salvar a vistoria do veículo.";

      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          return;
        }
        onClose();
      }}
      disableEscapeKeyDown={true}
    >
      <Box sx={modalStyle}>
        <Box
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
            <VerifiedUserIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
            Confirmação de recebimento do veículo
          </Typography>
        </Box>

        <Typography
          color="text.secondary"
          variant="body1"
          sx={{ mb: 3, fontWeight: 500 }}
        >
          Verifique as condições do veículo antes de confirmar. Este registro
          ficará vinculado à sua corrida.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <RadioGroup
          value={opcaoSelecionada}
          onChange={(e) => {
            setOpcaoSelecionada(
              e.target.value as "sem_avarias" | "com_observacoes"
            );
            setError(null);
          }}
        >
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControlLabel
              value="sem_avarias"
              control={<Radio color="primary" />}
              label={
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  Veículo recebido sem avarias
                </Typography>
              }
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControlLabel
              value="com_observacoes"
              control={<Radio color="primary" />}
              label={
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  Registrar observações
                </Typography>
              }
            />
          </Box>
        </RadioGroup>

        {opcaoSelecionada === "com_observacoes" && (
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              placeholder="Descreva aqui detalhadamente os amassados, arranhões ou problemas mecânicos identificados na retirada..."
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={observacoes}
              onChange={(e) => {
                setObservacoes(e.target.value);
                setError(null);
              }}
              disabled={isProcessing}
              required
              error={!observacoes.trim() && !!error}
              helperText={
                !observacoes.trim() && !!error
                  ? "Campo Observações:"
                  : ""
              }
              slotProps={{
                input: {
                  style: { color: "inherit" },
                },
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            variant="contained"
            onClick={handleConfirmarRecebimento}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Confirmar"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}