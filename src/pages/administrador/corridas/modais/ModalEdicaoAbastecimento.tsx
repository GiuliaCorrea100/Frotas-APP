import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  InputAdornment,
  CircularProgress,
  IconButton,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { LocalGasStation, Close } from "@mui/icons-material";
import { Abastecimento } from "../../../../services/AbastecimentoService";
import abastecimentoService from "../../../../services/AbastecimentoService";
import { TipoCombustivel } from "../../../../services/CarroService";
import { TipoCombustivelService } from "../../../../services/TipoCombustivelService";
import { CorridaFrontend } from "../../../../services/CorridaService";
import { modalStyle } from "../../../../utils/modalStyle";

interface EdicaoAbastecimentoModalProps {
  open: boolean;
  abastecimento: Abastecimento | null;
  corrida?: CorridaFrontend;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const EdicaoAbastecimentoModal: React.FC<EdicaoAbastecimentoModalProps> = ({
  open,
  abastecimento,
  corrida,
  onClose,
  onSuccess,
  onError,
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
    idMotorista: "",
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

  // Função para preencher dados do abastecimento
  const preencherDadosAbastecimento = (
    abastecimento: Abastecimento,
    tiposCombustivel: TipoCombustivel[],
  ) => {
    const dados = {
      quantidade: abastecimento.quantidade ? String(abastecimento.quantidade) : "",
      codigoPagamento: abastecimento.codigoPagamento || "",
      valorTotal: abastecimento.valorTotal ? String(abastecimento.valorTotal) : "",
      dataAbastecimento: abastecimento.dataAbastecimento
        ? new Date(abastecimento.dataAbastecimento).toISOString().slice(0, 10)
        : "",
      valorUnitario: abastecimento.valorUnitario ? String(abastecimento.valorUnitario) : "",
      justificativaAlteracao: abastecimento.justificativaAlteracao || "",
      tipoCombustivelId: abastecimento.idTipoCombustivel?.toString() || "",
      idCorrida: corrida?.idCorrida ? corrida.idCorrida.toString() : "",
      idMotorista: abastecimento.idMotorista ? String(abastecimento.idMotorista) : "",
    };

    setFormData(dados);
  };

  // Efeito unificado para carregar dados do modal
  useEffect(() => {
    if (!open || !abastecimento) return;

    const carregarDadosModal = async () => {
      setLoading(true);
      setCarregandoTipos(true);

      try {
        // Carrega tipos de combustível
        const tiposResponse = await TipoCombustivelService.listar();
        setTiposCombustivel(tiposResponse.data);

        // Preenche os dados do abastecimento
        preencherDadosAbastecimento(abastecimento, tiposResponse.data);
      } catch (err) {
        console.error("Erro ao carregar tipos de combustível:", err);
        onError("Erro ao carregar tipos de combustível.");
      } finally {
        setLoading(false);
        setCarregandoTipos(false);
      }
    };

    carregarDadosModal();
  }, [open, abastecimento]);

  // Calcula preço final automaticamente
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

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      novosErros.quantidade =
        "Litros são obrigatórios e devem ser maiores que zero";
    }

    if (!formData.codigoPagamento) {
      novosErros.codigoPagamento = "Código de pagamento é obrigatório";
    }

    if (!formData.valorTotal || parseFloat(formData.valorTotal) <= 0) {
      novosErros.valorTotal = "Preço final é obrigatório";
    }

    if (!formData.dataAbastecimento) {
      novosErros.dataAbastecimento = "Data é obrigatória";
    }

    if (!formData.tipoCombustivelId) {
      novosErros.tipoCombustivelId = "Tipo de combustível é obrigatório";
    }

    if (!formData.idMotorista) {
      novosErros.idMotorista = "Motorista é obrigatório";
    }

    // Validação de data
    const apenasData = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    if (formData.dataAbastecimento) {
      const [ano, mes, dia] = formData.dataAbastecimento.split("-").map(Number);
      const dataAbastecimento = new Date(ano, mes - 1, dia);

      if (
        dataMinima &&
        apenasData(dataAbastecimento) < apenasData(dataMinima)
      ) {
        novosErros.dataAbastecimento =
          "Data não pode ser anterior à liberação da chave";
      } else if (apenasData(dataAbastecimento) > apenasData(dataLimite)) {
        novosErros.dataAbastecimento =
          "Data não pode ser posterior à data de encerramento da corrida";
      }
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => {
        const novosErros = { ...prev };
        delete novosErros[name];
        return novosErros;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;

    if (errors[name]) {
      setErrors((prev) => {
        const novosErros = { ...prev };
        delete novosErros[name];
        return novosErros;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!abastecimento) return;

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      let dataAbastecimento: Date | null = null;
      if (formData.dataAbastecimento) {
        const [ano, mes, dia] = formData.dataAbastecimento
          .split("-")
          .map(Number);
        dataAbastecimento = new Date(ano, mes - 1, dia);
      }

      const dadosAtualizados = {
        quantidade: parseFloat(formData.quantidade),
        codigoPagamento: formData.codigoPagamento,
        valorTotal: parseFloat(formData.valorTotal),
        dataAbastecimento: dataAbastecimento as Date,
        valorUnitario: formData.valorUnitario ? parseFloat(formData.valorUnitario) : 0,
        justificativaAlteracao: formData.justificativaAlteracao || "",
        idTipoCombustivel: Number(formData.tipoCombustivelId),
        idMotorista: parseInt(formData.idMotorista),
      };

      await abastecimentoService.atualizarAbastecimentoPatch(
        abastecimento.idAbastecimento!,
        dadosAtualizados,
      );

      const mensagem = "Abastecimento atualizado com sucesso!";

      setTimeout(() => {
        setSuccessMessage("");
        if (onSuccess) onSuccess(mensagem);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar abastecimento:", error);
      setErrors({
        submit: "Erro ao atualizar abastecimento. Tente novamente.",
      });
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
            <LocalGasStation color="primary" sx={{ fontSize: 32, mr: 1 }} />
            Editar Abastecimento
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
            disabled={loading || isSubmitting}
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
            disabled={loading || isSubmitting}
            sx={{ flex: "1 1 50%" }}
          />

          <TextField
            label="Preço Final"
            name="valorTotal"
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
            disabled={loading || isSubmitting}
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
            disabled={loading || isSubmitting}
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
            disabled={loading || isSubmitting}
            sx={{ flex: "1 1 50%" }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl fullWidth required error={!!errors.tipoCombustivelId}>
            <InputLabel>Tipo de Combustível</InputLabel>
            <Select
              name="tipoCombustivelId"
              value={formData.tipoCombustivelId}
              onChange={handleSelectChange}
              label="Tipo de Combustível"
              disabled={loading || isSubmitting}
            >
              {carregandoTipos ? (
                <MenuItem value="">Carregando tipos de combustível...</MenuItem>
              ) : (
                tiposCombustivel.map((tipo) => (
                  <MenuItem
                    key={tipo.idTipoCombustivel}
                    value={String(tipo.idTipoCombustivel)}
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

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth error={!!errors.idMotorista}>
            <InputLabel id="motorista-label">Motorista Responsável</InputLabel>
            <Select
              labelId="motorista-label"
              name="idMotorista"
              value={formData.idMotorista}
              onChange={handleSelectChange}
              label="Motorista Responsável"
              disabled={loading || isSubmitting}
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
          <Button
            onClick={onClose}
            variant="outlined"
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
                Atualizando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EdicaoAbastecimentoModal;