import React, { useState } from "react";
import { Box, Typography, Paper, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CadastrarOcorrencia from "./cadastros/corrida/modais/ocorrenciasModal";
import AbastecimentoModal from "./cadastros/abastecimento/ModalCadastroAbastecimento"; // Importe o modal de abastecimento

const menuItems = [
  { label: "Iniciar Percurso", path: "/IniciarPercurso" },
  { label: "Finalizar Percurso", path: "/FinalizarPercurso" },
  { label: "Abastecimento", path: "#abrirModalAbastecimento" },
  { label: "Ocorrências", path: "#abrirModalOcorrencia" },
];

type MenuGridProps = {
  idCorrida: number;
};

const MenuGrid = ( { idCorrida }: MenuGridProps ) => {
  const navigate = useNavigate();
  const [modalOcorrenciaAberto, setModalOcorrenciaAberto] = useState(false);
  const [modalAbastecimentoAberto, setModalAbastecimentoAberto] = useState(false);

  const fecharModalOcorrencia = () => setModalOcorrenciaAberto(false);
  const fecharModalAbastecimento = () => setModalAbastecimentoAberto(false);

  const handleClick = (path: string) => {
    if (path === "#abrirModalOcorrencia") {
      setModalOcorrenciaAberto(true);
    } else if (path === "#abrirModalAbastecimento") {
      setModalAbastecimentoAberto(true);
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

      {/* Modal de Ocorrências */}
      <CadastrarOcorrencia 
        open={modalOcorrenciaAberto} 
        onClose={fecharModalOcorrencia} 
        corrida={idCorrida}
        onSuccess={() => {
          console.log("Ocorrência salva com sucesso!");
        }}
        onError={(erro) => {
          console.error("Erro ao salvar ocorrência:", erro);
        }}
      />

      {/* Modal de Abastecimento */}
      <AbastecimentoModal
        open={modalAbastecimentoAberto}
        onClose={fecharModalAbastecimento}
        corridaId={idCorrida} // Passando o ID da corrida para o modal
        onSuccess={() => {
          console.log("Abastecimento cadastrado com sucesso!");
        }}
      />
    </Box>
  );
};

export default MenuGrid;