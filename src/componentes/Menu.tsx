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

  // NOVO: estado e referência para o botão MENU no desktop
  const [anchorMenu, setAnchorMenu] = useState<null | HTMLElement>(null);
  const handleOpenMenuDesktop = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorMenu(event.currentTarget);
  const handleCloseMenuDesktop = () => setAnchorMenu(null);

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
    if (loading) return <CircularProgress />;
    if (!isAuthenticated || !dashboardData) return null;

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
            />
          </Paper>
        </Box>
      );
    }

    return <Typography variant="h6" sx={{ mt: 4 }}>Nenhuma corrida agendada.</Typography>;
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>

          {isMobile && (
            <Button color="inherit" onClick={() => setShowMobileMenu(!showMobileMenu)} sx={{ minWidth: 'auto', px: 1 }} className="mobile-menu-button">
              <MenuIcon />
            </Button>
          )}

          <Typography
            variant="h6"
            sx={{ flexGrow: isMobile ? 1 : 0, color: "inherit", mr: 2 }}
            component={Link}
            to={isAuthenticated ? "/menu" : "/"}
          >
            FROTAS UNIR
          </Typography>

          {isAuthenticated && !isMobile && (
            <>
              {/* NOVO BOTÃO MENU */}
              <Button
                color="inherit"
                onClick={handleOpenMenuDesktop}
                sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
              >
                MENU
              </Button>

              <DropdownMenu anchorEl={anchorMenu} open={Boolean(anchorMenu)} onClose={handleCloseMenuDesktop}>
                {administrador && (
                  <>
                    <DropdownItem component={Link} to="/ListaCorrida" onClick={handleCloseMenuDesktop}>Painel Corrida</DropdownItem>
                    <DropdownItem component={Link} to="/ListaCarros" onClick={handleCloseMenuDesktop}>Veículos</DropdownItem>
                    <DropdownItem component={Link} to="/ListaMultas" onClick={handleCloseMenuDesktop}>Multas</DropdownItem>
                    <DropdownItem component={Link} to="/Administradores" onClick={handleCloseMenuDesktop}>Administradores</DropdownItem>
                  </>
                )}
                <DropdownItem component={Link} to="/HistoricoIndividual" onClick={handleCloseMenuDesktop}>Histórico</DropdownItem>
                <DropdownItem component={Link} to="/Relatorios" onClick={handleCloseMenuDesktop}>Relatórios</DropdownItem>
              </DropdownMenu>
            </>
          )}

          <Box sx={{ flex: 1 }} />

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={handleAbrirModalDadosPerfil}>{nome}</Button>
              <Button color="inherit" onClick={handleLogout}>Sair</Button>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/">Login</Button>
          )}

        </Toolbar>
      </AppBar>

      {location.pathname === '/menu' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, p: 2 }}>
          {renderContent()}
        </Box>
      )}
    </>
  );
};

export default Menu;