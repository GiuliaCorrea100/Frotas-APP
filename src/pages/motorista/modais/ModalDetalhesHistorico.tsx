import React from "react";
import {
  Modal,
  Box,
  Chip,
  Divider,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton,
} from "@mui/material";
import { CorridaFrontend } from "../../../services/CorridaService";
import { PercursoBackend } from "../../../services/PercursoService";
import { Abastecimento } from "../../../services/AbastecimentoService";
import { formatDate, formatDateOnly } from "../../../utils/formatDate";
import { modalStyle } from "../../../utils/modalStyle";
import {
  AccessTime,
  ArrowForward,
  Article,
  CalendarToday,
  Close,
  DirectionsCar,
  Event,
  LocalGasStation,
  Warning,
} from "@mui/icons-material";

type ModalDetalhesHistoricoProps = {
  open: boolean;
  onClose: () => void;
  corrida: CorridaFrontend | null;
  percursos: PercursoBackend[];
  abastecimentos: Abastecimento[];
  ocorrencias: Record<number, string>;
  modalLoading: boolean;
  getSituacaoChipProps: (s: string | undefined) => {
    label: string | undefined;
    color: any;
  };
};

export function ModalDetalhesHistorico(props: ModalDetalhesHistoricoProps) {
  const {
    open,
    onClose,
    corrida,
    percursos,
    abastecimentos,
    ocorrencias,
    modalLoading,
    getSituacaoChipProps,
  } = props;

  if (!corrida) return null;

  const situacaoProps = getSituacaoChipProps(corrida.situacao);

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
            <Article sx={{ mr: 1.5, fontSize: 24, color: "primary.main" }} />
            Detalhes da Corrida
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* INFORMAÇÕES BÁSICAS */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DirectionsCar
                      sx={{ fontSize: 18, color: "primary.main" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "text.primary" }}
                        >
                          Veículo:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ color: "text.primary" }}
                        >
                          {corrida.placaVeiculo}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>

                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AccessTime sx={{ fontSize: 18, color: "warning.main" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "text.primary" }}
                        >
                          Situação:
                        </Typography>
                        <Chip
                          label={situacaoProps.label}
                          color={situacaoProps.color as any}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.primary",
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Datas */}
            <Grid item xs={12} md={6}>
              <List sx={{ p: 0 }}>
                {/* INÍCIO */}
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CalendarToday
                      sx={{ fontSize: 18, color: "success.main" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: "text.primary",
                          }}
                        >
                          Início:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "text.primary",
                          }}
                        >
                          {formatDate(corrida.dataHoraLiberacaoChave)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>

                {/* TÉRMINO */}
                <ListItem sx={{ py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Event sx={{ fontSize: 18, color: "error.main" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "text.primary" }}
                        >
                          Término:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ color: "text.primary" }}
                        >
                          {formatDate(corrida.dataHoraRecebimentoChave)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          <Divider />

          {/* OCORRÊNCIAS */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: "text.primary" }}>
              Ocorrências
            </Typography>
            {ocorrencias[corrida.idCorrida] ? (
              <List sx={{ p: 0 }}>
                {ocorrencias[corrida.idCorrida]
                  .split(", ")
                  .map((ocorrencia: string, i: number) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Warning sx={{ fontSize: 18, color: "warning.main" }} />
                      </ListItemIcon>
                      <ListItemText primary={ocorrencia} />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontStyle: "italic", mb: 0.5 }}
              >
                Nenhuma ocorrência registrada
              </Typography>
            )}
          </Box>
          <Divider />

          {/* PERCURSOS */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: "text.primary" }}>
              Percursos
            </Typography>

            {modalLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="body2" color="text.primary">
                  Carregando...
                </Typography>
              </Box>
            ) : percursos.length === 0 ? (
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontStyle: "italic", mb: 0.5 }}
              >
                Nenhum percurso registrado
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {percursos.map((percurso: any, i: number) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <DirectionsCar
                        sx={{ fontSize: 20, color: "primary.main" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "text.primary" }}
                        >
                          {percurso.localOrigem}
                          <ArrowForward
                            sx={{
                              mx: 0.5,
                              fontSize: 16,
                              verticalAlign: "middle",
                            }}
                          />
                          {percurso.localDestino}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: "block",
                            fontWeight: 400,
                          }}
                        >
                          {formatDate(percurso.saidaHora)} →{" "}
                          {formatDate(percurso.chegadaHora)}
                        </Typography>
                      }
                      secondaryTypographyProps={{ component: "span" }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Divider />

          {/* ABASTECIMENTOS */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: "text.primary" }}>
              Abastecimentos
            </Typography>

            {modalLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="body2" color="text.primary">
                  Carregando...
                </Typography>
              </Box>
            ) : abastecimentos.length === 0 ? (
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontStyle: "italic", mb: 0.5 }}
              >
                Nenhum abastecimento registrado
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {abastecimentos.map((ab: any, i: number) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <LocalGasStation
                        sx={{ fontSize: 20, color: "success.main" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "text.primary" }}
                        >
                          {formatDateOnly(ab.dataAbastecimento)} -{" "}
                          {Math.floor(ab.quantidade)}L (R$ {ab.valorTotal})
                        </Typography>
                      }
                      primaryTypographyProps={{
                        variant: "body2",
                        color: "text.primary",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 3,
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
