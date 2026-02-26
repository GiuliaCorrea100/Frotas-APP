import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu as DropdownMenu,
  MenuItem as DropdownItem,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Chip,
} from "@mui/material";
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axiosConnect from "../services/axios/axiosConnect";
import { Tooltip } from '@mui/material';
import ContrastIcon from '@mui/icons-material/Contrast';
import { useThemeContext } from '../context/ThemeContext';

interface JwtPayload {
  sub: number;
  login: string;
  administrador: boolean;
  iat: number;
  exp: number;
  nome: string;
  email: string;
  idUsuario: number;
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
  const { themeMode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModalDadosPerfil, setShowModalDadosPerfil] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<MotoristaDashboard | null>(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Estados para o timer de inatividade
  const [tempoRestante, setTempoRestante] = useState<string>('30:00');
  const [corTimer, setCorTimer] = useState<string>('#4caf50');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para iniciar/atualizar o timer
  const iniciarTimer = useCallback((expiresAt: number) => {
    // Limpa timer anterior
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Configura novo timer
    timerRef.current = setInterval(() => {
      const agora = Date.now();
      const segundosRestantes = Math.max(0, Math.floor((expiresAt - agora) / 1000));

      // Atualiza display
      const minutos = Math.floor(segundosRestantes / 60);
      const segundos = segundosRestantes % 60;
      setTempoRestante(`${minutos}:${segundos < 10 ? '0' : ''}${segundos}`);

      // Atualiza cor
      if (minutos > 5) {
        setCorTimer(themeMode === 'dark' ? '#4caf50' : '#2e7d32');
      } else if (minutos > 1) {
        setCorTimer(themeMode === 'dark' ? '#ff9800' : '#f57c00');
      } else {
        setCorTimer(themeMode === 'dark' ? '#f44336' : '#d32f2f');
      }

      // Se expirou, para o timer e faz logout
      if (segundosRestantes <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        handleAutoLogout();
      }
    }, 1000);
  }, [themeMode]);

  // Função para logout automático
  const handleAutoLogout = useCallback(async () => {
    console.log("⏰ Sessão expirada por inatividade");

    // Limpa timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Limpa localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiresAt");

    // Faz logout via AuthContext
    await logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);

  // Função para logout manual
  const handleLogout = async () => {
    // Limpa timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await logout();
    navigate("/", { replace: true });
  };

  // Efeito para escutar renovação de token
  useEffect(() => {
    const handleTokenRenewed = (event: CustomEvent) => {
      if (event.detail && event.detail.expiresAt) {
        console.log("🔄 Token renovado, reiniciando timer...");
        iniciarTimer(event.detail.expiresAt);
      }
    };

    window.addEventListener('tokenRenewed', handleTokenRenewed as EventListener);

    // Inicializa com tempo atual do localStorage
    const storedExpiresAt = localStorage.getItem("tokenExpiresAt");
    if (storedExpiresAt) {
      const expiresAt = parseInt(storedExpiresAt, 10);
      if (!isNaN(expiresAt) && expiresAt > Date.now()) {
        iniciarTimer(expiresAt);
      } else if (expiresAt <= Date.now() && isAuthenticated) {
        // Se já expirou e usuário está autenticado, faz logout
        handleAutoLogout();
      }
    }

    return () => {
      window.removeEventListener('tokenRenewed', handleTokenRenewed as EventListener);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [iniciarTimer, handleAutoLogout, isAuthenticated]);

  // Efeito para monitorar mudanças de rota (reinicia timer na navegação)
  useEffect(() => {
    if (isAuthenticated && timerRef.current) {
      // Quando o usuário navega, o timer continua contando
      // A renovação acontece via interceptor do axiosConnect
      // e o timer é reiniciado via evento tokenRenewed
    }
  }, [location.pathname, isAuthenticated]);

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

  const hasActiveRide = dashboardData?.corridaDeHoje &&
    (dashboardData.corridaDeHoje.situacao === 'ANDAMENTO' ||
      dashboardData.corridaDeHoje.situacao === 'AGENDADA');

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{
          flexWrap: 'wrap',
          gap: 1,
        }}>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              sx={{ px: 1 }}
              className="mobile-menu-button"
            >
              <MenuIcon />
            </IconButton>
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
            SISTEMA FROTAS
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            flex: 1,
            alignItems: 'center'
          }}>
            {isAuthenticated && (
              <>
                {!isMobile && (
                  <>
                    {hasActiveRide && (
                      <Tooltip title={"Corrida em Andamento"}>
                        <span>
                          <IconButton
                            color="inherit"
                            component={Link}
                            to={`/PainelCorridaMotorista/${dashboardData?.corridaDeHoje?.idCorrida}`}
                            sx={{
                              position: 'relative',
                              animation: hasActiveRide ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%': { opacity: 1 },
                                '50%': { opacity: 0.6 },
                                '100%': { opacity: 1 },
                              }
                            }}
                          >
                            <Badge color="error" variant="dot">
                              <DirectionsCarIcon />
                            </Badge>
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {administrador === true && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/Corridas"
                          sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                        >
                          Corridas
                        </Button>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/Veiculos"
                          sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                        >
                          Veículos
                        </Button>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/Multas"
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

                        <Button
                          color="inherit"
                          component={Link}
                          to="/Relatorios"
                          sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                        >
                          Relatórios
                        </Button>
                      </Box>
                    )}

                    <Button
                      color="inherit"
                      component={Link}
                      to="/RegistrosDeInfracao"
                      sx={{ fontFamily: "inherit", fontSize: '0.875rem' }}
                    >
                      Registros de Infração
                    </Button>

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
                    {hasActiveRide && (
                      <DropdownItem
                        component={Link}
                        to="/corrida-andamento"
                        onClick={() => setShowMobileMenu(false)}
                        sx={{
                          fontSize: '0.9rem',
                          py: 1,
                          color: 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        <DirectionsCarIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                        Corrida em Andamento
                      </DropdownItem>
                    )}

                    {administrador === true && (
                      <>
                        <DropdownItem
                          component={Link}
                          to="/Corridas"
                          onClick={() => setShowMobileMenu(false)}
                          sx={{ fontSize: '0.9rem', py: 1 }}
                        >
                          Painel Corrida
                        </DropdownItem>
                        <DropdownItem
                          component={Link}
                          to="/Veiculos"
                          onClick={() => setShowMobileMenu(false)}
                          sx={{ fontSize: '0.9rem', py: 1 }}
                        >
                          Veículos
                        </DropdownItem>
                        <DropdownItem
                          component={Link}
                          to="/Multas"
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
                      to="/Boletos"
                      onClick={() => setShowMobileMenu(false)}
                      sx={{ fontSize: '0.9rem', py: 1 }}
                    >
                      Boletos
                    </DropdownItem>

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

                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'nowrap',
                  alignItems: 'center'
                }}>
                  <Tooltip title={"Perfil"}>
                    <span>
                      <IconButton
                        color="inherit"
                        onClick={handleAbrirModalDadosPerfil}
                        sx={{
                          p: 1
                        }}
                      >
                        <AccountCircleIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={`Modo ${themeMode === 'dark' ? 'claro' : 'escuro'}`}>
                    <span>
                      <IconButton
                        color="inherit"
                        onClick={toggleTheme}
                        sx={{
                          p: 1
                        }}
                      >
                        <ContrastIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  {/* Timer de Inatividade */}
                  <Tooltip title="Sessão expira em">
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={tempoRestante}
                      sx={{
                        backgroundColor: themeMode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(255, 255, 255, 1)',
                        border: `1px solid ${corTimer}30`,
                        color: corTimer,
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: corTimer,
                        },
                        display: { xs: 'none', sm: 'flex' } // Oculta em mobile
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={"Sair"}>
                    <span>
                      <IconButton
                        color="inherit"
                        onClick={handleLogout}
                        sx={{
                          p: 1
                        }}
                      >
                        <ExitToAppIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>

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
                  <DialogTitle sx={{
                    fontSize: '1.25rem',
                    p: 2,
                    color: 'text.primary',
                    fontWeight: 600
                  }}>
                    Seus Dados
                  </DialogTitle>
                  <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            minWidth: 80,
                            color: 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          Nome:
                        </Typography>
                        <Typography
                          fontWeight="medium"
                          sx={{ color: 'text.primary', ml: 1 }}
                        >
                          {nome}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            minWidth: 80,
                            color: 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          Email:
                        </Typography>
                        <Typography
                          fontWeight="medium"
                          sx={{ color: 'text.primary', ml: 1 }}
                        >
                          {email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            minWidth: 80,
                            color: 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          CPF:
                        </Typography>
                        <Typography
                          fontWeight="medium"
                          sx={{ color: 'text.primary', ml: 1 }}
                        >
                          {cpf}
                        </Typography>
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
                        px: 3,
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }}
                    >
                      Fechar
                    </Button>
                  </DialogActions>
                </Dialog>
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
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          mt: 4,
          p: 2,
          flex: 1
        }}>
        </Box>
      )}
    </>
  );
};

export default Menu;