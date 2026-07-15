import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  useTheme,
  Card,
  CardContent,
  Box,
  Stack,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  Tooltip,
  Alert,
  Grid,
  Chip,
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

import { Add, PersonAdd, PersonOutlineOutlined } from "@mui/icons-material";
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
import ExportarCorridaPDF from "./ExportarRelatorioDetalhes";
import { CorridaVistoriaFrontend, CorridaVistoriaService } from "../../../services/CorridaVistoriaService";
import { ModalFotosVistoria } from "./modais/ModalFotosVistoria";
import ModalCadastroMotoristaAdicional from "./modais/ModalCadastroMotoristaAdicional";

const DetalhesRequisicao: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [corrida, setCorrida] = useState<CorridaFrontend>(null);
  const [loading, setLoading] = useState(true);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDto[]>([]);
  const [abastecimentos, setAbastecimento] = useState<Abastecimento[]>([]);
  const [percursos, setPercursos] = useState<PercursoDto[]>([]);

  const [motoristasSelecionados, setMotoristasSelecionados] = useState<any[]>([]);
  const [idMotoristaPrincipal, setIdMotoristaPrincipal] = useState<number | null>(null);
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState<any[]>([]);

  // const [vistoriaAdministrador, setVistoriaAdministrador] = useState<CorridaVistoriaFrontend>(null);
  // const [vistoriaMotorista, setVistoriaMotorista] = useState<CorridaVistoriaFrontend>(null);
  const [vistorias, setVistorias] = useState<CorridaVistoriaFrontend[]>([]);

  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const [modalEditarOcorrenciaAberto, setModalEditarOcorrenciaAberto] = useState(false);
  const [modalCadastroOcorrenciaAberto, setModalCadastroOcorrenciaAberto] = useState(false);
  const [modalCadastroAbertoAbastecimento, setModalCadastroAbertoAbastecimento] = useState(false);
  const [modalEditarAbastecimentoAberto, setModalEditarAbastecimento] = useState(false);
  const [modalCadastrarPercursoAberto, setModalCadastrarPercusoAberto] = useState(false);
  const [modalEditarPercursoAberto, setModalEditarPercursoAberto] = useState(false);
  const [modalExcluirPercursoAberto, setModalExcluirPercursoAberto] = useState(false);
  const [modalExcluirOcorrenciaAberto, setModalExcluirOcorrenciaAberto] = useState(false);
  const [modalExcluirAbastecimentoAberto, setModalExcluirAbastecimentoAberto] = useState(false);
  const [modalAdicionarMotoristaAberto, setModalAdicionarMotoristaAberto] = useState(false);
  const [modalCarrosselAberto, setModalCarrosselAberto] = useState(false);
  const [vistoriaSelecionadaParaFotos, setVistoriaSelecionadaParaFotos] = useState<{
    id: Number;
    tipo: "RETIRADA" | "DEVOLUCAO";
  } | null>(null);
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
        const [
          corridaData,
          ocorrenciasData,
          abastecimentosData,
          percursosData,
          vistoriasData,
        ] = await Promise.all([
          getCorridaById(Number(id)),
          OcorrenciaService.buscarPorCorrida(Number(id)),
          AbastecimentoService.buscarPorCorrida(Number(id)),
          buscarPercursosDaCorrida(Number(id)),
          CorridaVistoriaService.buscarVistoria(Number(id)),
        ]);

        setCorrida(corridaData);

        if (corridaData.motoristas && corridaData.motoristas.length > 0) {
          const principal = corridaData.motoristas.find(
            (m) => m.idMotorista === corridaData.idMotoristaPrincipal,
          );
          const outros = corridaData.motoristas.filter(
            (m) => m.idMotorista !== corridaData.idMotoristaPrincipal,
          );
          const motoristasIniciais = [
            ...(principal
              ? [{ idUsuario: principal.idMotorista, nome: principal.nome }]
              : []),
            ...outros.map((m) => ({
              idUsuario: m.idMotorista,
              nome: m.nome,
            })),
          ];
          setMotoristasSelecionados(motoristasIniciais);
          setIdMotoristaPrincipal(corridaData.idMotoristaPrincipal);
        }

        if (Array.isArray(ocorrenciasData)) {
          setOcorrencias(ocorrenciasData);
        } else if (ocorrenciasData) {
          setOcorrencias([ocorrenciasData]);
        }

        if (Array.isArray(abastecimentosData)) {
          console.log(abastecimentosData);
          setAbastecimento(abastecimentosData);
        } else if (abastecimentosData) {
          setAbastecimento([abastecimentosData]);
        }

        if (Array.isArray(percursosData)) {
          setPercursos(percursosData);
        } else if (percursosData) {
          setPercursos([percursosData]);
        }

        if (Array.isArray(vistoriasData)){
          setVistorias(vistoriasData);
        } else if (vistoriasData){
          setVistorias([vistoriasData]);
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
      field: "nomeMotorista",
      headerName: "Motorista Responsável",
      width: 400,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "descricao",
      headerName: "Descrição",
      width: 300,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "dataOcorrencia",
      headerName: "Data",
      width: 200,
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
      field: "nomeMotorista",
      headerName: "Motorista Responsável",
      width: 400,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "nomeTipoCombustivel",
      headerName: "Combustível",
      width: 200,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
    {
      field: "quantidade",
      headerName: "Quantidade de Litros",
      width: 100,
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
      field: "nomeMotorista",
      headerName: "Motorista Responsável",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.primary">{params.value}</Typography>
      ),
    },
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
      setMensagemSucesso("Percuso removido com sucesso!");
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

  const handleAbrirModalAdicionarMotorista = ( corrida: CorridaFrontend) => {
    setCorrida(corrida);
    setModalAdicionarMotoristaAberto(true);
  }

  const handleFecharModalAdicionarMotorista = () => {
    setModalAdicionarMotoristaAberto(false);
  }

  const handleConfirmarExclusaoOcorrencia = async () => {
    if (!ocorrenciaSelecionada) return;

    try {
      await OcorrenciaService.excluirOcorrencia(
        ocorrenciaSelecionada.idOcorrencia!,
      );
      await carregarDados();
      handleFecharModalExcluirOcorrencia();
      setMensagemSucesso("Ocorrência removida com sucesso!");
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
      setMensagemSucesso("Abastecimento removido com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error);
    }
  };

  //funções do carrossel
  const handleAbrirCarrossel = (idCorridaVistoria: number, tipo: "RETIRADA" | "DEVOLUCAO") => {
    setVistoriaSelecionadaParaFotos({ id: idCorridaVistoria, tipo});
    setModalCarrosselAberto(true);
  }

  const handleFecharCarrossel = () => {
    setModalCarrosselAberto(false);
    setVistoriaSelecionadaParaFotos(null);
  }

  const formatarStatusVistoria = (veiculoRecebidoSemAvarias: boolean): string => {
    return veiculoRecebidoSemAvarias ? "Sem avarias" : "Com avarias";
  };

  const getVistoriaDevolucao = (): CorridaVistoriaFrontend | null => {
    const vistoriaDevolucao = vistorias.find(v => v.tipo === "DEVOLUCAO");
    return vistoriaDevolucao || null;
  };

  const getVistoriaRetirada = (): CorridaVistoriaFrontend | null => {
    const vistoriaRetirada = vistorias.find(v => v.tipo === "RETIRADA");
    return vistoriaRetirada || null;
  }



  return (
    <AppLayout>
      {mensagemSucesso && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            fontSize: "1.1rem",
            border: "1px solid",
            borderColor: "success.main",
            borderRadius: 1.5,
          }}
          onClose={() => setMensagemSucesso("")}
        >
          {mensagemSucesso}
        </Alert>
      )}
      
      <Box mt={1.5}>
        {/* Card de Informações Básicas */}
        <Card
          sx={{
            marginBottom: 3,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                : "0px 8px 24px rgba(0, 0, 0, 0.08)",
            border:
              theme.palette.mode === "dark"
                ? "1px solid transparent"
                : "1px solid #E7E9EE",
            bgcolor:
              theme.palette.mode === "light"
                ? "#FFF"
                : theme.palette.background.paper,
          }}
        >
          <Box ml={1.5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mr: 3,
                pt: 2,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.primary"
                ml={1.5}
              >
                Informações Básicas
              </Typography>
              
              
              <ExportarCorridaPDF
                corrida={corrida}
                ocorrencias={ocorrencias}
                abastecimentos={abastecimentos}
                percursos={percursos}
                vistorias={vistorias}
                disabled={loading || !corrida}
              />
            </Box>
            
            <CardContent>
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Carregando informações da corrida...
                </Typography>
              ) : corrida ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Motoristas da corrida:
                      </Typography>
                      <Tooltip title="Editar motoristas">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleAbrirModalAdicionarMotorista(corrida)}
                          sx={{
                            // minWidth: 24,
                            // width: 24,
                            height: 24,
                            padding: 1,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ml: 1,
                          }}
                        >
                          <PersonAdd sx={{ fontSize: 16, mr: 1 }} />
                          Editar Motoristas
                        </Button>
                      </Tooltip>
                    </Box>
                    <Stack spacing={0.5} mt={0.5}>
                      {motoristasSelecionados.map((motorista, index) => (
                        <Box 
                          key={motorista.idUsuario}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Typography variant="body2" color="text.primary">
                            {motorista.nome}
                          </Typography>
                          {motorista.idUsuario === idMotoristaPrincipal && (
                            <Typography variant="body1" color="red">
                              (Principal)
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Veículo (placa):
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
                      {corrida.chaveEmprestada
                        ? "Emprestada"
                        : "Não Emprestada"}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body1" color="error">
                  Corrida não encontrada.
                </Typography>
              )}
            </CardContent>
          </Box>
        </Card>

        {/* Card de Ocorrências */}
        <Card
          sx={{
            marginBottom: 3,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                : "0px 8px 24px rgba(0, 0, 0, 0.08)",
            border:
              theme.palette.mode === "dark"
                ? "1px solid transparent"
                : "1px solid #E7E9EE",
            bgcolor:
              theme.palette.mode === "light"
                ? "#FFF"
                : theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              ml: 3,
              mr: 3,
              height: 56,
              pt: 2,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              pt={1}
            >
              Ocorrências
            </Typography>
            <Button
              variant="contained"
              onClick={handleAbrirModalCadastroOcorrencia}
              startIcon={<Add />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
              }}
            >
              Nova Ocorrência
            </Button>
          </Box>
          <Box m={1}>
            <CardContent>
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Carregando ocorrências...
                </Typography>
              ) : ocorrencias.length > 0 ? (
                <DataGrid
                  rows={ocorrencias}
                  columns={columnsOcorrencias}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      "& .MuiDataGrid-columnHeader:first-child": {
                        pl: 4,
                      },
                      "& .MuiDataGrid-columnHeader:last-child": {
                        pr: 4,
                      },
                    },
                    "& .MuiDataGrid-row": {
                      "& .MuiDataGrid-cell:first-child": {
                        pl: 4,
                      },
                      "& .MuiDataGrid-cell:last-child": {
                        pr: 4,
                      },
                    },
                  }}
                  autoHeight
                  rowSelection={false}
                  rowHeight={50}
                  columnHeaderHeight={60}
                  pageSizeOptions={[5, 10, 25]}
                  localeText={
                    ptBR.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableRowSelectionOnClick
                  getRowId={(row) => row.idOcorrencia}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma ocorrência cadastrada para esta corrida.
                </Typography>
              )}
            </CardContent>
          </Box>
        </Card>

        {/* Card de Abastecimento */}
        <Card
          sx={{
            marginBottom: 3,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                : "0px 8px 24px rgba(0, 0, 0, 0.08)",
            border:
              theme.palette.mode === "dark"
                ? "1px solid transparent"
                : "1px solid #E7E9EE",
            bgcolor:
              theme.palette.mode === "light"
                ? "#FFF"
                : theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              ml: 3,
              mr: 3,
              height: 56,
              pt: 2,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              pt={1}
            >
              Abastecimentos
            </Typography>
            <Button
              variant="contained"
              onClick={handleAbrirModalCadastroAbastecimento}
              startIcon={<Add />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
              }}
            >
              Novo Abastecimento
            </Button>
          </Box>
          <Box m={1}>
            <CardContent>
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
                      "& .MuiDataGrid-columnHeaders": {
                        "& .MuiDataGrid-columnHeader:first-child": {
                          pl: 4,
                        },
                        "& .MuiDataGrid-columnHeader:last-child": {
                          pr: 4,
                        },
                      },
                      "& .MuiDataGrid-row": {
                        "& .MuiDataGrid-cell:first-child": {
                          pl: 4,
                        },
                        "& .MuiDataGrid-cell:last-child": {
                          pr: 4,
                        },
                      },
                    }}
                    autoHeight
                    rowSelection={false}
                    rowHeight={50}
                    columnHeaderHeight={60}
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
          </Box>
        </Card>

        {/* Card de Percursos */}
        <Card
          sx={{
            marginBottom: 3,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                : "0px 8px 24px rgba(0, 0, 0, 0.08)",
            border:
              theme.palette.mode === "dark"
                ? "1px solid transparent"
                : "1px solid #E7E9EE",
            bgcolor:
              theme.palette.mode === "light"
                ? "#FFF"
                : theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              ml: 3,
              mr: 3,
              height: 56,
              pt: 2,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              pt={1}
            >
              Percursos
            </Typography>
            <Button
              variant="contained"
              onClick={handleAbrirModalCadastroPercurso}
              startIcon={<Add />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
              }}
            >
              Novo Percurso
            </Button>
          </Box>
          <Box m={1}>
            <CardContent>
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
                      "& .MuiDataGrid-columnHeaders": {
                        "& .MuiDataGrid-columnHeader:first-child": {
                          pl: 4,
                        },
                        "& .MuiDataGrid-columnHeader:last-child": {
                          pr: 4,
                        },
                      },
                      "& .MuiDataGrid-row": {
                        "& .MuiDataGrid-cell:first-child": {
                          pl: 4,
                        },
                        "& .MuiDataGrid-cell:last-child": {
                          pr: 4,
                        },
                      },
                    }}
                    autoHeight
                    rowSelection={false}
                    rowHeight={50}
                    columnHeaderHeight={60}
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
          </Box>
        </Card>

        {/* Cards de Vistorias */}
        <Grid container spacing={3} sx={{ marginBottom: 3 }}>
          {/* Card de Vistoria Motorista - Tipo RETIRADA */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                    : "0px 8px 24px rgba(0, 0, 0, 0.08)",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid transparent"
                    : "1px solid #E7E9EE",
                bgcolor:
                  theme.palette.mode === "light"
                    ? "#FFF"
                    : theme.palette.background.paper,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  ml: 3,
                  mr: 3,
                  height: 56,
                  pt: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="text.primary"
                  pt={1}
                >
                  Vistoria Motorista
                </Typography>
              </Box>
              <Box m={1}>
                <CardContent>
                  {loading ? (
                    <Typography variant="body2" color="text.secondary">
                      Carregando vistoria do motorista...
                    </Typography>
                  ) : (() => {
                    const vistoriaRetirada = getVistoriaRetirada();
                    
                    if (!vistoriaRetirada) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma vistoria de retirada cadastrada para esta corrida.
                        </Typography>
                      );
                    }
                    
                    const temAvarias = !vistoriaRetirada.veiculoRecebidoSemAvarias;
                    
                    return (
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Registrado por:
                          </Typography>
                          <Typography variant="body1" color="text.primary">
                            {vistoriaRetirada.usuarioRegistrou?.nome || 'Usuário não identificado'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.primary">
                            Situação:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            color={vistoriaRetirada.veiculoRecebidoSemAvarias ? "text.primary" : "error"}
                            fontWeight="medium"
                          >
                            {formatarStatusVistoria(vistoriaRetirada.veiculoRecebidoSemAvarias)}
                            
                          </Typography>
                        </Box>

                        {temAvarias && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Observações:
                            </Typography>
                            <Typography variant="body1" color="text.primary">
                              {vistoriaRetirada.observacoes || 'Nenhuma observação registrada'}
                            </Typography>
                          </Box>
                        )}

                        {temAvarias && (
                          <Button
                            variant="contained"
                            onClick={() => handleAbrirCarrossel(vistoriaRetirada.idCorridaVistoria!, vistoriaRetirada.tipo)}
                            
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              boxShadow: theme.shadows[2],
                              mt: 1
                            }}
                          >
                            Visualizar fotos
                          </Button>
                        )}
                      </Stack>
                    );
                  })()}
                </CardContent>
              </Box>
            </Card>
          </Grid>

          {/* Card de Vistoria Administrador - Tipo DEVOLUCAO */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                    : "0px 8px 24px rgba(0, 0, 0, 0.08)",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid transparent"
                    : "1px solid #E7E9EE",
                bgcolor:
                  theme.palette.mode === "light"
                    ? "#FFF"
                    : theme.palette.background.paper,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  ml: 3,
                  mr: 3,
                  height: 56,
                  pt: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="text.primary"
                  pt={1}
                >
                  Vistoria Administrador
                </Typography>
              </Box>
              <Box m={1}>
                <CardContent>
                  {loading ? (
                    <Typography variant="body2" color="text.secondary">
                      Carregando vistoria do administrador...
                    </Typography>
                  ) : (() => {
                    const vistoriaDevolucao = getVistoriaDevolucao();
                    
                    if (!vistoriaDevolucao) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma vistoria de devolução cadastrada para esta corrida.
                        </Typography>
                      );
                    }
                    
                    const temAvarias = !vistoriaDevolucao.veiculoRecebidoSemAvarias;
                    
                    return (
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Registrado por:
                          </Typography>
                          <Typography variant="body1" color="text.primary">
                            {vistoriaDevolucao.usuarioRegistrou?.nome || 'Usuário não identificado'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.primary">
                            Situação:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            color={vistoriaDevolucao.veiculoRecebidoSemAvarias ? "text.primary" : "error"}
                            fontWeight="medium"
                          >
                            {formatarStatusVistoria(vistoriaDevolucao.veiculoRecebidoSemAvarias)}
                          </Typography>
                        </Box>

                        {temAvarias && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Observações:
                            </Typography>
                            <Typography variant="body1" color="text.primary">
                              {vistoriaDevolucao.observacoes || 'Nenhuma observação registrada'}
                            </Typography>
                          </Box>
                        )}

                        {temAvarias && (
                          <Button
                            variant="contained"
                             onClick={() => handleAbrirCarrossel(vistoriaDevolucao.idCorridaVistoria!, vistoriaDevolucao.tipo)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              boxShadow: theme.shadows[2],
                              mt: 1
                            }}
                          >
                            Visualizar fotos
                          </Button>
                        )}
                      </Stack>
                    );
                  })()}
                </CardContent>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
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
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "600" }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            Excluir Percurso
          </Typography>
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
            Confirmar
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
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "600" }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            Excluir Ocorrência
          </Typography>
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
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "600" }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            Excluir Abastecimento
          </Typography>
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
          corrida={corrida}
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarDados();
            } catch (error) {
              console.error(error);
            }
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
          corrida={corrida}
          onClose={handleFecharModalEditarOcorrencia}
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarDados();
            } catch (error) {
              console.error(error);
            }
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
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarDados();
            } catch (error) {
              console.error(error);
            }
          }}
        />
      )}

      {modalEditarAbastecimentoAberto && (
        <EdicaoAbastecimentoModal
          open={modalEditarAbastecimentoAberto}
          abastecimento={abastecimentoSelecionado}
          corrida={corrida}
          onClose={handleFecharModalEditarAbastecimento}
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarDados();
            } catch (error) {
              console.error(error);
            }
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
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarDados();
            } catch (error) {
              console.error(error);
            }
          }}
          onError={(err) => {
            console.error(err);
          }}
          corrida={corrida}
        />
      )}

      {modalEditarPercursoAberto && (
        <EdicaoPercursosModal
          open={modalEditarPercursoAberto}
          percurso={percursoSelecionado}
          corrida={corrida}
          onClose={handleFecharModalEditarPercurso}
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarDados();
            } catch (error) {
              console.error(error);
            }
          }}
          onError={(err) => {
            console.error(err);
          }}
        />
      )}

      {modalCarrosselAberto && (
        <ModalFotosVistoria
          open={modalCarrosselAberto}
          onClose={handleFecharCarrossel}
          modalLoading={loading}
          idCorridaVistoria={vistoriaSelecionadaParaFotos?.id as number || 0}
          tipoVistoria={vistoriaSelecionadaParaFotos?.tipo || "RETIRADA"}
        />
      )}

      {modalAdicionarMotoristaAberto && (
        <ModalCadastroMotoristaAdicional
          open={modalAdicionarMotoristaAberto} 
          onClose={handleFecharModalAdicionarMotorista} 
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarDados();
            } catch (error) {
              console.error(error);
            }
          }} 
         onError={(err) => {
            console.error(err);
          }}
          corrida={corrida}
          percursos={percursos}          
        />
      )}




    </AppLayout>
  );
};

export default DetalhesRequisicao;