import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Box,
  Stack,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  Tooltip,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CancelIcon from "@mui/icons-material/Cancel";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";

import {
  CorridaFrontend,
  getCorridaById,
} from "../../../services/CorridaService";
import {
  OcorrenciaDto,
  OcorrenciaService,
} from "../../../services/OcorrenciaService";
import {
  buscarPercursosDaCorrida,
  PercursoDto,
  removerPercurso,
} from "../../../services/PercursoService";

import { Add } from "@mui/icons-material";
import { Abastecimento } from "../../../services/AbastecimentoService";
import AbastecimentoService from "../../../services/AbastecimentoService";
import ModalEditarOcorrencia from "./modais/ModalEdicaoOcorrencia";
import CadastrarOcorrencia from "./modais/ModalCadastroOcorrencia";
import AbastecimentoModal from "./modais/ModalCadastroAbastecimento";
import EdicaoAbastecimentoModal from "./modais/ModalEdicaoAbastecimento";
import EdicaoPercursosModal from "./modais/ModalEdicaoPercurso";
import CadastrarPercursosModal from "./modais/ModalCadastroPercurso";
import AppLayout from "../../../components/Layout";
import { formatDate, formatDateOnly } from "../../../utils/formatDate";

const DetalhesRequisicao: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [corrida, setCorrida] = useState<CorridaFrontend>(null);
  const [loading, setLoading] = useState(true);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDto[]>([]);
  const [abastecimentos, setAbastecimento] = useState<Abastecimento[]>([]);
  const [percursos, setPercursos] = useState<PercursoDto[]>([]);

  const [modalEditarOcorrenciaAberto, setModalEditarOcorrenciaAberto] =
    useState(false);
  const [modalCadastroOcorrenciaAberto, setModalCadastroOcorrenciaAberto] =
    useState(false);
  const [
    modalCadastroAbertoAbastecimento,
    setModalCadastroAbertoAbastecimento,
  ] = useState(false);
  const [modalEditarAbastecimentoAberto, setModalEditarAbastecimento] =
    useState(false);
  const [modalCadastrarPercursoAberto, setModalCadastrarPercusoAberto] =
    useState(false);
  const [modalEditarPercursoAberto, setModalEditarPercursoAberto] =
    useState(false);
  const [modalExcluirPercursoAberto, setModalExcluirPercursoAberto] =
    useState(false);
  const [modalExcluirOcorrenciaAberto, setModalExcluirOcorrenciaAberto] =
    useState(false);
  const [modalExcluirAbastecimentoAberto, setModalExcluirAbastecimentoAberto] =
    useState(false);

  const [abastecimentoSelecionado, setAbastecimentoSelecionado] =
    useState<Abastecimento | null>(null);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
    useState<OcorrenciaDto | null>(null);
  const [percursoSelecionado, setPercursoSelecionado] =
    useState<PercursoDto | null>(null);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      if (id) {
        const [
          corridaData,
          ocorrenciasData,
          abastecimentosData,
          percursosData,
        ] = await Promise.all([
          getCorridaById(Number(id)),
          OcorrenciaService.buscarPorCorrida(Number(id)),
          AbastecimentoService.buscarPorCorrida(Number(id)),
          buscarPercursosDaCorrida(Number(id)),
        ]);

        setCorrida(corridaData);

        if (Array.isArray(ocorrenciasData)) {
          setOcorrencias(ocorrenciasData);
        } else if (ocorrenciasData) {
          setOcorrencias([ocorrenciasData]);
        }

        if (Array.isArray(abastecimentosData)) {
          setAbastecimento(abastecimentosData);
        } else if (abastecimentosData) {
          setAbastecimento([abastecimentosData]);
        }

        if (Array.isArray(percursosData)) {
          setPercursos(percursosData);
        } else if (percursosData) {
          setPercursos([percursosData]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const idcorridaNumber = Number(id);
  const isAgendada = corrida ? !corrida.dataHoraLiberacaoChave : false;

  // Função para formatar valores como moeda
  const formatCurrency = (value: number) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const columnsOcorrencias: GridColDef<OcorrenciaDto>[] = [
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 1,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "dataOcorrencia",
      headerName: "Data",
      flex: 1,
      renderCell: (params) => (
        <Typography color="text.primary">
          {formatDateOnly(params.value)}
        </Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const ocorrencia = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Editar ocorrência">
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => handleAbrirModalEditarOcorrencia(ocorrencia)}
                startIcon={<CreateIcon />}
                sx={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  padding: 0,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiButton-startIcon": {
                    margin: 0,
                  },
                }}
              ></Button>
            </Tooltip>
            <Tooltip title="Excluir ocorrência">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleAbrirModalExcluirOcorrencia(ocorrencia)}
                startIcon={<CancelIcon />}
                sx={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  padding: 0,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiButton-startIcon": {
                    margin: 0,
                  },
                  color:
                    theme.palette.mode === "dark"
                      ? "rgba(0, 0, 0, 0.87)"
                      : undefined,
                }}
              ></Button>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const columnsAbastecimentos: GridColDef<Abastecimento>[] = [
    {
      field: "nomeTipoCombustivel",
      headerName: "Combustível",
      flex: 1,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "quantidade",
      headerName: "Quantidade de Litros",
      flex: 1,
      renderCell: (params) => {
        const value = Number(params.value);
        return isNaN(value) ? "-" : value.toFixed(2);
      },
    },
    {
      field: "valorUnitario",
      headerName: "Valor do Litro",
      flex: 1,
      renderCell: (params) => (
        <Typography color="text.primary">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: "valorTotal",
      headerName: "Preço Final",
      flex: 1,
      renderCell: (params) => (
        <Typography color="text.primary">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: "dataAbastecimento",
      headerName: "Data Abastecimento",
      flex: 1,
      renderCell: (params) => (
        <Typography color="text.primary">
          {formatDateOnly(params.value)}
        </Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const abastecimento = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Editar abastecimento">
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() =>
                  handleAbrirModalEditarAbastecimento(abastecimento)
                }
                startIcon={<CreateIcon />}
                sx={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  padding: 0,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiButton-startIcon": {
                    margin: 0,
                  },
                }}
              ></Button>
            </Tooltip>
            <Tooltip title="Excluir abastecimento">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() =>
                  handleAbrirModalExcluirAbastecimento(abastecimento)
                }
                startIcon={<CancelIcon />}
                sx={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  padding: 0,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiButton-startIcon": {
                    margin: 0,
                  },
                  color:
                    theme.palette.mode === "dark"
                      ? "rgba(0, 0, 0, 0.87)"
                      : undefined,
                }}
              ></Button>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const colunsPercursos: GridColDef<PercursoDto>[] = [
    {
      field: "localOrigem",
      headerName: "Local origem",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "saidaHora",
      headerName: "Hora de saída",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.primary">{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: "saidaOdometro",
      headerName: "Odômetro saída",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "localDestino",
      headerName: "Local destino",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "chegadaHora",
      headerName: "Hora da chegada",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.primary">{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: "chegadaOdometro",
      headerName: "Odômetro chegada",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const percurso = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Editar percurso">
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => handleAbrirModalEditarPercuso(percurso)}
                startIcon={<CreateIcon />}
                sx={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  padding: 0,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiButton-startIcon": {
                    margin: 0,
                  },
                }}
              ></Button>
            </Tooltip>
            <Tooltip title="Excluir percurso">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleAbrirModalExcluirPercurso(percurso)}
                startIcon={<CancelIcon />}
                sx={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  padding: 0,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiButton-startIcon": {
                    margin: 0,
                  },
                  color:
                    theme.palette.mode === "dark"
                      ? "rgba(0, 0, 0, 0.87)"
                      : undefined,
                }}
              ></Button>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const handleAbrirModalEditarOcorrencia = (ocorrencia: OcorrenciaDto) => {
    setOcorrenciaSelecionada(ocorrencia);
    setModalEditarOcorrenciaAberto(true);
  };
  const handleFecharModalEditarOcorrencia = () => {
    setModalEditarOcorrenciaAberto(false);
    setOcorrenciaSelecionada(null);
  };

  const handleAbrirModalCadastroOcorrencia = () => {
    setModalCadastroOcorrenciaAberto(true);
  };
  const handleFecharModalCadastroOcorrencia = () => {
    setModalCadastroOcorrenciaAberto(false);
  };

  const handleAbrirModalCadastroAbastecimento = () => {
    setModalCadastroAbertoAbastecimento(true);
  };
  const handleFecharModalCadastroAbastecimento = () => {
    setModalCadastroAbertoAbastecimento(false);
  };

  const handleAbrirModalEditarAbastecimento = (
    abastecimento: Abastecimento,
  ) => {
    setAbastecimentoSelecionado(abastecimento);
    setModalEditarAbastecimento(true);
  };
  const handleFecharModalEditarAbastecimento = () => {
    setModalEditarAbastecimento(false);
  };

  const handleAbrirModalCadastroPercurso = () => {
    setModalCadastrarPercusoAberto(true);
  };
  const handleFecharModalCadastroPercurso = () => {
    setModalCadastrarPercusoAberto(false);
  };

  const handleAbrirModalEditarPercuso = (percurso: PercursoDto) => {
    setPercursoSelecionado(percurso);
    setModalEditarPercursoAberto(true);
  };
  const handleFecharModalEditarPercurso = () => {
    setModalEditarPercursoAberto(false);
  };

  const handleFecharModalExcluirPercurso = () => {
    setModalExcluirPercursoAberto(false);
    setPercursoSelecionado(null);
  };

  const handleConfirmarExclusaoPercurso = async () => {
    if (!percursoSelecionado) return;

    try {
      await removerPercurso(percursoSelecionado.idPercurso!);
      await carregarDados();
      handleFecharModalExcluirPercurso();
    } catch (error) {
      console.error("Erro ao excluir percurso:", error);
    }
  };

  const handleAbrirModalExcluirPercurso = (percurso: PercursoDto) => {
    setPercursoSelecionado(percurso);
    setModalExcluirPercursoAberto(true);
  };

  const handleAbrirModalExcluirOcorrencia = (ocorrencia: OcorrenciaDto) => {
    setOcorrenciaSelecionada(ocorrencia);
    setModalExcluirOcorrenciaAberto(true);
  };

  const handleFecharModalExcluirOcorrencia = () => {
    setModalExcluirOcorrenciaAberto(false);
    setOcorrenciaSelecionada(null);
  };

  const handleConfirmarExclusaoOcorrencia = async () => {
    if (!ocorrenciaSelecionada) return;

    try {
      await OcorrenciaService.excluirOcorrencia(
        ocorrenciaSelecionada.idOcorrencia!,
      );
      await carregarDados();
      handleFecharModalExcluirOcorrencia();
    } catch (error) {
      console.error("Erro ao excluir ocorrência:", error);
    }
  };

  // Funções para exclusão de abastecimento
  const handleAbrirModalExcluirAbastecimento = (
    abastecimento: Abastecimento,
  ) => {
    setAbastecimentoSelecionado(abastecimento);
    setModalExcluirAbastecimentoAberto(true);
  };

  const handleFecharModalExcluirAbastecimento = () => {
    setModalExcluirAbastecimentoAberto(false);
    setAbastecimentoSelecionado(null);
  };

  const handleConfirmarExclusaoAbastecimento = async () => {
    if (!abastecimentoSelecionado) return;

    try {
      await AbastecimentoService.excluirAbastecimento(
        abastecimentoSelecionado.idAbastecimento!,
      );
      await carregarDados();
      handleFecharModalExcluirAbastecimento();
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error);
    }
  };

  return (
    <AppLayout>
      <Box>
        {/* Card de Informações Básicas */}
        <Card
          sx={{
            marginBottom: 2,
            boxShadow: theme.shadows[1],
            border: "1px solid",
            borderColor: "divider",
            background: theme.palette.mode === "dark" ? "#1E1E1E" : "#fff",
          }}
        >
          <CardHeader
            title="Informações Básicas"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
              },
            }}
          />
          <CardContent>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando informações da corrida...
              </Typography>
            ) : corrida ? (
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Motorista:
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {corrida.nomeMotorista}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Carro:
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {corrida.placaVeiculo}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {isAgendada
                      ? "Data agendada para início da corrida"
                      : "Data e hora de início da corrida"}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {isAgendada
                      ? formatDateOnly(corrida.dataInicio)
                      : formatDate(corrida.dataHoraLiberacaoChave)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {isAgendada
                      ? "Data agendada para término da corrida"
                      : "Data e hora de término da corrida"}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {isAgendada
                      ? formatDateOnly(corrida.dataTermino)
                      : corrida.dataHoraRecebimentoChave
                        ? formatDate(corrida.dataHoraRecebimentoChave)
                        : "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {corrida.situacao}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status da chave:
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {corrida.chaveEmprestada ? "Emprestada" : "Não Emprestada"}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" color="error">
                Corrida não encontrada.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Card de Ocorrências */}
        <Card
          sx={{
            marginBottom: 2,
            boxShadow: theme.shadows[1],
            border: "1px solid",
            borderColor: "divider",
            background: theme.palette.mode === "dark" ? "#1E1E1E" : "#fff",
          }}
        >
          <CardHeader
            title="Ocorrências cadastradas na corrida"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
              },
            }}
          />
          <CardContent>
            <Button
              variant="contained"
              onClick={handleAbrirModalCadastroOcorrencia}
              startIcon={<Add />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                mb: 2,
              }}
            >
              Nova Ocorrência
            </Button>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando ocorrências...
              </Typography>
            ) : ocorrencias.length > 0 ? (
              <Box sx={{ minHeight: 200, width: "100%" }}>
                <DataGrid
                  rows={ocorrencias}
                  columns={columnsOcorrencias}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: `1px solid ${theme.palette.divider}`,
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      {
                        marginBottom: 0,
                        alignSelf: "center",
                      },
                    "& .MuiTablePagination-toolbar": {
                      minHeight: "52px",
                      alignItems: "center",
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  localeText={
                    ptBR.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableRowSelectionOnClick
                  getRowId={(row) => row.idOcorrencia}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma ocorrência cadastrada para esta corrida.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Card de Abastecimento */}
        <Card
          sx={{
            marginBottom: 2,
            boxShadow: theme.shadows[1],
            border: "1px solid",
            borderColor: "divider",
            background: theme.palette.mode === "dark" ? "#1E1E1E" : "#fff",
          }}
        >
          <CardHeader
            title="Abastecimentos cadastrados na corrida"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
              },
            }}
          />
          <CardContent>
            <Button
              variant="contained"
              onClick={handleAbrirModalCadastroAbastecimento}
              startIcon={<Add />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                mb: 2,
              }}
            >
              Novo Abastecimento
            </Button>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando Abastecimentos...
              </Typography>
            ) : abastecimentos.length > 0 ? (
              <Box sx={{ minHeight: 200, width: "100%" }}>
                <DataGrid
                  rows={abastecimentos}
                  columns={columnsAbastecimentos}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: `1px solid ${theme.palette.divider}`,
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      {
                        marginBottom: 0,
                        alignSelf: "center",
                      },
                    "& .MuiTablePagination-toolbar": {
                      minHeight: "52px",
                      alignItems: "center",
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  localeText={
                    ptBR.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableRowSelectionOnClick
                  getRowId={(row) => row.idAbastecimento!}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum abastecimento cadastrado para esta corrida.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Card de Percusos */}
        <Card
          sx={{
            marginBottom: 2,
            boxShadow: theme.shadows[1],
            border: "1px solid",
            borderColor: "divider",
            background: theme.palette.mode === "dark" ? "#1E1E1E" : "#fff",
          }}
        >
          <CardHeader
            title="Percursos cadastrados na corrida"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
              },
            }}
          />
          <CardContent>
            <Button
              variant="contained"
              onClick={handleAbrirModalCadastroPercurso}
              startIcon={<Add />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                mb: 2,
              }}
            >
              Novo Percurso
            </Button>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando Percursos...
              </Typography>
            ) : percursos.length > 0 ? (
              <Box sx={{ minHeight: 200, width: "100%" }}>
                <DataGrid
                  rows={percursos}
                  columns={colunsPercursos}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: `1px solid ${theme.palette.divider}`,
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      {
                        marginBottom: 0,
                        alignSelf: "center",
                      },
                    "& .MuiTablePagination-toolbar": {
                      minHeight: "52px",
                      alignItems: "center",
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  localeText={
                    ptBR.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableRowSelectionOnClick
                  getRowId={(row) => row.idPercurso!}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum percurso cadastrado para esta corrida.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Modal de Exclusão de Percurso */}
      <Dialog
        open={modalExcluirPercursoAberto}
        onClose={handleFecharModalExcluirPercurso}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color:
              theme.palette.mode === "dark"
                ? theme.palette.common.white
                : theme.palette.text.primary,
          }}
        >
          Excluir Percurso
        </DialogTitle>
        <DialogContent>
          <Typography
            color={
              theme.palette.mode === "dark"
                ? theme.palette.common.white
                : theme.palette.text.primary
            }
          >
            Você tem certeza que deseja excluir este percurso?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleFecharModalExcluirPercurso} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarExclusaoPercurso}
            variant="contained"
            color="error"
          >
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Exclusão de Ocorrência */}
      <Dialog
        open={modalExcluirOcorrenciaAberto}
        onClose={handleFecharModalExcluirOcorrencia}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color:
              theme.palette.mode === "dark"
                ? theme.palette.common.white
                : theme.palette.text.primary,
          }}
        >
          Excluir Ocorrência
        </DialogTitle>
        <DialogContent>
          <Typography
            color={
              theme.palette.mode === "dark"
                ? theme.palette.common.white
                : theme.palette.text.primary
            }
          >
            Você tem certeza que deseja excluir esta ocorrência?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleFecharModalExcluirOcorrencia}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarExclusaoOcorrencia}
            variant="contained"
            color="error"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Exclusão de Abastecimento */}
      <Dialog
        open={modalExcluirAbastecimentoAberto}
        onClose={handleFecharModalExcluirAbastecimento}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color:
              theme.palette.mode === "dark"
                ? theme.palette.common.white
                : theme.palette.text.primary,
          }}
        >
          Excluir Abastecimento
        </DialogTitle>
        <DialogContent>
          <Typography
            color={
              theme.palette.mode === "dark"
                ? theme.palette.common.white
                : theme.palette.text.primary
            }
          >
            Você tem certeza que deseja excluir este abastecimento?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleFecharModalExcluirAbastecimento}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarExclusaoAbastecimento}
            variant="contained"
            color="error"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {modalCadastroOcorrenciaAberto && (
        <CadastrarOcorrencia
          open={modalCadastroOcorrenciaAberto}
          onClose={handleFecharModalCadastroOcorrencia}
          corrida={idcorridaNumber}
          onSuccess={async () => {
            await carregarDados();
          }}
          onError={(erro) => {
            console.error("Erro ao salvar ocorrência:", erro);
          }}
          chaveEmprestada={false}
        />
      )}

      {modalEditarOcorrenciaAberto && (
        <ModalEditarOcorrencia
          open={modalEditarOcorrenciaAberto}
          ocorrencia={ocorrenciaSelecionada}
          onClose={handleFecharModalEditarOcorrencia}
          onSuccess={async (msg) => {
            await carregarDados();
          }}
          onError={(err) => {
            console.error(err);
          }}
        />
      )}

      {modalCadastroAbertoAbastecimento && (
        <AbastecimentoModal
          open={modalCadastroAbertoAbastecimento}
          corrida={corrida}
          onClose={handleFecharModalCadastroAbastecimento}
          onSuccess={async () => {
            await carregarDados();
          }}
        />
      )}

      {modalEditarAbastecimentoAberto && (
        <EdicaoAbastecimentoModal
          open={modalEditarAbastecimentoAberto}
          abastecimento={abastecimentoSelecionado}
          corrida={corrida}
          onClose={handleFecharModalEditarAbastecimento}
          onSuccess={async () => {
            await carregarDados();
          }}
          onError={(err) => {
            console.error(err);
          }}
        />
      )}

      {modalCadastrarPercursoAberto && (
        <CadastrarPercursosModal
          open={modalCadastrarPercursoAberto}
          onClose={handleFecharModalCadastroPercurso}
          onSuccess={async (msg) => {
            console.log(msg);
            await carregarDados();
          }}
          onError={(err) => {
            console.error(err);
          }}
          corrida={idcorridaNumber}
        />
      )}

      {modalEditarPercursoAberto && (
        <EdicaoPercursosModal
          open={modalEditarPercursoAberto}
          percurso={percursoSelecionado}
          onClose={handleFecharModalEditarPercurso}
          onSuccess={async (msg) => {
            console.log(msg);
            await carregarDados();
          }}
          onError={(err) => {
            console.error(err);
          }}
        />
      )}
    </AppLayout>
  );
};

export default DetalhesRequisicao;
