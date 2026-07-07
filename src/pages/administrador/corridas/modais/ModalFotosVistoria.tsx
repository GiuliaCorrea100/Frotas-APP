import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Chip,
  Divider,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Close,
  PhotoCamera,
  ArrowBack,
  ArrowForward,
  Image,
} from "@mui/icons-material";
import { modalStyle } from "../../../../utils/modalStyle";
import { CorridaVistoriaService } from "../../../../services/CorridaVistoriaService";

// Interface para as fotos da vistoria
export interface FotoVistoriaDto {
  idCorridaVistoriaFoto: number;
  idCorridaVistoria: number;
  urlArquivo: string;
  dataUpload: Date;
}

type ModalFotosVistoriaProps = {
  open: boolean;
  onClose: () => void;
  modalLoading: boolean;
  idCorridaVistoria: number;
  tipoVistoria: "RETIRADA" | "DEVOLUCAO";
};

export function ModalFotosVistoria(props: ModalFotosVistoriaProps) {
  const {
    open,
    onClose,
    idCorridaVistoria,
    tipoVistoria,
  } = props;

  const theme = useTheme();
  const [fotos, setFotos] = useState<FotoVistoriaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    if (open && idCorridaVistoria) {
      carregarFotos();
    }
  }, [open, idCorridaVistoria]);

  const carregarFotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await CorridaVistoriaService.buscarFotosVistoria(idCorridaVistoria);
      // console.log('📸 Dados das fotos recebidos:', dados);
      setFotos(dados);
      setIndiceAtual(0);
    } catch (err) {
      setError('Erro ao carregar as fotos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnterior = () => {
    setIndiceAtual((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const handleProximo = () => {
    setIndiceAtual((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  const tipoLabel = tipoVistoria === 'RETIRADA' ? 'Retirada' : 'Devolução';

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0,
          }}
        >
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            <PhotoCamera sx={{ mr: 1.5, fontSize: 24, color: "primary.main" }} />
            Fotos da Vistoria - {tipoLabel}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 400 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          ) : fotos.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
              <Image sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="body1" color="text.secondary">
                Nenhuma foto registrada para esta vistoria.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', position: 'relative' }}>
              {/* Container da imagem */}
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={fotos[indiceAtual].urlArquivo}
                  alt={`Foto ${indiceAtual + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              {/* Indicador de página */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                <Chip
                  label={`${indiceAtual + 1} / ${fotos.length}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* Botões de navegação */}
              {fotos.length > 1 && (
                <>
                  <IconButton
                    onClick={handleAnterior}
                    sx={{
                      position: 'absolute',
                      left: -20,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: theme.palette.background.paper,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ArrowBack />
                  </IconButton>

                  <IconButton
                    onClick={handleProximo}
                    sx={{
                      position: 'absolute',
                      right: -20,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: theme.palette.background.paper,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </>
              )}

              {/* Miniaturas */}
              {fotos.length > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mt: 2,
                    overflowX: 'auto',
                    pb: 1,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {fotos.map((foto, index) => (
                    <Box
                      key={foto.idCorridaVistoriaFoto}
                      onClick={() => setIndiceAtual(index)}
                      sx={{
                        width: 60,
                        height: 60,
                        border: `2px solid ${index === indiceAtual ? theme.palette.primary.main : 'transparent'}`,
                        borderRadius: 1,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        flexShrink: 0,
                        '&:hover': {
                          border: `2px solid ${theme.palette.primary.light}`,
                        },
                      }}
                    >
                      <img
                        src={foto.urlArquivo}
                        alt={`Miniatura ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 1,
          }}
        >
          <Button onClick={onClose} color="primary" variant="contained">
            Fechar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}