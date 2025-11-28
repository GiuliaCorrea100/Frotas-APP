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
} from "@mui/material";

import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";

import { CorridaFrontend, getCorridaById } from "../../../services/CorridaService";
import { OcorrenciaDto, OcorrenciaService } from "../../../services/OcorrenciaService";
import { buscarPercursosDaCorrida, PercursoDto, removerPercurso } from "../../../services/PercursoService";


import { Add } from "@mui/icons-material";
import { Abastecimento } from "../../../services/AbastecimentoService";
import AbastecimentoService from "../../../services/AbastecimentoService";
import Menu from "../../../components/Menu";
import ModalEditarOcorrencia from "./modais/ModalEdicaoOcorrencia";
import CadastrarOcorrencia from "./modais/ModalCadastroOcorrencia";
import AbastecimentoModal from "./modais/ModalCadastroAbastecimento";
import EdicaoAbastecimentoModal from "./modais/ModalEdicaoAbastecimento";
import EdicaoPercursosModal from "./modais/ModalEdicaoPercurso";
import CadastrarPercursosModal from "./modais/ModalCadastroPercurso";

const DetalhesRequisicao: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [corrida, setCorrida] = useState<CorridaFrontend | null>(null);
  const [loading, setLoading] = useState(true);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDto[]>([]);
  const [abastecimentos, setAbastecimento] = useState<Abastecimento[]>([]);
  const [percursos, setPercursos] = useState<PercursoDto[]>([]);

  const [modalEditarOcorrenciaAberto, setModalEditarOcorrenciaAberto] = useState(false);
  const [modalCadastroOcorrenciaAberto, setModalCadastroOcorrenciaAberto] = useState(false);
  const [modalCadastroAbertoAbastecimento, setModalCadastroAbertoAbastecimento] = useState(false);
  const [modalEditarAbastecimentoAberto, setModalEditarAbastecimento] = useState(false);
  const [modalCadastrarPercursoAberto, setModalCadastrarPercusoAberto] = useState(false);
  const [modalEditarPercursoAberto, setModalEditarPercursoAberto] = useState(false);
  const [modalExcluirPercursoAberto, setModalExcluirPercursoAberto] = useState(false);
  const [modalExcluirOcorrenciaAberto, setModalExcluirOcorrenciaAberto] = useState(false);
  const [modalExcluirAbastecimentoAberto, setModalExcluirAbastecimentoAberto] = useState(false);

  const [abastecimentoSelecionado, setAbastecimentoSelecionado] = useState<Abastecimento | null>(null);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<OcorrenciaDto | null>(null);
  const [percursoSelecionado, setPercursoSelecionado] = useState<PercursoDto | null>(null);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      if (id) {
        const [corridaData, ocorrenciasData, abastecimentosData, percursosData] = await Promise.all([
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

  // Função para formatar valores como moeda
  const formatCurrency = (value: number) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para formatar datas
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columnsOcorrencias: GridColDef<OcorrenciaDto>[] = [
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 1,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const ocorrencia = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalEditarOcorrencia(ocorrencia)}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleAbrirModalExcluirOcorrencia(ocorrencia)}
            >
              Excluir
            </Button>
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
        <Typography>{params.value}</Typography>
      ),
    },
    {
      field: "quantidade",
      headerName: "Quantidade de Litros",
      flex: 1,
      renderCell: (params) => {
        const value = Number(params.value);
        return isNaN(value) ? "-" : value.toFixed(2);
      }
    },
    {
      field: "valorUnitario",
      headerName: "Valor do Litro",
      flex: 1,
      renderCell: (params) => (
        <Typography>{formatCurrency(params.value)}</Typography>
      ),
    },
    {
      field: "valorTotal",
      headerName: "Preço Final",
      flex: 1,
      renderCell: (params) => (
        <Typography>{formatCurrency(params.value)}</Typography>
      ),
    },
    {
      field: "dataAbastecimento",
      headerName: "Data Abastecimento",
      flex: 1,
      renderCell: (params) => (
        <Typography>{formatDateTime(params.value)}</Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const abastecimento = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalEditarAbastecimento(abastecimento)}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleAbrirModalExcluirAbastecimento(abastecimento)}
            >
              Excluir
            </Button>
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
        <Typography>{params.value}</Typography>
      ),
    },
    {
      field: "saidaHora",
      headerName: "Hora de saída",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography>{formatDateTime(params.value)}</Typography>
      ),
    },
    {
      field: "saidaOdometro",
      headerName: "Odômetro saída",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography>{params.value}</Typography>
      ),
    },
    {
      field: "localDestino",
      headerName: "Local destino",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography>{params.value}</Typography>
      ),
    },
    {
      field: "chegadaHora",
      headerName: "Hora da chegada",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography>{formatDateTime(params.value)}</Typography>
      ),
    },
    {
      field: "chegadaOdometro",
      headerName: "Odômetro chegada",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography>{params.value}</Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const percurso = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalEditarPercuso(percurso)}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleAbrirModalExcluirPercurso(percurso)}
            >
              Excluir
            </Button>
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

  const handleAbrirModalEditarAbastecimento = (abastecimento: Abastecimento) => {
    setAbastecimentoSelecionado(abastecimento);
    setModalEditarAbastecimento(true);
  }
  const handleFecharModalEditarAbastecimento = () => {
    setModalEditarAbastecimento(false);
  }

  const handleAbrirModalCadastroPercurso = () => {
    setModalCadastrarPercusoAberto(true);
  }
  const handleFecharModalCadastroPercurso = () => {
    setModalCadastrarPercusoAberto(false);
  }

  const handleAbrirModalEditarPercuso = (percurso: PercursoDto) => {
    setPercursoSelecionado(percurso);
    setModalEditarPercursoAberto(true);
  }
  const handleFecharModalEditarPercurso = () => {
    setModalEditarPercursoAberto(false);
  }

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
      await OcorrenciaService.excluirOcorrencia(ocorrenciaSelecionada.idOcorrencia!);
      await carregarDados();
      handleFecharModalExcluirOcorrencia();
    } catch (error) {
      console.error("Erro ao excluir ocorrência:", error);
    }
  };

  // Funções para exclusão de abastecimento
  const handleAbrirModalExcluirAbastecimento = (abastecimento: Abastecimento) => {
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
      await AbastecimentoService.excluirAbastecimento(abastecimentoSelecionado.idAbastecimento!);
      await carregarDados();
      handleFecharModalExcluirAbastecimento();
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: theme.palette.background.default,
    }}>
      <Menu />

      <Box sx={{
        flex: 1,
        p: 2,
        overflow: 'auto', 
      }}>
        {/* Card de Informações Básicas */}
        <Card
          sx={{
            marginBottom: 2,
            boxShadow: theme.shadows[1],
            border: "1px solid",
            borderColor: "divider",
            background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
          }}
        >
          <CardHeader
            title="Informações Básicas"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
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
                  <Typography variant="body1">{corrida.nomeMotorista}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Carro:
                  </Typography>
                  <Typography variant="body1">{corrida.placaVeiculo}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data do início:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(corrida.dataInicio).toLocaleString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data do término:
                  </Typography>
                  <Typography variant="body1">
                    {corrida.dataTermino
                      ? new Date(corrida.dataTermino).toLocaleString()
                      : "Em andamento"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Typography variant="body1">{corrida.situacao}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status da chave:
                  </Typography>
                  <Typography variant="body1">
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
            background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
          }}
        >
          <CardHeader
            title="Ocorrências cadastradas na corrida"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
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
              Nova Ocorrencia
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
                    '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${theme.palette.divider}` },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      marginBottom: 0,
                      alignSelf: 'center',
                    },
                    '& .MuiTablePagination-toolbar': {
                      minHeight: '52px',
                      alignItems: 'center',
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
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
            background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
          }}
        >
          <CardHeader
            title="Abastecimentos cadastrados na corrida"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
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
                    '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${theme.palette.divider}` },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      marginBottom: 0,
                      alignSelf: 'center',
                    },
                    '& .MuiTablePagination-toolbar': {
                      minHeight: '52px',
                      alignItems: 'center',
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
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
            background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
          }}
        >
          <CardHeader
            title="Percursos cadastrados na corrida"
            sx={{
              pb: 0,
              "& .MuiCardHeader-title": {
                fontSize: "1.25rem",
                fontWeight: 600,
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
                    '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${theme.palette.divider}` },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      marginBottom: 0,
                      alignSelf: 'center',
                    },
                    '& .MuiTablePagination-toolbar': {
                      minHeight: '52px',
                      alignItems: 'center',
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
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

      
      <Dialog
          open={modalExcluirPercursoAberto}
          onClose={handleFecharModalExcluirPercurso}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Excluir Percurso</DialogTitle>
          <DialogContent>
            <Typography>
              Você tem certeza que deseja excluir este percurso?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleFecharModalExcluirPercurso} 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarExclusaoPercurso}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2 }}
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
          PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Excluir Ocorrência</DialogTitle>
          <DialogContent>
            <Typography>
              Você tem certeza que deseja excluir esta ocorrência?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleFecharModalExcluirOcorrencia} 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarExclusaoOcorrencia}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Confirmar Exclusão
            </Button>
          </DialogActions>
        </Dialog>

      {/* Modal de Exclusão de Abastecimento */}
      <Dialog
          open={modalExcluirAbastecimentoAberto}
          onClose={handleFecharModalExcluirAbastecimento}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Excluir Abastecimento</DialogTitle>
          <DialogContent>
            <Typography>
              Você tem certeza que deseja excluir este abastecimento?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleFecharModalExcluirAbastecimento} 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarExclusaoAbastecimento}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Confirmar Exclusão
            </Button>
          </DialogActions>
        </Dialog>

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

      <CadastrarOcorrencia
        open={modalCadastroOcorrenciaAberto}
        onClose={handleFecharModalCadastroOcorrencia}
        corrida={idcorridaNumber}
        onSuccess={async () => {
          console.log("Ocorrência salva com sucesso!");
          await carregarDados();
        } }
        onError={(erro) => {
          console.error("Erro ao salvar ocorrência:", erro);
        } } chaveEmprestada={false}      />

      <AbastecimentoModal
        open={modalCadastroAbertoAbastecimento}
        onClose={handleFecharModalCadastroAbastecimento}
        corridaId={idcorridaNumber}
        onSuccess={async () => {
          await carregarDados();
        }}
      />

      <EdicaoAbastecimentoModal 
        open={modalEditarAbastecimentoAberto} 
        abastecimento={abastecimentoSelecionado} 
        onClose={handleFecharModalEditarAbastecimento}
        onSuccess={async (msg) => {
          console.log(msg);
          await carregarDados();
        }}
        onError={(err) => {
          console.error(err);
        }}
      />

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
    </Box>
  );
};

export default DetalhesRequisicao;