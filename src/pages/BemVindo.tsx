import React, { useState } from "react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link } from "react-router-dom";

const BemVindo: React.FC = () => {
  const { nome } = useAuth();
  const theme = useTheme();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("hideWelcomeMessage") !== "true";
  });

  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hideWelcomeMessage", "true");
  };

  return (
    <Box
      sx={{
        mt: 0,
        mb: 1.5,
        py: 3,
        px: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.mode === "dark" ? "transparent" : "#fff",
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#3B414B" : "#d4e5ff",
        boxShadow: "none",
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        position: "relative",
      }}
    >
      {/* Ícone Informativo */}
      <InfoOutlinedIcon
        sx={{
          color: theme.palette.mode === "dark" ? "#82B1FF" : "#1976d2",
          fontSize: "1.7rem",
          mt: 0,
          flexShrink: 0,
        }}
      />

      {/* Conteúdo da Mensagem */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 500, color: theme.palette.text.primary, mb: 0.5 }}
        >
          Olá,{" "}
          <span
            style={{
              color: theme.palette.mode === "dark" ? "#82B1FF" : "#1976d2",
            }}
          >
            {nome}
          </span>
          !
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 1 }}
        >
          Seja bem-vindo(a) ao Frotas.
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 1 }}
        >
          Este é o Sistema de Frotas da UNIR, sua central oficial para controle
          de veículos, corridas e todas as movimentações da frota.
        </Typography>

        <Box sx={{ height: theme.spacing(1) }} />

        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          Dúvidas? Consulte os{" "}
          <Link
            to="https://dti.unir.br/pagina/exibir/27850"
            target="_blank"
            style={{
              color: theme.palette.mode === "dark" ? "#82B1FF" : "#1976d2",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            manuais do sistema
          </Link>
          .
        </Typography>
      </Box>

      {/* Botão de Fechar */}
      <IconButton
        size="small"
        sx={{
          position: "absolute",
          top: 24,
          right: 24,
          color: theme.palette.text.secondary,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.08)",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.12)",
          },
        }}
        onClick={handleClose}
        aria-label="Fechar mensagem de boas-vindas"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default BemVindo;
