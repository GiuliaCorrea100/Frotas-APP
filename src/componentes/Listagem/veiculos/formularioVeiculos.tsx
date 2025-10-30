import React, { FormEvent, useCallback, useEffect, useState } from 'react';
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
  Grid,
} from '@mui/material';
import { DirectionsCar, Close, Save, Search } from '@mui/icons-material';
import { CarroDto, CarroService } from '../../../api/CarroService';
import { TipoCombustivel, TipoCombustivelService } from '../../../api/tipoCombustivelService';
import axiosConnect from "../../../services/axiosConnect";

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface FormularioVeiculosProps {
  idVeiculo?: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError: (error: any) => void;
}

const FormularioVeiculos: React.FC<FormularioVeiculosProps> = ({
  idVeiculo,
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  // Estados para os dados do formulário
  const [placa, setPlaca] = useState<string>('');
  const [odometro, setOdometro] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [ano, setAno] = useState<number>(0);
  const [tombo, setTombo] = useState<string>('');
  const [localidadeFisica, setLocalidadeFisica] = useState<string>('');
  const [tipoCombustivelSelecionado, setTipoCombustivelSelecionado] = useState<TipoCombustivel | null>(null);
  
  const [tiposCombustivelDisponiveis, setTiposCombustivelDisponiveis] = useState<TipoCombustivel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [veiculoExistente, setVeiculoExistente] = useState<any>(null);
  const [errorTombo, setErrorTombo] = useState<string | null>(null);

  const hasInitializedNovoVeiculo = React.useRef(false);

  // Função para buscar detalhes do veículo pelo tombo
  const fetchDetalhesVeiculo = useCallback(async (tomboConsulta: string) => {
    setErrorTombo(null);
    setErrors(prev => ({ ...prev, tombo: '' }));

    if (tomboConsulta.trim() === '') {
      setErrors(prev => ({ ...prev, tombo: 'O campo Tombo não pode estar vazio.' }));
      return;
    }

    try {
      // Verifica se já existe um veículo com este tombo
      const response = await axiosConnect.get(`/carros/por-tombo/${tomboConsulta}`);
      const veiculo = response.data;
      
      if (veiculo) {
        setVeiculoExistente(veiculo);
        // Se estiver no modo cadastro e já existir veículo, mostra erro
        if (!modoEdicao) {
          setErrorTombo('Já existe um veículo cadastrado com este tombo.');
          return;
        }
        // Se estiver no modo edição, preenche os dados para edição
        if (modoEdicao && idVeiculo === veiculo.id) {
          preencherDadosVeiculo(veiculo);
        }
      } else {
        setVeiculoExistente(null);
        if (modoEdicao) {
          setErrorTombo('Veículo não encontrado para edição.');
        }
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setVeiculoExistente(null);
        if (modoEdicao) {
          setErrorTombo('Veículo não encontrado.');
        }
      } else {
        setErrorTombo('Erro ao consultar veículo. Tente novamente.');
        console.error('Erro ao consultar veículo:', error);
      }
    }
  }, [modoEdicao, idVeiculo]);

  // Função para preencher dados do veículo no formulário
  const preencherDadosVeiculo = (veiculo: any) => {
    setPlaca(veiculo.placa || '');
    setOdometro(veiculo.odometro?.toString() || '');
    setModelo(veiculo.modelo || '');
    setAno(veiculo.ano || 0);
    setTombo(veiculo.tombo?.toString() || '');
    setLocalidadeFisica(veiculo.localidadeFisica || '');
    setTipoCombustivelSelecionado(veiculo.tipoCombustivel || null);
  };

  // Função para consultar veículo (similar ao handleConsultarBem)
  const handleConsultarVeiculo = useCallback(async () => {
    setLoading(true);
    setErrorTombo('');
    setErrors(prev => ({ ...prev, tombo: '' }));

    if (tombo.trim() === '') {
      setErrors(prev => ({ ...prev, tombo: 'O campo Tombo não pode estar vazio.' }));
      setLoading(false);
      return;
    }

    await fetchDetalhesVeiculo(tombo);
    setLoading(false);
  }, [tombo, fetchDetalhesVeiculo]);

  // Efeito para carregar dados quando em modo edição
  useEffect(() => {
    if (open && idVeiculo) {
      setModoEdicao(true);
      setLoading(true);
      hasInitializedNovoVeiculo.current = false;
      
      const fetchDadosVeiculo = async () => {
        try {
          const response = await CarroService.buscarPorId(idVeiculo);
          const veiculoData = response;
          
          setVeiculoExistente(veiculoData);
          preencherDadosVeiculo(veiculoData);
          
          // Se houver tombo, consulta para verificar existência
          if (veiculoData.tombo) {
            await fetchDetalhesVeiculo(veiculoData.tombo.toString());
          }
          
        } catch (err: any) {
          console.error('Erro ao buscar os dados do veículo:', err);
          onError('Erro ao carregar dados do veículo. Tente novamente.');
          handleClose();
        } finally {
          setLoading(false);
        }
      };

      fetchDadosVeiculo();
    } else if (open) {
      // Modo cadastro - reseta estados
      setModoEdicao(false);
      setVeiculoExistente(null);
      setErrorTombo(null);
      hasInitializedNovoVeiculo.current = true;
    }
  }, [open, idVeiculo, onError, fetchDetalhesVeiculo]);

  // Efeito para carregar tipos de combustível
  useEffect(() => {
    if (open) {
      setErrors({});
      setSuccessMessage('');
      
      const buscarTipos = async () => {
        try {
          const res = await TipoCombustivelService.listar();
          const tipos = res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
          setTiposCombustivelDisponiveis(tipos);
        } catch (error) {
          console.error('Erro ao carregar tipos de combustível:', error);
          setErrors({ geral: 'Erro ao carregar tipos de combustível.' });
        }
      };
      buscarTipos();
    }
  }, [open]);

  const handleSelectChange = (e: SelectChangeEvent) => {
    const idSelecionado = e.target.value;
    const tipoSelecionado = tiposCombustivelDisponiveis.find(
      (tipo) => tipo.idTipoCombustivel?.toString() === idSelecionado
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
    return valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limpa o erro específico ao digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Limpa erro do tombo quando usuário digita
    if (name === 'tombo') {
      setErrorTombo(null);
      setVeiculoExistente(null);
    }
    
    switch (name) {
      case 'placa':
        setPlaca(formatarPlaca(value));
        break;
      case 'odometro':
        setOdometro(value);
        break;
      case 'modelo':
        setModelo(value);
        break;
      case 'ano':
        setAno(Number(value));
        break;
      case 'tombo':
        setTombo(value);
        break;
      case 'localidadeFisica':
        setLocalidadeFisica(value);
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!placa) newErrors.placa = 'Placa é obrigatória.';
    else if (placa.length !== 7) newErrors.placa = 'A placa deve ter 7 caracteres alfanuméricos.';

    if (!odometro || parseFloat(odometro) < 0) newErrors.odometro = 'Odômetro é obrigatório e deve ser um valor válido.';
    if (!modelo) newErrors.modelo = 'Modelo é obrigatório.';
    if (!ano) newErrors.ano = 'Ano é obrigatório.';
    if (!tombo) newErrors.tombo = 'Tombo é obrigatório.';
    if (!localidadeFisica) newErrors.localidadeFisica = 'Localidade Física é obrigatória.';
    if (!tipoCombustivelSelecionado) newErrors.tipoCombustivel = 'Tipo de Combustível é obrigatório.';

    // Validação adicional para evitar duplicação em modo cadastro
    if (!modoEdicao && veiculoExistente) {
      newErrors.tombo = 'Já existe um veículo com este tombo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !errorTombo;
  };

  const handleClose = () => {
    // Resetar o estado ao fechar
    setPlaca('');
    setOdometro('');
    setModelo('');
    setAno(0);
    setTombo('');
    setLocalidadeFisica('');
    setTipoCombustivelSelecionado(null);
    setErrors({});
    setSuccessMessage('');
    setErrorTombo(null);
    setVeiculoExistente(null);
    setModoEdicao(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();

      if (!validateForm()) return;

      // Validação final para evitar cadastro duplicado
      if (!modoEdicao && veiculoExistente) {
          setErrorTombo('Não é possível cadastrar: já existe um veículo com este tombo.');
          return;
      }

      const dadosVeiculo: CarroDto = {
          placa,
          odometro: odometro, // mantém como string
          modelo,
          ano: Number(ano),
          tombo: Number(tombo),
          qrCode: '', 
          localidadeFisica: localidadeFisica,
          ativo: true, 
          tipoCombustivel: tipoCombustivelSelecionado as TipoCombustivel,
          // Não inclui situacao - no modo edição mantém a atual, no criação o service define como DISPONIVEL
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
              ? 'Veículo atualizado com sucesso!' 
              : 'Veículo cadastrado com sucesso!';
          
          setSuccessMessage(mensagem);
          
          setTimeout(() => {
              if (onSuccess) onSuccess(mensagem);
              handleClose(); 
          }, 1500);

      } catch (error: any) {
          const mensagemErro = error.response?.data?.message || 'Erro ao salvar veículo. Tente novamente.';
          
          if (error.response?.status === 409) {
              setErrorTombo('Já existe um veículo cadastrado com este tombo.');
          } else {
              setErrors({ geral: mensagemErro });
          }
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-cadastro-carro"
      aria-describedby="modal-formulario-cadastro-veiculo"
    >
      <Paper sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DirectionsCar color="primary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" component="h2">
              {modoEdicao ? 'Edição de Veículo' : 'Cadastro de Veículo'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        {/* Mensagens de feedback */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errors.geral && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.geral}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Tombo com consulta */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={10}>
              <TextField
                label="Tombo"
                name="tombo"
                value={tombo}
                onChange={handleInputChange}
                required
                error={!!errors.tombo || !!errorTombo}
                helperText={errorTombo || errors.tombo || " "}
                fullWidth
                disabled={loading || modoEdicao} // Em modo edição, não permite alterar tombo
              />
            </Grid>
            <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleConsultarVeiculo}
                disabled={!tombo.trim() || loading}
                sx={{ minWidth: '100%', height: '56px' }}
              >
                <Search />
              </Button>
            </Grid>
          </Grid>

          {/* Exibe informações do veículo existente */}
          {veiculoExistente && modoEdicao && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Editando veículo: {veiculoExistente.modelo} - Placa: {veiculoExistente.placa}
            </Alert>
          )}

          {/* Linha 1: Placa e Odômetro */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Placa do Veículo (7 caracteres)"
              name="placa"
              value={placa}
              onChange={handleInputChange}
              placeholder="AAA0A00"
              inputProps={{ maxLength: 7 }}
              required
              error={!!errors.placa}
              helperText={errors.placa}
              sx={{ flex: '1 1 300px' }}
              disabled={loading}
            />
            <TextField
              label="Odômetro (km)"
              name="odometro"
              type="number"
              value={odometro}
              onChange={handleInputChange}
              inputProps={{ min: 0 }}
              required
              error={!!errors.odometro}
              helperText={errors.odometro}
              sx={{ flex: '1 1 300px' }}
              disabled={loading}
            />
          </Box>

          {/* Linha 2: Modelo e Ano */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Modelo do Veículo"
              name="modelo"
              type="text"
              value={modelo}
              onChange={handleInputChange}
              placeholder="Ex: Onix 1.0"
              required
              error={!!errors.modelo}
              helperText={errors.modelo}
              sx={{ flex: '1 1 300px' }}
              disabled={loading}
            />
            <TextField
              label="Ano do Veículo"
              name="ano"
              type="number"
              value={ano}
              onChange={handleInputChange}
              required
              error={!!errors.ano}
              helperText={errors.ano}
              sx={{ flex: '1 1 300px' }}
              disabled={loading}
            />
          </Box>

          {/* Linha 3: Localidade Física */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Localidade Física"
              name="localidadeFisica"
              type="text"
              value={localidadeFisica}
              onChange={handleInputChange}
              placeholder="Ex: Porto Velho"
              required
              error={!!errors.localidadeFisica}
              helperText={errors.localidadeFisica}
              sx={{ flex: '1 1 300px' }}
              disabled={loading}
            />
          </Box>

          {/* Tipo de Combustível */}
          <FormControl fullWidth margin="normal" required error={!!errors.tipoCombustivel} sx={{ mb: 3 }}>
            <InputLabel>Tipo de Combustível</InputLabel>
            <Select
              name="tipoCombustivel"
              value={tipoCombustivelSelecionado?.idTipoCombustivel?.toString() || ''}
              onChange={handleSelectChange}
              label="Tipo de Combustível"
              disabled={loading}
            >
              {tiposCombustivelDisponiveis.map((tipo) => (
                <MenuItem
                  key={tipo.idTipoCombustivel}
                  value={tipo.idTipoCombustivel?.toString()}
                >
                  {tipo.nome}
                </MenuItem>
              ))}
            </Select>
            {errors.tipoCombustivel && (
              <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                {errors.tipoCombustivel}
              </Typography>
            )}
          </FormControl>
          
          <Divider sx={{ my: 2 }} />

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Save />}
              disabled={loading || !!successMessage || !!errorTombo}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {loading 
                ? (modoEdicao ? 'Atualizando...' : 'Cadastrando...') 
                : (modoEdicao ? 'Salvar alterações' : 'Concluir cadastro')
              }
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
};

export default FormularioVeiculos;