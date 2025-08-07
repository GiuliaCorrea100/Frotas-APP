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
  DialogContentText,
  DialogActions,
  Typography
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { CorridaFrontend, getCorridas } from '../../api/corridaService';
import { OcorrenciaService } from '../../api/ocorrenciasService';
import Menu from "../Menu";
import { decodeToken } from '../../utils/jwtDecodeHelper';
import { useAuth } from "../../context/AuthContext";

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Em andamento';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleString('pt-BR');
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
  
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedCorrida, setSelectedCorrida] = useState<CorridaFrontend | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosCorridas = await getCorridas();
        setCorridas(dadosCorridas);
        
        const ocorrenciasMap: Record<number, string> = {};
        for (const corrida of dadosCorridas) {
          try {
            const ocorrencia = await OcorrenciaService.buscarPorCorrida(corrida.idCorrida);
            if (ocorrencia) {
              ocorrenciasMap[corrida.idCorrida] = ocorrencia.descricao;
            }
          } catch (error) {
            console.error(`Erro ao buscar ocorrência para corrida ${corrida.idCorrida}:`, error);
          }
        }
        setOcorrencias(ocorrenciasMap);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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
        <Link 
          to={`/corrida/${params.row.idCorrida}`} 
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {params.value}
        </Link>
      )
    },
    { 
      field: 'dataInicio', 
      headerName: 'Data/Hora Início', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {formatDate(params.value as string)}
        </div>
      )
    },
    { 
      field: 'dataTermino', 
      headerName: 'Data/Hora Término', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          {formatDate(params.value as string | null)}
        </div>
      )
    },
    {
      field: 'ocorrencia',
      headerName: 'Ocorrência',
      flex: 2,
      renderCell: (params: GridRenderCellParams<CorridaFrontend>) => (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {ocorrencias[params.row.idCorrida] || 'Nenhuma ocorrência registrada'}
        </div>
      )
    },
    { 
      field: 'situacao',
      headerName: 'Situação',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value || 'Desconhecida'}
          color={
            params.value === 'AGENDADA' ? 'primary' : 
            params.value === 'EM-ANDAMENTO' ? 'secondary' : 
            params.value === 'CONCLUIDA' ? 'success' : 
            'default'
          }
          variant="outlined"
        />
      )
    },
    {
      field: 'detalhes',
      headerName: 'Detalhes',
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
      )
    );

  return (
    <>
      <Menu />
      <Box sx={{ p: 3 }}>
        <h1>Histórico de Corridas</h1>
        <TextField
          label="Buscar"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={dadosFiltrados}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.idCorrida}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Box>
      </Box>

      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Detalhes da Corrida</DialogTitle>
        <DialogContent>
          {selectedCorrida && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" display="inline">Motorista: </Typography>
                <Typography variant="body1" display="inline">{selectedCorrida.nomeMotorista}</Typography>
              </DialogContentText>
              
              <DialogContentText sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" display="inline">Veículo: </Typography>
                <Typography variant="body1" display="inline">{selectedCorrida.placaVeiculo}</Typography>
              </DialogContentText>
              
              <DialogContentText sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" display="inline">Data/Hora Início: </Typography>
                <Typography variant="body1" display="inline">{formatDate(selectedCorrida.dataInicio)}</Typography>
              </DialogContentText>
              
              <DialogContentText sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" display="inline">Data/Hora Término: </Typography>
                <Typography variant="body1" display="inline">{formatDate(selectedCorrida.dataTermino)}</Typography>
              </DialogContentText>
              
              <DialogContentText sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" display="inline">Situação: </Typography>
                <Chip 
                  label={selectedCorrida.situacao || 'Desconhecida'}
                  color={
                    selectedCorrida.situacao === 'AGENDADA' ? 'primary' : 
                    selectedCorrida.situacao === 'EM-ANDAMENTO' ? 'secondary' : 
                    selectedCorrida.situacao === 'CONCLUIDA' ? 'success' : 
                    'default'
                  }
                  variant="outlined"
                  size="small"
                />
              </DialogContentText>
              
              <DialogContentText>
                <Typography variant="subtitle1" fontWeight="bold">Ocorrências:</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {ocorrencias[selectedCorrida.idCorrida] || 'Nenhuma ocorrência registrada'}
                </Typography>
              </DialogContentText>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}