import {
  AppBar,
  Box,
  Button,
  Menu as DropdownMenu,
  MenuItem as DropdownItem,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Chip,
} from "@mui/material";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Tooltip } from "@mui/material";
import ContrastIcon from "@mui/icons-material/Contrast";
import { useThemeContext } from "../context/ThemeContext";
import DadosPerfil from "../pages/DadosPerfil";

const Menu: React.FC = () => {
  const {
    isAuthenticated,
    logout,
    administrador,
    hasCorridaAtiva,
    idCorridaAtiva,
  } = useAuth();
  const { themeMode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModalDadosPerfil, setShowModalDadosPerfil] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width:768px)");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Estados para o timer de inatividade
  const [tempoRestante, setTempoRestante] = useState<string>("30:00");
  const [corTimer, setCorTimer] = useState<string>("#4caf50");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para iniciar/atualizar o timer
  const iniciarTimer = useCallback(
    (expiresAt: number) => {
      // Limpa timer anterior
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Configura novo timer
      timerRef.current = setInterval(() => {
        const agora = Date.now();
        const segundosRestantes = Math.max(
          0,
          Math.floor((expiresAt - agora) / 1000),
        );

        // Atualiza display
        const minutos = Math.floor(segundosRestantes / 60);
        const segundos = segundosRestantes % 60;
        setTempoRestante(`${minutos}:${segundos < 10 ? "0" : ""}${segundos}`);

        // Atualiza cor
        if (minutos > 5) {
          setCorTimer(themeMode === "dark" ? "#4caf50" : "#2e7d32");
        } else if (minutos > 1) {
          setCorTimer(themeMode === "dark" ? "#ff9800" : "#f57c00");
        } else {
          setCorTimer(themeMode === "dark" ? "#f44336" : "#d32f2f");
        }

        // Se expirou, para o timer e faz logout
        if (segundosRestantes <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          handleAutoLogout();
        }
      }, 1000);
    },
    [themeMode],
  );

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

  // Recursos para TODOS os usuários
  const recursosPadrao = [
    { label: "Registros de Infração", path: "/RegistrosDeInfracao" },
    { label: "Histórico", path: "/HistoricoIndividual" },
  ];

  // Recursos EXCLUSIVOS para admin
  const recursosAdmin = [
    { label: "Corridas", path: "/Corridas" },
    { label: "Veículos", path: "/Veiculos" },
    { label: "Multas", path: "/Multas" },
    { label: "Administradores", path: "/Administradores" },
    { label: "Relatórios", path: "/Relatorios" },
  ];

  // Função para renderizar botões desktop
  const renderBotoesDesktop = () => (
    <>
      {administrador &&
        recursosAdmin.map((recurso) => (
          <Button
            key={recurso.label}
            color="inherit"
            component={Link}
            to={recurso.path}
            sx={{ fontFamily: "inherit", fontSize: "0.875rem" }}
          >
            {recurso.label}
          </Button>
        ))}
      {recursosPadrao.map((recurso) => (
        <Button
          key={recurso.label}
          color="inherit"
          component={Link}
          to={recurso.path}
          sx={{ fontFamily: "inherit", fontSize: "0.875rem" }}
        >
          {recurso.label}
        </Button>
      ))}
    </>
  );

  // Função para renderizar botões mobile
  const renderItensMobile = () => (
    <>
      {administrador &&
        recursosAdmin.map((recurso) => (
          <DropdownItem
            key={recurso.label}
            component={Link}
            to={recurso.path}
            onClick={() => setShowMobileMenu(false)}
            sx={{ fontSize: "0.9rem", py: 1 }}
          >
            {recurso.label}
          </DropdownItem>
        ))}
      {recursosPadrao.map((recurso) => (
        <DropdownItem
          key={recurso.label}
          component={Link}
          to={recurso.path}
          onClick={() => setShowMobileMenu(false)}
          sx={{ fontSize: "0.9rem", py: 1 }}
        >
          {recurso.label}
        </DropdownItem>
      ))}
    </>
  );

  // Efeito para escutar renovação de token
  useEffect(() => {
    const handleTokenRenewed = (event: CustomEvent) => {
      if (event.detail && event.detail.expiresAt) {
        console.log("🔄 Token renovado, reiniciando timer...");
        iniciarTimer(event.detail.expiresAt);
      }
    };

    window.addEventListener(
      "tokenRenewed",
      handleTokenRenewed as EventListener,
    );

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
      window.removeEventListener(
        "tokenRenewed",
        handleTokenRenewed as EventListener,
      );
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

  return (
    <>
      <AppBar position="static">
        <Toolbar
          sx={{
            flexWrap: "wrap",
            gap: 1,
          }}
        >
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
              ml: 3,
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
            component={Link}
            to={isAuthenticated ? "/menu" : "/"}
          >
            SISTEMA FROTAS
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              flex: 1,
              alignItems: "center",
            }}
          >
            {isAuthenticated && (
              <>
                {!isMobile && (
                  <>
                    {hasCorridaAtiva && (
                      <Tooltip title={"Corrida em Andamento"}>
                        <span>
                          <IconButton
                            color="inherit"
                            component={Link}
                            to={`/PainelCorridaMotorista/${idCorridaAtiva}`}
                            sx={{
                              position: "relative",
                              animation: hasCorridaAtiva
                                ? "pulse 2s infinite"
                                : "none",
                              "@keyframes pulse": {
                                "0%": { opacity: 1 },
                                "50%": { opacity: 0.6 },
                                "100%": { opacity: 1 },
                              },
                            }}
                          >
                            <Badge color="error" variant="dot">
                              <DirectionsCarIcon />
                            </Badge>
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {isAuthenticated && !isMobile && renderBotoesDesktop()}
                  </>
                )}

                <DropdownMenu
                  anchorEl={
                    isMobile
                      ? document.querySelector(".mobile-menu-button")
                      : null
                  }
                  open={isMobile && showMobileMenu}
                  onClose={() => setShowMobileMenu(false)}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      backgroundColor: "background.paper",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      borderRadius: 1,
                    },
                  }}
                >
                  <>
                    {hasCorridaAtiva && (
                      <DropdownItem
                        component={Link}
                        to={`/PainelCorridaMotorista/${idCorridaAtiva}`}
                        onClick={() => setShowMobileMenu(false)}
                        sx={{
                          fontSize: "0.9rem",
                          py: 1,
                          color: "error.main",
                          fontWeight: "bold",
                        }}
                      >
                        <DirectionsCarIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                        Corrida em Andamento
                      </DropdownItem>
                    )}

                    {renderItensMobile()}
                  </>
                </DropdownMenu>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "nowrap",
                    alignItems: "center",
                  }}
                >
                  <Tooltip title={"Perfil"}>
                    <span>
                      <IconButton
                        color="inherit"
                        onClick={handleAbrirModalDadosPerfil}
                        sx={{ p: 1 }}
                      >
                        <AccountCircleIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={`Modo ${themeMode === "dark" ? "claro" : "escuro"}`}
                  >
                    <span>
                      <IconButton
                        color="inherit"
                        onClick={toggleTheme}
                        sx={{ p: 1 }}
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
                        backgroundColor:
                          themeMode === "dark"
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(255, 255, 255, 1)",
                        border: `1px solid ${corTimer}30`,
                        color: corTimer,
                        fontWeight: 600,
                        "& .MuiChip-icon": {
                          color: corTimer,
                        },
                        display: { xs: "none", sm: "flex" }, // Oculta em mobile
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={"Sair"}>
                    <span>
                      <IconButton
                        color="inherit"
                        onClick={handleLogout}
                        sx={{ p: 1, mr: 3 }}
                      >
                        <ExitToAppIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
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

      {showModalDadosPerfil && (
        <DadosPerfil
          open={showModalDadosPerfil}
          onClose={() => setShowModalDadosPerfil(false)}
          onSuccess={async (msg) => {
            console.log(msg);
          }}
          onError={(error) => {
            console.error("Erro ao exibir dados do perfil:", error);
            if (error.response?.status === 401) {
              navigate("/");
            }
          }}
        />
      )}
    </>
  );
};

export default Menu;
