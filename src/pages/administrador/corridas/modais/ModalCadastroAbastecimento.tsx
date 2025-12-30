import React, { useEffect, useState } from 'react';
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
  Paper,
  Divider,
} from '@mui/material';
import { LocalGasStation, CalendarToday } from '@mui/icons-material';
import { CorridaFrontend, getCorridas } from '../../../../services/CorridaService';
import { TipoCombustivel, TipoCombustivelService } from '../../../../services/TipoCombustivelService';
import AbastecimentoService from '../../../../services/AbastecimentoService';

// Estilo para o modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

interface AbastecimentoModalProps {
  open: boolean;
  onClose: () => void;
  corridaId?: number;
  onSuccess?: () => void;
}

const AbastecimentoModal: React.FC<AbastecimentoModalProps> = ({
  open,
  onClose,
  corridaId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    quantidade: '',
    codigoPagamento: '',
    valorTotal: '',
    dataAbastecimento: new Date().toISOString().slice(0, 10),
    valorUnitario: '',
    justificativaAlteracao: '',
    tipoCombustivelId: '',
    idCorrida: corridaId ? corridaId.toString() : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [corridaSelecionada, setCorridaSelecionada] = useState<CorridaFrontend | null>(null);
  const [carregandoTipos, setCarregandoTipos] = useState(true);

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
        .catch((err) => console.error('Erro ao buscar tipos de combustível:', err))
        .finally(() => setCarregandoTipos(false));

      // Carregar corridas
      getCorridas()
        .then((res) => setCorridas(res))
        .catch((err) => console.error('Erro ao buscar corridas:', err));
    }
  }, [open]);

  // Atualizar informações da corrida selecionada
  useEffect(() => {
    if (formData.idCorrida) {
      const corrida = corridas.find(c => c.idCorrida === parseInt(formData.idCorrida));
      setCorridaSelecionada(corrida || null);
    } else {
      setCorridaSelecionada(null);
    }
  }, [formData.idCorrida, corridas]);

  // Calcular preço final automaticamente
  useEffect(() => {
    if (formData.quantidade && formData.valorUnitario) {
      const litros = parseFloat(formData.quantidade);
      const valorUnitario = parseFloat(formData.valorUnitario);

      if (!isNaN(litros) && !isNaN(valorUnitario)) {
        const precoFinal = litros * valorUnitario;
        setFormData(prev => ({
          ...prev,
          valorTotal: precoFinal.toFixed(2)
        }));
      }
    }
  }, [formData.quantidade, formData.valorUnitario]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      newErrors.litros = 'Litros são obrigatórios e devem ser maiores que zero';
    }

    if (!formData.codigoPagamento) {
      newErrors.codigoPagamento = 'Código de pagamento é obrigatório';
    }

    if (!formData.valorTotal || parseFloat(formData.valorTotal) <= 0) {
      newErrors.preco_final = 'Preço final é obrigatório';
    }

    if (!formData.dataAbastecimento) {
      newErrors.dataAbastecimento = 'Data é obrigatória';
    }

    if (!formData.tipoCombustivelId) {
      newErrors.tipoCombustivelId = 'Tipo de combustível é obrigatório';
    }

    if (!formData.idCorrida) {
      newErrors.id_corrida = 'Corrida é obrigatória';
    }

    // Validação de data (não pode ser futura)
    if (formData.dataAbastecimento) {
       const dataAbastecimento = new Date(formData.dataAbastecimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataAbastecimento.getTime() > hoje.getTime()) {
        newErrors.dataAbastecimento = 'Data não pode ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Encontrar o tipo de combustível selecionado
    const tipoCombustivelSelecionado = tiposCombustivel.find(
      tipo => tipo.idTipoCombustivel === parseInt(formData.tipoCombustivelId)
    );

    if (!tipoCombustivelSelecionado) {
      setErrors({ submit: 'Tipo de combustível inválido' });
      return;
    }

    const dadosParaCadastro = {
      quantidade: parseFloat(formData.quantidade),
      codigoPagamento: formData.codigoPagamento,
      valorTotal: parseFloat(formData.valorTotal),
      dataAbastecimento: new Date(formData.dataAbastecimento),
      valorUnitario: formData.valorUnitario ? parseFloat(formData.valorUnitario) : 0,
      justificativaAlteracao: formData.justificativaAlteracao || '',
      tipoCombustivel: tipoCombustivelSelecionado.idTipoCombustivel as number,
      idCorrida: parseInt(formData.idCorrida),
    };

    try {
      setLoading(true);
      console.log(dadosParaCadastro);
      await AbastecimentoService.cadastrarAbastecimento(dadosParaCadastro);
      setSuccessMessage('Abastecimento cadastrado com sucesso!');
      

      setTimeout(() => {
        setSuccessMessage('');
        setFormData({
          quantidade: '',
          codigoPagamento: '',
          valorTotal: '',
          dataAbastecimento: new Date().toISOString().slice(0, 10),
          valorUnitario: '',
          justificativaAlteracao: '',
          tipoCombustivelId: '',
          idCorrida: corridaId ? corridaId.toString() : '',
        });

        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao cadastrar abastecimento. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors(prev => {
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
      setErrors(prev => {
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

  const handleClose = () => {
    setFormData({
      quantidade: '',
      codigoPagamento: '',
      valorTotal: '',
      dataAbastecimento: new Date().toISOString().slice(0, 10),
      valorUnitario: '',
      justificativaAlteracao: '',
      tipoCombustivelId: '',
      idCorrida: corridaId ? corridaId.toString() : '',
    });
    setErrors({});
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-abastecimento"
      aria-describedby="modal-cadastro-abastecimento"
    >
      <Paper sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalGasStation color="primary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" component="h2">
              Cadastro de Abastecimento
            </Typography>
          </Box>
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

        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informações Básicas
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
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
                sx={{ flex: '1 1 200px' }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">L</InputAdornment>,
                }}
              />

              <TextField
                label="Código de Pagamento"
                name="codigoPagamento"
                value={formData.codigoPagamento}
                onChange={handleInputChange}
                required
                error={!!errors.codigoPagamento}
                helperText={errors.codigoPagamento}
                sx={{ flex: '1 1 200px' }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField
                label="Valor Unitário por Litro"
                name="valorUnitario"
                type="number"
                value={formData.valorUnitario}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.001 }}
                sx={{ flex: '1 1 200px' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
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
                sx={{ flex: '1 1 200px' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  readOnly: true,
                }}
              />
            </Box>

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
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" />
                  </InputAdornment>
                ),
                inputProps: {
                  max: new Date().toISOString().slice(0, 10), 
                },
              }}
              sx={{ mb: 2, width: '100%', maxWidth: 400 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Tipo de Combustível */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tipo de Combustível
            </Typography>

            <FormControl fullWidth required error={!!errors.tipoCombustivelId} sx={{ mb: 2 }}>
              <InputLabel>Tipo de Combustível</InputLabel>
              <Select
                name="tipoCombustivelId"
                value={formData.tipoCombustivelId}
                onChange={handleSelectChange}
                label="Tipo de Combustível"
              >
                {carregandoTipos ? (
                  <MenuItem value="">Carregando tipos de combustível...</MenuItem>
                ) : (
                  tiposCombustivel.map((tipo) => (
                    <MenuItem key={tipo.idTipoCombustivel} value={tipo.idTipoCombustivel}>
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
};

export default AbastecimentoModal;