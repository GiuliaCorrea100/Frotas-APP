import React, { FormEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  IconButton,
  SelectChangeEvent,
  CircularProgress,
  InputAdornment,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  DirectionsCar,
  Close,
  AttachFile as AttachFileIcon,
  CloudUpload,
  Description,
} from "@mui/icons-material";
import { CarroDto, CarroService } from "../../../services/CarroService";
import {
  TipoCombustivel,
  TipoCombustivelService,
} from "../../../services/TipoCombustivelService";
import { modalStyle } from "../../../utils/modalStyle";

interface ModalCadastroEdicaoVeiculoProps {
  idVeiculo?: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ModalCadastroEdicaoVeiculo: React.FC<ModalCadastroEdicaoVeiculoProps> = ({
  idVeiculo,
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [placa, setPlaca] = useState<string>("");
  const [odometro, setOdometro] = useState<string>("");
  const [modelo, setModelo] = useState<string>("");
  const [ano, setAno] = useState<number | null>(null);
  const [tombo, setTombo] = useState<string>("");
  const [localidadeFisica, setLocalidadeFisica] = useState<string>("");
  const [tipoCombustivelSelecionado, setTipoCombustivelSelecionado] =
    useState<TipoCombustivel | null>(null);
  const [tiposCombustivelDisponiveis, setTiposCombustivelDisponiveis] =
    useState<TipoCombustivel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estados do Arquivo CRLV
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [arquivoAtualUrl, setArquivoAtualUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const extrairNomeArquivo = (url: string): string => {
    if (!url) return "";
    return url.split("/").pop() || "crlv_veiculo.pdf";
  };

  const validateFileExtension = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setFileError(
        `Formato de arquivo não permitido. Extensões permitidas: ${allowedExtensions.join(", ")}`
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

  const handleRemoveSelectedFile = () => {
    setArquivoSelecionado(null);
    setFileError(null);
  };

  const handleRemoverArquivoAtual = async () => {
    if (!idVeiculo || !arquivoAtualUrl) return;

    try {
      setLoading(true);
      await CarroService.removerArquivoCrlv(idVeiculo);
      setArquivoAtualUrl(null);
    } catch (error) {
      console.error("Erro ao remover CRLV:", error);
      setErrors({ geral: "Erro ao remover documento CRLV atual." });
    } finally {
      setLoading(false);
    }
  };

  const preencherDadosVeiculo = (
    veiculo: CarroDto,
    tiposCombustivel: TipoCombustivel[],
  ) => {
    setPlaca(veiculo.placa || "");
    setOdometro(veiculo.odometro?.toString() || "");
    setModelo(veiculo.modelo || "");
    setAno(veiculo.ano || null);
    setTombo(veiculo.tombo?.toString() || "");
    setLocalidadeFisica(veiculo.localidadeFisica || "");
    setArquivoAtualUrl(veiculo.urlCrlv || null);

    if (veiculo.idTipoCombustivel && tiposCombustivel.length > 0) {
      const idProcurado =
        typeof veiculo.idTipoCombustivel === "object"
          ? (veiculo.idTipoCombustivel as TipoCombustivel).idTipoCombustivel
          : veiculo.idTipoCombustivel;

      const tipoEncontrado = tiposCombustivel.find(
        (tipo) => tipo.idTipoCombustivel === idProcurado
      );
      setTipoCombustivelSelecionado(tipoEncontrado || null);
    }
  };

  useEffect(() => {
    if (!open) return;

    const carregarDadosFormulario = async () => {
      setLoading(true);
      setErrors({});
      setArquivoSelecionado(null);
      setFileError(null);

      try {
        // 1. Carrega tipos de combustível primeiro
        const response = await TipoCombustivelService.listar();
        const tiposCombustivel = response.data;
        setTiposCombustivelDisponiveis(tiposCombustivel);

        // 2. Se for edição, carrega dados do veículo
        if (idVeiculo) {
          setModoEdicao(true);
          const veiculoData = await CarroService.buscarPorId(idVeiculo);
          preencherDadosVeiculo(veiculoData, tiposCombustivel);
        } else {
          setModoEdicao(false);
          setPlaca("");
          setOdometro("");
          setModelo("");
          setAno(null);
          setTombo("");
          setLocalidadeFisica("");
          setTipoCombustivelSelecionado(null);
          setArquivoAtualUrl(null);
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados do formulário:", error);
        const mensagemErro = idVeiculo
          ? "Erro ao carregar dados do veículo."
          : "Erro ao carregar tipos de combustível.";
        setErrors({ geral: mensagemErro });
        onError(mensagemErro);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosFormulario();
  }, [open, idVeiculo]);

  const handleSelectChange = (e: SelectChangeEvent) => {
    const idSelecionado = e.target.value;
    const tipoSelecionado = tiposCombustivelDisponiveis.find(
      (tipo) => tipo.idTipoCombustivel?.toString() === idSelecionado,
    );

    setTipoCombustivelSelecionado(tipoSelecionado || null);
    if (errors.tipoCombustivel) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tipoCombustivel;
        return newErrors;
      });
    }
  };

  const formatarPlaca = (valor: string): string => {
    return valor
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 7);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Limpa o erro específico ao digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    switch (name) {
      case "placa":
        setPlaca(formatarPlaca(value));
        break;
      case "odometro":
        setOdometro(value);
        break;
      case "modelo":
        setModelo(value.toUpperCase());
        break;
      case "ano":
        setAno(value === "" ? null : Number(value));
        break;
      case "tombo":
        setTombo(value);
        break;
      case "localidadeFisica":
        setLocalidadeFisica(value.toUpperCase());
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!placa) newErrors.placa = "Placa é obrigatória.";
    else if (placa.length !== 7)
      newErrors.placa = "A placa deve ter 7 caracteres alfanuméricos.";

    if (!odometro || parseFloat(odometro) < 0)
      newErrors.odometro = "Odômetro é obrigatório e deve ser um valor válido.";
    if (!modelo) newErrors.modelo = "Modelo é obrigatório.";
    if (ano === null || ano === 0) newErrors.ano = "Ano é obrigatório.";
    if (!tombo) newErrors.tombo = "Tombo é obrigatório.";
    if (!localidadeFisica)
      newErrors.localidadeFisica = "Localidade Física é obrigatória.";
    if (!tipoCombustivelSelecionado)
      newErrors.tipoCombustivel = "Tipo de Combustível é obrigatório.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    const tomboLimpo = tombo.trim().replace(/\D/g, "");

    try {
      if (modoEdicao && idVeiculo) {
        const dadosVeiculo: CarroDto = {
          placa,
          odometro: odometro,
          modelo,
          ano: ano as number,
          tombo: Number(tomboLimpo),
          qrCode: "",
          localidadeFisica: localidadeFisica,
          ativo: true,
          idTipoCombustivel:
            tipoCombustivelSelecionado?.idTipoCombustivel as number,
        };

        await CarroService.atualizar(idVeiculo, dadosVeiculo);

        if (arquivoSelecionado) {
          const formData = new FormData();
          formData.append("arquivo", arquivoSelecionado);
          await CarroService.atualizarArquivoCrlv(idVeiculo, formData);
        }
      } else {
        if (arquivoSelecionado) {
          const formData = new FormData();
          formData.append("placa", placa);
          formData.append("odometro", odometro);
          formData.append("modelo", modelo);
          formData.append("ano", (ano as number).toString());
          formData.append("tombo", tomboLimpo);
          formData.append("localidadeFisica", localidadeFisica);
          formData.append("ativo", "true");
          formData.append(
            "idTipoCombustivel",
            (tipoCombustivelSelecionado?.idTipoCombustivel as number).toString()
          );
          formData.append("arquivo", arquivoSelecionado);

          await CarroService.criarComArquivo(formData);
        } else {
          const dadosVeiculo: CarroDto = {
            placa,
            odometro: odometro,
            modelo,
            ano: ano as number,
            tombo: Number(tomboLimpo),
            qrCode: "",
            localidadeFisica: localidadeFisica,
            ativo: true,
            idTipoCombustivel:
              tipoCombustivelSelecionado?.idTipoCombustivel as number,
          };

          await CarroService.criar(dadosVeiculo);
        }
      }

      const mensagem = modoEdicao
        ? "Veículo atualizado com sucesso!"
        : "Veículo cadastrado com sucesso!";

      onSuccess(mensagem);
      onClose();
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.message ||
        "Erro ao salvar veículo. Tente novamente.";

      if (error.response?.status === 409) {
        setErrors({
          geral: "Já existe um veículo cadastrado com estes dados.",
        });
      } else {
        setErrors({ geral: mensagemErro });
      }
      console.error(error);
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
            <DirectionsCar color="primary" sx={{ fontSize: 24, mr: 1 }} />
            {modoEdicao ? "EDITAR VEÍCULO" : "CADASTRAR VEÍCULO"}
          </Typography>
          <IconButton onClick={onClose} disabled={loading || isSubmitting}>
            <Close />
          </IconButton>
        </Box>

        {errors.geral && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.geral}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              label="Placa"
              value={placa}
              onChange={handleInputChange}
              name="placa"
              required
              error={!!errors.placa}
              helperText={errors.placa}
              sx={{ flex: 1 }}
              disabled={loading || isSubmitting}
            />
            <TextField
              label="Odômetro"
              value={odometro}
              onChange={handleInputChange}
              name="odometro"
              required
              error={!!errors.odometro}
              helperText={errors.odometro}
              sx={{ flex: 1 }}
              disabled={loading || isSubmitting}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              label="Modelo"
              value={modelo}
              onChange={handleInputChange}
              name="modelo"
              required
              error={!!errors.modelo}
              helperText={errors.modelo}
              sx={{ flex: 1 }}
              disabled={loading || isSubmitting}
            />
            <TextField
              label="Ano"
              type="number"
              value={ano ?? ""}
              onChange={handleInputChange}
              name="ano"
              required
              error={!!errors.ano}
              helperText={errors.ano}
              sx={{ flex: 1 }}
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              disabled={loading || isSubmitting}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Tombo"
              value={tombo}
              onChange={handleInputChange}
              name="tombo"
              required
              error={!!errors.tombo}
              helperText={errors.tombo}
              fullWidth
              disabled={loading || isSubmitting}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Localidade Física"
              value={localidadeFisica}
              onChange={handleInputChange}
              name="localidadeFisica"
              required
              error={!!errors.localidadeFisica}
              helperText={errors.localidadeFisica}
              fullWidth
              disabled={loading || isSubmitting}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth required error={!!errors.tipoCombustivel}>
              <InputLabel>Tipo de Combustível</InputLabel>
              <Select
                value={
                  tipoCombustivelSelecionado?.idTipoCombustivel?.toString() || ""
                }
                onChange={handleSelectChange}
                label="Tipo de Combustível"
                disabled={
                  loading ||
                  isSubmitting ||
                  tiposCombustivelDisponiveis.length === 0
                }
              >
                {tiposCombustivelDisponiveis.map((tipo) => (
                  <MenuItem
                    key={tipo.idTipoCombustivel}
                    value={tipo.idTipoCombustivel?.toString() || ""}
                  >
                    {tipo.nome}
                  </MenuItem>
                ))}
              </Select>
              {errors.tipoCombustivel && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.tipoCombustivel}
                </Typography>
              )}
            </FormControl>
          </Box>

          {modoEdicao ? (
            <Box
              sx={{
                flex: "1 1 100%",
                mt: 2,
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
                DOCUMENTO CRLV
              </Typography>

              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                {arquivoAtualUrl ? (
                  <Tooltip title="Clique para remover o arquivo atual">
                    <Chip
                      icon={<Description />}
                      label={extrairNomeArquivo(arquivoAtualUrl)}
                      onDelete={handleRemoverArquivoAtual}
                      color="primary"
                      variant="outlined"
                      disabled={loading || isSubmitting}
                      sx={{ maxWidth: "100%" }}
                    />
                  </Tooltip>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum CRLV anexado.
                  </Typography>
                )}

                <Button
                  variant="contained"
                  component="label"
                  size="small"
                  startIcon={<CloudUpload />}
                  color={arquivoSelecionado ? "success" : "inherit"}
                  disabled={loading || isSubmitting}
                  sx={{ textTransform: "none" }}
                >
                  {arquivoSelecionado ? "Trocar Seleção" : "Selecionar Novo"}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelection}
                  />
                </Button>

                {arquivoSelecionado && (
                  <Chip
                    label={`Upload pendente: ${arquivoSelecionado.name}`}
                    size="small"
                    color="success"
                    onDelete={handleRemoveSelectedFile}
                    disabled={loading || isSubmitting}
                  />
                )}
              </Box>

              {fileError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {fileError}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ flex: "1 1 100%", mt: 1 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                disabled={loading || isSubmitting}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "text.secondary",
                    backgroundColor: "action.hover",
                  },
                }}
              >
                Anexar CRLV
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelection}
                />
              </Button>

              {arquivoSelecionado && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "action.hover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{ color: "text.primary" }}
                    >
                      {arquivoSelecionado.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(arquivoSelecionado.size)}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={handleRemoveSelectedFile}
                    color="error"
                    disabled={loading || isSubmitting}
                  >
                    <Close fontSize="small" />
                  </IconButton>
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
                sx={{
                  display: "block",
                  mt: 1,
                }}
              >
                Formatos permitidos: PDF, JPG, JPEG, PNG, DOC, DOCX (Máx:{" "}
                {MAX_FILE_SIZE_MB}MB)
              </Typography>
            </Box>
          )}

          <Box sx={{ width: "100%", mt: 2 }}>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ textTransform: "none" }}
                disabled={loading || isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                type="submit"
                disabled={loading || isSubmitting}
                sx={{
                  textTransform: "none",
                  minWidth: 100,
                }}
              >
                {loading || isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : modoEdicao ? (
                  "Salvar"
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalCadastroEdicaoVeiculo;
