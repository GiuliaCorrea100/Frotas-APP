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
import { atualizarSituacaoCorrida } from '../api/corridaService';

const API_URL = "http://localhost:3000/percurso";

export interface PercursoBackend {
  idPercurso?: number;
  idCorrida: number;
  localDestino: string;
  saidaOdometro: number;
  saidaHora?: Date;
  chegadaHora?: Date;
  chegadaodometro?: number; // Corrigido para corresponder ao backend
  localOrigem?: string;
}

export const iniciarPercurso = async (data: {
  localDestino: string;
  odometroInicial: number;
  idCorrida: number;
  localOrigem?: string;
}) => {
  if (!data.localDestino || isNaN(data.odometroInicial)) {
    throw new Error("Dados inválidos");
  }

  try {
    const payload = {
      idCorrida: data.idCorrida,
      saidaOdometro: data.odometroInicial,
      localDestino: data.localDestino,
      localOrigem: data.localOrigem || ""
    };

    const response = await axios.post(API_URL, payload);
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Erro no servidor";
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao iniciar percurso");
  }
};

export const finalizarPercurso = async (idPercurso: number, data: {
  chegadaOdometro: number;
}) => {
  if (isNaN(data.chegadaOdometro)) {
    throw new Error("Odômetro inválido");
  }

  try {
    const response = await axios.put(`${API_URL}/${idPercurso}/finalizar`, data);
    return response.data as PercursoBackend;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Erro no servidor";
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao finalizar percurso");
  }
};

interface Corrida {
  idCorrida: number;
  dataInicio: string;
  itinerario: string;
  placaVeiculo?: string;
  nomeMotorista?: string;
  dataTermino?: string | null;
  local_de_saida?: string;
}

interface MenuGridProps {
  corrida: Corrida;
}

const menuItems = [
  { label: "Iniciar Percurso", path: "/IniciarPercurso" },
  { label: "Finalizar Percurso", path: "/FinalizarPercurso" },
  { label: "Abastecimento", path: "/Abastecimento" },
  { label: "Ocorrências", path: "/Ocorrencias" },
];

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

