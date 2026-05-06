import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  MenuItem,
  Divider,
  Paper,
} from "@mui/material";
import {
  LocalGasStation,
  CalendarToday,
  Close,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { MultaService } from "../../../services/MultaService";

interface CadastrarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msgSucesso: string, msgAlerta?: string) => void;
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
  const [horaInfracao, setHoraInfracao] = useState<string>("");
  const [autoInfracao, setAutoInfracao] = useState<string>("");
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAutoInfracao("");
      setClassificacao("");
      setCodigoInfracao("");
      setDataInfracao("");
      setHoraInfracao("");
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
      setFileError(`Formato de arquivo não permitido. Extensões permitidas: ${allowedExtensions.join(", ")}`);
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

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    maxLength?: number
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      if (maxLength && value.length > maxLength) return;
      setter(value);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const dataHoraObj = new Date(`${dataInfracao}T${horaInfracao}`);
      const dataHoraInfracaoISO = dataHoraObj.toISOString();
      const codigoInfracaoNum = Number(codigoInfracao);
      const valorInfracaoNum = Number(valorInfracao);
      const autoInfracaoNum = Number(autoInfracao);

      let response;

      if (arquivoSelecionado) {
        const formData = new FormData();
        formData.append("codigoInfracao", codigoInfracaoNum.toString());
        formData.append("classificacao", classificacao);
        formData.append("valorInfracao", valorInfracaoNum.toString());
        formData.append("placaVeiculo", placaVeiculo);
        formData.append("dataInfracao", dataHoraInfracaoISO);
        formData.append("autoInfracao", autoInfracaoNum.toString());
        formData.append("arquivo", arquivoSelecionado);

        response = await MultaService.criarMultaComArquivo(formData);
      } else {
        const dadosMultas = {
          codigoInfracao: codigoInfracaoNum,
          classificacao,
          valorInfracao: valorInfracaoNum,
          placaVeiculo,
          dataInfracao: dataHoraInfracaoISO,
          autoInfracao: autoInfracaoNum,
        };

        response = await MultaService.criarMulta(dadosMultas);
      }

      if (response?.mensagem) {
        onSuccess(
          "Multa cadastrada com sucesso!",
          response.mensagem
        );
      } else {
        onSuccess("Multa cadastrada com sucesso!");
      }

      onClose();
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ display: "flex", alignItems: "center", fontWeight: "bold", pt: 1 }}
          >
            <LocalGasStation color="primary" sx={{ fontSize: 24, mr: 1 }} />
            CADASTRAR MULTA
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            label="Código da Infração"
            type="text"
            inputMode="numeric"
            value={codigoInfracao}
            onChange={(e) => handleNumberInputChange(e, setCodigoInfracao, 8)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            inputProps={{ maxLength: 8 }}
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
            {opcoesClassificacao.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
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
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />

          <TextField
            label="Placa do Veículo"
            value={placaVeiculo}
            onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            placeholder="AAA-0000 ou AAA0A00"
            inputProps={{ maxLength: 8 }}
          />

          <TextField
            label="Auto de Infração"
            type="text"
            inputMode="numeric"
            value={autoInfracao}
            onChange={(e) => handleNumberInputChange(e, setAutoInfracao)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
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
            sx={{ flex: "1 1 calc(50% - 8px)" }}
          />

          <TextField
            label="Hora da Infração"
            type="time"
            fullWidth
            value={horaInfracao}
            onChange={(e) => setHoraInfracao(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            sx={{ flex: "1 1 calc(50% - 8px)" }}
          />

          <Box sx={{ flex: "1 1 100%", mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              disabled={loading}
              sx={{
                textTransform: "none",
                color: "text.primary",
                borderColor: "divider",
                "&:hover": { borderColor: "text.secondary", backgroundColor: "action.hover" },
              }}
            >
              Anexar Boleto
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileSelection} />
            </Button>

            {arquivoSelecionado && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: "action.hover", borderRadius: 1, border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ color: "text.primary" }}>
                    {arquivoSelecionado.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(arquivoSelecionado.size)}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={handleRemoveFile} color="error" disabled={loading}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            )}

            {fileError && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{fileError}</Typography>}
            
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Formatos permitidos: PDF, JPG, JPEG, PNG, DOC, DOCX (Máx: {MAX_FILE_SIZE_MB}MB)
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2, width: "100%" }}>
            <Button variant="outlined" onClick={onClose} sx={{ textTransform: "none" }} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="contained" type="submit" disabled={loading} sx={{ textTransform: "none", minWidth: 100 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Cadastrar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default CadastroMultaModal;