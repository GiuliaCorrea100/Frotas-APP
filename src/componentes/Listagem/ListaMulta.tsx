import { Add } from '@mui/icons-material';
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Menu from '../Menu';
import { listarMultas } from '../../api/multaService';

interface Multa {
  idMultas: number;
  codInfracao: string;
  placaVeiculo: string;
  data: Date;
  valor: string;
  classInfracao: string;
  numAutoInfracao: number;
}

export default function ListaMulta() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

    carregarMultas();
  }, []);

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
    { field: 'data', headerName: 'Data da Infração', flex: 1 },
    { field: 'valor', headerName: 'Valor', flex: 1 },
    { field: 'classInfracao', headerName: 'Classificação', flex: 2 },
    { field: 'numAutoInfracao', headerName: 'Número do auto da infração', flex: 1 },
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
            Listagem de Multas
          </Typography>
          
          <Button 
            variant="contained"
            component={Link} 
            to="/CadastroMulta"
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
      </Box>
    </>
  );
}