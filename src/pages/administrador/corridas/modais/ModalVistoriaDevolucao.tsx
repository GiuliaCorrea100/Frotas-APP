import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Alert,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  Close,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { CorridaDto, CorridaService } from "../../../../services/CorridaService";
import { CarroService } from "../../../../services/CarroService";
import { CorridaVistoriaService } from "../../../../services/CorridaVistoriaService";

interface VistoriaDevolucaoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
  corrida: CorridaDto;
  idMotoristaDevolucao: number;
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

const allowedExtensions = ["jpg", "jpeg", "png"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const VistoriaDevolucaoModal: React.FC<VistoriaDevolucaoProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida,
  idMotoristaDevolucao,
}) => {
  const [observacao, setObservacao] = useState<string>("");
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensagemMotorista, setMensagemMotorista] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [avariado, setAvariado] = useState(false);

  const handleClose = () => {
    setAvariado(false);
    setArquivosSelecionados([]);
    setObservacao("");
    setFileError(null);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setObservacao("");
      setArquivosSelecionados([]);
      setFileError(null);
      setMensagemMotorista(null);
      setAvariado(false);
      setSuccessMessage('');
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

    const newFiles = Array.from(files);
    
    const invalidFiles = newFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !extension || !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      setFileError('Formato de arquivo inválido. Apenas arquivos JPG, JPEG, PNG são permitidos.');
      return;
    }

    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      setFileError(`Arquivo(s) muito grande(s). Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setArquivosSelecionados(prev => [...prev, ...newFiles]);
    setFileError(null); 
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setArquivosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (avariado && arquivosSelecionados.length === 0) {
      setFileError("É obrigatório anexar fotos quando o veículo for devolvido com avarias");
      return;
    }

    setLoading(true);
    
    try {
      const observacaoFinal = !avariado ? "sem avarias" : observacao;

      const dadosVistoria = {
        idCorrida: corrida?.idCorrida,
        tipo: "DEVOLUCAO" as const,
        veiculoRecebidoSemAvarias: !avariado,
        observacoes: observacaoFinal
      };

      const response = await CorridaVistoriaService.registrarVistoria(dadosVistoria);

      if (arquivosSelecionados.length > 0) {
        const formData = new FormData();
        arquivosSelecionados.forEach((file) => {
          formData.append('files', file); 
        });

        await CorridaVistoriaService.salvarFotosVistoria(response.idCorridaVistoria, formData, 'DEVOLUCAO');
      }

      await CorridaService.confirmarReceberChave(corrida.idCorrida, idMotoristaDevolucao);

      await CarroService.atualizarSituacaoCarro(corrida.idCarro, "DISPONIVEL");

      const mensagem = "Chave recebida e vistoria realizada com sucesso"; 
      onSuccess(mensagem);
      handleClose();
    } catch (error) {
      const mensagem = "Erro ao processar vistoria e recebimento da chave";
      console.error("Erro ao processar vistoria e recebimento da chave:", error);
      onError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <Typography 
              variant="h6" 
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: 24, 
                pt: 1,
              }}
            >
              <AssignmentIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
              Vistoria de Devolução
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "text.primary" }}>
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
          flexDirection="column"
          gap={2}
        >
          <Box>
            <RadioGroup
              value={avariado ? "com_avaria" : "sem_avaria"}
              name="controlled-radio-buttons-group"
              sx={{ mb: 2 }}
            >
              <FormControlLabel 
                value="sem_avaria" 
                control={<Radio color="primary" />} 
                label={
                  <Typography variant="body2" color="text.primary" fontWeight={500}>
                    Veículo devolvido sem avarias
                  </Typography>
                }
                onChange={() => setAvariado(false)} 
              />
              <FormControlLabel 
                value="com_avaria" 
                control={<Radio color="primary" />} 
                label={
                  <Typography variant="body2" color="text.primary" fontWeight={500}>
                    Veículo devolvido com avarias
                  </Typography>
                } 
                onChange={() => setAvariado(true)}
              />
            </RadioGroup>
          </Box>

          {avariado && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Registre as avarias detectadas no momento da devolução"
                multiline
                rows={4}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                variant="outlined"
                disabled={loading}
                required
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
                  Anexar Fotos {arquivosSelecionados.length === 0 && "*"}
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
                    <Typography variant="subtitle2" gutterBottom color="text.primary">
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
                          disabled={loading}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
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
                  Formatos permitidos: JPG, JPEG, PNG (Máx: {MAX_FILE_SIZE_MB}MB por arquivo)
                  {arquivosSelecionados.length === 0 && (
                    <span style={{ color: "#d32f2f", display: "block", marginTop: "4px" }}>
                      * Obrigatório anexar pelo menos uma foto quando há avarias
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>
          )}

          {mensagemMotorista && (
            <Box
              sx={{
                width: "100%",
                p: 2,
                mt: 1,
                borderRadius: 1,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "warning.main",
              }}
            >
              <Typography color="warning.main" fontWeight="bold">
                {mensagemMotorista}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ textTransform: "none", color: "text.primary", borderColor: "divider" }}
              disabled={loading || !!successMessage}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                loading || 
                !!successMessage ||
                (avariado && (!observacao.trim() || arquivosSelecionados.length === 0))
              }
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default VistoriaDevolucaoModal;