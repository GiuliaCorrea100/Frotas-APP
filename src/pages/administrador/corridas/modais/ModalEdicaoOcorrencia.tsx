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

import {
  Close,
  Warning,
  AttachFile as AttachFileIcon,
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

const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
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
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idMotorista, setIdMotorista] = useState<number | "">("");
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

  const minDate = dataMinima
    ? dataMinima.toISOString().slice(0, 10)
    : undefined;

  const maxDate = dataLimite.toISOString().slice(0, 10);

  useEffect(() => {
    const carregarDadosEdicao = async () => {
      if (open && ocorrencia) {
        setDescricao(ocorrencia.descricao || "");

        if (ocorrencia.dataOcorrencia) {
          let dataObj: Date;

          if (typeof ocorrencia.dataOcorrencia === "string") {
            const dateString = ocorrencia.dataOcorrencia.includes("T")
              ? ocorrencia.dataOcorrencia.split("T")[0]
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
          console.error(
            "Erro ao carregar arquivos da ocorrência:",
            error
          );

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
      newErrors.dataOcorrencia =
        "Data da ocorrência é obrigatória";
    } else {
      const [ano, mes, dia] = dataOcorrencia.split("-").map(Number);

      const dataSelecionada = new Date(
        ano,
        mes - 1,
        dia
      );

      dataSelecionada.setHours(0, 0, 0, 0);

      const apenasData = (d: Date) =>
        new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate()
        ).getTime();

      if (
        dataMinima &&
        apenasData(dataSelecionada) <
          apenasData(dataMinima)
      ) {
        newErrors.dataOcorrencia = `Data não pode ser anterior à liberação da chave (${minDate})`;
      } else if (
        apenasData(dataSelecionada) >
        apenasData(dataLimite)
      ) {
        newErrors.dataOcorrencia = `Data não pode ser posterior ao encerramento da corrida (${maxDate})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const formatarDataParaEnvio = (
    dateStr: string
  ): string => {
    const [ano, mes, dia] = dateStr
      .split("-")
      .map(Number);

    const data = new Date(
      ano,
      mes - 1,
      dia
    );

    data.setHours(0, 0, 0, 0);

    return data.toISOString();
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!ocorrencia) return;

    if (!validateForm()) return;

    setLoading(true);

    try {
      const dadosAtualizados = {
        descricao: descricao.trim(),
        idMotorista: idMotorista,
        dataOcorrencia:
          formatarDataParaEnvio(dataOcorrencia),
      };

      await axiosConnect.patch(
        `/ocorrencia/${ocorrencia.idOcorrencia}`,
        dadosAtualizados
      );

      if (arquivosSelecionados.length > 0) {
        const formData = new FormData();

        arquivosSelecionados.forEach((file) => {
          formData.append("files", file);
        });

        await OcorrenciaService.salvarArquivosOcorrencia(
          ocorrencia.idOcorrencia,
          formData
        );
      }

      const mensagem =
        "Ocorrência atualizada com sucesso!";

      setSuccessMessage(mensagem);

      setTimeout(() => {
        onSuccess(mensagem);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error( "Erro ao editar ocorrência:", error);

      if (error.response?.status === 401) {
        onError("Sessão expirada. Faça login novamente.");
      } else if (
        error.response?.status === 400
      ) {
        setErrors({
          submit: error.response?.data?.message ||"Dados inválidos",
        });
      } else {
        setErrors({
          submit: error.response?.data?.message ||"Erro ao editar ocorrência",
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

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const newFiles = Array.from(files);


    const oversizedFiles =
      newFiles.filter(
        (file) =>
          file.size >
          MAX_FILE_SIZE_BYTES
      );

    if (oversizedFiles.length > 0) {
      setFileError(
        `Arquivo(s) muito grande(s). Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`
      );

      return;
    }

    setArquivosSelecionados(
      (prev) => [
        ...prev,
        ...newFiles,
      ]
    );

    setFileError(null);
    event.target.value = "";
  };

  const handleRemoveFile = (
    index: number
  ) => {
    setArquivosSelecionados(
      (prev) =>
        prev.filter(
          (_, i) => i !== index
        )
    );
  };

  const obterNomeArquivo = (
    urlArquivo: string
  ): string => {
    const partes =
      urlArquivo.split("/");

    return (
      partes[partes.length - 1] ||
      "Arquivo"
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
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
            <Warning
              color="primary"
              sx={{fontSize: 24,mr: 1, }}
            />

            Editar ocorrência
          </Typography>

          <IconButton
            onClick={onClose}
            disabled={loading}
          >
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

        <Box
          sx={{display: "flex", gap: 2, mb: 2,}}
        >
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
            disabled={!!successMessage ||loading }
          />
        </Box>

        <Box sx={{ mt: 1, mb: 2,}}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<AttachFileIcon />}
            disabled={loading}
            sx={{
              mr: 2,
              color:
                "text.primary",
              borderColor:
                "divider",
              "&:hover": {
                borderColor:
                  "text.secondary",
                backgroundColor:
                  "action.hover",
              },
            }}
          >
            Anexar Arquivos
            <input
              type="file"
              multiple
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelection}
            />
          </Button>

          {(arquivosExistentes.length > 0 || arquivosSelecionados.length >0) && 
            (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  color="text.primary"
                >
                  Arquivos selecionados (
                  {arquivosExistentes.length +
                    arquivosSelecionados.length}
                  ):
                </Typography>

                {arquivosExistentes.map(
                  (arquivo) => {
                    const nomeArquivo =
                      obterNomeArquivo(
                        arquivo.urlArquivo
                      );

                    return (
                      <Box
                        key={`existente-${arquivo.idArquivoOcorrencia}`}
                        sx={{
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          mb: 1,
                          p: 1.5,
                          backgroundColor:
                            "action.hover",
                          borderRadius: 1,
                          border:
                            "1px solid",
                          borderColor:
                            "divider",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color="text.primary"
                          >
                            {
                              nomeArquivo
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Arquivo existente
                          </Typography>
                        </Box>

                        <IconButton
                          size="small"
                          color="primary"
                          disabled={
                            loading
                          }
                          component="a"
                          href={
                            arquivo.urlArquivo
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <AttachFileIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  }
                )}

                {arquivosSelecionados.map(
                  (file, index) => (
                    <Box
                      key={`novo-${index}`}
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        mb: 1,
                        p: 1.5,
                        backgroundColor:
                          "action.hover",
                        borderRadius: 1,
                        border:
                          "1px solid",
                        borderColor:
                          "divider",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color="text.primary"
                        >
                          {file.name}
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
                  )
                )}
              </Box>
          )}

          {fileError && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 1 }}
            >
              {fileError}
            </Typography>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 1,
              mb: 4,
            }}
          >
            Formatos permitidos:
            JPG, JPEG, PNG (Máx:{" "}
            {MAX_FILE_SIZE_MB}MB por
            arquivo)
          </Typography>
        </Box>
        <Box sx={{display: "flex", gap: 2,mb: 2,}}>
          <TextField
            label="Data da ocorrência"
            type="date"
            fullWidth
            value={
              dataOcorrencia
            }
            onChange={
              handleDataChange
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: minDate,
              max: maxDate,
            }}
            required
            error={
              !!errors.dataOcorrencia
            }
            helperText={
              errors.dataOcorrencia
            }
            disabled={
              !!successMessage ||
              loading
            }
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="motorista-label">
              Motorista Responsável
            </InputLabel>

            <Select
              labelId="motorista-label"
              value={idMotorista}
              onChange={(e) =>
                setIdMotorista(
                  e.target
                    .value as
                    | number
                    | ""
                )
              }
              label="Motorista Responsável"
              disabled={
                loading ||
                !!successMessage
              }
            >
              <MenuItem value="">
                <em>
                  Selecione o
                  motorista
                </em>
              </MenuItem>

              {corrida.motoristas?.map(
                (m) => (
                  <MenuItem
                    key={
                      m.idMotorista
                    }
                    value={
                      m.idMotorista
                    }
                  >
                    {m.nome}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Box>

        <Divider
          sx={{ my: 2 }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: 1,
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={
              loading ||
              !!successMessage
            }
          >
            Cancelar
          </Button>

          <Button
            onClick={
              handleSubmit
            }
            variant="contained"
            disabled={
              loading ||
              !descricao.trim() ||
              !dataOcorrencia ||
              !!successMessage
            }
          >
            {loading ? (
              <CircularProgress
                size={24}
              />
            ) : (
              "Salvar"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalEditarOcorrencia;