import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Menu: React.FC = () => {
  const { isAuthenticated, cpf, logout, permissao, nome, email } = useAuth();
  const navigate = useNavigate();
  const [showModalDadosPerfil, setShowModalDadosPerfil] = useState(false);

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

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ 
            flexGrow: 1, 
            textDecoration: "none", 
            color: "inherit",
            fontFamily: "inherit" // Mantém a fonte padrão
          }}
          component={Link}
          to={isAuthenticated ? "/menu" : "/"}
        >
          FROTAS UNIR
        </Typography>

        {isAuthenticated && (
          <>
            {/* Botões visíveis apenas para administradores */}
            {Number(permissao) === 2 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/ColocarTombo"
                  sx={{ fontFamily: "inherit" }}
                >
                  Cadastro Corrida
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/ListaCarros"
                  sx={{ fontFamily: "inherit" }}
                >
                  Lista de Carros
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/ListaMotoristas"
                  sx={{ fontFamily: "inherit" }}
                >
                  Lista de Motoristas
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/ListaMultas"
                  sx={{ fontFamily: "inherit" }}
                >
                  Lista de Multas
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

            {/* Botão do perfil do usuário */}
            {nome && (
              <>
                <Button 
                  color="inherit" 
                  onClick={handleAbrirModalDadosPerfil}
                  sx={{ fontFamily: "inherit" }}
                >
                  {nome}
                </Button>

                {/* Modal de Dados do Perfil */}
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
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ minWidth: 80 }}>Permissão:</Typography>
                        <Typography fontWeight="medium">
                          {permissao === "2" ? "Usuário" : "Administrador"}
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
                        px: 3
                      }}
                    >
                      Fechar
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}

            {/* Botão Sair */}
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
  );
};

export default Menu;