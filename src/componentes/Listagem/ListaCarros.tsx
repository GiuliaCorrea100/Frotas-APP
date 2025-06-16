import { Add, Cancel, CheckCircle, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { CarrosDto, CarrosService } from "../../api/carrosService";
import { TipoCombustivel } from '../../api/tipoCombustivelService';
import Menu from "../Menu";

export default function ListaCarros() {
  const theme = useTheme();
  const location = useLocation();
  const carroCadastrado = location.state?.carroCadastrado as CarrosDto | undefined;
  const [busca, setBusca] = useState("");
  const [carros, setCarros] = useState<CarrosDto[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('ATIVOS');
  const [filtroSituacao, setFiltroSituacao] = useState<string>('TODOS');
  const [qtdAtivos, setQtdAtivos] = useState<number>(0);
  const [qtdInativos, setQtdInativos] = useState<number>(0);
  const [qtdDisponivel, setQtdDisponivel] = useState<number>(0);
  const [qtdViagem, setQtdViagem] = useState<number>(0);
  const [qtdManutencao, setQtdManutencao] = useState<number>(0);
  
  // Estado para armazenar os tipos de combustível
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);

  // Estados para o modal de confirmação
  const [showModalAtivacao, setShowModalAtivacao] = useState(false);
  const [selectedCarro, setSelectedCarro] = useState<CarrosDto | null>(null);

  // Estados para situacao de veiculo
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCarroForEdit, setSelectedCarroForEdit] = useState<CarrosDto | null>(null);
  const [novaSituacao, setNovaSituacao] = useState<string>('');

  const handleOpenEditModal = (carro: CarrosDto) => {
  setSelectedCarroForEdit(carro);
  setNovaSituacao(carro.situacao);
  setOpenEditModal(true);
};

const handleCloseEditModal = () => {
  setOpenEditModal(false);
  setSelectedCarroForEdit(null);
};

const handleSituacaoChange = (event: SelectChangeEvent) => {
  setNovaSituacao(event.target.value);
};


// Cria um mapa de ID para nome
const mapaCombustiveis = tiposCombustivel.reduce((map, tipo) => {
  if (tipo.id_tipo_combustivel) {
    map[tipo.id_tipo_combustivel] = tipo.nome;
  }
  return map;
}, {} as Record<number, string>);
  useEffect(() => {
    async function carregarCarros() {
      try {
        const lista = await CarrosService.buscarTodos();
        
        // Calcular contadores
        setQtdAtivos(lista.filter(c => c.ativo).length);
        setQtdInativos(lista.filter(c => !c.ativo).length);
        setQtdDisponivel(lista.filter(c => c.situacao === 'DISPONIVEL' && c.ativo).length);
        setQtdViagem(lista.filter(c => c.situacao === 'VIAGEM' && c.ativo).length);
        setQtdManutencao(lista.filter(c => c.situacao === 'MANUTENCAO' && c.ativo).length);
        
        setCarros(lista);
      } catch (error) {
        console.error("Erro ao carregar carros:", error);
      }
    } 
    carregarCarros();
  }, [carroCadastrado]);

  const filteredCarros = carros.filter(carro => {
    const matchesSearchTerm = 
      Object.values(carro).some(valor =>
        String(valor).toLowerCase().includes(busca.toLowerCase())
      );

    const matchesStatus =
      filtroStatus === 'TODOS' ||
      (filtroStatus === 'ATIVOS' && carro.ativo) ||
      (filtroStatus === 'INATIVOS' && !carro.ativo);
      
    const matchesSituacao =
      filtroSituacao === 'TODOS' ||
      carro.situacao === filtroSituacao;

    return matchesSearchTerm && matchesStatus && matchesSituacao;
  });

  // Abre o modal de confirmação
  const handleAbrirModalAtivacao = (carro: CarrosDto) => {
    setSelectedCarro(carro);
    setShowModalAtivacao(true);
  };

  // Confirma a alteração de status
  const handleConfirmarToggleAtivo = async () => {
    if (!selectedCarro || !selectedCarro.idCarros) return;
    
    try {
      await CarrosService.inativar(selectedCarro.idCarros);
      const listaAtualizada = await CarrosService.buscarTodos();
      setCarros(listaAtualizada);
      setShowModalAtivacao(false);
    } catch (error) {
      console.error("Erro ao alternar status:", error);
      alert("Erro ao alternar status do veículo");
    }
  };

  const handleSaveSituacao = async () => {
    if (!selectedCarroForEdit || !selectedCarroForEdit.idCarros) return;
    try {
      console.log('Enviando para API:', selectedCarroForEdit.idCarros, { situacao: novaSituacao });
      await CarrosService.atualizar(
        selectedCarroForEdit.idCarros,
        { situacao: novaSituacao }
      );
      const listaAtualizada: CarrosDto[] = await CarrosService.buscarTodos();
      setCarros(listaAtualizada);
      handleCloseEditModal();
    } catch (error: any) {
      console.error("Erro ao atualizar situação:", error);
      alert("Erro ao atualizar situação do veículo: " + (error?.response?.data?.message || error.message));
    }
  };

  const colunas: GridColDef[] = [
    { 
      field: 'placa', 
      headerName: 'Placa', 
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    { field: 'modelo', headerName: 'Modelo', flex: 2 },
    { field: 'ano', headerName: 'Ano', flex: 1 },
    { field: 'localidade_fisica', headerName: 'Localidade', flex: 1 },
     {
        field: 'tipo_combustivel',
        headerName: 'Combustível',
        flex: 1,
        renderCell: (params) => {
          const valor = params.value;
          let nomeCombustivel = 'Não definido';

          // Caso 1: É um número (ID)
          if (typeof valor === 'number') {
            nomeCombustivel = mapaCombustiveis[valor] || 'Não definido';
          } 
          // Caso 2: É um objeto com propriedade 'nome'
          else if (valor && typeof valor === 'object' && 'nome' in valor) {
            nomeCombustivel = valor.nome;
          }
          // Caso 3: É um objeto incompleto ou string
          else if (valor && typeof valor === 'object') {
            nomeCombustivel = valor.nome || 'Não definido';
          }

          return (
            <Typography variant="body2">
              {nomeCombustivel}
            </Typography>
          );
        }
      },
    { 
      field: 'situacao', 
      headerName: 'Situação', 
      flex: 1,
      renderCell: (params) => {
        if (!params.row.ativo) {
          return (
            <Typography 
              color="textSecondary"
              fontStyle="italic"
              fontWeight={500}
            >
              INATIVO
            </Typography>
          );
        }
        
        let color, texto;
        switch(params.value) {
          case 'DISPONIVEL': 
            color = theme.palette.success.main; 
            texto = 'Disponível';
            break;
          case 'VIAGEM': 
            color = theme.palette.info.main; 
            texto = 'Em Viagem';
            break;
          case 'MANUTENCAO': 
            color = theme.palette.warning.main; 
            texto = 'Manutenção';
            break;
          default: 
            color = theme.palette.text.secondary;
            texto = 'Indisponivel';
        }
        return (
          <Typography 
            style={{ color, fontWeight: 600 }}
            variant="body2"
          >
            {texto}
          </Typography>
        );
      }
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
      
          <Tooltip title="Editar veículo">
            <IconButton 
              color="primary"
              size="small"
               onClick={() => handleOpenEditModal(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={params.row.ativo ? "Inativar veículo" : "Ativar veículo"}>
            <IconButton 
              color={params.row.ativo ? "error" : "success"}
              size="small"
              onClick={() => handleAbrirModalAtivacao(params.row)}
            >
              {params.row.ativo ? 
                <Cancel fontSize="small" /> : 
                <CheckCircle fontSize="small" />
              }
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <>
      <Menu />
      <Box sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="textPrimary">
            Listagem de Veículos
          </Typography>
          
          <Button 
            variant="contained"
            component={Link} 
            to="/CadastroCarro"
            startIcon={<Add />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[2]
            }}
          >
            Novo Veículo
          </Button>
        </Box>

        {/* Filtros por status (Ativos/Inativos) */}
        <Box sx={{ 
          width: '100%',
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}>
            {[
              { label: 'ATIVOS', value: 'ATIVOS', count: qtdAtivos, color: theme.palette.success.main },
              { label: 'INATIVOS', value: 'INATIVOS', count: qtdInativos, color: theme.palette.error.main },
              { label: 'TODOS', value: 'TODOS', count: carros.length, color: theme.palette.text.secondary }
            ].map((tab) => (
              <Button
                key={tab.value}
                disableRipple
                onClick={() => setFiltroStatus(tab.value)}
                sx={{
                  minWidth: 'fit-content',
                  px: 3,
                  py: 1.5,
                  borderRadius: 0,
                  borderBottom: filtroStatus === tab.value ? 2 : 0,
                  borderColor: 'primary.main',
                  color: filtroStatus === tab.value ? 'primary.main' : 'text.primary',
                  fontWeight: filtroStatus === tab.value ? 600 : 400,
                  textTransform: 'none',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                <Box sx={{
                  ml: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: filtroStatus === tab.value ? 'primary.main' : tab.color,
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {tab.count}
                </Box>
              </Button>
            ))}
          </Box>
          
          <TextField
            placeholder="Buscar veículos..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            sx={{ 
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper
              }
            }}
          />
        </Box>

        {/* Filtros por situação operacional */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mb: 3,
          flexWrap: 'wrap',
          rowGap: 2
        }}>
          {[
            { label: 'DISPONÍVEL', value: 'DISPONIVEL', count: qtdDisponivel },
            { label: 'EM VIAGEM', value: 'VIAGEM', count: qtdViagem },
            { label: 'EM MANUTENÇÃO', value: 'MANUTENCAO', count: qtdManutencao }
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filtroSituacao === tab.value ? "contained" : "outlined"}
              onClick={() => setFiltroSituacao(tab.value)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                fontWeight: filtroSituacao === tab.value ? 600 : 500,
                color: filtroSituacao === tab.value ? 'white' : 'text.primary',
                bgcolor: filtroSituacao === tab.value ? 'primary.main' : 'background.paper',
                '&:hover': {
                  bgcolor: filtroSituacao === tab.value ? 'primary.dark' : theme.palette.action.hover,
                }
              }}
            >
              {tab.label} 
              <Box sx={{ 
                ml: 1, 
                fontWeight: 600,
                backgroundColor: filtroSituacao === tab.value ? 'rgba(255,255,255,0.2)' : theme.palette.grey[200],
                px: 1,
                borderRadius: 12
              }}>
                {tab.count}
              </Box>
            </Button>
          ))}
        </Box>

        <DataGrid
          rows={filteredCarros}
          columns={colunas}
          getRowId={(row) => row.idCarros}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 20, 30, 50, 100]}
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 1.5,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.grey[100],
              fontWeight: 'bold',
              borderRadius: 1,
              borderBottom: `2px solid ${theme.palette.divider}`
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                }
              }
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            boxShadow: theme.shadows[1],
            borderRadius: 2,
            border: 'none',
            backgroundColor: theme.palette.background.paper
          }}
          rowSelection={false}
        />
      </Box>

      {/* Modal de editar status do Veículo */}
  <Modal
    open={openEditModal}
    onClose={handleCloseEditModal}
    aria-labelledby="modal-edit-situacao"
  >
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Alterar Situação do Veículo
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Placa: <strong>{selectedCarroForEdit?.placa}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Modelo: <strong>{selectedCarroForEdit?.modelo}</strong>
      </Typography>
      
      <FormControl fullWidth>
        <InputLabel id="situacao-select-label">Nova Situação</InputLabel>
        <Select
          labelId="situacao-select-label"
          value={novaSituacao}
          label="Nova Situação"
          onChange={handleSituacaoChange}
        >
          <MenuItem value="DISPONIVEL">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main
              }} />
              Disponivel
            </Box>
          </MenuItem>
          <MenuItem value="VIAGEM">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: theme.palette.info.main
              }} />
              Em Viagem
            </Box>
          </MenuItem>
          <MenuItem value="MANUTENCAO">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: theme.palette.warning.main
              }} />
              Manutenção
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button 
              onClick={handleCloseEditModal}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveSituacao}
              variant="contained"
              color="primary"
            >
              Salvar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de Ativar/Inativar Veículo */}
      <Modal
        open={showModalAtivacao}
        onClose={() => setShowModalAtivacao(false)}
        aria-labelledby="modal-ativacao-title"
        aria-describedby="modal-ativacao-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography id="modal-ativacao-title" variant="h6" component="h2" gutterBottom>
            Alterar Status do Veículo
          </Typography>
          <Typography variant="body1" className='pb-4' gutterBottom>
            Você está prestes a {selectedCarro?.ativo ? "inativar" : "ativar"} o veículo {selectedCarro?.placa}.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              onClick={handleConfirmarToggleAtivo}
              variant="contained"
              color={selectedCarro?.ativo ? "error" : "success"} 
            >
              {selectedCarro?.ativo ? "Inativar" : "Ativar"}
            </Button>
            <Button 
              onClick={() => setShowModalAtivacao(false)}
              variant="outlined"
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>
      
    </>
  );
}