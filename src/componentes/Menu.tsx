import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MenuGrid from "./MenuGrid";
import axiosConnect from "../services/axiosConnect";
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: number;
  login: string;
  permissao: number;
  iat: number;
  exp: number;
}

interface Corrida {
  idCorrida: number;
  dataInicio: string;
  itinerario: string;
  placaVeiculo?: string;
  nomeMotorista?: string;
  dataTermino?: string | null;
  situacao?: string;
}

interface MotoristaDashboard {
  corridaDeHoje: Corrida | null;
  proximasCorridas: Corrida[];
}

const Menu: React.FC = () => {
  const { isAuthenticated, cpf, logout, permissao, nome, email } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModalDadosPerfil, setShowModalDadosPerfil] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<MotoristaDashboard | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleAbrirModalDadosPerfil = () => setShowModalDadosPerfil(true);
  const handleFecharModalDadosPerfil = () => setShowModalDadosPerfil(false);

  useEffect(() => {
    const carregarDadosDoDashboard = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const idUsuario = decodedToken?.sub;

        if (idUsuario) {
          const response = await axiosConnect.get<MotoristaDashboard>(`/corrida/motorista-dashboard/${idUsuario}`);
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosDoDashboard();
  }, [isAuthenticated]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Em andamento';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const columns: GridColDef<Corrida>[] = [
    {
      field: 'nomeMotorista',
      headerName: 'Motorista',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Link to={`/corrida/${params.row.idCorrida}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {nome}
        </Link>
      )
    },
    {
      field: 'placaVeiculo',
      headerName: 'Veículo',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Link to={`/corrida/${params.row.idCorrida}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {params.value || 'Não especificado'}
        </Link>
      )
    },
    {
      field: 'dataInicio',
      headerName: 'Data/Hora Início',
      flex: 1,
      renderCell: (params) => formatDate(params.value as string)
    },
    {
      field: 'dataTermino',
      headerName: 'Data/Hora Término',
      flex: 1,
      renderCell: (params) => formatDate(params.value as string | null)
    },
  ];

  const renderContent = () => {
    if (loading) {
      return <CircularProgress />;
    }

    if (!isAuthenticated || !dashboardData) {
      return null;
    }

    if (dashboardData.corridaDeHoje &&
        (dashboardData.corridaDeHoje.situacao === 'ANDAMENTO' ||
         dashboardData.corridaDeHoje.situacao === 'AGENDADA' ||
         dashboardData.corridaDeHoje.situacao === 'FINALIZADA')) {
      return <MenuGrid corrida={dashboardData.corridaDeHoje} />;
    }

    if (dashboardData.proximasCorridas.length > 0) {
      return (
        <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', maxWidth: '900px', mt: 2 }}>
          <Typography variant="h5" gutterBottom align="center">
            Suas Próximas Corridas Agendadas
          </Typography>
          <Paper sx={{ height: 450, width: '100%', mt: 2 }}>
            <DataGrid
              rows={dashboardData.proximasCorridas}
              columns={columns}
              getRowId={(row) => row.idCorrida}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              localeText={{ noRowsLabel: "Nenhuma corrida futura agendada." }}
              sx={{
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal !important',
                  wordWrap: 'break-word !important',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            />
          </Paper>
        </Box>
      );
    }

    return (
      <Typography variant="h6" sx={{ mt: 4 }}>
        Nenhuma corrida agendada.
      </Typography>
    );
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontFamily: "inherit"
            }}
            component={Link}
            to={isAuthenticated ? "/menu" : "/"}
          >
            FROTAS UNIR
          </Typography>

          {isAuthenticated && (
            <>
              {Number(permissao) === 2 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/ListaCorrida"
                    sx={{ fontFamily: "inherit" }}
                  >
                    Painel Corrida
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/ListaCarros"
                    sx={{ fontFamily: "inherit" }}
                  >
                    Veículos
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/ListaMultas"
                    sx={{ fontFamily: "inherit" }}
                  >
                    Multas
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/Administradores"
                    sx={{ fontFamily: "inherit" }}
                  >
                    Administradores
                  </Button>
                </Box>
              )}

              <Button
                color="inherit"
                component={Link}
                to="/HistoricoIndividual"
                sx={{ fontFamily: "inherit" }}
              >
                Relatórios
              </Button>

              {nome && (
                <>
                  <Button
                    color="inherit"
                    onClick={handleAbrirModalDadosPerfil}
                    sx={{ fontFamily: "inherit" }}
                  >
                    {nome}
                  </Button>

                  <Dialog
                    open={showModalDadosPerfil}
                    onClose={handleFecharModalDadosPerfil}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                      sx: {
                        borderRadius: 2,
                        p: 2
                      }
                    }}
                  >
                    <DialogTitle sx={{ fontSize: '1.25rem', p: 2 }}>Seus Dados</DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                          <Typography sx={{ minWidth: 80 }}>Nome:</Typography>
                          <Typography fontWeight="medium">{nome}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                          <Typography sx={{ minWidth: 80 }}>Email:</Typography>
                          <Typography fontWeight="medium">{email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                          <Typography sx={{ minWidth: 80 }}>CPF:</Typography>
                          <Typography fontWeight="medium">{cpf}</Typography>
                        </Box>
                      </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                      <Button
                        onClick={handleFecharModalDadosPerfil}
                        variant="contained"
                        sx={{
                          borderRadius: 1,
                          textTransform: 'none',
                          px: 3
                        }}
                      >
                        Fechar
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}

              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{ fontFamily: "inherit" }}
              >
                Sair
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{ fontFamily: "inherit" }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {location.pathname === '/menu' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', mt: 4, p: 2 }}>
          {renderContent()}
        </Box>
      )}
    </>
  );
};

export default Menu;