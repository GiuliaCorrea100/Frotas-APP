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
import { atualizarSituacaoCorrida } from "../api/corridaService";

const API_URL = "http://localhost:3000/percurso";

export interface PercursoBackend {
  idPercurso?: number;
  idCorrida: number;
  localDestino: string;
  saidaOdometro: number;
  saidaHora?: Date;
  chegadaHora?: Date | null;
  chegadaodometro?: number;
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
  situacao?: string;
}

interface MenuGridProps {
  corrida: Corrida;
  onCorridaUpdate?: (corridaAtualizada: Corrida) => void;
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

const MenuGrid: React.FC<MenuGridProps> = ({ corrida, onCorridaUpdate }) => {
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
  const [percursosAtivosCount, setPercursosAtivosCount] = useState(0);
  const [corridaLocal, setCorridaLocal] = useState<Corrida>(corrida);

  const buscarPercursosDaCorrida = async () => {
    try {
      const response = await axios.get(`${API_URL}/corrida/${corrida.idCorrida}`);
      const percursos: PercursoBackend[] = response.data;

      const countResponse = await axios.get(`${API_URL}/corrida/${corrida.idCorrida}/ativos/count`);
      setPercursosAtivosCount(countResponse.data);

      const percursoAtivo = percursos.find((percurso) => !percurso.chegadaHora);
      setPercursoAtual(percursoAtivo || null);
      setIsCorridaIniciada(!!percursoAtivo);

    } catch (error) {
      console.error("Nenhum percurso encontrado ou erro ao buscar:", error);
      setPercursoAtual(null);
      setIsCorridaIniciada(false);
      setPercursosAtivosCount(0);
    }
  };

  useEffect(() => {
    const carregarDadosCorrida = async () => {
      try {
        await buscarPercursosDaCorrida();
      } catch (error) {
        console.error("Erro ao carregar dados da corrida:", error);
        setIsCorridaIniciada(false);
        setPercursosAtivosCount(0);
      }
    };

    carregarDadosCorrida();
  }, [corrida.idCorrida]);

  useEffect(() => {
    setCorridaLocal(corrida);
  }, [corrida]);

  const isIniciarDisabled = isCorridaIniciada;
  const isFinalizarDisabled = !isCorridaIniciada;
  const isOutrosBotoesDisabled = false;

  const handleClick = (path: string, label: string) => {
    if (label === "Iniciar Percurso") {
      setModalIniciarOpen(true);
    } else if (label === "Finalizar Percurso") {
      setModalFinalizarOpen(true);
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
        localOrigem: corridaLocal.local_de_saida || "",
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
      
      await buscarPercursosDaCorrida();

      handleCloseFinalizarModal();
      setFinalizeSuccessModalOpen(true);
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
          {percursosAtivosCount > 0 && ` (${percursosAtivosCount} percurso(s) ativo(s))`}
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
                    transform: "scale(1.03)", 
                    boxShadow: isIniciarDisabled && item.label === "Iniciar Percurso" ? 4 : 6,
                    cursor: isIniciarDisabled && item.label === "Iniciar Percurso" ? "not-allowed" : "pointer"
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

      <Dialog open={modalIniciarOpen} onClose={handleCloseIniciarModal} fullWidth>
        <DialogTitle>
          <Typography component="div" fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
            Iniciar Novo Percurso
          </Typography>
          {percursosAtivosCount > 0 && (
            <Typography variant="body2" color="warning.main">
              Existe(m) {percursosAtivosCount} percurso(s) ativo(s) nesta corrida
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Local de Saída"
              value={corridaLocal.local_de_saida || "Não informado"}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                readOnly: true,
              }}
            />
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
        <DialogTitle>Percurso iniciado com sucesso</DialogTitle>
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