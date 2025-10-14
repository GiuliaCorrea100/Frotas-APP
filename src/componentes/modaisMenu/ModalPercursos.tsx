import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon
} from "@mui/icons-material";
import { PercursoBackend, buscarPercursosDaCorrida } from "../../api/percursoService";

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
        <Typography variant="subtitle1" fontWeight="bold">
          PERCURSOS ATIVOS
        </Typography>
      </Box>
      
      <Collapse in={showPercursos}>
        <Box sx={{ mt: 1, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          {loadingPercursos ? (
            <Typography variant="body2">Carregando percursos...</Typography>
          ) : percursos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum percurso registrado para esta corrida.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Origem → Destino</TableCell>
                    <TableCell>Saída</TableCell>
                    <TableCell>Chegada</TableCell>
                    <TableCell>Odômetro</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {percursos.map((percurso) => (
                    <TableRow key={percurso.idPercurso}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={percurso.chegadaHora ? "Finalizado" : "Em Andamento"}
                          color={percurso.chegadaHora ? "success" : "primary"}
                          variant={percurso.chegadaHora ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          {percurso.localOrigem || "Saída"} → {percurso.localDestino}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {percurso.saidaHora ? formatTime(percurso.saidaHora.toString()) : '-'}
                      </TableCell>
                      <TableCell>
                        {percurso.chegadaHora ? formatTime(percurso.chegadaHora.toString()) : '-'}
                      </TableCell>
                      <TableCell>
                        {percurso.saidaOdometro} → {percurso.chegadaOdometro || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ModalPercursos;