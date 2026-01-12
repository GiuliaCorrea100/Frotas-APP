import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Collapse,
  IconButton,
  Chip
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  Schedule,
  CheckCircle
} from "@mui/icons-material";
import { PercursoBackend, buscarPercursosDaCorrida } from "../../../services/PercursoService";

interface ModalPercursosProps {
  corridaId: number;
  situacaoCorrida: string;
}

const formatTime = (dateString: string | null) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleTimeString("pt-BR");
  } catch {
    return "-";
  }
};

const ModalPercursos: React.FC<ModalPercursosProps> = ({ corridaId, situacaoCorrida }) => {
  const [percursos, setPercursos] = useState<PercursoBackend[]>([]);
  const [showPercursos, setShowPercursos] = useState(false);
  const [loadingPercursos, setLoadingPercursos] = useState(false);

  const carregarPercursos = async () => {
    if (showPercursos && percursos.length > 0) return;
    
    setLoadingPercursos(true);
    try {
      const percursosData = await buscarPercursosDaCorrida(corridaId);
      setPercursos(percursosData);
    } catch (error) {
      console.error("Erro ao carregar percursos:", error);
    } finally {
      setLoadingPercursos(false);
    }
  };

  const togglePercursos = () => {
    if (!showPercursos) {
      carregarPercursos();
    }
    setShowPercursos(!showPercursos);
  };

  if (situacaoCorrida === 'FINALIZADA') {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' },
          p: 1,
          borderRadius: 1
        }}
        onClick={togglePercursos}
      >
        <IconButton size="small">
          {showPercursos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
          PERCURSOS ATIVOS
        </Typography>
      </Box>
      
      <Collapse in={showPercursos}>
        <Box sx={{ mt: 1, p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
          {loadingPercursos ? (
            <Typography variant="body2">Carregando percursos...</Typography>
          ) : percursos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum percurso registrado para esta corrida.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {percursos
                // Ordena o percurso "Em andamento" acima dos finalizados
                .sort((a, b) => {
                  if (!a.chegadaHora && b.chegadaHora) return -1;
                  if (a.chegadaHora && !b.chegadaHora) return 1;
                  if (a.chegadaHora && b.chegadaHora) {
                    return new Date(b.chegadaHora).getTime() - new Date(a.chegadaHora).getTime();
                  }
                  return new Date(b.saidaHora).getTime() - new Date(a.saidaHora).getTime();
                })
                .map((percurso) => (
                <Paper 
                  key={percurso.idPercurso} 
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    borderColor: percurso.chegadaHora ? 'success.light' : 'primary.light',
                    backgroundColor: 'background.paper'
                  }}
                >
                  {/* Cabeçalho com status e odômetro */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1.5 
                  }}>
                    <Chip
                      size="small"
                      label={percurso.chegadaHora ? "Finalizado" : "Em Andamento"}
                      color={percurso.chegadaHora ? "success" : "primary"}
                      variant={percurso.chegadaHora ? "filled" : "outlined"}
                    />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontWeight: 'medium' }}
                    >
                      {percurso.saidaOdometro} Km → {percurso.chegadaOdometro || '-'} Km
                    </Typography>
                  </Box>
                  
                  {/* Trajeto */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon 
                      sx={{ 
                        fontSize: 18, 
                        mr: 1, 
                        color: 'primary.main',
                        flexShrink: 0
                      }} 
                    />
                    <Box>
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        Para: {percurso.localDestino}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        De: {percurso.localOrigem || "Local de saída"}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Horários */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    gap: 1
                  }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Schedule 
                        sx={{ fontSize: 16, color: 'primary.main', mb: 0.5 }} 
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Saída
                      </Typography>
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {percurso.saidaHora ? formatTime(percurso.saidaHora.toString()) : '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <CheckCircle 
                        sx={{ 
                          fontSize: 16, 
                          color: percurso.chegadaHora ? 'success.main' : 'text.disabled', 
                          mb: 0.5 
                        }} 
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Chegada
                      </Typography>
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {percurso.chegadaHora ? formatTime(percurso.chegadaHora.toString()) : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ModalPercursos;