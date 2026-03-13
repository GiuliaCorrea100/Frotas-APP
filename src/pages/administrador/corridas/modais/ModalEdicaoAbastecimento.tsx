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
} from "@mui/material";
import { LocalGasStation, CalendarToday, Close } from "@mui/icons-material";
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
    quantidade: 0,
    valorTotal: 0,
    valorUnitario: 0,
    dataAbastecimento: "",
    tipoCombustivelId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
      quantidade: abastecimento.quantidade
        ? Number(abastecimento.quantidade)
        : 0,
      valorTotal: abastecimento.valorTotal
        ? Number(abastecimento.valorTotal)
        : 0,
      valorUnitario: abastecimento.valorUnitario
        ? Number(abastecimento.valorUnitario)
        : 0,
      dataAbastecimento: abastecimento.dataAbastecimento
        ? new Date(abastecimento.dataAbastecimento).toISOString().slice(0, 10)
        : "",
      tipoCombustivelId: abastecimento.idTipoCombustivel?.toString() || "",
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
    if (formData.quantidade >= 0 && formData.valorUnitario >= 0) {
      const total = Number(
        (formData.quantidade * formData.valorUnitario).toFixed(2),
      );
      setFormData((prev) => ({
        ...prev,
        valorTotal: total,
      }));
    }
  }, [formData.quantidade, formData.valorUnitario]);

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.quantidade || formData.quantidade <= 0) {
      novosErros.quantidade =
        "Litros são obrigatórios e devem ser maiores que zero";
    }

    if (!formData.valorUnitario || formData.valorUnitario <= 0) {
      novosErros.valorUnitario = "Valor unitário é obrigatório";
    }

    if (!formData.dataAbastecimento) {
      novosErros.dataAbastecimento = "Data é obrigatória";
    }

    if (!formData.tipoCombustivelId) {
      novosErros.tipoCombustivelId = "Tipo de combustível é obrigatório";
    }

    // Validação de data (não pode ser futura)
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

    // Limpa erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => {
        const novosErros = { ...prev };
        delete novosErros[name];
        return novosErros;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("quantidade") || name.includes("valor")
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;

    // Limpa erro do campo quando usuário selecionar uma opção
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
      return; // Impede o salvamento se houver erros
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Criar a data considerando o fuso horário
      // const dataAbastecimentoUTC = new Date(formData.dataAbastecimento + 'T04:00:00.000Z');
      let dataAbastecimento: Date | null = null;
      if (formData.dataAbastecimento) {
        const [ano, mes, dia] = formData.dataAbastecimento
          .split("-")
          .map(Number);
        dataAbastecimento = new Date(ano, mes - 1, dia);
      }

      const dadosAtualizados = {
        quantidade: formData.quantidade,
        valorTotal: formData.valorTotal,
        valorUnitario: formData.valorUnitario,
        dataAbastecimento: dataAbastecimento as Date,
        idTipoCombustivel: Number(formData.tipoCombustivelId),
      };

      await abastecimentoService.atualizarAbastecimentoPatch(
        abastecimento.idAbastecimento!,
        dadosAtualizados,
      );

      setSuccessMessage("Abastecimento atualizado com sucesso!");

      setTimeout(() => {
        setSuccessMessage("");
        onSuccess("Abastecimento atualizado com sucesso!");
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
            Edição de Abastecimento
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
            InputProps={{
              endAdornment: <InputAdornment position="end">L</InputAdornment>,
            }}
            disabled={loading || isSubmitting}
            fullWidth
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Valor Unitário"
            name="valorUnitario"
            type="number"
            value={formData.valorUnitario}
            onChange={handleInputChange}
            required
            error={!!errors.valorUnitario}
            helperText={errors.valorUnitario}
            sx={{ flex: "1 1 50%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            }}
            disabled={loading || isSubmitting}
          />
          <TextField
            label="Preço Final"
            type="number"
            value={formData.valorTotal}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
              readOnly: true,
            }}
            sx={{
              flex: "1 1 50%",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" },
            }}
            disabled={loading || isSubmitting}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Data de Abastecimento"
            name="dataAbastecimento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.dataAbastecimento}
            onChange={handleInputChange}
            required
            error={!!errors.dataAbastecimento}
            helperText={errors.dataAbastecimento}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              ),
              inputProps: {
                min: minDate,
                max: maxDate,
              },
            }}
            disabled={loading || isSubmitting}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl fullWidth required error={!!errors.tipoCombustivelId}>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="tipoCombustivelId"
              value={formData.tipoCombustivelId}
              onChange={handleSelectChange}
              label="Tipo"
              disabled={loading || isSubmitting}
            >
              {carregandoTipos ? (
                <MenuItem disabled>Carregando tipos de combustível...</MenuItem>
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
