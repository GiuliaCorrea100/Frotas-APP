import React, { useState } from "react";
import { Box, Typography, Paper, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CadastrarOcorrencia from "./cadastros/corrida/modais/ocorrenciasModal";
import AbastecimentoModal from "./cadastros/abastecimento/ModalCadastroAbastecimento"; 
import { CorridaFrontend } from "../api/corridaService";

const menuItems = [
  { label: "Iniciar Percurso", path: "/IniciarPercurso" },
  { label: "Finalizar Percurso", path: "/FinalizarPercurso" },
  { label: "Abastecimento", path: "#abastecimentoModal" },
  { label: "Ocorrências", path: "#ocorrenciaModal" },
];

type MenuGridProps = {
  corrida: CorridaFrontend | null;
};

const MenuGrid = ({ corrida }: MenuGridProps) => {
  const navigate = useNavigate();
  const [ocorrenciaModalAberto, setOcorrenciaModalAberto] = useState(false);
  const [abastecimentoModalAberto, setAbastecimentoModalAberto] = useState(false);

  const fecharOcorrenciaModal = () => setOcorrenciaModalAberto(false);
  const fecharAbastecimentoModal = () => setAbastecimentoModalAberto(false);

  const handleClick = (path: string) => {
    if (path === "#ocorrenciaModal") {
      setOcorrenciaModalAberto(true);
    } else if (path === "#abastecimentoModal") {
      setAbastecimentoModalAberto(true);
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

      <CadastrarOcorrencia 
      <CadastrarOcorrencia 
        open={ocorrenciaModalAberto} 
        onClose={fecharOcorrenciaModal} 
        corrida={corrida}
        onSuccess={() => {
          console.log("Ocorrência salva com sucesso!");
        }}
        onError={(erro) => {
          console.error("Erro ao salvar ocorrência:", erro);
        }}
      />

      <AbastecimentoModal
        open={abastecimentoModalAberto}
        onClose={fecharAbastecimentoModal}
        corrida={corrida}
        onSuccess={() => {
          console.log("Abastecimento cadastrado com sucesso!");
        }}
        onError={(erro: any) => {
          console.error("Erro ao cadastrar abastecimento:", erro);
        }}
      />
  );
};

export default MenuGrid;