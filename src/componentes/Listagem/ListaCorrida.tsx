import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from "@mui/material";
import { DataGrid, GridColDef} from '@mui/x-data-grid';
import { CorridaFrontend, getCorridas, CorridaService } from '../../api/corridaService';
import { OcorrenciaService } from '../../api/ocorrenciasService';
import Menu from "../Menu";

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Em andamento';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleString('pt-BR');
  } catch {
    return 'Data inválida';
  }
};

export default function ListaCorridas() {
  const theme = useTheme();

  const [busca, setBusca] = useState('');
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const [showModalLiberarChave, setShowModalLiberarChave] = useState(false);
  const [showModalReceberChave, setShowModalReceberChave] = useState(false);
  const [selectedCorrida, setSelectedCorrida] = useState<CorridaFrontend | null>(null);
  const [senhaLiberarChave, setSenhaLiberarChave] = useState('');

  const [filtroSituacao, setFiltroSituacao] = useState<string>('TODOS');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosCorridas = await getCorridas();
        setCorridas(dadosCorridas);
        
        const ocorrenciasMap: Record<number, string> = {};
        for (const corrida of dadosCorridas) {
          try {
            const ocorrenciasArray = await OcorrenciaService.buscarPorCorrida(corrida.idCorrida);
            if (ocorrenciasArray && ocorrenciasArray.length > 0) {
              const primeiraOcorrencia = ocorrenciasArray[0];
              if (primeiraOcorrencia && typeof primeiraOcorrencia === 'object' && 'descricao' in primeiraOcorrencia) {
                ocorrenciasMap[corrida.idCorrida] = primeiraOcorrencia.descricao;
              } else {
                ocorrenciasMap[corrida.idCorrida] = 'Ocorrência registrada';
              }
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

  const qtdAgendadas = corridas.filter(c => c.situacao === 'AGENDADA').length;
  const qtdEmAndamento = corridas.filter(c => c.situacao === 'ANDAMENTO').length;
  const qtdFinalizadas = corridas.filter(c => c.situacao === 'FINALIZADA').length;

  const dadosFiltrados = corridas.filter(corrida => {
    const matchesSearch = Object.values(corrida).some(valor =>
      String(valor).toLowerCase().includes(busca.toLowerCase())
    );

    const matchesSituacao =
      filtroSituacao === 'TODOS' ||
      corrida.situacao === filtroSituacao;

    return matchesSearch && matchesSituacao;
  });

  const handleAbrirModalLiberarChave = (corrida: CorridaFrontend) => {
    setSelectedCorrida(corrida);
    setShowModalLiberarChave(true);
  };

  const handleAbrirModalReceberChave = (corrida: CorridaFrontend) => {
    setSelectedCorrida(corrida);
    setShowModalReceberChave(true);
  };

  const columns: GridColDef<CorridaFrontend>[] = [
    {
      field: 'nomeMotorista',
      headerName: 'Motorista',
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'placaVeiculo',
      headerName: 'Veículo',
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.value}</Typography>
      )
    },
    {
      field: 'dataInicio',
      headerName: 'Data/Hora Início',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value as string)}
        </Typography>
      )
    },
    {
      field: 'dataTermino',
      headerName: 'Data/Hora Término',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value as string | null)}
        </Typography>
      )
    },
    {
      field: 'ocorrencia',
      headerName: 'Ocorrência',
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {ocorrencias[params.row.idCorrida] || 'Nenhuma ocorrência registrada'}
        </Typography>
      )
    },
    {
      field: 'situacao',
      headerName: 'Situação',
      flex: 1,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case 'AGENDADA':
            color = theme.palette.info.main;
            break;
          case 'ANDAMENTO':
            color = theme.palette.warning.main;
            break;
          case 'FINALIZADA':
            color = theme.palette.success.main;
            break;
          default:
            color = theme.palette.text.secondary;
        }
        return (
          <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
            {params.value}
          </Typography>
        );
      }
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const corrida = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleAbrirModalLiberarChave(corrida)}
              disabled={
                ((corrida.chaveEmprestada === true) && (corrida.situacao === "FINALIZADA" || corrida.situacao === "ANDAMENTO" || corrida.situacao === "AGENDADA"))
                || ((corrida.situacao === "FINALIZADA") && (corrida.chaveEmprestada === false))
              }
            >
              Liberar Chave
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => handleAbrirModalReceberChave(corrida)}
              disabled={((corrida.chaveEmprestada === false) && (corrida.situacao === "AGENDADA" || corrida.situacao === "ANDAMENTO" || corrida.situacao === "FINALIZADA")) 
                ||( (corrida.chaveEmprestada === true ) && (corrida.situacao === "AGENDADA" || corrida.situacao === "ANDAMENTO")) }
            >
              Receber Chave
            </Button>
          </Box>
        );
      }
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
            Listagem de Corridas
          </Typography>

          <Button
            component={Link}
            to="/ColocarTombo"
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[2]
            }}
          >
            + Agendar Corrida
          </Button>
        </Box>

        <Box sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          flexWrap: 'wrap'
        }}>
          {[
            { label: 'AGENDADA', value: 'AGENDADA', count: qtdAgendadas, color: theme.palette.info.main },
            { label: 'EM ANDAMENTO', value: 'ANDAMENTO', count: qtdEmAndamento, color: theme.palette.warning.main },
            { label: 'FINALIZADA', value: 'FINALIZADA', count: qtdFinalizadas, color: theme.palette.success.main },
            { label: 'TODOS', value: 'TODOS', count: corridas.length, color: theme.palette.text.secondary }
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
                bgcolor: filtroSituacao === tab.value ? tab.color : 'background.paper',
                '&:hover': {
                  bgcolor: filtroSituacao === tab.value
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
                }
              }}
            >
              {tab.label}
              <Box sx={{
                ml: 1,
                fontWeight: 600,
                backgroundColor: filtroSituacao === tab.value
                  ? 'rgba(255,255,255,0.2)'
                  : theme.palette.grey[200],
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
            placeholder="Buscar corridas..."
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

        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.idCorrida}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50]}
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

      <Dialog
        open={showModalLiberarChave}
        onClose={() => setShowModalLiberarChave(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Liberar chave</DialogTitle>
        <DialogContent>
          <Typography>
            Você está entregando a chave do carro ao motorista:
            <strong> {selectedCorrida?.nomeMotorista}</strong>
          </Typography>
          <TextField
            label=" "
            type="password"
            value={senhaLiberarChave}
            onChange={(e) => setSenhaLiberarChave(e.target.value)}
            fullWidth
            variant="outlined"
          
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowModalLiberarChave(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (selectedCorrida) {
                try {
                  await CorridaService.confirmarLiberarChave(selectedCorrida.idCorrida, selectedCorrida.idMotorista, senhaLiberarChave);
                  const dadosAtualizados = await getCorridas();
                  setCorridas(dadosAtualizados);
                  setShowModalLiberarChave(false);
                  setSenhaLiberarChave('');
                } catch (error) {
                  console.error(error);
                }
              }
            }}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showModalReceberChave}
        onClose={() => setShowModalReceberChave(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Receber chave</DialogTitle>
        <DialogContent>
          <Typography>
            Você confirma que está recebendo a chave do motorista
            <strong> {selectedCorrida?.nomeMotorista}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowModalReceberChave(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (selectedCorrida) {
                try {
                  await CorridaService.confirmarReceberChave(selectedCorrida.idCorrida);
                  const dadosAtualizados = await getCorridas();
                  setCorridas(dadosAtualizados);
                  setShowModalReceberChave(false);
                } catch (error) {
                  console.error(error);
                }
              }
            }}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}