import React from "react";
import { AppBar, Button, Toolbar, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Menu: React.FC = () => {
  const { isAuthenticated, cpf, logout, idPermissao } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redireciona para a página de login após logout
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h5"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          component={Link}
          to="/menu"
        >
          FROTAS UNIR
        </Typography>

        {/* Exibe informações do usuário se autenticado */}
        {isAuthenticated && cpf && (
          <Box sx={{ mr: 2 }}>
            <Typography variant="subtitle2">CPF: {cpf}</Typography>
            <Typography variant="caption" display="block">
              Permissão: {idPermissao}
            </Typography>
          </Box>
        )}

        {/* Botões visíveis apenas quando autenticado */}
        {isAuthenticated && (
          <>
            <Button color="inherit" component={Link} to="/ListaCarros">
              Lista de Carros
            </Button>
            <Button color="inherit" component={Link} to="/ListaMotoristas">
              Lista de Motoristas
            </Button>
            <Button color="inherit" component={Link} to="/ListaMultas">
              Lista de Multas
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          </>
        )}

        {/* Botão de login visível apenas quando não autenticado */}
        {!isAuthenticated && (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Menu;