import React from "react";
import { AppBar, Button, Toolbar, Typography, Box } from "@mui/material"; // Adicione Box
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importe o hook de autenticação

const Menu: React.FC = () => {
  const { user } = useAuth();
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

        {/* Adicione esta parte para mostrar nome e email */}
        {user && (
          <Box sx={{ mr: 2 }}>
            <Typography variant="subtitle2">{user.nome}</Typography>
            <Typography variant="caption" display="block">{user.email}</Typography>
          </Box>
        )}

        <Button color="inherit" component={Link} to="/ListaCarros">
          Lista de Carros
        </Button>
        <Button color="inherit" component={Link} to="/ListaMotoristas">
          Lista de Motoristas
        </Button>
        <Button color="inherit" component={Link} to="/ListaMultas">
          Lista de Multas
        </Button>
        <Button color="inherit" component={Link} to="/">
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Menu;
