import React, { useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import { CorridaVistoriaService } from "../../../services/CorridaVistoriaService";
import { modalStyle } from "../../../utils/modalStyle";

interface ModalVistoriaVeiculoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  idCorrida: number;
  nomeMotorista?: string;
}

const allowedExtensions = ["jpg", "jpeg", "png"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setOpcaoSelecionada("sem_avarias");
      setObservacoes("");
      setArquivosSelecionados([]);
      setError(null);
    }
  }, [open]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + ["Bytes", "KB", "MB", "GB"][i];
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    const invalidFiles = newFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !extension || !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      setError('Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.');
      return;
    }

    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      setError(`Arquivo(s) muito grande(s). Tamanho máximo: ${MAX_FILE_SIZE_MB}MB por arquivo.`);
      return;
    }

    setArquivosSelecionados(prev => [...prev, ...newFiles]);
    setError(null); 
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setArquivosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmarRecebimento = async () => {
    setIsProcessing(true);
    setError(null);

    const semAvariasBool = opcaoSelecionada === "sem_avarias";

    if (!semAvariasBool) {
      if (!observacoes.trim()) {
        setError("Por favor, preencha o campo de observações relatando as avarias.");
        setIsProcessing(false);
        return;
      }
      if (arquivosSelecionados.length === 0) {
        setError("É obrigatório anexar pelo menos uma foto ao registrar avarias.");
        setIsProcessing(false);
        return;
      }
    }

    try {
      const response = await CorridaVistoriaService.registrarVistoria({
        idCorrida: Number(idCorrida),
        tipo: "RETIRADA",
        veiculoRecebidoSemAvarias: semAvariasBool,
        observacoes: semAvariasBool ? undefined : observacoes.trim()
      });

      const idCorridaVistoria = response?.idCorridaVistoria || response?.id;

      if (!semAvariasBool && arquivosSelecionados.length > 0 && idCorridaVistoria) {
        const formData = new FormData();
        arquivosSelecionados.forEach((file) => {
          formData.append('files', file); 
        });

        await CorridaVistoriaService.salvarFotosVistoria(idCorridaVistoria, formData);
      }

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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
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

            <Box sx={{ mt: 1 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                disabled={isProcessing}
                sx={{
                  color: "text.primary",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "text.secondary",
                  },
                }}
              >
                Anexar Fotos *
                <input
                  type="file"
                  multiple
                  hidden
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileSelection}
                />
              </Button>

              {arquivosSelecionados.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.primary" gutterBottom>
                    Arquivos selecionados ({arquivosSelecionados.length}):
                  </Typography>
                  {arquivosSelecionados.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                        p: 1.5,
                        backgroundColor: "action.hover",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        color="error"
                        disabled={isProcessing}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                Formatos permitidos: JPG, JPEG, PNG (Máx: {MAX_FILE_SIZE_MB}MB por arquivo)
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            variant="contained"
            onClick={handleConfirmarRecebimento}
            disabled={
              isProcessing || 
              (opcaoSelecionada === "com_observacoes" && (!observacoes.trim() || arquivosSelecionados.length === 0))
            }
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