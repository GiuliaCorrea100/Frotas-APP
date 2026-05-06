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
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  LocalGasStation,
  CalendarToday,
  Close,
  Delete,
  Person,
  Description,
  CloudUpload,
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
  const [codigoInfracao, setCodigoInfracao] = useState<string>("0");
  const [classificacao, setClassificacao] = useState("");
  const [valorInfracao, setValorInfracao] = useState<number>(0);
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [dataInfracao, setDataInfracao] = useState<string>("");
  const [autoInfracao, setAutoInfracao] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arquivoAtual, setArquivoAtual] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"success" | "error" | "warning" | "info">("success");

  useEffect(() => {
    if (multa) {
      setCodigoInfracao(multa.codigoInfracao.toString());
      setValorInfracao(multa.valorInfracao);
      setAutoInfracao(multa.autoInfracao);
      setClassificacao(multa.classificacao);
      setPlacaVeiculo(multa.placaVeiculo);
      setDataInfracao(formatDateForInput(multa.dataInfracao));
      setArquivoAtual((multa as any).urlArquivo || null);
      setArquivo(null);
      setMensagem("");
    }
  }, [multa]);

  const formatDateForInput = (date: any): string => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime()) ? dateObj.toISOString().split("T")[0] : "";
  };

  const extrairNomeArquivo = (url: string): string => {
    if (!url) return "";
    return url.split("/").pop() || "boleto_multa.pdf";
  };

  const handleRemoverArquivoAtual = async () => {
    if (!multa?.idMulta || !arquivoAtual) return;

    try {
      setLoading(true);
      await MultaService.removerArquivoMulta(multa.idMulta);
      setArquivoAtual(null);


      setMensagem("Boleto removido com sucesso!");
      setTipoMensagem("success");
    } catch {
      setMensagem("Erro ao remover boleto.");
      setTipoMensagem("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      if (value.length <= 8) {
        setCodigoInfracao(value);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const dataInfracaoUTC = new Date(dataInfracao + "T04:00:00.000Z");

      const dadosMultas = {
        codigoInfracao: Number(codigoInfracao),
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
        await MultaService.atualizarArquivoMulta(multa?.idMulta!, formData);
      }
      onSuccess("Multa atualizada com sucesso!");
      onClose();
    } catch (error) {
      setMensagem("Erro ao atualizar multa");
      setTipoMensagem("error");
      onError(error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalGasStation color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }} color="text.primary">
              Editar Multa
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: "action.hover", 
          borderRadius: 2, 
          border: "1px solid",
          borderColor: "divider" 
        }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Person color="action" fontSize="small" />
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
              Motorista Responsável
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="bold" color="primary.main">
            {multa?.nomeMotorista || multa?.motorista?.nome || "Não identificado"}
          </Typography>

          {multa?.motorista?.email && (
            <Typography variant="body2" color="text.secondary">
              {multa.motorista.email}
            </Typography>
          )}

        </Box>


        {mensagem && (
          <Alert severity={tipoMensagem} onClose={() => setMensagem("")} sx={{ mb: 2 }}>
            {mensagem}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexWrap="wrap" gap={2}>
          <TextField 
            label="Código da Infração" 
            type="text" 
            inputMode="numeric"
            value={codigoInfracao} 
            onChange={handleCodigoChange} 
            required 
            sx={{ flex: "1 1 calc(50% - 8px)" }} 
            inputProps={{ maxLength: 8 }}
          />
          <TextField select label="Classificação" value={classificacao} onChange={(e) => setClassificacao(e.target.value)} required sx={{ flex: "1 1 calc(50% - 8px)" }}>
            {opcoesClassificacao.map((opcao) => (
              <MenuItem key={opcao.value} value={opcao.value}>{opcao.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Valor (R$)" type="number" value={valorInfracao} onChange={(e) => setValorInfracao(Number(e.target.value))} required sx={{ flex: "1 1 calc(50% - 8px)" }} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
          <TextField label="Placa" value={placaVeiculo} onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())} required sx={{ flex: "1 1 calc(50% - 8px)" }} />
          <TextField label="Auto da Infração" type="number" value={autoInfracao} onChange={(e) => setAutoInfracao(Number(e.target.value))} required sx={{ flex: "1 1 calc(50% - 8px)" }} />
          <TextField label="Data" type="date" value={dataInfracao} onChange={(e) => setDataInfracao(e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} sx={{ flex: "1 1 calc(50% - 8px)" }} />

          <Box sx={{ 
            flex: "1 1 100%", 
            mt: 2, 
            p: 2, 
            border: "1px dashed", 
            borderColor: "divider",
            borderRadius: 2 
          }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.primary">
              BOLETO
            </Typography>

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              {arquivoAtual ? (
                <Tooltip title="Clique para remover o arquivo atual">
                  <Chip
                    icon={<Description />}
                    label={extrairNomeArquivo(arquivoAtual)}
                    onDelete={handleRemoverArquivoAtual}
                    color="primary"
                    variant="outlined"
                    sx={{ maxWidth: "100%" }}
                  />
                </Tooltip>
              ) : (
                <Typography variant="body2" color="text.secondary">Nenhum boleto anexado.</Typography>
              )}

              <Button
                variant="contained"
                component="label"
                size="small"
                startIcon={<CloudUpload />}
                color={arquivo ? "success" : "inherit"}
                sx={{ textTransform: "none" }}
              >
                {arquivo ? "Trocar Seleção" : "Selecionar Novo"}
                <input type="file" hidden onChange={(e) => e.target.files && setArquivo(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
              </Button>

              {arquivo && (
                <Chip 
                  label={`Upload pendente: ${arquivo.name}`} 
                  size="small" 
                  color="success" 
                  onDelete={() => setArquivo(null)} 
                />
              )}
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1} mt={3} sx={{ flex: "1 1 100%" }}>
            <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || uploading} 
              sx={{ textTransform: "none", minWidth: 120 }}
            >
              {loading || uploading ? <CircularProgress size={24} /> : "Salvar Alterações"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default EditarMultaModal;