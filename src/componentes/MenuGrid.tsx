import React, { useState } from "react";
import { Box, Typography, Paper, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CadastrarOcorrencia from "./cadastros/corrida/modais/ocorrenciasModal";

const menuItems = [
  { label: "Iniciar Percurso", path: "/IniciarPercurso" },
  { label: "Finalizar Percurso", path: "/FinalizarPercurso" },
  { label: "Abastecimento", path: "/Abastecimento" },
  { label: "Ocorrências", path: "#abrirModal" },
];

type MenuGridProps = {
  idCorrida: number;
};

const MenuGrid = ( { idCorrida }: MenuGridProps ) => {
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);


  const fecharModal = () => setModalAberto(false);

  const handleClick = (path: string) => {
    if (path === "#abrirModal") {
      setModalAberto(true);
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Corrida:
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Porto Velho - Ariquemes
        </Typography>
      </Box>

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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '120px'
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                {item.label}
              </Typography>
            </Paper>
          </ButtonBase>
        ))}
      </Box>

      <CadastrarOcorrencia open={modalAberto} onClose={fecharModal} corrida={idCorrida}
        onSuccess={() => {
          console.log("Ocorrência salva com sucesso!");
        }}
        onError={(erro) => {
          console.error("Erro ao salvar ocorrência:", erro);
        }}
      />
    </Box>
  );
};

export default MenuGrid;
