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
  Paper,
  Divider,
  IconButton,
  SelectChangeEvent,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { DirectionsCar, Close, Save } from "@mui/icons-material";
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
  const [ano, setAno] = useState<number | null>(null); // ALTERADO: Inicializado como null
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

  const preencherDadosVeiculo = (
    veiculo: CarroDto,
    tiposCombustivel: TipoCombustivel[],
  ) => {
    setPlaca(veiculo.placa || "");
    setOdometro(veiculo.odometro?.toString() || "");
    setModelo(veiculo.modelo || "");
    setAno(veiculo.ano || null); // ALTERADO: Preenche com null se for 0/falsy
    setTombo(veiculo.tombo?.toString() || "");
    setLocalidadeFisica(veiculo.localidadeFisica || "");

    if (veiculo.idTipoCombustivel && tiposCombustivel.length > 0) {
      const tipoEncontrado = tiposCombustivel.find(
        (tipo) => tipo.idTipoCombustivel === veiculo.idTipoCombustivel,
      );
      setTipoCombustivelSelecionado(tipoEncontrado || null);
    }
  };

  useEffect(() => {
    if (!open) return;

    const carregarDadosFormulario = async () => {
      setLoading(true);
      setErrors({});

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
        setAno(value === "" ? null : Number(value)); // ALTERADO: Trata string vazia como null
        break;
      case "tombo":
        setTombo(value);
        break;
      case "localidadeFisica":
        setLocalidadeFisica(value);
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
    if (ano === null || ano === 0) newErrors.ano = "Ano é obrigatório."; // ALTERADO: Verifica se é null ou 0
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

    const dadosVeiculo: CarroDto = {
      placa,
      odometro: odometro,
      modelo,
      ano: ano as number,
      tombo: Number(tombo),
      qrCode: "",
      localidadeFisica: localidadeFisica,
      ativo: true,
      idTipoCombustivel:
        tipoCombustivelSelecionado?.idTipoCombustivel as number,
    };

    try {
      setLoading(true);
      let veiculoSalvo;

      if (modoEdicao && idVeiculo) {
        veiculoSalvo = await CarroService.atualizar(idVeiculo, dadosVeiculo);
      } else {
        veiculoSalvo = await CarroService.criar(dadosVeiculo);
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
          component="form"
          onSubmit={handleSubmit}
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
            <DirectionsCar color="primary" sx={{ fontSize: 32, mr: 1 }} />
            {modoEdicao ? "Editar Veículo" : "Cadastrar Veículo"}
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

        <Divider sx={{ my: 2 }} />

        {/* Botões */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {modoEdicao ? "Salvando..." : "Cadastrando..."}
              </>
            ) : modoEdicao ? (
              "Salvar"
            ) : (
              "Cadastrar"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalCadastroEdicaoVeiculo;
