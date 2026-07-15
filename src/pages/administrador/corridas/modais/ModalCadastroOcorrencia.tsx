import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { OcorrenciaService } from "../../../../services/OcorrenciaService";
import { Close, Warning } from "@mui/icons-material";
import { modalStyle } from "../../../../utils/modalStyle";
import { CorridaFrontend } from "../../../../services/CorridaService";

interface CadastrarOcorrenciaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  chaveEmprestada: boolean;
  onError: (error: any) => void;
  corrida: CorridaFrontend;
  dataRegistro?: Date;
}

const CadastrarOcorrencia: React.FC<CadastrarOcorrenciaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida,
}) => {
  const [descricao, setDescricao] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idMotorista, setIdMotorista] = useState<number | "">("");

  const dataMinima = corrida?.dataHoraLiberacaoChave
    ? new Date(corrida.dataHoraLiberacaoChave)
    : null;

  if (dataMinima) {
    dataMinima.setHours(0, 0, 0, 0);
  }

  const dataLimite = corrida?.dataHoraRecebimentoChave
    ? new Date(corrida.dataHoraRecebimentoChave)
    : new Date();
  dataLimite.setHours(0, 0, 0, 0);

  const minDate = dataMinima
    ? dataMinima.toISOString().slice(0, 10)
    : undefined;
  const maxDate = dataLimite.toISOString().slice(0, 10);

  useEffect(() => {
    if (open) {
      setDescricao("");
      setDataOcorrencia("");
      setErrors({});
      setSuccessMessage("");
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    }

    if (!dataOcorrencia) {
      newErrors.dataOcorrencia = "Data da ocorrência é obrigatória";
    } else {
      const [ano, mes, dia] = dataOcorrencia.split("-").map(Number);
      const dataSelecionada = new Date(ano, mes - 1, dia);
      dataSelecionada.setHours(0, 0, 0, 0);
      
      const apenasData = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

      if (dataMinima && apenasData(dataSelecionada) < apenasData(dataMinima)) {
        newErrors.dataOcorrencia = `Data não pode ser anterior à liberação da chave (${minDate})`;
      } else if (apenasData(dataSelecionada) > apenasData(dataLimite)) {
        newErrors.dataOcorrencia = `Data não pode ser posterior ao encerramento da corrida (${maxDate})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const [ano, mes, dia] = dataOcorrencia.split("-").map(Number);
      const dataOcorrenciaFormatada = new Date(ano, mes - 1, dia);
      dataOcorrenciaFormatada.setHours(0, 0, 0, 0);

      const dadosOcorrencia = {
        descricao: descricao.trim(),
        idCorrida: corrida.idCorrida,
        dataOcorrencia: dataOcorrenciaFormatada,
        idMotorista: idMotorista,
      };

      await OcorrenciaService.criar(dadosOcorrencia);

      const mensagem = "Ocorrência cadastrada com sucesso!";

      setSuccessMessage(mensagem);

      setTimeout(() => {
        onSuccess(mensagem);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao cadastrar ocorrência:", error);

      if (error.response?.status === 401) {
        onError("Sessão expirada. Faça login novamente.");
      } else {
        setErrors({
          submit: error.response?.data?.message || "Erro ao cadastrar ocorrência",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescricao(e.target.value);
    if (errors.descricao) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.descricao;
        return newErrors;
      });
    }
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDataOcorrencia(selectedDate);
    
    if (errors.dataOcorrencia) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.dataOcorrencia;
        return newErrors;
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0,
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
            <Warning color="primary" sx={{ fontSize: 24, mr: 1 }} />
            Cadastrar ocorrência
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Descrição"
            value={descricao}
            onChange={handleDescricaoChange}
            fullWidth
            required
            multiline
            rows={3}
            variant="outlined"
            margin="normal"
            error={!!errors.descricao}
            helperText={errors.descricao}
            disabled={!!successMessage || loading}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Data da ocorrência"
            type="date"
            fullWidth
            value={dataOcorrencia}
            onChange={handleDataChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: minDate,
              max: maxDate,
            }}
            required
            error={!!errors.dataOcorrencia}
            helperText={errors.dataOcorrencia}
            disabled={!!successMessage || loading}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth error={!!errors.idMotorista}>
            <InputLabel id="motorista-label">Motorista Responsável</InputLabel>
            <Select
              labelId="motorista-label"
              name="idMotorista"
              value={idMotorista}
              onChange={(e) => setIdMotorista(e.target.value as number | "")}
              label="Motorista Responsável"
              disabled={loading || !!successMessage}
            >
              <MenuItem value="">
                <em>Selecione o motorista</em>
              </MenuItem>
              {corrida?.motoristas?.map((m) => (
                <MenuItem key={m.idMotorista} value={String(m.idMotorista)}>
                  {m.nome}
                </MenuItem>
              ))}
            </Select>
            {errors.idMotorista && (
              <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                {errors.idMotorista}
              </Typography>
            )}
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading ||
              !descricao.trim() ||
              !dataOcorrencia ||
              !!successMessage
            }
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CadastrarOcorrencia;