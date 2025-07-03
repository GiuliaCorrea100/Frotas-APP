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
  CircularProgress // Adicionado para um feedback visual de carregamento
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MenuGrid from "./MenuGrid";
import axiosConnect from "../services/axiosConnect";
import { jwtDecode } from 'jwt-decode';

// A interface do payload do token permanece a mesma
interface JwtPayload {
  sub: number; // idUsuario
  login: string;
  permissao: number;
  iat: number;
  exp: number;
}

const Menu: React.FC = () => {
  const { isAuthenticated, cpf, logout, permissao, nome, email } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModalDadosPerfil, setShowModalDadosPerfil] = useState(false);
  const [hasCorridaAgendadaHoje, setHasCorridaAgendadaHoje] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleAbrirModalDadosPerfil = () => {
    setShowModalDadosPerfil(true);
  };

  const handleFecharModalDadosPerfil = () => {
    setShowModalDadosPerfil(false);
  };

  useEffect(() => {
    const verificarCorrida = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const idUsuario = decodedToken?.sub;

        if (idUsuario) {
          const response = await axiosConnect.get(`/corrida/verificar-agendada/${idUsuario}`);
          setHasCorridaAgendadaHoje(response.data);
        }
      } catch (error) {
        console.error("Erro ao verificar corridas ou decodificar token:", error);
        // Opcional: Tratar o erro de forma visual para o usuário
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      // Chama a função se o usuário estiver autenticado
      verificarCorrida();
    } else {
      // Se não estiver autenticado, apenas para de carregar
      setLoading(false);
    }
  }, [isAuthenticated]); // O hook reage apenas à mudança no status de autenticação

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

          {/* O restante do seu JSX para a AppBar permanece igual */}
          {isAuthenticated && (
            <>
              {Number(permissao) === 2 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button color="inherit" component={Link} to="/ListaCorrida" sx={{ fontFamily: "inherit" }}>
                    Painel Corrida
                  </Button>
                  <Button color="inherit" component={Link} to="/ListaCarros" sx={{ fontFamily: "inherit" }}>
                    Lista de Carros
                  </Button>
                  <Button color="inherit" component={Link} to="/ListaMotoristas" sx={{ fontFamily: "inherit" }}>
                    Lista de Motoristas
                  </Button>
                  <Button color="inherit" component={Link} to="/ListaMultas" sx={{ fontFamily: "inherit" }}>
                    Lista de Multas
                  </Button>
                  <Button color="inherit" component={Link} to="/Administradores" sx={{ fontFamily: "inherit" }}>
                    Administradores
                  </Button>
                </Box>
              )}
              <Button color="inherit" component={Link} to="/HistoricoIndividual" sx={{ fontFamily: "inherit" }}>
                Histórico de Corridas
              </Button>
              {nome && (
                <>
                  <Button color="inherit" onClick={handleAbrirModalDadosPerfil} sx={{ fontFamily: "inherit" }}>
                    {nome}
                  </Button>
                  <Dialog open={showModalDadosPerfil} onClose={handleFecharModalDadosPerfil} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, p: 2 } }}>
                    <DialogTitle sx={{ fontSize: '1.25rem', p: 2 }}>Seus Dados</DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>Nome:</Typography><Typography fontWeight="medium">{nome}</Typography></Box>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>Email:</Typography><Typography fontWeight="medium">{email}</Typography></Box>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>CPF:</Typography><Typography fontWeight="medium">{cpf}</Typography></Box>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>Permissão:</Typography><Typography fontWeight="medium">{permissao === "1" ? "Motorista" : "Administrador"}</Typography></Box>
                      </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                      <Button onClick={handleFecharModalDadosPerfil} variant="contained" sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}>
                        Fechar
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
              <Button color="inherit" onClick={handleLogout} sx={{ fontFamily: "inherit" }}>
                Sair
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <Button color="inherit" component={Link} to="/" sx={{ fontFamily: "inherit" }}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, minHeight: '100px' }}>
        {loading ? (
          <CircularProgress />
        ) : isAuthenticated && hasCorridaAgendadaHoje &&  location.pathname === "/menu" ? (
          <MenuGrid />
        ) : isAuthenticated && location.pathname === "/menu" ? (
          <Typography variant="h6" sx={{ mt: 4 }}>
            Nenhuma corrida agendada para hoje.
          </Typography>
        ) : null}
      </Box>
    </>
  );
};

export default Menu;