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
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import {
  LocalGasStation,
  AttachMoney,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import { Abastecimento } from "../../../../services/abastecimentoService";
import abastecimentoService from "../../../../services/abastecimentoService";
import { TipoCombustivel } from "../../../../services/CarroService";
import { TipoCombustivelService } from "../../../../services/TipoCombustivelService";

interface EdicaoAbastecimentoModalProps {
  open: boolean;
  abastecimento: Abastecimento | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 800,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// Função auxiliar para formatar a data
const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const EdicaoAbastecimentoModal: React.FC<EdicaoAbastecimentoModalProps> = ({
  open,
  abastecimento,
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
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [carregandoTipos, setCarregandoTipos] = useState(true);

  // Função para preencher dados do abastecimento
  const preencherDadosAbastecimento = (abastecimento: Abastecimento, tiposCombustivel: TipoCombustivel[]) => {
    const dados = {
      quantidade: abastecimento.quantidade ? Number(abastecimento.quantidade) : 0,
      valorTotal: abastecimento.valorTotal ? Number(abastecimento.valorTotal) : 0,
      valorUnitario: abastecimento.valorUnitario ? Number(abastecimento.valorUnitario) : 0,
      dataAbastecimento: abastecimento.dataAbastecimento
        ? formatDate(new Date(abastecimento.dataAbastecimento))
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
      const total = Number((formData.quantidade * formData.valorUnitario).toFixed(2));
      setFormData(prev => ({
        ...prev,
        valorTotal: total
      }));
    }
  }, [formData.quantidade, formData.valorUnitario]);

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.quantidade || formData.quantidade <= 0) {
      novosErros.quantidade = 'Litros são obrigatórios e devem ser maiores que zero';
    }

    if (!formData.valorUnitario || formData.valorUnitario <= 0) {
      novosErros.valorUnitario = 'Valor unitário é obrigatório';
    }

    if (!formData.dataAbastecimento) {
      novosErros.dataAbastecimento = 'Data é obrigatória';
    }

    if (!formData.tipoCombustivelId) {
      novosErros.tipoCombustivelId = 'Tipo de combustível é obrigatório';
    }

    // Validação de data (não pode ser futura)
    if (formData.dataAbastecimento) {
      const dataAbastecimento = new Date(formData.dataAbastecimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataAbastecimento > hoje) {
        novosErros.dataAbastecimento = 'Data não pode ser futura';
      }
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Limpa erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => {
        const novosErros = { ...prev };
        delete novosErros[name];
        return novosErros;
      });
    }

    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantidade') || name.includes('valor') ? Number(value) : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;

    // Limpa erro do campo quando usuário selecionar uma opção
    if (errors[name]) {
      setErrors(prev => {
        const novosErros = { ...prev };
        delete novosErros[name];
        return novosErros;
      });
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSalvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!abastecimento) return;

    if (!validarFormulario()) {
      return; // Impede o salvamento se houver erros
    }

    setLoading(true);
    try {
      // Criar a data considerando o fuso horário
      const dataAbastecimentoUTC = new Date(formData.dataAbastecimento + 'T04:00:00.000Z');

      const dadosAtualizados = {
        quantidade: formData.quantidade,
        valorTotal: formData.valorTotal,
        valorUnitario: formData.valorUnitario,
        dataAbastecimento: dataAbastecimentoUTC,
        idTipoCombustivel: Number(formData.tipoCombustivelId),
      };

      await abastecimentoService.atualizarAbastecimentoPatch(
        abastecimento.idAbastecimento!,
        dadosAtualizados
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
        submit: "Erro ao atualizar abastecimento. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      quantidade: 0,
      valorTotal: 0,
      valorUnitario: 0,
      dataAbastecimento: "",
      tipoCombustivelId: "",
    });
    setErrors({});
    setSuccessMessage("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper sx={modalStyle}>
        {/* Cabeçalho */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <LocalGasStation color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Edição de Abastecimento</Typography>
          </Box>
          <IconButton onClick={handleClose}>
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

        {/* Conteúdo */}
        <Box component="form" onSubmit={handleSalvar}>
          {/* Informações Básicas */}
          <Typography variant="subtitle1" gutterBottom>
            Informações Básicas
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField
              label="Litros"
              name="quantidade"
              type="number"
              value={formData.quantidade}
              onChange={handleInputChange}
              required
              error={!!errors.quantidade}
              helperText={errors.quantidade}
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">L</InputAdornment>
                ),
              }}
              disabled={loading}
            />
            <TextField
              label="Valor Unitário"
              name="valorUnitario"
              type="number"
              value={formData.valorUnitario}
              onChange={handleInputChange}
              required
              error={!!errors.valorUnitario}
              helperText={errors.valorUnitario}
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
              disabled={loading}
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
              sx={{ flex: "1 1 200px" }}
              disabled={loading}
            />
          </Box>

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
            }}
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <Divider sx={{ my: 2 }} />

          {/* Tipo de Combustível */}
          <Typography variant="subtitle1" gutterBottom>
            Tipo de Combustível
          </Typography>
          <FormControl 
            fullWidth 
            required 
            error={!!errors.tipoCombustivelId}
            sx={{ mb: 2 }}
          >
            <InputLabel>Tipo</InputLabel>
            <Select
              name="tipoCombustivelId"
              value={formData.tipoCombustivelId}
              onChange={handleSelectChange}
              label="Tipo"
              disabled={loading}
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
              <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, display: 'block' }}>
                {errors.tipoCombustivelId}
              </Typography>
            )}
          </FormControl>

          {/* Botões */}
          <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
            <Button onClick={handleClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={!loading && <AttachMoney />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Atualizar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default EdicaoAbastecimentoModal;