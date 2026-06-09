import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  useTheme,
  CircularProgress,
  Alert
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { CorridaVistoriaService } from "../../../services/CorridaVistoriaService";

interface ModalVistoriaVeiculoProps {
  open: boolean;
  idCorrida: number;
  onSuccess: () => void;
}

export default function ModalVistoriaVeiculo({
  open,
  idCorrida,
  onSuccess
}: ModalVistoriaVeiculoProps) {
  const theme = useTheme();

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
        idCorrida: idCorrida,
        tipo: "ENTRADA",
        veiculoRecebidoSemAvarias: semAvariasBool,
        observacoes: semAvariasBool ? undefined : observacoes.trim()
      });

      onSuccess();
    } catch (err: any) {
      console.error("Erro ao registrar vistoria:", err);
      const msg =
        err.response?.data?.message ||
        "Erro ao salvar a vistoria do veículo.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (
          reason === "backdropClick" ||
          reason === "escapeKeyDown"
        ) {
          return;
        }
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0px 8px 32px rgba(0, 0, 0, 0.5)"
              : "0px 8px 32px rgba(0, 0, 0, 0.15)",
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)"
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: theme.palette.text.primary,
          pt: 3
        }}
      >
        <VerifiedUserIcon color="primary" sx={{ fontSize: 28 }} />
        Confirmação de recebimento do veículo
      </DialogTitle>

      <DialogContent>
        <Typography
          color="text.secondary"
          variant="body1"
          sx={{ mb: 3, fontWeight: 500 }}
        >
          Verifique as condições do veículo antes de confirmar. Este registro
          ficará vinculado à sua corrida.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
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
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${
                opcaoSelecionada === "sem_avarias"
                  ? theme.palette.primary.main
                  : theme.palette.divider
              }`,
              backgroundColor:
                opcaoSelecionada === "sem_avarias"
                  ? theme.palette.mode === "dark"
                    ? "rgba(25, 118, 210, 0.08)"
                    : "rgba(25, 118, 210, 0.04)"
                  : "transparent",
              mb: 2
            }}
          >
            <FormControlLabel
              value="sem_avarias"
              control={<Radio color="primary" />}
              label={
                <Typography variant="body2" fontWeight={500}>
                  Veículo recebido sem avarias
                </Typography>
              }
            />
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${
                opcaoSelecionada === "com_observacoes"
                  ? theme.palette.primary.main
                  : theme.palette.divider
              }`,
              backgroundColor:
                opcaoSelecionada === "com_observacoes"
                  ? theme.palette.mode === "dark"
                    ? "rgba(25, 118, 210, 0.08)"
                    : "rgba(25, 118, 210, 0.04)"
                  : "transparent",
              mb: 2
            }}
          >
            <FormControlLabel
              value="com_observacoes"
              control={<Radio color="primary" />}
              label={
                <Typography variant="body2" fontWeight={500}>
                  Registrar observações
                </Typography>
              }
            />
          </Box>
        </RadioGroup>

        {opcaoSelecionada === "com_observacoes" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mt: 2,
              mb: 1
            }}
          >
            <Typography
              variant="body2"
              color="error.main"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 500
              }}
            >
              <ReportProblemIcon sx={{ fontSize: 16 }} />
              Campo Observações:
            </Typography>

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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2
                }
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic", mt: 0.5 }}
            >
              * Nota: Os uploads de fotos serão integrados na próxima etapa.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleConfirmarRecebimento}
          variant="contained"
          color="primary"
          disabled={isProcessing}
          fullWidth
          sx={{
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold"
          }}
        >
          {isProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Confirmar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}