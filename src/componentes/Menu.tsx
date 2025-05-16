import React from "react";
import { AppBar, Button, Toolbar, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Menu: React.FC = () => {
  const { isAuthenticated, cpf, logout, permissao } = useAuth();
  const navigate = useNavigate();


  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  console.log(cpf,permissao);

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
        {isAuthenticated && cpf &&  permissao && (
          <Box sx={{ mr: 2 }}>
            <Typography variant="subtitle2">CPF: {cpf}</Typography>
            <Typography variant="subtitle2">ID Permissão: {permissao}</Typography>
            <Typography variant="caption" display="block">
              {Number(permissao) === 2 ? "Administrador" : "Usuário Regular"}
            </Typography>
          </Box>
        )}

        {/* Botões visíveis apenas quando autenticado */}
        {isAuthenticated && (
          <>
            {/* Botões visíveis apenas para administradores (idPermissao === "2") */}
            {Number(permissao) === 2 && (
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
              </>
            )}

            {/* Botão Sair visível para todos os usuários autenticados */}
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          </>
        )}

        {/* Botão de login visível apenas quando não autenticado */}
        {!isAuthenticated && (
          <Button color="inherit" component={Link} to="/">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Menu;