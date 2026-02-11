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
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import {
  LocalGasStation,
  CalendarToday,
  Close,
  AttachFile,
  Download,
  Delete,
  Person,
} from "@mui/icons-material";
import { MultaDto, MultaService } from "../../../services/MultaService";

interface EdicaoModalProps {
  open: boolean;
  multa: MultaDto | null;
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

const EditarMultaModal: React.FC<EdicaoModalProps> = ({
  open,
  multa,
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
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arquivoAtual, setArquivoAtual] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const formatDateForInput = (date: any): string => {
    if (!date) return "";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return !isNaN(dateObj.getTime())
        ? dateObj.toISOString().split("T")[0]
        : "";
    } catch {
      return "";
    }
  };

  const extrairNomeArquivo = (url: string): string => {
    if (!url) return "";
    return url.split("/").pop() || "arquivo_anexo";
  };

  const handleDownloadArquivo = async () => {
    if (!arquivoAtual) return;
    try {
      const nomeArquivo = extrairNomeArquivo(arquivoAtual);
      const blob = await MultaService.downloadArquivo(nomeArquivo);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      onError("Erro ao baixar arquivo");
    }
  };

  const handleRemoverArquivoAtual = async () => {
    if (!multa?.idMulta || !arquivoAtual) return;

    try {
      setLoading(true);
      await MultaService.removerArquivoMulta(multa.idMulta);
      setArquivoAtual(null);

      if (multa) {
        (multa as any).urlArquivo = null;
      }

      onSuccess("Arquivo removido com sucesso");
    } catch {
      onError("Erro ao remover arquivo");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setArquivo(event.target.files[0]);
    }
  };

  useEffect(() => {
    if (multa) {
      setCodigoInfracao(multa.codigoInfracao);
      setValorInfracao(multa.valorInfracao);
      setAutoInfracao(multa.autoInfracao);
      setClassificacao(multa.classificacao);
      setPlacaVeiculo(multa.placaVeiculo);
      setDataInfracao(formatDateForInput(multa.dataInfracao));
      setArquivoAtual((multa as any).urlArquivo || null);
      setArquivo(null);
    }
  }, [multa]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const dataInfracaoUTC = new Date(dataInfracao + "T04:00:00.000Z");

      const dadosMultas = {
        codigoInfracao,
        classificacao,
        valorInfracao,
        placaVeiculo,
        dataInfracao: dataInfracaoUTC,
        autoInfracao,
      };

      await MultaService.atualizarMulta(multa?.idMulta!, dadosMultas);

      if (arquivo) {
        setUploading(true);
        const formData = new FormData();
        formData.append("arquivo", arquivo);
        try {
          await MultaService.atualizarArquivoMulta(multa?.idMulta!, formData);
        } finally {
          setUploading(false);
        }
      }

      onSuccess("Multa atualizada com sucesso");
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const getNomeMotorista = () => {
    if (!multa) return "Não identificado";
    
    return multa.nomeMotorista || 
           multa.motorista?.nome || 
           (multa.idMotorista ? `Motorista #${multa.idMotorista}` : "Não identificado");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle} onClick={(e) => e.stopPropagation()}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <LocalGasStation color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Editar Multa
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Person color="primary" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Motorista Responsável
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body1" fontWeight="medium" color="text.primary">
              {getNomeMotorista()}
            </Typography>
          </Box>
          
          {multa?.motorista?.email && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Email: {multa.motorista.email}
            </Typography>
          )}
          
          {!multa?.idMotorista && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Não foi possível identificar o motorista responsável para esta infração.
            </Alert>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} display="flex" flexWrap="wrap" gap={2}>
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
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
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
            <Typography variant="subtitle1" fontWeight="bold" mb={1} color="text.primary">
              Boleto Anexado
            </Typography>

            {arquivoAtual ? (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip
                  icon={<AttachFile />}
                  label={extrairNomeArquivo(arquivoAtual)}
                  variant="outlined"
                  color="primary"
                />
                <IconButton size="small" onClick={handleDownloadArquivo}>
                  <Download />
                </IconButton>
                <IconButton size="small" onClick={handleRemoverArquivoAtual} color="error">
                  <Delete />
                </IconButton>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                Nenhum boleto anexado a esta multa.
              </Alert>
            )}

            <Typography variant="body2" fontWeight="medium" mb={1} color="text.primary">
              {arquivoAtual ? "Substituir boleto" : "Anexar boleto"}
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFile />}
              size="small"
            >
              Selecionar boleto
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </Button>

            {arquivo && (
              <Typography variant="body2" sx={{ mt: 1, color: "success.main" }}>
                Novo boleto selecionado: {arquivo.name}
              </Typography>
            )}
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1} mt={3} sx={{ flex: "1 1 100%" }}>
            <Button onClick={onClose} color="inherit" disabled={loading || uploading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading || uploading}>
              {loading || uploading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Atualizar"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default EditarMultaModal;