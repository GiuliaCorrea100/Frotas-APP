import {
  Modal,
  Box,
  Chip,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Event,
  ListItemIcon,
  Paper,
  Button,
} from "@mui/material";
import { CorridaFrontend } from "../../../services/CorridaService";
import { PercursoBackend } from "../../../services/PercursoService";
import { Abastecimento } from "../../../services/AbastecimentoService";
import React from "react";
import {
  AccessTime,
  ArrowForward,
  CalendarToday,
  DirectionsCar,
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
  formatDate: (d: string | Date | null) => string;
  getSituacaoChipProps: (s: string | undefined) => {
    label: string | undefined;
    color: any;
  };
  modalStyle: any;
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
    formatDate,
    getSituacaoChipProps,
    modalStyle,
  } = props;

  if (!corrida) return null;

  const situacaoProps = getSituacaoChipProps(corrida.situacao);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Paper sx={modalStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" color="text.primary">
              Detalhes da Corrida
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* INFORMAÇÕES BÁSICAS */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: "100%" }}>
                  <CardContent sx={{ "&:last-child": { pb: "0" }, pt: 2 }}>
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
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: "text.primary",
                                }}
                              >
                                Veículo:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "text.primary",
                                }}
                              >
                                {corrida.placaVeiculo}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>

                      <ListItem sx={{ py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AccessTime
                            sx={{ fontSize: 18, color: "warning.main" }}
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
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: "text.primary",
                                }}
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
                  </CardContent>
                </Card>
              </Grid>

              {/* Datas */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: "100%" }}>
                  <CardContent sx={{ "&:last-child": { pb: "0" }, pt: 2 }}>
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
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: "text.primary",
                                }}
                              >
                                Início:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "text.primary",
                                }}
                              >
                                {formatDate(corrida.dataInicio)}
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
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: "text.primary",
                                }}
                              >
                                Término:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "text.primary",
                                }}
                              >
                                {formatDate(corrida.dataTermino)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* OCORRÊNCIAS */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ "&:last-child": { pb: "0", mb: 2 } }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Ocorrências
                </Typography>
                {ocorrencias[corrida.idCorrida] ? (
                  <List sx={{ p: 0 }}>
                    {ocorrencias[corrida.idCorrida]
                      .split(", ")
                      .map((ocorrencia: string, i: number) => (
                        <ListItem key={i} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <Warning
                              sx={{ fontSize: 18, color: "warning.main" }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={ocorrencia}
                            primaryTypographyProps={{
                              variant: "body2",
                              color: "text.primary",
                            }}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ fontStyle: "italic", mb: 2 }}
                  >
                    Nenhuma ocorrência registrada
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* PERCURSOS */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ "&:last-child": { pb: "0", mb: 2 } }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Percursos
                </Typography>

                {modalLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 3 }}
                  >
                    <Typography variant="body2" color="text.primary">
                      Carregando...
                    </Typography>
                  </Box>
                ) : percursos.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ fontStyle: "italic", mb: 2 }}
                  >
                    Nenhum percurso registrado
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {percursos.map((percurso: any, i: number) => (
                      <ListItem key={i} sx={{ py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <DirectionsCar
                            sx={{ fontSize: 20, color: "primary.main" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <>
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{
                                  fontWeight: 500,
                                  display: "block",
                                  color: "text.primary",
                                }}
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
                            </>
                          }
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* ABASTECIMENTOS */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ "&:last-child": { pb: "0", mb: 2 } }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Abastecimentos
                </Typography>

                {modalLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 3 }}
                  >
                    <Typography variant="body2" color="text.primary">
                      Carregando...
                    </Typography>
                  </Box>
                ) : abastecimentos.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ fontStyle: "italic", mb: 2 }}
                  >
                    Nenhum abastecimento registrado
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {abastecimentos.map((ab: any, i: number) => (
                      <ListItem key={i} sx={{ py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
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
                              {formatDate(ab.dataAbastecimento)} -{" "}
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
              </CardContent>
            </Card>
          </Box>

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
        </Paper>
      </Box>
    </Modal>
  );
}
