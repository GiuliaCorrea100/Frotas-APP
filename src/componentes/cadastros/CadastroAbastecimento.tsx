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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  AbastecimentoService  from '../../api/abastecimentoService';
import { CorridaFrontend, getCorridas } from '../../api/corridaService';
import { TipoCombustivel, TipoCombustivelService } from '../../api/tipoCombustivelService';
import Menu from "../Menu";

interface AbastecimentoFormData {
  litros: number;
  cod_pagamento: number;
  preco_final: number;
  data_abastecimento: string;
  valor_unitario_litro: number;
  valor_medio_litro: number;
  valor_unitario: number;
  valor_medio: number;
  justificativa_alteracao: string;
  tipo_combustivel_id: string;
  id_corrida: string;
}

const CadastroAbastecimento: React.FC = () => {
  const [formData, setFormData] = useState<AbastecimentoFormData>({
    litros: 0,
    cod_pagamento: 0,
    preco_final: 0,
    data_abastecimento: '',
    valor_unitario_litro: 0,
    valor_medio_litro: 0,
    valor_unitario: 0,
    valor_medio: 0,
    justificativa_alteracao: '',
    tipo_combustivel_id:'',
    id_corrida: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    TipoCombustivelService.listar()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTiposCombustivel(res.data);
        } else {
          console.error("Formato inválido de resposta:", res);
        }
      })
      .catch((err) => console.error('Erro ao buscar tipos de combustível:', err));

    getCorridas()
      .then((res) => setCorridas(res))
      .catch((err) => console.error('Erro ao buscar corridas:', err));
  }, []);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.litros) newErrors.litros = 'Litros são obrigatórios';
    if (!formData.cod_pagamento) newErrors.cod_pagamento = 'Código de pagamento é obrigatório';
    if (!formData.preco_final) newErrors.preco_final = 'Preço final é obrigatório';
    if (!formData.data_abastecimento) newErrors.data_abastecimento = 'Data é obrigatória';
    if (!formData.tipo_combustivel_id) newErrors.tipo_combustivel_id = 'Tipo de combustível obrigatório';
    if (!formData.id_corrida) newErrors.id_corrida = 'Corrida obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dadosParaCadastro = {
      litros: Number(formData.litros),
      codPagamento: Number(formData.cod_pagamento),
      precoFinal: Number(formData.preco_final),
      tipo_combustivel: Number(formData.tipo_combustivel_id),
      corrida: Number(formData.id_corrida), 
      dataAbastecimento: formData.data_abastecimento, 
      valorUnitarioLitro: Number(formData.valor_unitario_litro),
      valorMedioLitro: Number(formData.valor_medio_litro),
      valorUnitario: Number(formData.valor_unitario),
      valorMedio: Number(formData.valor_medio),
      justificativaAlteracao: formData.justificativa_alteracao || '',
    };

    try {
      setLoading(true);
      await AbastecimentoService.cadastrarAbastecimento(dadosParaCadastro);
      setSuccessMessage('Cadastro realizado com sucesso!');
      navigate('/ListaAbastecimento');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name!]: value,
    }));
  };

  return (
    <div className="pagina">
      <Menu />
      <Container component="main" maxWidth="xs" sx={{ marginTop: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Cadastro de Abastecimento
          </Typography>

          {successMessage && (
            <Typography variant="body1" color="success.main" sx={{ marginBottom: 2 }}>
              {successMessage}
            </Typography>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField label="Litros" name="litros" type="number" value={formData.litros} onChange={handleInputChange} fullWidth margin="normal" error={!!errors.litros} helperText={errors.litros} />
            <TextField label="Código de Pagamento" name="cod_pagamento" value={formData.cod_pagamento} onChange={handleInputChange} fullWidth margin="normal" error={!!errors.cod_pagamento} helperText={errors.cod_pagamento} />
            <TextField label="Preço Final" name="preco_final" type="number" value={formData.preco_final} onChange={handleInputChange} fullWidth margin="normal" error={!!errors.preco_final} helperText={errors.preco_final} />
            <TextField label="Valor Unitário Litro" name="valor_unitario_litro" type="number" value={formData.valor_unitario_litro} onChange={handleInputChange} fullWidth margin="normal" />
            <TextField label="Valor Médio Litro" name="valor_medio_litro" type="number" value={formData.valor_medio_litro} onChange={handleInputChange} fullWidth margin="normal" />
            <TextField label="Valor Unitário" name="valor_unitario" type="number" value={formData.valor_unitario} onChange={handleInputChange} fullWidth margin="normal" />
            <TextField label="Valor Médio" name="valor_medio" type="number" value={formData.valor_medio} onChange={handleInputChange} fullWidth margin="normal" />
            <TextField label="Justificativa Alteração" name="justificativa_alteracao" value={formData.justificativa_alteracao} onChange={handleInputChange} fullWidth margin="normal" />

            <FormControl fullWidth margin="normal" error={!!errors.tipo_combustivel_id}>
              <InputLabel>Tipo de Combustível</InputLabel>
              <Select name="tipo_combustivel_id" value={formData.tipo_combustivel_id} onChange={handleSelectChange} label="Tipo de Combustível">
                {tiposCombustivel.length === 0 ? (
                  <MenuItem value="">Nenhum tipo disponível</MenuItem>
                ) : (
                  tiposCombustivel.map((tipo) => (
                    <MenuItem key={tipo.id_tipo_combustivel} value={tipo.id_tipo_combustivel}>
                      {tipo.nome}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.tipo_combustivel_id && <Typography color="error">{errors.tipo_combustivel_id}</Typography>}
            </FormControl>

            <FormControl fullWidth margin="normal" error={!!errors.id_corrida}>
              <InputLabel>Corrida</InputLabel>
              <Select name="id_corrida" value={formData.id_corrida} onChange={handleSelectChange} label="Corrida">
                {corridas.map((corrida) => (
                  <MenuItem key={corrida.idCorrida} value={corrida.idCorrida}>
                    {`ID: ${corrida.idCorrida} - ${corrida.nomeMotorista || 'Motorista'} - ${corrida.placaVeiculo || 'Veículo'}`}
                  </MenuItem>
                ))}
              </Select>
              {errors.id_corrida && <Typography color="error">{errors.id_corrida}</Typography>}
            </FormControl>

            <TextField label="Data de Abastecimento" name="data_abastecimento" type="date" value={formData.data_abastecimento} onChange={handleInputChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} error={!!errors.data_abastecimento} helperText={errors.data_abastecimento} />

            <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        </Box>
      </Container>
    </div>
  );
};

export default CadastroAbastecimento;