import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  IconButton,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  Close,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { RecursoService } from "../../../services/RecursoService";

interface SolcitarRecursoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
  multaId?: number; 
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 700,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const SolicitarRecursoModal: React.FC<SolcitarRecursoProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  multaId, 
}) => {
  const [justificativa, setJustificativa] = useState<string>("");
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
    null
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensagemMotorista, setMensagemMotorista] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    if (open) {
      setJustificativa("");
      setArquivoSelecionado(null);
      setFileError(null);
      setMensagemMotorista(null);
    }
  }, [open]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFileExtension = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      setFileError(
        `Formato de arquivo não permitido. Extensões permitidas: ${allowedExtensions.join(
          ", "
        )}`
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (validateFileExtension(file)) {
      setArquivoSelecionado(file);
    }

    event.target.value = "";
  };

  const handleRemoveFile = () => {
    setArquivoSelecionado(null);
    setFileError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    
    if (!multaId) {
      onError(new Error("ID da multa não encontrado"));
      return;
    }

    setLoading(true);
    

    try {
      let response;

      const formData = new FormData();
      formData.append("idMulta", multaId.toString()); 
      formData.append("justificativa", justificativa);

      if (arquivoSelecionado) {
        formData.append("arquivo", arquivoSelecionado);
      }

      response = await RecursoService.solicitarRecurso(formData);

      if (response?.mensagem) {
        setMensagemMotorista(response.mensagem);
        setTimeout(() => {
          setMensagemMotorista(null);
          onClose();
        }, 3000);
      } else {
    
        setSuccessMessage("Recurso solicitado com sucesso!"); // Mova para cá
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 3000);
      }
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center">
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Solicitar recurso de multa
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
        )}


        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexWrap="wrap"
          gap={2}
        >
          {/* Campo de justificativa */}
          <Box sx={{ flex: "1 1 100%" }}>
            <TextField
              fullWidth
              label="Justificativa"
              multiline
              rows={4}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Digite sua justificativa para o recurso..."
              variant="outlined"
              disabled={loading}
              required
            />
          </Box>

          <Box sx={{ flex: "1 1 100%", mt: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              disabled={loading}
              sx={{
                mr: 2,
                color: "text.primary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "text.secondary",
                  backgroundColor: "action.hover",
                },
              }}
            >
              Anexar Documentos
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelection}
              />
            </Button>

            {arquivoSelecionado && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Arquivo selecionado:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                    p: 2,
                    backgroundColor: "action.hover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {arquivoSelecionado.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(arquivoSelecionado.size)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handleRemoveFile}
                    color="error"
                    disabled={loading}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}

            {fileError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {fileError}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Formatos permitidos: PDF, JPG, JPEG, PNG, DOC, DOCX (Máx: {MAX_FILE_SIZE_MB}MB)
            </Typography>
          </Box>

          {mensagemMotorista && (
            <Box
              sx={{
                width: "100%",
                p: 2,
                mt: 2,
                borderRadius: 1,
                backgroundColor: "#FFF4E5",
                border: "1px solid #FFA726",
              }}
            >
              <Typography color="warning.main" fontWeight="bold">
                {mensagemMotorista}
              </Typography>
            </Box>
          )}

          <Box
            display="flex"
            justifyContent="flex-end"
            gap={1}
            mt={3}
            sx={{ flex: "1 1 100%" }}
          >
            <Button onClick={onClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Cadastrar"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default SolicitarRecursoModal;