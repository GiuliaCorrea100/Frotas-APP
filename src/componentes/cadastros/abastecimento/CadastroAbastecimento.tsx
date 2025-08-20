import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  Paper,
  Divider,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CorridaFrontend, getCorridas } from '../../../api/corridaService';
import { TipoCombustivel, TipoCombustivelService } from '../../../api/tipoCombustivelService';
import Menu from "../../Menu";
import AbastecimentoService from '../../../api/abastecimentoService';
import { LocalGasStation, AttachMoney, CalendarToday } from '@mui/icons-material';

const CadastroAbastecimento: React.FC = () => {
  const [formData, setFormData] = useState({
    litros: '',
    cod_pagamento: '',
    preco_final: '',
    data_abastecimento: '',
    valor_unitario_litro: '',
    valor_medio_litro: '',
    valor_unitario: '',
    valor_medio: '',
    justificativa_alteracao: '',
    tipo_combustivel_id: '',
    id_corrida: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [corridaSelecionada, setCorridaSelecionada] = useState<CorridaFrontend | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar tipos de combustível
    TipoCombustivelService.listar()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTiposCombustivel(res.data);
        } else {
          console.error("Formato inválido de resposta:", res);
        }
      })
      .catch((err) => console.error('Erro ao buscar tipos de combustível:', err));

    // Carregar corridas
    getCorridas()
      .then((res) => setCorridas(res))
      .catch((err) => console.error('Erro ao buscar corridas:', err));
  }, []);

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

    const dadosParaCadastro = {
      litros: parseFloat(formData.litros),
      codPagamento: parseInt(formData.cod_pagamento),
      precoFinal: parseFloat(formData.preco_final),
      dataAbastecimento: formData.data_abastecimento,
      valorUnitarioLitro: formData.valor_unitario_litro ? parseFloat(formData.valor_unitario_litro) : 0,
      valorMedioLitro: formData.valor_medio_litro ? parseFloat(formData.valor_medio_litro) : 0,
      valorUnitario: formData.valor_unitario ? parseFloat(formData.valor_unitario) : 0,
      valorMedio: formData.valor_medio ? parseFloat(formData.valor_medio) : 0,
      justificativaAlteracao: formData.justificativa_alteracao || '',
      tipo_combustivel: parseInt(formData.tipo_combustivel_id),
      corrida: parseInt(formData.id_corrida),
    };

    try {
      setLoading(true);
      await AbastecimentoService.cadastrarAbastecimento(dadosParaCadastro);
      setSuccessMessage('Cadastro realizado com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/ListaAbastecimento');
      }, 2000);
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
    
    // Limpar erro do campo quando usuário começar a digitar
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

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    // Limpar erro do campo quando usuário selecionar uma opção
    if (errors[name!]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name!];
        return newErrors;
      });
    }
    
    setFormData((prev) => ({
      ...prev,
      [name!]: value,
    }));
  };

  // Obter data atual no formato YYYY-MM-DD
  const getCurrentDate = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  return (
    <div className="pagina">
      <Menu />
      <Container component="main" maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocalGasStation color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Cadastro de Abastecimento
              </Typography>
            </Box>

            {successMessage && (
              <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {errors.submit && (
              <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                {errors.submit}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {/* Informações Básicas */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Informações Básicas
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
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
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
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
                
                <Box sx={{ mt: 2, width: '100%', maxWidth: '400px' }}>
                  <TextField
                    label="Data de Abastecimento"
                    name="data_abastecimento"
                    type="date"
                    value={formData.data_abastecimento}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!errors.data_abastecimento}
                    helperText={errors.data_abastecimento}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: getCurrentDate() }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Tipo de Combustível */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Tipo de Combustível
                </Typography>
                
                <FormControl fullWidth required error={!!errors.tipo_combustivel_id} sx={{ mt: 2, maxWidth: '400px' }}>
                  <InputLabel>Tipo de Combustível</InputLabel>
                  <Select
                    name="tipo_combustivel_id"
                    value={formData.tipo_combustivel_id}
                    onChange={handleSelectChange}
                    label="Tipo de Combustível"
                  >
                    {tiposCombustivel.length === 0 ? (
                      <MenuItem value="">Carregando...</MenuItem>
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
              
              <Divider sx={{ my: 3 }} />
              
              {/* Corrida Relacionada */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Corrida Relacionada
                </Typography>
                
                <FormControl fullWidth required error={!!errors.id_corrida} sx={{ mt: 2 }}>
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
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9', mt: 2 }}>
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
              
              <Divider sx={{ my: 3 }} />
              
              {/* Informações Adicionais */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Informações Adicionais (Opcionais)
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  <TextField
                    label="Valor Médio por Litro"
                    name="valor_medio_litro"
                    type="number"
                    value={formData.valor_medio_litro}
                    onChange={handleInputChange}
                    sx={{ flex: '1 1 200px' }}
                    inputProps={{ min: 0, step: 0.001 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                  
                  <TextField
                    label="Valor Unitário"
                    name="valor_unitario"
                    type="number"
                    value={formData.valor_unitario}
                    onChange={handleInputChange}
                    sx={{ flex: '1 1 200px' }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                  
                  <TextField
                    label="Valor Médio"
                    name="valor_medio"
                    type="number"
                    value={formData.valor_medio}
                    onChange={handleInputChange}
                    sx={{ flex: '1 1 200px' }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                </Box>
                
                <TextField
                  label="Justificativa de Alteração"
                  name="justificativa_alteracao"
                  value={formData.justificativa_alteracao}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Informe a justificativa para alterações de valores, se aplicável"
                  sx={{ mt: 2 }}
                />
              </Box>
              
              {/* Botões */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/ListaAbastecimento')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<AttachMoney />}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default CadastroAbastecimento;