import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { 
  Box, 
  TextField, 
  Chip, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Alert,
  InputAdornment
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, ptBR } from '@mui/x-data-grid';
import { Search, DirectionsCar, CalendarToday, AccessTime, Warning } from '@mui/icons-material';
import { CorridaFrontend, getCorridas } from '../../api/corridaService';
import { OcorrenciaService } from '../../api/ocorrenciasService';
import Menu from "../Menu";
import { decodeToken } from '../../utils/jwtDecodeHelper';
import { useAuth } from "../../context/AuthContext";

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Em andamento';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return 'Data inválida';
  }
};

const formatDistance = (distance: string | null) => {
  if (!distance) return 'Não informada';
  try {
    const num = parseFloat(distance);
    return isNaN(num) ? 'Formato inválido' : `${num.toFixed(2)} km`;
  } catch {
    return 'Formato inválido';
  }
};

const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case 'AGENDADA': return 'primary';
    case 'EM-ANDAMENTO': return 'secondary';
    case 'CONCLUIDA': return 'success';
    case 'CANCELADA': return 'error';
    default: return 'default';
  }
};

const getStatusText = (status: string | undefined) => {
  switch (status) {
    case 'AGENDADA': return 'Agendada';
    case 'EM-ANDAMENTO': return 'Em Andamento';
    case 'CONCLUIDA': return 'Concluída';
    case 'CANCELADA': return 'Cancelada';
    default: return status || 'Desconhecida';
  }
};

export default function HistoricoIndividual() {
  const { token } = useAuth();
  const decodedToken = token 
    ? decodeToken<{ sub: string }>(token)
    : null;
  const idUsuarioLogado = decodedToken?.sub 
    ? Number(decodedToken.sub) 
    : null;

  const [busca, setBusca] = useState('');
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedCorrida, setSelectedCorrida] = useState<CorridaFrontend | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setError(null);
        const dadosCorridas = await getCorridas();
        setCorridas(dadosCorridas);
        
        const ocorrenciasMap: Record<number, string> = {};
        for (const corrida of dadosCorridas) {
          try {
            const ocorrenciasList = await OcorrenciaService.buscarPorCorrida(corrida.idCorrida);
            if (ocorrenciasList.length > 0) {
              // Combinar todas as descrições de ocorrências
              ocorrenciasMap[corrida.idCorrida] = ocorrenciasList
                .map(occ => occ.descricao)
                .join(', ');
            }
          } catch (error) {
            console.error(`Erro ao buscar ocorrência para corrida ${corrida.idCorrida}:`, error);
          }
        }
        setOcorrencias(ocorrenciasMap);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Falha ao carregar histórico de corridas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const handleOpenDetails = (corrida: CorridaFrontend) => {
    setSelectedCorrida(corrida);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedCorrida(null);
  };

  const columns: GridColDef<CorridaFrontend>[] = [
    { 
      field: 'placaVeiculo',
      headerName: 'Veículo', 
      flex: 1,
      renderCell: (params: GridRenderCellParams<CorridaFrontend>) => (
        <Box display="flex" alignItems="center">
          <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
          <Link 
            to={`/corrida/${params.row.idCorrida}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {params.value}
          </Link>
        </Box>
      )
    },
    { 
      field: 'dataInicio', 
      headerName: 'Data/Hora Início', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" style={{ whiteSpace: 'nowrap' }}>
          <CalendarToday sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
          {formatDate(params.value as string)}
        </Box>
      )
    },
    { 
      field: 'dataTermino', 
      headerName: 'Data/Hora Término', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" style={{ whiteSpace: 'nowrap' }}>
          <AccessTime sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
          {formatDate(params.value as string | null)}
        </Box>
      )
    },
    {
      field: 'ocorrencia',
      headerName: 'Ocorrência',
      flex: 2,
      renderCell: (params: GridRenderCellParams<CorridaFrontend>) => (
        <Box display="flex" alignItems="center" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {ocorrencias[params.row.idCorrida] ? (
            <>
              <Warning sx={{ mr: 1, color: 'warning.main' }} />
              {ocorrencias[params.row.idCorrida]}
            </>
          ) : (
            'Nenhuma ocorrência registrada'
          )}
        </Box>
      )
    },
    { 
      field: 'situacao',
      headerName: 'Situação',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={getStatusText(params.value as string | undefined)}
          color={getStatusColor(params.value as string | undefined) as any}
          variant="outlined"
        />
      )
    },
    {
      field: 'detalhes',
      headerName: 'Ações',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<CorridaFrontend>) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => handleOpenDetails(params.row)}
        >
          Detalhes
        </Button>
      )
    }
  ];

  const dadosFiltrados = corridas
    .filter(corrida => corrida.idMotorista === idUsuarioLogado)
    .filter(corrida =>
      Object.values(corrida).some(valor =>
        String(valor).toLowerCase().includes(busca.toLowerCase())
      ) || 
      (ocorrencias[corrida.idCorrida] && ocorrencias[corrida.idCorrida].toLowerCase().includes(busca.toLowerCase()))
    );

  return (
    <>
      <Menu />
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
            Histórico de Corridas
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Visualize todas as suas corridas realizadas, incluindo detalhes e ocorrências registradas.
          </Typography>
          
          <TextField
            label="Buscar corridas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            helperText="Busque por placa, datas, situação ou ocorrências"
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        <Paper elevation={2} sx={{ height: '100%', width: '100' }}>
          <DataGrid
            rows={dadosFiltrados}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.idCorrida}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
              sorting: {
                sortModel: [{ field: 'dataInicio', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
                py: 1,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'primary.light',
                color: 'white',
                fontSize: 16,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                marginBottom: 0,
                alignSelf: 'center',
              },
              '& .MuiTablePagination-toolbar': {
                minHeight: '52px',
                alignItems: 'center',
              },
            }}
          />
        </Paper>
      </Box>

      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>
          Detalhes da Corrida
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedCorrida && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsCar color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">Veículo: </Typography>
                  <Typography variant="body1" sx={{ ml: 1 }}>{selectedCorrida.placaVeiculo}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">Data/Hora Início: </Typography>
                  <Typography variant="body1" sx={{ ml: 1 }}>{formatDate(selectedCorrida.dataInicio)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">Data/Hora Término: </Typography>
                  <Typography variant="body1" sx={{ ml: 1 }}>{formatDate(selectedCorrida.dataTermino)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={getStatusText(selectedCorrida.situacao)}
                    color={getStatusColor(selectedCorrida.situacao) as any}
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>Situação:</Typography>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning color="warning" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">Ocorrências:</Typography>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1">
                      {ocorrencias[selectedCorrida.idCorrida] || 'Nenhuma ocorrência registrada'}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary" variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}