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
} from "@mui/material";
import {
  LocalGasStation,
  CalendarToday,
  Close,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { MultaService } from '../../../services/MultaService';

interface CadastrarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
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

const opcoesClassificacao = [
  { value: "LEVE", label: "LEVE" },
  { value: "MEDIA", label: "MÉDIA" },
  { value: "GRAVE", label: "GRAVE" },
  { value: "GRAVISSIMA", label: "GRAVÍSSIMA" },
];

const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const CadastroMultaModal: React.FC<CadastrarModalProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [codigoInfracao, setCodigoInfracao] = useState<string>("");
  const [classificacao, setClassificacao] = useState("");
  const [valorInfracao, setValorInfracao] = useState<string>("");
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [dataInfracao, setDataInfracao] = useState<string>("");
  const [autoInfracao, setAutoInfracao] = useState<string>("");
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
    null
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAutoInfracao("");
      setClassificacao("");
      setCodigoInfracao("");
      setDataInfracao("");
      setPlacaVeiculo("");
      setValorInfracao("");
      setArquivoSelecionado(null);
      setFileError(null);
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
    setLoading(true);

    try {
      const codigoInfracaoNum = codigoInfracao ? Number(codigoInfracao) : 0;
      const valorInfracaoNum = valorInfracao ? Number(valorInfracao) : 0;
      const autoInfracaoNum = autoInfracao ? Number(autoInfracao) : 0;

      if (arquivoSelecionado) {
        const formData = new FormData();

        formData.append("codigoInfracao", codigoInfracaoNum.toString());
        formData.append("classificacao", classificacao);
        formData.append("valorInfracao", valorInfracaoNum.toString());
        formData.append("placaVeiculo", placaVeiculo);
        formData.append("dataInfracao", dataInfracao);
        formData.append("autoInfracao", autoInfracaoNum.toString());
        formData.append("arquivo", arquivoSelecionado);

        await MultaService.criarMultaComArquivo(formData);
      } else {
        const dadosMultas = {
          codigoInfracao: codigoInfracaoNum,
          classificacao,
          valorInfracao: valorInfracaoNum,
          placaVeiculo,
          dataInfracao,
          autoInfracao: autoInfracaoNum,
        };
        await MultaService.criarMulta(dadosMultas);
      }

      onSuccess("Multa cadastrada com sucesso");
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
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
            <LocalGasStation color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Cadastro de Multa
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexWrap="wrap"
          gap={2}
        >
          <TextField
            label="Código da Infração"
            type="text"
            inputMode="numeric"
            value={codigoInfracao}
            onChange={(e) => handleNumberInputChange(e, setCodigoInfracao)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            placeholder=""
          />

          <TextField
            select
            label="Classificação"
            value={classificacao}
            onChange={(e) => setClassificacao(e.target.value)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
          >
            {opcoesClassificacao.map((opcao) => (
              <MenuItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Valor da multa (R$)"
            type="text"
            inputMode="decimal"
            value={valorInfracao}
            onChange={(e) => handleNumberInputChange(e, setValorInfracao)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            }}
            placeholder=""
          />

          <TextField
            label="Placa do Veículo"
            value={placaVeiculo}
            onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            placeholder="AAA-0000 ou AAA0A00"
            inputProps={{
              maxLength: 8,
            }}
          />

          <TextField
            label="Auto da Infração"
            type="text"
            inputMode="numeric"
            value={autoInfracao}
            onChange={(e) => handleNumberInputChange(e, setAutoInfracao)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            placeholder=""
          />

          <TextField
            label="Data da Infração"
            type="date"
            fullWidth
            value={dataInfracao}
            onChange={(e) => setDataInfracao(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: "1 1 100%", mt: 1 }}
          />

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
              Anexar Boleto
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

export default CadastroMultaModal;