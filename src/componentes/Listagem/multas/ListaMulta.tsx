import { Add, Cancel, CheckCircle, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Menu from '../../Menu';
import { listarMultas, MultaDto, removerMulta } from '../../../api/multaService';
import React from 'react';
import CadastroMultaModal from './modais/adicionarMulta';
import EditarMultaModal from './modais/editarMulta';

interface Multa {
  idMultas: number;
  codInfracao: string;
  placaVeiculo: string;
  data: Date;
  valor: string;
  classInfracao: string;
  numAutoInfracao: number;
  ativo?: boolean; // Adicionado para compatibilidade com o código existente
}

export default function ListaMulta() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalCadastrarAberto, setModalCadastroAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [multaSelecionada, setMultaSelecionada] = useState<MultaDto | null>(null);

  useEffect(() => {
    carregarMultas();
  }, []);

  const carregarMultas = async () => {
    setLoading(true);
    try {
      const dados = await listarMultas();
      setMultas(dados);
    } catch (error) {
      console.error("Erro ao carregar multas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalCadastrarMulta = () => {
    setModalCadastroAberto(true);
  };

  const handleFecharModalCadastrarMulta = () => {
    setModalCadastroAberto(false);
  };

  const handleAbrirModalEditarMulta = (multa: MultaDto) => {
    setModalEditarAberto(true);
    setMultaSelecionada(multa);
  };

  const handleFecharModalEditarMulta = () => {
    setModalEditarAberto(false);
    setMultaSelecionada(null);
  };

  const handleAbrirModalExcluirMulta = (multa: MultaDto) => {
    setModalExcluirAberto(true);
    setMultaSelecionada(multa);
  };

  const handleFecharModalExcluirMulta = () => {
    setModalExcluirAberto(false);
    setMultaSelecionada(null);
  };

  const handleConfirmarExclusao = async () => {
    if (!multaSelecionada) return;
    
    try {
      await removerMulta(multaSelecionada.idMulta); // Corrigido para idMultas
      await carregarMultas(); // Recarrega a lista após exclusão
      handleFecharModalExcluirMulta();
    } catch (error) {
      console.error("Erro ao excluir multa:", error);
    }
  };

  const dadosFiltrados = multas.filter((multa) =>
    Object.values(multa).some((valor) =>
      String(valor).toLowerCase().includes(busca.toLowerCase())
    )
  );

  const columns: GridColDef[] = [
    { field: 'codInfracao', headerName: 'Código Infração', flex: 1 },
    {
      field: 'placaVeiculo',
      headerName: 'Placa',
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'data', 
      headerName: 'Data da Infração', 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('pt-BR');
      }
    },
    { field: 'valor', headerName: 'Valor', flex: 1 },
    { field: 'classInfracao', headerName: 'Classificação', flex: 2 },
    { field: 'numAutoInfracao', headerName: 'Número do auto', flex: 1 },
    {
      field: 'acoes',
      headerName: 'Ações',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Editar multa">
            <IconButton 
              color="primary"
              size="small"
              onClick={() => handleAbrirModalEditarMulta(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Excluir multa">
            <IconButton 
              color="error"
              size="small"
              onClick={() => handleAbrirModalExcluirMulta(params.row)}
            >
              <Cancel fontSize="small" />
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
        {/* Cabeçalho */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="textPrimary">
            Listagem de Multas
          </Typography>

          <Button
            variant="contained"
            onClick={handleAbrirModalCadastrarMulta}
            startIcon={<Add />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[2]
            }}
          >
            Cadastrar Multa
          </Button>
        </Box>

        {/* Filtros e busca */}
        <Box sx={{
          width: '100%',
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <TextField
            placeholder="Buscar multas..."
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

        {/* Tabela */}
        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.idMultas}
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

        {/* Dialog de Exclusão - CORRIGIDO */}
        <Dialog
          open={modalExcluirAberto}
          onClose={handleFecharModalExcluirMulta}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Excluir Multa</DialogTitle>
          <DialogContent>
            <Typography>
              Você tem certeza que deseja excluir esta multa?
            </Typography>
            {multaSelecionada && (
              <Box mt={2} p={2} sx={{ backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Detalhes da Multa:
                </Typography>
                <Typography variant="body2">
                  Código: {multaSelecionada.codigoInfracao}
                </Typography>
                <Typography variant="body2">
                  Placa: {multaSelecionada.placaVeiculo}
                </Typography>
                <Typography variant="body2">
                  Valor: {multaSelecionada.valorInfracao}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleFecharModalExcluirMulta} 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarExclusao}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Confirmar Exclusão
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modais de Cadastro e Edição */}
        <CadastroMultaModal
          open={modalCadastrarAberto}
          onClose={handleFecharModalCadastrarMulta}
          onSuccess={async () => {
            await carregarMultas();
            handleFecharModalCadastrarMulta();
          }}
          onError={(err) => {
            console.error(err);
          }}
        />

        <EditarMultaModal
          open={modalEditarAberto}
          multa={multaSelecionada}
          onClose={handleFecharModalEditarMulta}
          onSuccess={async () => {
            await carregarMultas();
            handleFecharModalEditarMulta();
          }}
          onError={(err) => {
            console.error(err);
          }}
        />
      </Box>
    </>
  );
}