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

const CadastroMultaModal: React.FC<CadastrarModalProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [codigoInfracao, setCodigoInfracao] = useState<number>(0);
  const [classificacao, setClassificacao] = useState("");
  const [valorInfracao, setValorInfracao] = useState<number>(0);
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [dataInfracao, setDataInfracao] = useState<string>("");
  const [autoInfracao, setAutoInfracao] = useState<number>(0);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
    null
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAutoInfracao(0);
      setClassificacao("");
      setCodigoInfracao(0);
      setDataInfracao("");
      setPlacaVeiculo("");
      setValorInfracao(0);
      setArquivoSelecionado(null);
      setFileError(null);
    }
  }, [open]);

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

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Arquivo muito grande. Tamanho máximo: 5MB");
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
      const dataInfracaoUTC = dataInfracao
        ? new Date(dataInfracao)
        : new Date();

      if (arquivoSelecionado) {
        const formData = new FormData();

        formData.append("codigoInfracao", codigoInfracao.toString());
        formData.append("classificacao", classificacao);
        formData.append("valorInfracao", valorInfracao.toString());
        formData.append("placaVeiculo", placaVeiculo);
        formData.append("dataInfracao", dataInfracaoUTC.toISOString());
        formData.append("autoInfracao", autoInfracao.toString());

        formData.append("arquivo", arquivoSelecionado);

        await MultaService.criarMultaComArquivo(formData);
      } else {
        const dadosMultas = {
          codigoInfracao,
          classificacao,
          valorInfracao,
          placaVeiculo,
          dataInfracao: dataInfracaoUTC,
          autoInfracao,
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
            <Typography variant="h6" fontWeight="bold">
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
            type="number"
            value={codigoInfracao}
            onChange={(e) => setCodigoInfracao(Number(e.target.value))}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
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
            type="number"
            value={valorInfracao}
            onChange={(e) => setValorInfracao(Number(e.target.value))}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            }}
          />

          <TextField
            label="Placa do Veículo"
            value={placaVeiculo}
            onChange={(e) => setPlacaVeiculo(e.target.value)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
          />

          <TextField
            label="Auto da Infração"
            type="number"
            value={autoInfracao}
            onChange={(e) => setAutoInfracao(Number(e.target.value))}
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
              Anexar Arquivo da Multa
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
                      {(arquivoSelecionado.size / 1024).toFixed(2)} KB
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
              Formatos permitidos: PDF, JPG, JPEG, PNG, DOC, DOCX (Máx: 5MB)
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