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
} from '@mui/material';
import { DirectionsCar, Close, Save } from '@mui/icons-material';
import { CarrosDto, CarrosService } from '../../../api/carrosService'; // Ajuste o caminho de importação
import { TipoCombustivel, TipoCombustivelService } from '../../../api/tipoCombustivelService'; // Ajuste o caminho de importação


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


interface formularioVeiculosProps {
  idVeiculo?: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError: (error: any) => void;
  
}

const formularioVeiculos: React.FC<formularioVeiculosProps> = ({
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
  const [tombo, setTombo] = useState<number>(0);
  const [localidadeFisica, setLocalidadeFisica] = useState<string>('');
  const [tipoCombustivelSelecionado, setTipoCombustivelSelecionado] = useState<TipoCombustivel | null>(null);
  
  
  const [tiposCombustivelDisponiveis, setTiposCombustivelDisponiveis] = useState<TipoCombustivel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);


  
  const hasInitializaedNovoVeiculo = React.useRef(false);

  // Efeito para carregar tipos de combustível ao abrir o modal
  useEffect(() => {
    if (open) {
      setErrors({});
      setSuccessMessage('');
      
      const buscarTipos = async () => {
        try {
          const res = await TipoCombustivelService.listar();
          // Lida com diferentes formatos de resposta da API
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
      (tipo) => tipo.id_tipo_combustivel?.toString() === idSelecionado
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
    // Permite apenas letras e números, e limita a 7 caracteres
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
              setModelo(value);
              break;
          case 'ano':
              setAno(value);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    // Resetar o estado ao fechar
    setPlaca('');
    setOdometro('');
    setModelo('');
    setAno('');
    setTombo('');
    setLocalidadeFisica('');
    setTipoCombustivelSelecionado(null);
    setErrors({});
    setSuccessMessage('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    const novoCarro: CarrosDto = {
      placa,
      odometro,
      modelo,
      ano: Number(ano),
      tombo: Number(tombo),
      qrCode: '', 
      localidade_fisica: localidadeFisica,
      situacao: 'DISPONIVEL', 
      ativo: true, 
      tipo_combustivel: tipoCombustivelSelecionado as TipoCombustivel,
    };

    try {
      setLoading(true);
      const carroCadastrado = await CarrosService.criar(novoCarro);
      setSuccessMessage('Veículo cadastrado com sucesso!');
      
      setTimeout(() => {
        if (onSuccess) onSuccess(carroCadastrado);
        handleClose(); 
      }, 1500);

    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || 'Erro ao cadastrar veículo. Tente novamente.';
      setErrors({ geral: mensagemErro });
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
              Cadastro de Veículo
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

          {/* Linha 3: Tombo e Localidade Física */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Tombo"
              name="tombo"
              type="number"
              value={tombo}
              onChange={handleInputChange}
              required
              error={!!errors.tombo}
              helperText={errors.tombo}
              sx={{ flex: '1 1 300px' }}
              disabled={loading}
            />
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

          {/* Tipo de Combustível (Tela Cheia) */}
          <FormControl fullWidth margin="normal" required error={!!errors.tipoCombustivel} sx={{ mb: 3 }}>
            <InputLabel>Tipo de Combustível</InputLabel>
            <Select
              name="tipoCombustivel"
              value={tipoCombustivelSelecionado?.id_tipo_combustivel?.toString() || ''}
              onChange={handleSelectChange}
              label="Tipo de Combustível"
              disabled={loading}
            >
              {tiposCombustivelDisponiveis.map((tipo) => (
                <MenuItem
                  key={tipo.id_tipo_combustivel}
                  value={tipo.id_tipo_combustivel?.toString()}
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
              disabled={loading || !!successMessage}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {loading ? 'Cadastrando...' : 'Concluir cadastro'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
};

export default formularioVeiculos;