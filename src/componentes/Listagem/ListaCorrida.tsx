import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, TextField, Button } from "@mui/material";
import { CorridaFrontend, getCorridas } from '../../api/corridaService';
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

const formatDistance = (distance: string | null) => {
  if (!distance) return 'Não informada';
  try {
    const num = parseFloat(distance);
    return isNaN(num) ? 'Formato inválido' : `${num.toFixed(2)} km`;
  } catch {
    return 'Formato inválido';
  }
};

const columns: GridColDef<CorridaFrontend>[] = [
  { 
    field: 'nomeMotorista',
    headerName: 'Motorista', 
    flex: 1,
    renderCell: (params: GridRenderCellParams<CorridaFrontend>) => (
      <Link to={`/corrida/${params.row.idCorrida}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {params.value}
      </Link>
    )
  },
  { 
    field: 'placaVeiculo',
    headerName: 'Veículo', 
    flex: 1,
    renderCell: (params: GridRenderCellParams<CorridaFrontend>) => (
      <Link to={`/corrida/${params.row.idCorrida}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
];

export default function ListaCorridas() {
  const [busca, setBusca] = useState('');
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarCorridas = async () => {
      try {
        const dados = await getCorridas();
        setCorridas(dados);
      } catch (error) {
        console.error("Erro ao carregar corridas:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarCorridas();
  }, []);

  const dadosFiltrados = corridas.filter(corrida =>
    Object.values(corrida).some(valor =>
      String(valor).toLowerCase().includes(busca.toLowerCase())
    )
  );

  return (
    <>
      <Menu />
      <Box sx={{ p: 3 }}>
        <h1>Listagem de Corridas</h1>
        <Button 
          component={Link}
          to="/ColocarTombo"
          variant="contained"
          sx={{ mb: 2 }}
        >
          + Cadastrar Nova Corrida
        </Button>
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
    </>
  );
}
