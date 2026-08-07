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
} from "@mui/material";
import { OcorrenciaService } from "../../../../services/OcorrenciaService";
import { Close, Warning, AttachFile as AttachFileIcon, } from "@mui/icons-material";
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
  cadastroMotorista?: number;
}

const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const CadastrarOcorrencia: React.FC<CadastrarOcorrenciaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida,
  cadastroMotorista,
}) => {
  const [descricao, setDescricao] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idMotorista, setIdMotorista] = useState<number | undefined>(cadastroMotorista);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
      null
    );
  const [fileError, setFileError] = useState<string | null>(null);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);

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

    if (!cadastroMotorista) {
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

      if (!idMotorista) {
        newErrors.idMotorista = "Selecione um motorista";
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
      let dataOcorrenciaFormatada: Date;
      let motorista: number | undefined;
      let enviadoMotorista: boolean;

      if (cadastroMotorista) {
        dataOcorrenciaFormatada = new Date();
        motorista = cadastroMotorista;
        enviadoMotorista = true;
      } else {
        const [ano, mes, dia] = dataOcorrencia.split("-").map(Number);
        dataOcorrenciaFormatada = new Date(ano, mes - 1, dia);
        dataOcorrenciaFormatada.setHours(0, 0, 0, 0);

        motorista = idMotorista;
        enviadoMotorista = false;
      }

      console.log(enviadoMotorista);

      const payload = {
        descricao: descricao.trim(),
        idCorrida: corrida.idCorrida,
        dataOcorrencia: dataOcorrenciaFormatada.toISOString(),
        enviadoMotorista: enviadoMotorista,
        idMotorista: motorista
      };

      const response = await OcorrenciaService.criar(payload);
      console.log(response.idOcorrencia);

      if (arquivosSelecionados.length > 0) {
        const formData = new FormData();
        arquivosSelecionados.forEach((file) => {
          formData.append('files', file);
        });

        console.log("salvando foto");
        await OcorrenciaService.salvarArquivosOcorrencia(response.idOcorrencia, formData);
      }

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
          submit:
            error.response?.data?.message ||
            "Erro ao cadastrar ocorrência",
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
                          sx={{ display: "block", mt: 1, mb: 4 }}
                        >
                          Formatos permitidos: JPG, JPEG, PNG (Máx: {MAX_FILE_SIZE_MB}MB por arquivo)
                        </Typography>
                      </Box>

        
        
        { !cadastroMotorista  && (
          <Box sx={{ mb: 2 }}>
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

            <FormControl fullWidth error={!!errors.idMotorista}>
              <InputLabel id="motorista-label">Motorista Responsável</InputLabel>
              <Select
                labelId="motorista-label"
                name="idMotorista"
                value={idMotorista}
                onChange={(e) => setIdMotorista(Number(e.target.value) || undefined)}
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


        )}
        

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
              (!cadastroMotorista && !dataOcorrencia) ||
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