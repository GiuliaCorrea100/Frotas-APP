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
  Chip,
  Tooltip,
} from "@mui/material";

import {
  Close,
  Warning,
  Description,
  CloudUpload,
} from "@mui/icons-material";

import {
  OcorrenciaDto,
  ArquivoOcorrenciaDto,
  OcorrenciaService,
} from "../../../../services/OcorrenciaService";

import axiosConnect from "../../../../services/axios/axiosConnect";
import { modalStyle } from "../../../../utils/modalStyle";
import { CorridaFrontend } from "../../../../services/CorridaService";

interface ModalEditarOcorrenciaProps {
  open: boolean;
  ocorrencia: OcorrenciaDto | null;
  corrida: CorridaFrontend;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const allowedExtensions = ["jpg", "jpeg", "png", "doc", "docx", "pdf"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ModalEditarOcorrencia: React.FC<ModalEditarOcorrenciaProps> = ({
  open,
  ocorrencia,
  corrida,
  onClose,
  onSuccess,
  onError,
}) => {
  const [descricao, setDescricao] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idMotorista, setIdMotorista] = useState<number | "">("");

  // Estados de Arquivos (Padrão Veículo)
  const [arquivosExistentes, setArquivosExistentes] = useState<ArquivoOcorrenciaDto[]>([]);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

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

  const minDate = dataMinima ? dataMinima.toISOString().slice(0, 10) : undefined;
  const maxDate = dataLimite.toISOString().slice(0, 10);

  const extrairNomeArquivo = (url: string): string => {
    if (!url) return "Arquivo";
    return url.split("/").pop() || "Arquivo";
  };

  useEffect(() => {
    const carregarDadosEdicao = async () => {
      if (open && ocorrencia) {
        setDescricao(ocorrencia.descricao || "");

        if (ocorrencia.dataOcorrencia) {
          let dataObj: Date;
          if (typeof ocorrencia.dataOcorrencia === "string") {
            const dateString = (ocorrencia.dataOcorrencia as string).includes("T")
              ? (ocorrencia.dataOcorrencia as string).split("T")[0]
              : ocorrencia.dataOcorrencia;
            dataObj = new Date(dateString + "T00:00:00");
          } else {
            dataObj = ocorrencia.dataOcorrencia;
          }
          setDataOcorrencia(dataObj.toISOString().slice(0, 10));
        } else {
          setDataOcorrencia("");
        }

        setIdMotorista(ocorrencia.idMotorista || "");
        setArquivosSelecionados([]);
        setFileError(null);
        setErrors({});
        setSuccessMessage("");

        try {
          const arquivos = await OcorrenciaService.buscarArquivosOcorrencia(ocorrencia.idOcorrencia);
          setArquivosExistentes(arquivos);
        } catch (error) {
          console.error("Erro ao carregar arquivos da ocorrência:", error);
          setArquivosExistentes([]);
        }
      }
    };

    carregarDadosEdicao();
  }, [open, ocorrencia]);

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

  const formatarDataParaEnvio = (dateStr: string): string => {
    const [ano, mes, dia] = dateStr.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setHours(0, 0, 0, 0);
    return data.toISOString();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    const invalidFiles = newFiles.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return !ext || !allowedExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      setFileError(`Formato não permitido. Permitidos: ${allowedExtensions.join(", ")}`);
      return;
    }

    const oversizedFiles = newFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      setFileError(`Arquivo(s) muito grande(s). Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setArquivosSelecionados((prev) => [...prev, ...newFiles]);
    setFileError(null);
    event.target.value = "";
  };

  const handleRemoveSelectedFile = (index: number) => {
    setArquivosSelecionados((prev) => prev.filter((_, i) => i !== index));
  };

  // Exclusão direta no banco seguindo o padrão de veículo
  const handleRemoverArquivoExistente = async (idArquivo?: number) => {
    if (!idArquivo) return;

    try {
      setLoading(true);
      await OcorrenciaService.excluirArquivoOcorrencia(idArquivo);
      setArquivosExistentes((prev) =>
        prev.filter((arq) => (arq.idArquivoOcorrencia ?? (arq as any).idOcorrenciaArquivo) !== idArquivo)
      );
    } catch (error) {
      console.error("Erro ao remover anexo:", error);
      setErrors({ submit: "Erro ao remover arquivo existente." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!ocorrencia || !validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const dadosAtualizados = {
        descricao: descricao.trim(),
        idMotorista: idMotorista,
        dataOcorrencia: formatarDataParaEnvio(dataOcorrencia),
      };

      await axiosConnect.patch(`/ocorrencia/${ocorrencia.idOcorrencia}`, dadosAtualizados);

      if (arquivosSelecionados.length > 0) {
        const formData = new FormData();
        arquivosSelecionados.forEach((file) => {
          formData.append("files", file);
        });

        await OcorrenciaService.salvarArquivosOcorrencia(ocorrencia.idOcorrencia, formData);
      }

      const mensagem = "Ocorrência atualizada com sucesso!";
      setSuccessMessage(mensagem);

      setTimeout(() => {
        onSuccess(mensagem);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao editar ocorrência:", error);
      if (error.response?.status === 401) {
        onError("Sessão expirada. Faça login novamente.");
      } else {
        setErrors({
          submit: error.response?.data?.message || "Erro ao editar ocorrência",
        });
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
            <Warning color="primary" sx={{ fontSize: 24, mr: 1 }} />
            EDITAR OCORRÊNCIA
          </Typography>

          <IconButton onClick={onClose} disabled={loading || isSubmitting}>
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

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                if (errors.descricao) {
                  setErrors((prev) => {
                    const newErr = { ...prev };
                    delete newErr.descricao;
                    return newErr;
                  });
                }
              }}
              fullWidth
              required
              multiline
              rows={3}
              variant="outlined"
              error={!!errors.descricao}
              helperText={errors.descricao}
              disabled={!!successMessage || loading || isSubmitting}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Data da ocorrência"
              type="date"
              fullWidth
              value={dataOcorrencia}
              onChange={(e) => {
                setDataOcorrencia(e.target.value);
                if (errors.dataOcorrencia) {
                  setErrors((prev) => {
                    const newErr = { ...prev };
                    delete newErr.dataOcorrencia;
                    return newErr;
                  });
                }
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: minDate, max: maxDate }}
              required
              error={!!errors.dataOcorrencia}
              helperText={errors.dataOcorrencia}
              disabled={!!successMessage || loading || isSubmitting}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="motorista-label">Motorista Responsável</InputLabel>
              <Select
                labelId="motorista-label"
                value={idMotorista}
                onChange={(e) => setIdMotorista(e.target.value as number | "")}
                label="Motorista Responsável"
                disabled={loading || isSubmitting || !!successMessage}
              >
                <MenuItem value="">
                  <em>Selecione o motorista</em>
                </MenuItem>
                {corrida.motoristas?.map((m) => (
                  <MenuItem key={m.idMotorista} value={m.idMotorista}>
                    {m.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Seção de Anexos no Padrão do Modal de Veículo */}
          <Box
            sx={{
              flex: "1 1 100%",
              mt: 2,
              mb: 2,
              p: 2,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              gutterBottom
              color="text.primary"
            >
              ANEXOS DA OCORRÊNCIA
            </Typography>

            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              {arquivosExistentes.map((arquivo) => {
                const idArq = arquivo.idArquivoOcorrencia ?? (arquivo as any).idOcorrenciaArquivo;
                const nomeArquivo = extrairNomeArquivo(arquivo.urlArquivo);

                return (
                  <Tooltip key={`existente-${idArq}`} title="Clique no 'X' para remover o anexo">
                    <Chip
                      icon={<Description />}
                      label={nomeArquivo}
                      onDelete={() => handleRemoverArquivoExistente(idArq)}
                      color="primary"
                      variant="outlined"
                      disabled={loading || isSubmitting}
                      onClick={() => window.open(arquivo.urlArquivo, "_blank")}
                      sx={{ maxWidth: "100%", cursor: "pointer" }}
                    />
                  </Tooltip>
                );
              })}

              {arquivosExistentes.length === 0 && arquivosSelecionados.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Nenhum anexo registrado.
                </Typography>
              )}

              <Button
                variant="contained"
                component="label"
                size="small"
                startIcon={<CloudUpload />}
                color={arquivosSelecionados.length > 0 ? "success" : "inherit"}
                disabled={loading || isSubmitting}
                sx={{ textTransform: "none" }}
              >
                {arquivosSelecionados.length > 0 ? "Anexar Mais" : "Adicionar Arquivos"}
                <input
                  type="file"
                  multiple
                  hidden
                  accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"
                  onChange={handleFileSelection}
                />
              </Button>

              {arquivosSelecionados.map((file, index) => (
                <Chip
                  key={`novo-${index}`}
                  label={`Upload pendente: ${file.name}`}
                  size="small"
                  color="success"
                  onDelete={() => handleRemoveSelectedFile(index)}
                  disabled={loading || isSubmitting}
                />
              ))}
            </Box>

            {fileError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {fileError}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.5 }}
            >
              Formatos permitidos: JPG, JPEG, PNG, DOC, DOCX, PDF (Máx: {MAX_FILE_SIZE_MB}MB por arquivo)
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ textTransform: "none" }}
              disabled={loading || isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: "none", minWidth: 100 }}
              disabled={loading || isSubmitting || !descricao.trim() || !dataOcorrencia || !!successMessage}
            >
              {loading || isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Salvar"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalEditarOcorrencia;