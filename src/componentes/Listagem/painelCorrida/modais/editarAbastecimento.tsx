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
  IconButton
} from '@mui/material';
import { LocalGasStation, Close, AttachMoney, CalendarToday } from '@mui/icons-material';
import { TipoCombustivel } from '../../../../api/carrosService';
import { CorridaFrontend, getCorridas } from '../../../../api/corridaService';
import { TipoCombustivelService } from '../../../../api/tipoCombustivelService';
import abastecimentoService, { Abastecimento, AbastecimentoRequest, AbastecimentoService } from '../../../../api/abastecimentoService';


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

interface EdicaoAbastecimentoModalProps {
  open: boolean;
  onClose: () => void;
  abastecimentoId?: number;
  onSuccess?: () => void;
}

const EdicaoAbastecimentoModal: React.FC<EdicaoAbastecimentoModalProps> = ({
  open,
  onClose,
  abastecimentoId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    litros: '',
    cod_pagamento: '',
    preco_final: '',
    data_abastecimento: new Date().toISOString().split('T')[0],
    valor_unitario_litro: '',
    tipo_combustivel_id: '',
    id_corrida: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [corridaSelecionada, setCorridaSelecionada] = useState<CorridaFrontend | null>(null);
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [carregandoAbastecimento, setCarregandoAbastecimento] = useState(false);

  useEffect(() => {
    if (open && abastecimentoId) {
      carregarDadosAbastecimento();
    }
  }, [open, abastecimentoId]);

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

  // Carregar dados do abastecimento para edição
  const carregarDadosAbastecimento = async () => {
    if (!abastecimentoId) return;

    try {
      setCarregandoAbastecimento(true);
      const abastecimento: Abastecimento = await abastecimentoService.buscarAbastecimentoPorId(abastecimentoId);

      setFormData({
        litros: abastecimento.litros.toString(),
        cod_pagamento: abastecimento.codPagamento.toString(),
        preco_final: abastecimento.precoFinal.toString(),
        data_abastecimento: abastecimento.dataAbastecimento.split('T')[0],
        valor_unitario_litro: abastecimento.valorUnitarioLitro?.toString() || '',
        tipo_combustivel_id: abastecimento.tipoCombustivel.idTipoCombustivel?.toString() || '',
        id_corrida: abastecimento.corrida.idCorrida?.toString() || '',
      });
    } catch (error) {
      console.error('Erro ao carregar abastecimento:', error);
      setErrors({ submit: 'Erro ao carregar dados do abastecimento' });
    } finally {
      setCarregandoAbastecimento(false);
    }
  };

  // Atualizar informações da corrida selecionada
  useEffect(() => {
    if (formData.id_corrida) {
      const corrida = corridas.find(c => c.idCorrida === parseInt(formData.id_corrida));
      setCorridaSelecionada(corrida || null);
    } else {
      setCorridaSelecionada(null);
    }
  }, [formData.id_corrida, corridas]);

  // Calcular preço final automaticamente
  useEffect(() => {
    if (formData.litros && formData.valor_unitario_litro) {
      const litros = parseFloat(formData.litros);
      const valorUnitario = parseFloat(formData.valor_unitario_litro);

      if (!isNaN(litros) && !isNaN(valorUnitario)) {
        const precoFinal = litros * valorUnitario;
        setFormData(prev => ({
          ...prev,
          preco_final: precoFinal.toFixed(2)
        }));
      }
    }
  }, [formData.litros, formData.valor_unitario_litro]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.litros || parseFloat(formData.litros) <= 0) {
      newErrors.litros = 'Litros são obrigatórios e devem ser maiores que zero';
    }

    if (!formData.cod_pagamento) {
      newErrors.cod_pagamento = 'Código de pagamento é obrigatório';
    }

    if (!formData.preco_final || parseFloat(formData.preco_final) <= 0) {
      newErrors.preco_final = 'Preço final é obrigatório';
    }

    if (!formData.data_abastecimento) {
      newErrors.data_abastecimento = 'Data é obrigatória';
    }

    if (!formData.tipo_combustivel_id) {
      newErrors.tipo_combustivel_id = 'Tipo de combustível é obrigatório';
    }

    if (!formData.id_corrida) {
      newErrors.id_corrida = 'Corrida é obrigatória';
    }

    // Validação de data (não pode ser futura)
    if (formData.data_abastecimento) {
      const dataAbastecimento = new Date(formData.data_abastecimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataAbastecimento > hoje) {
        newErrors.data_abastecimento = 'Data não pode ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!abastecimentoId) {
      setErrors({ submit: 'ID do abastecimento não informado' });
      return;
    }

    const dadosParaEdicao: Partial<AbastecimentoRequest> = {
      litros: parseFloat(formData.litros),
      codPagamento: parseInt(formData.cod_pagamento),
      precoFinal: parseFloat(formData.preco_final),
      dataAbastecimento: formData.data_abastecimento,
      valorUnitarioLitro: formData.valor_unitario_litro ? parseFloat(formData.valor_unitario_litro) : undefined,
      tipoCombustivel: parseInt(formData.tipo_combustivel_id),
      idCorrida: parseInt(formData.id_corrida),
    };

    try {
      setLoading(true);
      await abastecimentoService.atualizarAbastecimento(abastecimentoId, dadosParaEdicao);
      setSuccessMessage('Abastecimento atualizado com sucesso!');

      setTimeout(() => {
        setSuccessMessage('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao editar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao atualizar abastecimento. Tente novamente.'
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
      litros: '',
      cod_pagamento: '',
      preco_final: '',
      data_abastecimento: new Date().toISOString().split('T')[0],
      valor_unitario_litro: '',
      tipo_combustivel_id: '',
      id_corrida: '',
    });
    setErrors({});
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-edicao-abastecimento"
      aria-describedby="modal-edicao-abastecimento"
    >
      <Paper sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalGasStation color="primary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" component="h2">
              Edição de Abastecimento
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        {carregandoAbastecimento && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Carregando dados do abastecimento...
          </Alert>
        )}

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
                name="litros"
                type="number"
                value={formData.litros}
                onChange={handleInputChange}
                required
                error={!!errors.litros}
                helperText={errors.litros}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ flex: '1 1 200px' }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">L</InputAdornment>,
                }}
              />

              <TextField
                label="Código de Pagamento"
                name="cod_pagamento"
                value={formData.cod_pagamento}
                onChange={handleInputChange}
                required
                error={!!errors.cod_pagamento}
                helperText={errors.cod_pagamento}
                sx={{ flex: '1 1 200px' }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField
                label="Valor Unitário por Litro"
                name="valor_unitario_litro"
                type="number"
                value={formData.valor_unitario_litro}
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
                value={formData.preco_final}
                onChange={handleInputChange}
                required
                error={!!errors.preco_final}
                helperText={errors.preco_final}
                sx={{ flex: '1 1 200px' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  readOnly: true,
                }}
              />
            </Box>

            <TextField
              label="Data de Abastecimento"
              name="data_abastecimento"
              type="date"
              value={formData.data_abastecimento}
              onChange={handleInputChange}
              required
              error={!!errors.data_abastecimento}
              helperText={errors.data_abastecimento}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" />
                  </InputAdornment>
                ),
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

            <FormControl fullWidth required error={!!errors.tipo_combustivel_id} sx={{ mb: 2 }}>
              <InputLabel>Tipo de Combustível</InputLabel>
              <Select
                name="tipo_combustivel_id"
                value={formData.tipo_combustivel_id}
                onChange={handleSelectChange}
                label="Tipo de Combustível"
              >
                {carregandoTipos ? (
                  <MenuItem value="">Carregando tipos de combustível...</MenuItem>
                ) : (
                  tiposCombustivel.map((tipo) => (
                    <MenuItem key={tipo.id_tipo_combustivel} value={tipo.id_tipo_combustivel}>
                      {tipo.nome}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.tipo_combustivel_id && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.tipo_combustivel_id}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Corrida Relacionada */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Corrida Relacionada
            </Typography>

            <FormControl fullWidth required error={!!errors.id_corrida} sx={{ mb: 2 }}>
              <InputLabel>Corrida</InputLabel>
              <Select
                name="id_corrida"
                value={formData.id_corrida}
                onChange={handleSelectChange}
                label="Corrida"
              >
                {corridas.length === 0 ? (
                  <MenuItem value="">Carregando corridas...</MenuItem>
                ) : (
                  corridas.map((corrida) => (
                    <MenuItem key={corrida.idCorrida} value={corrida.idCorrida}>
                      {`#${corrida.idCorrida} - ${new Date(corrida.dataInicio).toLocaleDateString()} - ${corrida.placaVeiculo} - ${corrida.nomeMotorista}`}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.id_corrida && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.id_corrida}
                </Typography>
              )}
            </FormControl>

            {corridaSelecionada && (
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Informações da Corrida Selecionada:
                </Typography>
                <Typography variant="body2">
                  Veículo: {corridaSelecionada.placaVeiculo} | Motorista: {corridaSelecionada.nomeMotorista}
                </Typography>
                <Typography variant="body2">
                  Data de Início: {new Date(corridaSelecionada.dataInicio).toLocaleDateString()}
                </Typography>
              </Paper>
            )}
          </Box>

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
              disabled={loading || carregandoAbastecimento}
              startIcon={<AttachMoney />}
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
};

export default EdicaoAbastecimentoModal;