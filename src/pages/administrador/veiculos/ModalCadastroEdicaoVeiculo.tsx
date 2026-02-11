import React, { FormEvent, useEffect, useState } from 'react';
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
} from '@mui/material';
import { DirectionsCar, Close, Save } from '@mui/icons-material';
import { CarroDto, CarroService } from '../../../services/CarroService';
import { TipoCombustivel, TipoCombustivelService } from '../../../services/TipoCombustivelService';


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
  const [ano, setAno] = useState<number | null>(null); // ALTERADO: Inicializado como null
  const [tombo, setTombo] = useState<string>('');
  const [localidadeFisica, setLocalidadeFisica] = useState<string>('');
  const [tipoCombustivelSelecionado, setTipoCombustivelSelecionado] = useState<TipoCombustivel | null>(null);
  
  const [tiposCombustivelDisponiveis, setTiposCombustivelDisponiveis] = useState<TipoCombustivel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  
  // Estado para controlar o loading do botão de submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Função para preencher dados do veículo no formulário
  const preencherDadosVeiculo = (veiculo: CarroDto, tiposCombustivel: TipoCombustivel[]) => {
    setPlaca(veiculo.placa || '');
    setOdometro(veiculo.odometro?.toString() || '');
    setModelo(veiculo.modelo || '');
    setAno(veiculo.ano || null); // ALTERADO: Preenche com null se for 0/falsy
    setTombo(veiculo.tombo?.toString() || '');
    setLocalidadeFisica(veiculo.localidadeFisica || '');
    
    if (veiculo.idTipoCombustivel && tiposCombustivel.length > 0) {
      const tipoEncontrado = tiposCombustivel.find(
        tipo => tipo.idTipoCombustivel === veiculo.idTipoCombustivel
      );
      setTipoCombustivelSelecionado(tipoEncontrado || null);
    }
  };

  // Efeito unificado para carregar dados do formulário
  useEffect(() => {
    if (!open) return;

    const carregarDadosFormulario = async () => {
      setLoading(true);
      setErrors({});
      setSuccessMessage('');

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
          resetForm();
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados do formulário:', error);
        const mensagemErro = idVeiculo 
          ? 'Erro ao carregar dados do veículo.' 
          : 'Erro ao carregar tipos de combustível.';
        setErrors({ geral: mensagemErro });
        onError(mensagemErro);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosFormulario();
  }, [open, idVeiculo]);

  // Função para resetar o formulário
  const resetForm = () => {
    setPlaca('');
    setOdometro('');
    setModelo('');
    setAno(null); // ALTERADO: Reseta para null
    setTombo('');
    setLocalidadeFisica('');
    setTipoCombustivelSelecionado(null);
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(false); // Resetar estado de submit
  };

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
    
    switch (name) {
      case 'placa':
        setPlaca(formatarPlaca(value));
        break;
      case 'odometro':
        setOdometro(value);
        break;
      case 'modelo':
        setModelo(value.toUpperCase());
        break;
      case 'ano':
        setAno(value === '' ? null : Number(value)); // ALTERADO: Trata string vazia como null
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
    if (ano === null || ano === 0) newErrors.ano = 'Ano é obrigatório.'; // ALTERADO: Verifica se é null ou 0
    if (!tombo) newErrors.tombo = 'Tombo é obrigatório.';
    if (!localidadeFisica) newErrors.localidadeFisica = 'Localidade Física é obrigatória.';
    if (!tipoCombustivelSelecionado) newErrors.tipoCombustivel = 'Tipo de Combustível é obrigatório.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();

      if (!validateForm()) return;

      // Iniciar o loading do botão
      setIsSubmitting(true);

      const dadosVeiculo: CarroDto = {
          placa,
          odometro: odometro,
          modelo,
          ano: ano as number, // Assumimos que a validação garante que não é null
          tombo: Number(tombo),
          qrCode: '', 
          localidadeFisica: localidadeFisica,
          ativo: true, 
          idTipoCombustivel: tipoCombustivelSelecionado?.idTipoCombustivel as number,
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
              setErrors({ geral: 'Já existe um veículo cadastrado com estes dados.' });
          } else {
              setErrors({ geral: mensagemErro });
          }
          console.error(error);
      } finally {
          setLoading(false);
          setIsSubmitting(false); // Parar o loading do botão
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
            <Typography variant="h5" component="h2" color="text.primary">
              {modoEdicao ? 'Edição de Veículo' : 'Cadastro de Veículo'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading || isSubmitting}>
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
          {/* Campo Tombo como campo simples */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Tombo"
              name="tombo"
              value={tombo}
              onChange={handleInputChange}
              required
              error={!!errors.tombo}
              helperText={errors.tombo || "Número de identificação do veículo no patrimônio"}
              fullWidth
              disabled={loading || isSubmitting} 
              placeholder="Digite o número do tombo"
            />
          </Box>

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
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
            />
            <TextField
              label="Ano do Veículo"
              name="ano"
              type="number"
              value={ano === null ? '' : ano} // ALTERADO: Exibe '' se for null
              onChange={handleInputChange}
              required
              error={!!errors.ano}
              helperText={errors.ano}
              sx={{ flex: '1 1 300px' }}
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
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
              disabled={loading || isSubmitting}
            >
              {loading ? (
                <MenuItem disabled>Carregando tipos de combustível...</MenuItem>
              ) : (
                tiposCombustivelDisponiveis.map((tipo) => (
                  <MenuItem
                    key={tipo.idTipoCombustivel}
                    value={tipo.idTipoCombustivel?.toString()}
                  >
                    {tipo.nome}
                  </MenuItem>
                ))
              )}
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
              disabled={isSubmitting || !!successMessage}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || isSubmitting || !!successMessage}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                  {modoEdicao ? 'Salvando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  <Save sx={{ mr: 1, fontSize: 20 }} />
                  {modoEdicao ? 'Salvar alterações' : 'Concluir cadastro'}
                </>
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
};

export default FormularioVeiculos;
