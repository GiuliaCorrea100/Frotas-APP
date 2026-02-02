import { Add, Cancel, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
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
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import Menu from '../../../components/Menu';
import { MultaDto, MultaService } from '../../../services/MultaService';
import CadastroMultaModal from './ModalCadastroMulta';
import EditarMultaModal from './ModalEdicaoMulta';

export default function ListaMulta() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");
  const [multas, setMultas] = useState<MultaDto[]>([]);
  const [filtroClassificacao, setFiltroClassificacao] = useState<string>('TODOS');
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
      const dados = await MultaService.listarMultas();
      const multasAtivas = dados.filter((m) => m.ativa);
      setMultas(multasAtivas);
    } catch (error) {
      console.error("Erro ao carregar multas:", error);
    } finally {
      setLoading(false);
    }
  };

  const estatisticas = useMemo(() => {
    return {
      LEVE: multas.filter(m => m.classificacao === 'LEVE').length,
      MEDIA: multas.filter(m => m.classificacao === 'MEDIA').length,
      GRAVE: multas.filter(m => m.classificacao === 'GRAVE').length,
      GRAVISSIMA: multas.filter(m => m.classificacao === 'GRAVISSIMA').length,
      TODOS: multas.length
    };
  }, [multas]);

  const dadosFiltrados = useMemo(() => {
    return multas.filter(multa => {
      const matchesSearch = busca === '' || 
        Object.values(multa).some(valor =>
          String(valor).toLowerCase().includes(busca.toLowerCase())
        );

      const matchesClassificacao = 
        filtroClassificacao === 'TODOS' || 
        multa.classificacao === filtroClassificacao;

      return matchesSearch && matchesClassificacao;
    });
  }, [multas, busca, filtroClassificacao]);

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
      await MultaService.removerMulta(multaSelecionada.idMulta!); 
      await carregarMultas(); 
      handleFecharModalExcluirMulta();
    } catch (error) {
      console.error("Erro ao excluir multa:", error);
    }
  };

  const formatarDataCorretamente = (dataString: Date | string | null): string => {
    if (!dataString) return '-';
    
    try {
      const date = new Date(dataString);
      
      const offset = date.getTimezoneOffset() * 60000;
      
      const adjustedDate = new Date(date.getTime() + offset);
      
      return adjustedDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  const columns: GridColDef[] = [
    { field: 'idMulta', headerName: 'N°', flex: 1 },
    { field: 'codigoInfracao', headerName: 'Código Infração', flex: 1 },
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
      field: 'motorista',
      headerName: 'Motorista',
      flex: 1.5,
      valueGetter: (params) => {
        const row = params.row;
        return row.nomeMotorista || 
               row.motorista?.nome || 
               (row.idMotorista ? `Motorista #${row.idMotorista}` : 'Não identificado');
      }
    },
    { 
      field: 'dataInfracao', 
      headerName: 'Data da Infração', 
      flex: 1,
      valueFormatter: (params) => {
        return formatarDataCorretamente(params.value);
      }
    },
    { 
      field: 'valorInfracao', 
      headerName: 'Valor', 
      flex: 1,
      valueFormatter: (params) => {
        return params.value ? 
          `R$ ${Number(params.value).toFixed(2).replace('.', ',')}` : 
          'R$ 0,00';
      }
    },
    { 
      field: 'classificacao', 
      headerName: 'Classificação', 
      flex: 1.5,
      renderCell: (params) => {
        const classificacao = params.value || '';
        let color = 'default';
        
        switch(classificacao) {
          case 'LEVE': color = 'success'; break;
          case 'MEDIA': color = 'warning'; break;
          case 'GRAVE': color = 'error'; break;
          case 'GRAVISSIMA': color = 'error'; break;
          default: color = 'default';
        }
        
        return (
          <Chip 
            label={classificacao}
            color={color as any}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    { field: 'autoInfracao', headerName: 'Número do auto', flex: 1 },
    {
      field: 'comprovantePagamento',
      headerName: 'Comprovante Pagamento',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        const url = params.row.urlComprovantePagamento;

        return (
          <Button
            size="small"
            variant="outlined"
            disabled={!url}
            onClick={async () => {
              if (!url) return;
              const fileName = url.split('/').pop()!;
              const blob = await MultaService.downloadArquivo(fileName);

              const downloadUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `comprovante_${params.row.autoInfracao}.pdf`;
              link.click();
              window.URL.revokeObjectURL(downloadUrl);
            }}
          >
            Comprovante
          </Button>
        );
      }
    },
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
        display: 'flex',
        flexDirection: 'column',
        flex: 1 
      }}>
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
            Nova Multa
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'LEVES', value: 'LEVE', count: estatisticas.LEVE, color: theme.palette.success.main },
            { label: 'MÉDIAS', value: 'MEDIA', count: estatisticas.MEDIA, color: theme.palette.warning.main },
            { label: 'GRAVES', value: 'GRAVE', count: estatisticas.GRAVE, color: theme.palette.error.main },
            { label: 'GRAVÍSSIMAS', value: 'GRAVISSIMA', count: estatisticas.GRAVISSIMA, color: theme.palette.error.dark },
            { label: 'TODAS', value: 'TODOS', count: estatisticas.TODOS, color: theme.palette.primary.dark }
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filtroClassificacao === tab.value ? "contained" : "outlined"}
              onClick={() => setFiltroClassificacao(tab.value)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                fontWeight: filtroClassificacao === tab.value ? 600 : 500,
                color: filtroClassificacao === tab.value ? 'white' : 'text.primary',
                bgcolor: filtroClassificacao === tab.value ? tab.color : 'background.paper',
                '&:hover': {
                  bgcolor: filtroClassificacao === tab.value
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
                }
              }}
            >
              {tab.label}
              <Box sx={{
                ml: 1,
                fontWeight: 600,
                backgroundColor: filtroClassificacao === tab.value 
                  ? 'rgba(255,255,255,0.2)' 
                  : (theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200]),
                color: filtroClassificacao === tab.value 
                  ? 'white' 
                  : (theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.text.primary),
                px: 1,
                borderRadius: 12
              }}>
                {tab.count}
              </Box>
            </Button>
          ))}
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Buscar multas..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            fullWidth
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2, 
                backgroundColor: theme.palette.background.paper 
              } 
            }}
          />
        </Box>

        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={dadosFiltrados}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.idMulta}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 8, page: 0 },
              },
            }}
            pageSizeOptions={[8, 16, 24]}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
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
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                marginBottom: 0,
                alignSelf: 'center',
              },
              '& .MuiTablePagination-toolbar': {
                minHeight: '52px',
                alignItems: 'center',
              },
              boxShadow: theme.shadows[1],
              borderRadius: 2,
              border: 'none',
              backgroundColor: theme.palette.background.paper,              
              height: 'calc(100vh - 350px)',
            }}
            rowSelection={false}
          />
        </Box>

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