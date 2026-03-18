import React, { useEffect, useState } from "react";
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
  InputAdornment,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { LocalGasStation, Close } from "@mui/icons-material";
import { CorridaFrontend } from "../../../../services/CorridaService";
import {
  TipoCombustivel,
  TipoCombustivelService,
} from "../../../../services/TipoCombustivelService";
import AbastecimentoService from "../../../../services/AbastecimentoService";
import { modalStyle } from "../../../../utils/modalStyle";

interface AbastecimentoModalProps {
  open: boolean;
  onClose: () => void;
  corrida?: CorridaFrontend;
  onSuccess?: () => void;
}

const AbastecimentoModal: React.FC<AbastecimentoModalProps> = ({
  open,
  onClose,
  corrida,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    quantidade: "",
    codigoPagamento: "",
    valorTotal: "",
    dataAbastecimento: "",
    valorUnitario: "",
    justificativaAlteracao: "",
    tipoCombustivelId: "",
    idCorrida: corrida ? corrida.idCorrida.toString() : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>(
    [],
  );
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    if (open && corrida?.idCorrida) {
      setFormData((prev) => ({
        ...prev,
        idCorrida: corrida.idCorrida.toString(),
      }));
    }
  }, [open, corrida]);

  useEffect(() => {
    if (open) {
      // Carregar tipos de combustível apenas quando o modal abrir
      setCarregandoTipos(true);
      TipoCombustivelService.listar()
        .then((res) => {
          if (Array.isArray(res.data)) {
            setTiposCombustivel(res.data);
          } else {
            console.error("Formato inválido de resposta:", res);
          }
        })
        .catch((err) =>
          console.error("Erro ao buscar tipos de combustível:", err),
        )
        .finally(() => setCarregandoTipos(false));
    }
  }, [open]);

  // Calcular preço final automaticamente
  useEffect(() => {
    if (formData.quantidade && formData.valorUnitario) {
      const litros = parseFloat(formData.quantidade);
      const valorUnitario = parseFloat(formData.valorUnitario);

      if (!isNaN(litros) && !isNaN(valorUnitario)) {
        const precoFinal = litros * valorUnitario;
        setFormData((prev) => ({
          ...prev,
          valorTotal: precoFinal.toFixed(2),
        }));
      }
    }
  }, [formData.quantidade, formData.valorUnitario]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      newErrors.litros = "Litros são obrigatórios e devem ser maiores que zero";
    }

    if (!formData.codigoPagamento) {
      newErrors.codigoPagamento = "Código de pagamento é obrigatório";
    }

    if (!formData.valorTotal || parseFloat(formData.valorTotal) <= 0) {
      newErrors.preco_final = "Preço final é obrigatório";
    }

    if (!formData.dataAbastecimento) {
      newErrors.dataAbastecimento = "Data é obrigatória";
    }

    if (!formData.tipoCombustivelId) {
      newErrors.tipoCombustivelId = "Tipo de combustível é obrigatório";
    }

    if (!formData.idCorrida) {
      newErrors.id_corrida = "Corrida é obrigatória";
    }

    // Validação de data (deve ser entre a data de liberação e recebimento da chave)
    const apenasData = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    if (formData.dataAbastecimento) {
      const [ano, mes, dia] = formData.dataAbastecimento.split("-").map(Number);
      const dataAbastecimento = new Date(ano, mes - 1, dia);

      if (
        dataMinima &&
        apenasData(dataAbastecimento) < apenasData(dataMinima)
      ) {
        newErrors.dataAbastecimento =
          "Data não pode ser anterior à liberação da chave";
      } else if (apenasData(dataAbastecimento) > apenasData(dataLimite)) {
        newErrors.dataAbastecimento =
          "Data não pode ser posterior à data de encerramento da corrida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Encontrar o tipo de combustível selecionado
    const tipoCombustivelSelecionado = tiposCombustivel.find(
      (tipo) => tipo.idTipoCombustivel === parseInt(formData.tipoCombustivelId),
    );

    if (!tipoCombustivelSelecionado) {
      setErrors({ submit: "Tipo de combustível inválido" });
      setIsSubmitting(false);
      return;
    }

    // Utilizar apenas a data e não o horário
    let dataAbastecimento: Date | null = null;
    if (formData.dataAbastecimento) {
      const [ano, mes, dia] = formData.dataAbastecimento.split("-").map(Number);
      dataAbastecimento = new Date(ano, mes - 1, dia);
    }

    const dadosParaCadastro = {
      quantidade: parseFloat(formData.quantidade),
      codigoPagamento: formData.codigoPagamento,
      valorTotal: parseFloat(formData.valorTotal),
      dataAbastecimento: dataAbastecimento as Date,
      valorUnitario: formData.valorUnitario
        ? parseFloat(formData.valorUnitario)
        : 0,
      justificativaAlteracao: formData.justificativaAlteracao || "",
      tipoCombustivel: tipoCombustivelSelecionado.idTipoCombustivel as number,
      idCorrida: parseInt(formData.idCorrida),
    };

    try {
      setLoading(true);
      await AbastecimentoService.cadastrarAbastecimento(dadosParaCadastro);
      setSuccessMessage("Abastecimento cadastrado com sucesso!");

      setTimeout(() => {
        setSuccessMessage("");
        setFormData({
          quantidade: "",
          codigoPagamento: "",
          valorTotal: "",
          dataAbastecimento: "",
          valorUnitario: "",
          justificativaAlteracao: "",
          tipoCombustivelId: "",
          idCorrida: corrida?.idCorrida ? corrida?.idCorrida.toString() : "",
        });

        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Erro ao cadastrar abastecimento. Tente novamente.",
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-abastecimento"
      aria-describedby="modal-cadastro-abastecimento"
    >
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
            <LocalGasStation color="primary" sx={{ fontSize: 32, mr: 1 }} />
            Cadastrar Abastecimento
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
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
            label="Litros"
            name="quantidade"
            type="number"
            value={formData.quantidade}
            onChange={handleInputChange}
            required
            error={!!errors.quantidade}
            helperText={errors.quantidade}
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">L</InputAdornment>,
            }}
            disabled={isSubmitting}
            fullWidth
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Valor Unitário por Litro"
            name="valorUnitario"
            type="number"
            value={formData.valorUnitario}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: 0.001 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            }}
            disabled={isSubmitting}
            sx={{ flex: "1 1 50%" }}
          />

          <TextField
            label="Preço Final"
            name="preco_final"
            type="number"
            value={formData.valorTotal}
            onChange={handleInputChange}
            required
            error={!!errors.valorTotal}
            helperText={errors.valorTotal}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
              readOnly: true,
            }}
            disabled={isSubmitting}
            sx={{
              flex: "1 1 50%",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#f5f5f5",
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Código de Pagamento"
            name="codigoPagamento"
            value={formData.codigoPagamento}
            onChange={handleInputChange}
            required
            error={!!errors.codigoPagamento}
            helperText={errors.codigoPagamento}
            disabled={isSubmitting}
            sx={{ flex: "1 1 50%" }}
          />

          <TextField
            label="Data de Abastecimento"
            name="dataAbastecimento"
            type="date"
            value={formData.dataAbastecimento}
            onChange={handleInputChange}
            required
            error={!!errors.dataAbastecimento}
            helperText={errors.dataAbastecimento}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputProps: {
                min: minDate,
                max: maxDate,
              },
            }}
            disabled={isSubmitting}
            sx={{ flex: "1 1 50%" }}
          />
        </Box>

        {/* Tipo de Combustível */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl fullWidth required error={!!errors.tipoCombustivelId}>
            <InputLabel>Tipo de Combustível</InputLabel>
            <Select
              name="tipoCombustivelId"
              value={formData.tipoCombustivelId}
              onChange={handleSelectChange}
              label="Tipo de Combustível"
              disabled={isSubmitting}
            >
              {carregandoTipos ? (
                <MenuItem value="">Carregando tipos de combustível...</MenuItem>
              ) : (
                tiposCombustivel.map((tipo) => (
                  <MenuItem
                    key={tipo.idTipoCombustivel}
                    value={tipo.idTipoCombustivel}
                  >
                    {tipo.nome}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.tipoCombustivelId && (
              <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                {errors.tipoCombustivelId}
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
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting || !!successMessage}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || isSubmitting || !!successMessage}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                Cadastrando...
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AbastecimentoModal;
