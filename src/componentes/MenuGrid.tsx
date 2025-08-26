import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  ButtonBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CadastrarOcorrencia from "./cadastros/corrida/modais/ocorrenciasModal";
import AbastecimentoModal from "./cadastros/abastecimento/ModalCadastroAbastecimento"; // Importe o modal de abastecimento

const menuItems = [
  { label: "Iniciar Percurso", path: "/IniciarPercurso" },
  { label: "Finalizar Percurso", path: "/FinalizarPercurso" },
  { label: "Abastecimento", path: "#abrirModalAbastecimento" },
  { label: "Ocorrências", path: "#abrirModalOcorrencia" },
];

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

const MenuGrid: React.FC<MenuGridProps> = ({ corrida, onCorridaUpdate }) => {
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

  const handleCloseIniciarModal = () => setModalIniciarOpen(false);
  const handleCloseFinalizarModal = () => {
    setModalFinalizarOpen(false);
    setOdometroFinal("");
  };
  const handleSuccessClose = () => setSuccessModalOpen(false);
  const handleFinalizeSuccessClose = () => setFinalizeSuccessModalOpen(false);

  const handleIniciarCorrida = async () => {
    if (!destino || !odometro) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await iniciarPercurso({
        localDestino: destino,
        odometroInicial: parseFloat(odometro),
        idCorrida: corridaLocal.idCorrida,
        localOrigem: ultimoDestino,
      });
      
      if (corridaLocal.situacao === 'AGENDADA') {
        await atualizarSituacaoCorrida(corridaLocal.idCorrida, 'ANDAMENTO');
        
        const corridaAtualizada = { ...corridaLocal, situacao: 'ANDAMENTO' };
        setCorridaLocal(corridaAtualizada);
        
        if (onCorridaUpdate) {
          onCorridaUpdate(corridaAtualizada);
        }
      }
      
      await buscarPercursosDaCorrida();

      handleCloseIniciarModal();
      setDestino("");
      setOdometro("");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error("Erro ao iniciar percurso:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      alert(message);
    }
  };

  const handleFinalizarCorrida = async () => {
    if (!odometroFinal || !percursoAtual?.idPercurso) {
      alert("Não foi possível encontrar o percurso atual ou o odômetro não foi preenchido.");
      return;
    }

    try {
      await finalizarPercurso(percursoAtual.idPercurso, {
        chegadaOdometro: parseFloat(odometroFinal)
      });
      
      if (percursoAtual.localDestino === corridaLocal.local_de_saida) {
        await atualizarSituacaoCorrida(corridaLocal.idCorrida, 'FINALIZADA');
        
        const corridaAtualizada = { ...corridaLocal, situacao: 'FINALIZADA' };
        setCorridaLocal(corridaAtualizada);
        
         if (onCorridaUpdate) {
          onCorridaUpdate(corridaAtualizada);
        }
      }
      
      await buscarPercursosDaCorrida();

      handleCloseFinalizarModal();
      setFinalizeSuccessModalOpen(true);
      
      const ultimoPercurso = await buscarUltimoPercursoFinalizado(corridaLocal.idCorrida);
      if (ultimoPercurso) {
        setUltimoDestino(ultimoPercurso.localDestino);
      }

    } catch (error: unknown) {
      console.error("Erro ao finalizar percurso:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      alert(message);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Corrida:
        </Typography>
        <Typography
          variant="body2"
          color={
            corridaLocal.situacao === 'FINALIZADA' ? "success.main" :
            percursosAtivosCount > 0 ? "warning.main" : "text.secondary"
          }
          sx={{ mb: 2, fontWeight: 'bold' }}
        >
          Situação: {corridaLocal.situacao} 
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          De {formatDate(corridaLocal.dataInicio)} até{" "}
          {corridaLocal.dataTermino ? formatDate(corridaLocal.dataTermino) : "em andamento"}
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
            onClick={() => handleClick(item.path, item.label)}
            sx={{ borderRadius: 3, width: "100%" }}
            disabled={
              (item.label === "Iniciar Percurso" && isIniciarDisabled) ||
              (item.label === "Finalizar Percurso" && isFinalizarDisabled) ||
              (item.label !== "Iniciar Percurso" &&
               item.label !== "Finalizar Percurso" &&
               isOutrosBotoesDisabled)
            }
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
                  transform: isCorridaFinalizada ? "none" : "scale(1.03)",
                  boxShadow: (isIniciarDisabled && item.label === "Iniciar Percurso") || 
                             (isFinalizarDisabled && item.label === "Finalizar Percurso") ? 4 : 6,
                  cursor: (isIniciarDisabled && item.label === "Iniciar Percurso") ||
                          (isFinalizarDisabled && item.label === "Finalizar Percurso") ? 
                          "not-allowed" : "pointer"
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "120px",
                opacity: (
                  (item.label === "Iniciar Percurso" && isIniciarDisabled) ||
                  (item.label === "Finalizar Percurso" && isFinalizarDisabled)
                ) ? 0.6 : 1,
                backgroundColor: (
                  (item.label === "Iniciar Percurso" && isIniciarDisabled) ||
                  (item.label === "Finalizar Percurso" && isFinalizarDisabled)
                ) ? "action.disabledBackground" : "background.paper"
              }}
            >
              <Typography 
                sx={{ 
                  fontWeight: "bold",
                  color: (
                    (item.label === "Iniciar Percurso" && isIniciarDisabled) ||
                    (item.label === "Finalizar Percurso" && isFinalizarDisabled)
                  ) ? "text.disabled" : "text.primary"
                }}
              >
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