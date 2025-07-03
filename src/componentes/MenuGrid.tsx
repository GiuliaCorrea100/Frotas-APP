import React from "react";
import { Box, Typography, Paper, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Iniciar Percurso", image: "placeholder-image.png", alt: "Iniciar Percurso", path: "/IniciarPercurso" },
  { label: "Finalizar Percurso", image: "placeholder-image.png", alt: "Finalizar Percurso", path: "/FinalizarPercurso" },
  { label: "Abastecimento", image: "placeholder-image.png", alt: "Abastecimento", path: "/Abastecimento" },
  { label: "Ocorrências", image: "placeholder-image.png", alt: "Ocorrências", path: "/Ocorrencias" },
];

const MenuGrid = () => {
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      
      {/* Cabeçalho da Corrida */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Corrida:
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Porto Velho - Ariquemes
        </Typography>
      </Box>

      {/* Grid de Botões */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 4,
        }}
      >
        {menuItems.map((item) => (
          <ButtonBase
            key={item.label}
            onClick={() => handleClick(item.path)}
            sx={{ borderRadius: 3, width: "100%" }}
          >
            <Paper
              elevation={4}
              sx={{
                width: "100%",
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: 6,
                },
              }}
            >
              <img
                src={item.image}
                alt={item.alt}
                style={{ width: "100px", height: "100px", objectFit: "contain" }}
              />
              <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                {item.label}
              </Typography>
            </Paper>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
};

export default MenuGrid;
