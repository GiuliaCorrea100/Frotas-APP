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
import { ArquivoOcorrenciaDto, OcorrenciaDto, OcorrenciaService } from "../../../../services/OcorrenciaService";


type ModalArquivoOcorrenciaProps = {
  open: boolean;
  onClose: () => void;
  modalLoading: boolean;
  ocorrencia: OcorrenciaDto | null
};

export function ModalArquivoOcorrencia(props: ModalArquivoOcorrenciaProps) {
  const {
    open,
    onClose,
    ocorrencia,
  } = props;

  const theme = useTheme();
  const [arquivos, setArquivos] = useState<ArquivoOcorrenciaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    if (open && ocorrencia?.idOcorrencia) {
      carregarArquivos();
    }
  }, [open, ocorrencia?.idOcorrencia]);

  const carregarArquivos = async () => {
    if (!ocorrencia?.idOcorrencia) return;
    
    try {
      setLoading(true);
      setError(null);
      const dados = await OcorrenciaService.buscarArquivosOcorrencia(ocorrencia.idOcorrencia);
      setArquivos(dados);
      setIndiceAtual(0);
    } catch (err) {
      setError('Erro ao carregar os arquivos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnterior = () => {
    setIndiceAtual((prev) => (prev === 0 ? arquivos.length - 1 : prev - 1));
  };

  const handleProximo = () => {
    setIndiceAtual((prev) => (prev === arquivos.length - 1 ? 0 : prev + 1));
  };

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
            Arquivos da ocorrência
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
          ) : arquivos.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
              <Image sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="body1" color="text.secondary">
                Nenhum arquivo registrado a esta ocorrência.
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
                  src={arquivos[indiceAtual].urlArquivo}
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
                  label={`${indiceAtual + 1} / ${arquivos.length}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* Botões de navegação */}
              {arquivos.length > 1 && (
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
              {arquivos.length > 1 && (
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
                  {arquivos.map((foto, index) => (
                    <Box
                      key={foto.idArquivoOcorrencia}
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