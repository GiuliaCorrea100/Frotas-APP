import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu as DropdownMenu,
  MenuItem as DropdownItem,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosConnect from "../services/axiosConnect";
import PainelCorridaMotorista from "./painelCorridaMotorista/PainelCorridaMotorista";
import { useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface JwtPayload {
  sub: number;
  login: string;
  administrador: boolean;
  iat: number;
  exp: number;
}

interface Corrida {
  idCorrida: number;
  dataInicio: string;
  itinerario: string;
  situacao: 'AGENDADA' | 'ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  placaVeiculo?: string;
  nomeMotorista?: string;
  dataTermino?: string | null;
}

interface MotoristaDashboard {
  corridaDeHoje: Corrida | null;
  proximasCorridas: Corrida[];
}

const Menu: React.FC = () => {
  const { isAuthenticated, cpf, logout, administrador, nome, email } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModalDadosPerfil, setShowModalDadosPerfil] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<MotoristaDashboard | null>(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleAbrirModalDadosPerfil = () => setShowModalDadosPerfil(true);
  const handleFecharModalDadosPerfil = () => setShowModalDadosPerfil(false);

  const carregarDadosDoDashboard = useCallback(async () => {
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
  }, [isAuthenticated]);

  useEffect(() => {
    carregarDadosDoDashboard();
  }, [carregarDadosDoDashboard]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Em andamento';
    try {
      const date = new Date(dateString);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return isNaN(date.getTime()) ? 'Data inválida' : new Date(date.getTime() + userTimezoneOffset).toLocaleString('pt-BR');
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

    if (dashboardData.corridaDeHoje && dashboardData.corridaDeHoje.situacao !== 'FINALIZADA') {
      return <PainelCorridaMotorista corrida={dashboardData.corridaDeHoje} onCorridaUpdate={carregarDadosDoDashboard} />;
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
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          {isMobile && (
            <Button
              color="inherit"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              sx={{ minWidth: 'auto', px: 1 }}
              className="mobile-menu-button"
            >
              <MenuIcon />
            </Button>
          )}

          <Typography
            variant="h6"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: "none",
              color: "inherit",
              fontFamily: "inherit",
              mr: 2,
              fontSize: isMobile ? '1rem' : '1.25rem',
            }}
            component={Link}
            to={isAuthenticated ? "/menu" : "/"}
          >
            FROTAS UNIR
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1, alignItems: 'center' }}>
            {isAuthenticated && (
              <>
                {!isMobile && (
                  <>
                    {administrador === true && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/ListaCorrida"
                          sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                        >
                          Painel Corrida
                        </Button>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/ListaCarros"
                          sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                        >
                          Veículos
                        </Button>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/ListaMultas"
                          sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                        >
                          Multas
                        </Button>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/Administradores"
                          sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                        >
                          Administradores
                        </Button>
                      </Box>
                    )}

                    <Button
                      color="inherit"
                      component={Link}
                      to="/HistoricoIndividual"
                      sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                    >
                      Historico
                    </Button>
                  </>
                )}

                <DropdownMenu
                  anchorEl={isMobile ? document.querySelector('.mobile-menu-button') : null}
                  open={isMobile && showMobileMenu}
                  onClose={() => setShowMobileMenu(false)}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      backgroundColor: 'background.paper',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      borderRadius: 1,
                    }
                  }}
                >
                  <>
                    {administrador === true && (
                      <>
                        <DropdownItem
                          component={Link}
                          to="/ListaCorrida"
                          onClick={() => setShowMobileMenu(false)}
                          sx={{ fontSize: '0.9rem', py: 1 }}
                        >
                          Painel Corrida
                        </DropdownItem>
                        <DropdownItem
                          component={Link}
                          to="/ListaCarros"
                          onClick={() => setShowMobileMenu(false)}
                          sx={{ fontSize: '0.9rem', py: 1 }}
                        >
                          Veículos
                        </DropdownItem>
                        <DropdownItem
                          component={Link}
                          to="/ListaMultas"
                          onClick={() => setShowMobileMenu(false)}
                          sx={{ fontSize: '0.9rem', py: 1 }}
                        >
                          Multas
                        </DropdownItem>
                        <DropdownItem
                          component={Link}
                          to="/Administradores"
                          onClick={() => setShowMobileMenu(false)}
                          sx={{ fontSize: '0.9rem', py: 1 }}
                        >
                          Administradores
                        </DropdownItem>
                      </>
                    )}

                    <DropdownItem
                      component={Link}
                      to="/HistoricoIndividual"
                      onClick={() => setShowMobileMenu(false)}
                      sx={{ fontSize: '0.9rem', py: 1 }}
                    >
                      Histórico Individual
                    </DropdownItem>

                    <DropdownItem
                      component={Link}
                      to="/Relatorios"
                      onClick={() => setShowMobileMenu(false)}
                      sx={{ fontSize: '0.9rem', py: 1 }}
                    >
                      Relatórios
                    </DropdownItem>
                  </>
                </DropdownMenu>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
                  {nome && (
                    <>
                      <Button
                        color="inherit"
                        onClick={handleAbrirModalDadosPerfil}
                        sx={{
                          fontFamily: "inherit",
                          fontSize: isMobile ? '0.8rem' : '0.875rem',
                          maxWidth: isMobile ? '120px' : 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={nome}
                      >
                        {isMobile ? `${nome.split(' ')[0]}...` : nome}
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
                    sx={{ fontFamily: "inherit", fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                  >
                    Sair
                  </Button>
                </Box>
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
          </Box>
        </Toolbar>
      </AppBar>

      {location.pathname === '/menu' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', mt: 4, p: 2, flex: 1 }}>
          {renderContent()}
        </Box>
      )}
    </>
  );
};

export default Menu;