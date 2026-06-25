import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tooltip,
  Chip,
  Alert,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import {
  CorridaFrontend,
  CorridaDto,
  getCorridas,
  CorridaService,
  atualizarSituacaoCorrida,
} from "../../../services/CorridaService";

import SalvarEdicaoCorrida from "./modais/ModalEdicaoCorrida";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CadastrarCorrida from "./modais/ModalCadastroCorrida";
import { CarroService } from "../../../services/CarroService";

import axiosConnect from "../../../services/axios/axiosConnect";
import AppLayout from "../../../components/Layout";
import BemVindo from "../../BemVindo";
import { formatDateOnly } from "../../../utils/formatDate";
import VistoriaDevolucaoModal from "./modais/ModalVistoriaDevolucao";

// Função para converter CorridaFrontend em CorridaDto
const mapToDto = (c: CorridaFrontend): CorridaDto => ({
  ...c,
  dataInicio: new Date(c.dataInicio),
  dataTermino: c.dataTermino ? new Date(c.dataTermino) : null,
});

export default function ListaCorrida() {
  const theme = useTheme();

  const [busca, setBusca] = useState("");
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCorrida, setSelectedCorrida] =
    useState<CorridaFrontend | null>(null);
  const [senhaLiberarChave, setSenhaLiberarChave] = useState("");
  const [corridaParaEditar, setCorridaParaEditar] =
    useState<CorridaFrontend | null>(null);

  const [showModalCadastrarCorrida, setShowModalCadastrarCorrida] =
    useState(false);
  const [showModalLiberarChave, setShowModalLiberarChave] = useState(false);
  const [showModalReceberChave, setShowModalReceberChave] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalCancelar, setShowModalCancelar] = useState(false);
  const [showVistoriaDevolucaoModal, setShowVistoriaDevolucaoModal] = useState(false); //point

  const [senhaError, setSenhaError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [filtroSituacao, setFiltroSituacao] = useState<string>("TODOS");
  const [authMode, setAuthMode] = useState<string>("SIGAA");

  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const navigate = useNavigate();

  // Estados para controle dos subfiltros
  const [mostrarSubFiltros, setMostrarSubFiltros] = useState(false);
  const [filtroAtivoInterno, setFiltroAtivoInterno] = useState<string | null>(null);

  // Buscar o modo de autenticação na inicialização
  useEffect(() => {
    const fetchAuthMode = async () => {
      try {
        const response = await axiosConnect.get("/auth/mode");
        setAuthMode(response.data.mode);
      } catch (error) {
        console.error("Erro ao buscar modo de autenticação:", error);
        setAuthMode("SIGAA");
      }
    };
    fetchAuthMode();
  }, []);

  useEffect(() => {
    carregarCorridas();
  }, []);

  const carregarCorridas = async () => {
    try {
      const dados = await getCorridas();
      setCorridas(dados);
    } catch (error) {
      console.error("Erro ao carregar corridas:", error);
    } finally {
      setLoading(false);
    }
  };

  const qtdAgendadas = corridas.filter((c) => c.situacao === "AGENDADA").length;
  const qtdConcluidas = corridas.filter((c) => c.situacao === "CONCLUIDA").length;
  const qtdEmAndamento = corridas.filter(
    (c) => c.situacao === "ANDAMENTO",
  ).length;
  const qtdFinalizadas = corridas.filter(
    (c) => c.situacao === "FINALIZADA",
  ).length;
  const qtdCanceladas = corridas.filter(
    (c) => c.situacao === "CANCELADA",
  ).length;

  const dadosFiltrados = corridas.filter((corrida) => {
    const matchesSearch = Object.values(corrida).some((valor) =>
      String(valor).toLowerCase().includes(busca.toLowerCase()),
    );

    const matchesSituacao = 
      filtroSituacao === "TODOS" || 
      filtroSituacao === "" || 
      (filtroSituacao === "ATIVAS" && (corrida.situacao === "AGENDADA" || corrida.situacao === "ANDAMENTO")) ||
      corrida.situacao === filtroSituacao;

    return matchesSearch && matchesSituacao;
  });

  const handleAbrirModalLiberarChave = (corrida: CorridaFrontend) => {
    setSelectedCorrida(corrida);
    setSenhaError(null);
    setSenhaLiberarChave("");
    setIsProcessing(false);
    setShowModalLiberarChave(true);
  };

  const handleAbrirModalReceberChave = (corrida: CorridaFrontend) => {
    setSelectedCorrida(corrida);
    setShowModalReceberChave(true);
  };

  const handleAbrirModalEditar = (corrida: CorridaFrontend) => {
    setCorridaParaEditar(corrida);
    setShowModalEditar(true);
  };

  const handleAbrirModalCancelarCorrida = (corrida: CorridaFrontend) => {
    setSelectedCorrida(corrida);
    setShowModalCancelar(true);
  };

  const handleLiberarChave = async () => {
    if (!selectedCorrida) return;

    setSenhaError(null);

    // Validar senha
    if (!senhaLiberarChave.trim()) {
      setSenhaError("Digite sua senha");
      return;
    }

    setIsProcessing(true);

    try {
      // No modo MOCK, validar com senha fixa
      if (authMode === "MOCK") {
        if (senhaLiberarChave !== "secret") {
          setSenhaError("Senha incorreta. No modo TESTE use a senha: secret");
          setIsProcessing(false);
          return;
        }

        // Simular a liberação da chave no modo MOCK
            await CorridaService.confirmarLiberarChaveMock(
                selectedCorrida.idCorrida,
                selectedCorrida.idMotoristaPrincipal,
        );
      } else {
        // Modo SIGAA normal
            await CorridaService.confirmarLiberarChave(
                selectedCorrida.idCorrida,
                selectedCorrida.idMotoristaPrincipal,
          senhaLiberarChave,
        );
      }

      await CarroService.atualizarSituacaoCarro(
        selectedCorrida.idCarro,
        "VIAGEM",
      );

      const dadosAtualizados = await getCorridas();
      setCorridas(dadosAtualizados);
      setShowModalLiberarChave(false);
      setSenhaLiberarChave("");
      setSenhaError(null);
      setMensagemSucesso("Chave liberada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao processar liberação da chave:", error);

      // Verificar se é erro de senha
      const errorMessage = error.response?.data?.message || error.message || "";
      const errorMessageLower = errorMessage.toLowerCase();

      if (
        error.response?.status === 401 ||
        errorMessageLower.includes("senha") ||
        errorMessageLower.includes("password") ||
        errorMessageLower.includes("credenciais") ||
        errorMessageLower.includes("autenticação") ||
        errorMessageLower.includes("incorreto") ||
        errorMessageLower.includes("inválido")
      ) {
        setSenhaError("Senha inválida. Verifique e tente novamente.");
      } else if (error.response?.status === 400) {
        setSenhaError("Requisição inválida. Verifique os dados.");
      } else if (error.response?.status === 403) {
        setSenhaError("Acesso não autorizado.");
      } else if (error.response?.status === 500) {
        setSenhaError("Erro interno do servidor. Tente novamente mais tarde.");
      } else {
        setSenhaError("Erro ao liberar chave. Tente novamente.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: GridColDef<CorridaFrontend>[] = [
    {
      field: "idCorrida",
      headerName: "Nº",
      flex: 0.2,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    {
      field: "nomeMotoristaPrincipal",
      headerName: "Motorista",
      flex: 0.8,
      renderCell: (params) => {
        const corrida = params.row;
        const principalNome = params.value || "Desconhecido";
        
        const outrosMotoristas = corrida.motoristas 
          ? corrida.motoristas.filter((motorista: any) => motorista.idMotorista !== corrida.idMotoristaPrincipal)
          : [];
          
        if (outrosMotoristas.length === 0) {
          return <Typography>{principalNome}</Typography>;
        }

        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>{principalNome}</Typography>
            <Tooltip 
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    Outros motoristas:
                  </Typography>
                  {outrosMotoristas.map((motorista) => (
                    <Box
                      key={motorista.idMotorista}
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                      mb={0.3}
                    >
                      <PersonOutlineIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {motorista.nome}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              }
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: theme.palette.mode === "light" ? "#f5f5f9" : theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[3],
                  },
                },
                arrow: {
                  sx: {
                    color: theme.palette.mode === "light" ? "#f5f5f9" : theme.palette.background.paper,
                    "&::before": {
                      border: `1px solid ${theme.palette.divider}`,
                    },
                  },
                },
              }}
            >
              <Chip 
                label={`+${outrosMotoristas.length}`} 
                size="small" 
                color="primary" 
                sx={{ 
                  height: 20, 
                  fontSize: "0.75rem", 
                  fontWeight: "bold",
                  cursor: "pointer" 
                }}
              />
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "placaVeiculo",
      headerName: "Veículo",
      width: 150,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    {
      field: "dataInicio",
      headerName: "Data Início",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDateOnly(params.value as string)}
        </Typography>
      ),
    },
    {
      field: "dataTermino",
      headerName: "Data Término",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDateOnly(params.value as string | null)}
        </Typography>
      ),
    },
    {
      field: "situacao",
      headerName: "Situação",
      width: 250,
      renderCell: (params) => {
        const situacao = params.value || "";
        let color;
        switch (situacao) {
          case "AGENDADA":
            color = "info";
            break;
          case "ANDAMENTO":
            color = "warning";
            break;
          case "FINALIZADA":
            color = "success";
            break;
          case "CONCLUIDA":
            color = "warning";
            break;
          default:
            color = "error";
        }
        return (
          <Chip
            label={situacao}
            color={color as any}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 450,
      minWidth: 450,
      maxWidth: 600,
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const corrida = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* EDITAR */}
            <Tooltip title="Editar corrida">
              <span>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleAbrirModalEditar(corrida)}
                  disabled={
                    (corrida.chaveEmprestada === true &&
                      (corrida.situacao === "FINALIZADA" ||
                        corrida.situacao === "ANDAMENTO" ||
                        corrida.situacao === "AGENDADA" ||
                        corrida.situacao === "CANCELADA"||
                        corrida.situacao === "CONCLUIDA")) ||
                    ((corrida.situacao === "FINALIZADA" ||
                      corrida.situacao === "CANCELADA") &&
                      corrida.chaveEmprestada === false)
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
              </span>
            </Tooltip>

            {/* DETALHES */}
            <Tooltip title="Ver detalhes">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() =>
                    navigate(`/DetalhesCorrida/${corrida.idCorrida}`)
                  }
                  disabled={corrida.situacao === "CANCELADA"}
                  startIcon={<VisibilityIcon />}
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
              </span>
            </Tooltip>

            {/* CANCELAR */}
            <Tooltip title="Cancelar corrida">
              <span>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleAbrirModalCancelarCorrida(corrida)}
                  disabled={
                    (corrida.chaveEmprestada === true &&
                      (corrida.situacao === "FINALIZADA" ||
                        corrida.situacao === "ANDAMENTO" ||
                        corrida.situacao === "AGENDADA" ||
                        corrida.situacao === "CANCELADA" ||
                        corrida.situacao === "CONCLUIDA")) ||
                    ((corrida.situacao === "FINALIZADA" ||
                      corrida.situacao === "CANCELADA") &&
                      corrida.chaveEmprestada === false)
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
              </span>
            </Tooltip>

            {/* LIBERAR CHAVE */}
            <Tooltip title="Liberar chave ao motorista">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleAbrirModalLiberarChave(corrida)}
                  disabled={
                    (corrida.chaveEmprestada === true &&
                      (corrida.situacao === "FINALIZADA" ||
                        corrida.situacao === "ANDAMENTO" ||
                        corrida.situacao === "AGENDADA" ||
                        corrida.situacao === "CANCELADA" ||
                        corrida.situacao === "CONCLUIDA")) ||
                    ((corrida.situacao === "FINALIZADA" ||
                      corrida.situacao === "CANCELADA") &&
                      corrida.chaveEmprestada === false)
                  }
                  sx={{
                    minHeight: 42,
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Liberar Chave
                </Button>
              </span>
            </Tooltip>

            {/* RECEBER CHAVE */}
            <Tooltip title="Receber chave do motorista">
              <span>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => handleAbrirModalReceberChave(corrida)}
                  disabled={
                    (corrida.chaveEmprestada === false &&
                      (corrida.situacao === "AGENDADA" ||
                        corrida.situacao === "ANDAMENTO" ||
                        corrida.situacao === "FINALIZADA" ||
                        corrida.situacao === "CANCELADA"  ||
                        corrida.situacao === "CONCLUIDA")) ||
                    (corrida.chaveEmprestada === true &&
                      (corrida.situacao === "CANCELADA" || corrida.situacao === "AGENDADA" || corrida.situacao === "ANDAMENTO"))
                  }
                  sx={{
                    minHeight: 42,
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Receber Chave
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <AppLayout>
      <BemVindo />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
        mx={3.5}
        height={56}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="text.primary"
          display="flex"
          pb={0}
        >
          Listagem de Corridas
        </Typography>
        <Button
          onClick={() => setShowModalCadastrarCorrida(true)}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            boxShadow: theme.shadows[2],
            mb: 1,
            mt: 1,
          }}
        >
          + Nova Corrida
        </Button>
      </Box>
        
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
        >
          {mensagemSucesso}
        </Alert>
      )}

      {/* Filtros por situação + campo de busca + datagrid */}
      <Box
        sx={{
          bgcolor:
            theme.palette.mode === "light"
              ? "#FFF"
              : theme.palette.background.paper,
          borderRadius: 2,
          py: 2,
          mb: 0,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
              : "0px 8px 24px rgba(0, 0, 0, 0.08)",
          border:
            theme.palette.mode === "dark"
              ? "1px solid transparent"
              : "1px solid #E7E9EE",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1,
            mb: 3,
            ml: 3,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "ATIVAS",
              value: "ATIVAS",
              count: qtdAgendadas + qtdEmAndamento,
              color: theme.palette.info.main,
              temSubmenu: true,
            },
            {
              label: "CONCLUIDAS",
              value: "CONCLUIDA",
              count: qtdConcluidas,
              color: theme.palette.warning.main,
            },
            {
              label: "FINALIZADAS",
              value: "FINALIZADA",
              count: qtdFinalizadas,
              color: theme.palette.success.main,
            },
            {
              label: "CANCELADAS",
              value: "CANCELADA",
              count: qtdCanceladas,
              color: theme.palette.success.main,
            },
            {
              label: "TODAS",
              value: "TODOS",
              count: corridas.length,
              color: theme.palette.primary.dark,
            },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={
                (tab.temSubmenu && mostrarSubFiltros) || 
                (!tab.temSubmenu && filtroSituacao === tab.value) 
                  ? "contained"
                  : "outlined"
              }
              onClick={() => {
                if (tab.temSubmenu) {
                  setMostrarSubFiltros(!mostrarSubFiltros);
                  
                  if (!mostrarSubFiltros) {
                    setFiltroSituacao("");
                    setFiltroAtivoInterno(null);
                  } else {
                    setFiltroAtivoInterno(null);
                    setFiltroSituacao("");
                  }
                } else {
                  setFiltroSituacao(tab.value);
                  setMostrarSubFiltros(false);
                  setFiltroAtivoInterno(null);
                }
              }}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                fontWeight:
                  (tab.temSubmenu && mostrarSubFiltros) ||
                  (!tab.temSubmenu && filtroSituacao === tab.value)
                    ? 600
                    : 500,
                color:
                  (tab.temSubmenu && mostrarSubFiltros) ||
                  (!tab.temSubmenu && filtroSituacao === tab.value)
                    ? "white"
                    : "text.primary",
                bgcolor:
                  (tab.temSubmenu && mostrarSubFiltros) ||
                  (!tab.temSubmenu && filtroSituacao === tab.value)
                    ? tab.color
                    : "background.paper",
                "&:hover": {
                  bgcolor:
                    (tab.temSubmenu && mostrarSubFiltros) ||
                    (!tab.temSubmenu && filtroSituacao === tab.value)
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                },
              }}
            >
              {tab.label}
              <Box
                sx={{
                  ml: 1,
                  fontWeight: 600,
                  backgroundColor:
                    (tab.temSubmenu && mostrarSubFiltros) ||
                    (!tab.temSubmenu && filtroSituacao === tab.value)
                      ? "rgba(255,255,255,0.2)"
                      : theme.palette.mode === "dark"
                        ? theme.palette.grey[700]
                        : theme.palette.grey[200],
                  color:
                    (tab.temSubmenu && mostrarSubFiltros) ||
                    (!tab.temSubmenu && filtroSituacao === tab.value)
                      ? "white"
                      : theme.palette.mode === "dark"
                        ? theme.palette.grey[100]
                        : theme.palette.text.primary,
                  px: 1,
                  borderRadius: 12,
                }}
              >
                {tab.count}
              </Box>
            </Button>
          ))}
        </Box>

        {/* Submenu com os filtros AGENDADAS e EM ANDAMENTO */}
        {mostrarSubFiltros && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 0,
              mb: 3,
              ml: 3,
              flexWrap: "wrap",
              pl: 2,
              borderLeft: `2px solid ${theme.palette.divider}`,
            }}
          >
            {[
              {
                label: "AGENDADAS",
                value: "AGENDADA",
                count: qtdAgendadas,
                color: theme.palette.info.main,
              },
              {
                label: "EM ANDAMENTO",
                value: "ANDAMENTO",
                count: qtdEmAndamento,
                color: theme.palette.warning.main,
              },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={filtroAtivoInterno === tab.value ? "contained" : "outlined"}
                onClick={() => {
                  setFiltroAtivoInterno(tab.value);
                  setFiltroSituacao(tab.value);
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  fontWeight: filtroAtivoInterno === tab.value ? 600 : 500,
                  color: filtroAtivoInterno === tab.value ? "white" : "text.primary",
                  bgcolor:
                    filtroAtivoInterno === tab.value
                      ? tab.color
                      : "background.paper",
                  "&:hover": {
                    bgcolor:
                      filtroAtivoInterno === tab.value
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                  },
                }}
              >
                {tab.label}
                <Box
                  sx={{
                    ml: 1,
                    fontWeight: 600,
                    backgroundColor:
                      filtroAtivoInterno === tab.value
                        ? "rgba(255,255,255,0.2)"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : theme.palette.grey[200],
                    color:
                      filtroAtivoInterno === tab.value
                        ? "white"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[100]
                          : theme.palette.text.primary,
                    px: 1,
                    borderRadius: 12,
                  }}
                >
                  {tab.count}
                </Box>
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ mb: 3, mx: 3 }}>
          <TextField
            placeholder="Buscar corrida"
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
        </Box>

        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          
          loading={loading}
          getRowId={(row) => row.idCorrida}
          pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'idCorrida', sort: 'desc' }],
            },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rowSelection={false}
          rowHeight={50}
          columnHeaderHeight={60}
          autoHeight
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
        />
      </Box>

      {/* Modal de Liberar Chave */}
      <Dialog
        open={showModalLiberarChave}
        onClose={() => {
          if (!isProcessing) {
            setShowModalLiberarChave(false);
            setSenhaError(null);
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle color="text.primary" sx={{ fontWeight: "bold" }}>
          LIBERAR CHAVE
        </DialogTitle>
        <DialogContent>
          <Typography color="text.primary" mb={2}>
            Você está entregando a chave do carro ao motorista:
            <strong> {selectedCorrida?.nomeMotoristaPrincipal}</strong>
          </Typography>

          <TextField
            label="Digite sua senha"
            type="password"
            value={senhaLiberarChave}
            onChange={(e) => {
              setSenhaLiberarChave(e.target.value);
              setSenhaError(null);
            }}
            fullWidth
            variant="outlined"
            error={!!senhaError}
            helperText={senhaError}
            autoFocus
            disabled={isProcessing}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isProcessing) {
                e.preventDefault();
                handleLiberarChave();
              }
            }}
          />

          {authMode === "MOCK" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1, fontStyle: "italic" }}
            >
              Modo de teste ativo. Use a senha: <strong>secret</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setShowModalLiberarChave(false);
              setSenhaError(null);
            }}
            variant="outlined"
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleLiberarChave}
            variant="contained"
            color="primary"
            disabled={isProcessing}
          >
            {isProcessing ? "Processando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showModalCancelar}
        onClose={() => setShowModalCancelar(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            Cancelar corrida
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.primary">
            Você tem certeza que deseja cancelar essa corrida?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowModalCancelar(false)}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (selectedCorrida) {
                try {
                  await atualizarSituacaoCorrida(
                    selectedCorrida.idCorrida,
                    "CANCELADA",
                  );

                  
                  await CarroService.atualizarSituacaoCarro(
                    selectedCorrida.idCarro,
                    "DISPONIVEL",
                  );

                  const dadosAtualizados = await getCorridas();
                  setCorridas(dadosAtualizados);
                  setShowModalCancelar(false);
                  setMensagemSucesso("Corrida cancelada sucesso!");
                } catch (error) {
                  console.error("Erro ao cancelar corrida:", error);
                }
              }
            }}
            variant="contained"
            color="error"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showModalReceberChave}
        onClose={() => setShowModalReceberChave(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle color="text.primary" sx={{ fontWeight: "bold" }}>
          RECEBER CHAVE
        </DialogTitle>
        <DialogContent>
          <Typography color="text.primary">
            Você confirma que está recebendo a chave do motorista
            <strong> {selectedCorrida?.nomeMotoristaPrincipal}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowModalReceberChave(false)}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setShowModalReceberChave(false);
              setShowVistoriaDevolucaoModal(true);
            }}
            variant="contained"
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {showModalEditar && (
        <SalvarEdicaoCorrida
          open={showModalEditar}
          onClose={() => setShowModalEditar(false)}
          corrida={
            corridaParaEditar
              ? {
                  ...mapToDto(corridaParaEditar),
                  dataTermino:
                    mapToDto(corridaParaEditar).dataTermino || new Date(),
                }
              : null
          }
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            const dadosAtualizados = await getCorridas();
            setCorridas(dadosAtualizados);
          }}
          onError={(err) => {
            console.error(err);
          }}
        />
      )}

      {showModalCadastrarCorrida && (
        <CadastrarCorrida
          open={showModalCadastrarCorrida}
          onClose={() => setShowModalCadastrarCorrida(false)}
          onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await carregarCorridas();
            } catch (error) {
              console.error(error);
            }
          }}
          onError={(error) => {
            console.error("Erro ao cadastrar corrida:", error);
          }}
        />
      )}

      <VistoriaDevolucaoModal
        open={showVistoriaDevolucaoModal}
        onClose={() => setShowVistoriaDevolucaoModal(false)}
        onSuccess={async (message) => {
          setMensagemSucesso(message);
          setShowVistoriaDevolucaoModal(false);
          try {
              await carregarCorridas();
            } catch (error) {
              console.error(error);
            }
        }}
        onError={(error) => {
          console.error("Erro ao solicitar recurso:", error);
        }}
        corrida={selectedCorrida}
      />
    </AppLayout>
  );
}