const MenuGrid: React.FC<MenuGridProps> = ({ corrida }) => {
  const navigate = useNavigate();
  const [modalIniciarOpen, setModalIniciarOpen] = useState(false);
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [finalizeSuccessModalOpen, setFinalizeSuccessModalOpen] = useState(false);
  const [isCorridaIniciada, setIsCorridaIniciada] = useState(false);
  const [destino, setDestino] = useState("");
  const [odometro, setOdometro] = useState("");
  const [odometroFinal, setOdometroFinal] = useState("");
  const [percursoAtual, setPercursoAtual] = useState<PercursoBackend | null>(null);

  useEffect(() => {
    const carregarPercursoAtual = async () => {
      try {
        const response = await axios.get(`${API_URL}/corrida/${corrida.idCorrida}`);
        setPercursoAtual(response.data);
      } catch (error) {
        console.error("Erro ao carregar percurso atual:", error);
      }
    };

    const corridaStatus = localStorage.getItem(`corrida_${corrida.idCorrida}_iniciada`);
    if (corridaStatus === "true") {
      setIsCorridaIniciada(true);
      carregarPercursoAtual();
    }
  }, [corrida.idCorrida]);

  const handleClick = (path: string, label: string) => {
    if (label === "Iniciar Percurso") {
      setModalIniciarOpen(true);
    } else if (label === "Finalizar Percurso") {
      setModalFinalizarOpen(true);
    } else {
      navigate(path);
    }
  };

  const handleCloseIniciarModal = () => {
    setModalIniciarOpen(false);
  };

  const handleCloseFinalizarModal = () => {
    setModalFinalizarOpen(false);
    setOdometroFinal("");
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
  };

  const handleFinalizeSuccessClose = () => {
    setFinalizeSuccessModalOpen(false);
    navigate('/menu');
  };

  const handleIniciarCorrida = async () => {
    if (!destino || !odometro) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const percursoCriado = await iniciarPercurso({
        localDestino: destino,
        odometroInicial: parseFloat(odometro),
        idCorrida: corrida.idCorrida,
        localOrigem: corrida.local_de_saida || "",
      });

      await atualizarSituacaoCorrida(corrida.idCorrida, 'ANDAMENTO');

      setPercursoAtual(percursoCriado);
      setIsCorridaIniciada(true);
      localStorage.setItem(`corrida_${corrida.idCorrida}_iniciada`, 'true');

      handleCloseIniciarModal();
      setDestino("");
      setOdometro("");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error("Erro ao iniciar percurso:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('já foi iniciada')) {
          setIsCorridaIniciada(true);
          localStorage.setItem(`corrida_${corrida.idCorrida}_iniciada`, 'true');
        }
        alert(error.message || "Ocorreu um erro ao iniciar o percurso");
      } else {
        alert("Ocorreu um erro desconhecido ao iniciar o percurso");
      }
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

      await atualizarSituacaoCorrida(corrida.idCorrida, 'FINALIZADA');

      setIsCorridaIniciada(false);
      localStorage.removeItem(`corrida_${corrida.idCorrida}_iniciada`);
      setPercursoAtual(null);

      handleCloseFinalizarModal();
      setFinalizeSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error("Erro ao finalizar percurso:", error);
      
      if (error instanceof Error) {
        alert(error.message || "Ocorreu um erro ao finalizar o percurso");
      } else {
        alert("Ocorreu um erro desconhecido ao finalizar o percurso");
      }
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
          color={isCorridaIniciada ? "success.main" : "text.secondary"}
          sx={{ mb: 2 }}
        >
          Situação: {isCorridaIniciada ? "EM ANDAMENTO" : "AGENDADA"}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          De {formatDate(corrida.dataInicio)} até{" "}
          {corrida.dataTermino ? formatDate(corrida.dataTermino) : "em andamento"}
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
              (item.label === "Iniciar Percurso" && isCorridaIniciada) ||
              (item.label === "Finalizar Percurso" && !isCorridaIniciada)
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
                "&:hover": !(
                  (item.label === "Iniciar Percurso" && isCorridaIniciada) ||
                  (item.label === "Finalizar Percurso" && !isCorridaIniciada)
                )
                  ? { transform: "scale(1.03)", boxShadow: 6 }
                  : {},
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "120px",
                opacity: (
                  (item.label === "Iniciar Percurso" && isCorridaIniciada) ||
                  (item.label === "Finalizar Percurso" && !isCorridaIniciada)
                ) ? 0.6 : 1,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>{item.label}</Typography>
            </Paper>
          </ButtonBase>
        ))}
      </Box>

      <Dialog open={modalIniciarOpen} onClose={handleCloseIniciarModal} fullWidth>
        <DialogTitle>
          <Typography component="div" fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
            Iniciar Percurso
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Local de Saída:</strong> {corrida.local_de_saida || "Não informado"}
            </Typography>
            <TextField
              label="Local de Destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Odômetro"
              value={odometro}
              onChange={(e) => setOdometro(e.target.value)}
              fullWidth
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, px: 3, pb: 2 }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
            onClick={handleIniciarCorrida}
            disabled={!destino || !odometro}
          >
            INICIAR
          </Button>
          <Button
            color="inherit"
            size="small"
            onClick={handleCloseIniciarModal}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalFinalizarOpen} onClose={handleCloseFinalizarModal} fullWidth>
        <DialogTitle>
          <Typography component="div" fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
            Finalizar Percurso
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Fim do percurso em:</strong> {percursoAtual?.localDestino || "Destino não encontrado"}
            </Typography>
            <TextField
              label="Odômetro Final"
              value={odometroFinal}
              onChange={(e) => setOdometroFinal(e.target.value)}
              fullWidth
              type="number"
              inputProps={{ min: percursoAtual?.saidaOdometro || 0 }}
              helperText={`Odômetro de saída: ${percursoAtual?.saidaOdometro || 0}`}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, px: 3, pb: 2 }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
            onClick={handleFinalizarCorrida}
            disabled={!odometroFinal}
          >
            FINALIZAR PERCURSO
          </Button>
          <Button
            color="inherit"
            size="small"
            onClick={handleCloseFinalizarModal}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successModalOpen} onClose={handleSuccessClose}>
        <DialogTitle>Corrida iniciada com sucesso</DialogTitle>
        <DialogActions>
          <Button onClick={handleSuccessClose}>OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={finalizeSuccessModalOpen} onClose={handleFinalizeSuccessClose}>
        <DialogTitle>Percurso finalizado com sucesso</DialogTitle>
        <DialogActions>
          <Button onClick={handleFinalizeSuccessClose}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuGrid;