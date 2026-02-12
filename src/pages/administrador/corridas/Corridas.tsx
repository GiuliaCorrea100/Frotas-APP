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
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CancelIcon from "@mui/icons-material/Cancel";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import {
  CorridaFrontend,
  CorridaDto,
  getCorridas,
  CorridaService,
  atualizarSituacaoCorrida,
} from "../../../services/CorridaService";

import SalvarEdicaoCorrida from "./modais/ModalEdicaoPainelCorrida";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CadastrarCorrida from "./modais/ModalCadastroCorrida";
import { CarroService } from "../../../services/CarroService";

import axiosConnect from "../../../services/axios/axiosConnect";
import AppLayout from "../../../components/Layout";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Em andamento";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return "Data inválida";
  }
};

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

  const [senhaError, setSenhaError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [filtroSituacao, setFiltroSituacao] = useState<string>("AGENDADA");
  const [authMode, setAuthMode] = useState<string>("SIGAA");

  const navigate = useNavigate();

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
      filtroSituacao === "TODOS" || corrida.situacao === filtroSituacao;

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
          selectedCorrida.idMotorista,
        );
      } else {
        // Modo SIGAA normal
        await CorridaService.confirmarLiberarChave(
          selectedCorrida.idCorrida,
          selectedCorrida.idMotorista,
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
      field: "nomeMotorista",
      headerName: "Motorista",
      flex: 0.8,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    {
      field: "placaVeiculo",
      headerName: "Veículo",
      width: 150,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    {
      field: "dataInicio",
      headerName: "Data/Hora Início",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value as string)}
        </Typography>
      ),
    },
    {
      field: "dataTermino",
      headerName: "Data/Hora Término",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value as string | null)}
        </Typography>
      ),
    },
    {
      field: "situacao",
      headerName: "Situação",
      width: 100,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case "AGENDADA":
            color = theme.palette.info.main;
            break;
          case "ANDAMENTO":
            color = theme.palette.warning.main;
            break;
          case "FINALIZADA":
            color = theme.palette.success.main;
            break;
          default:
            color = theme.palette.text.secondary;
        }
        return (
          <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
            {params.value}
          </Typography>
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
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalEditar(corrida)}
              disabled={
                (corrida.chaveEmprestada === true &&
                  (corrida.situacao === "FINALIZADA" ||
                    corrida.situacao === "ANDAMENTO" ||
                    corrida.situacao === "AGENDADA" ||
                    corrida.situacao === "CANCELADA")) ||
                ((corrida.situacao === "FINALIZADA" ||
                  corrida.situacao === "CANCELADA") &&
                  corrida.chaveEmprestada === false)
              }
              startIcon={<CreateIcon />}
            ></Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => navigate(`/DetalhesCorrida/${corrida.idCorrida}`)}
              disabled={corrida.situacao === "CANCELADA"}
              startIcon={<VisibilityIcon />}
            ></Button>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalCancelarCorrida(corrida)}
              disabled={
                (corrida.chaveEmprestada === true &&
                  (corrida.situacao === "FINALIZADA" ||
                    corrida.situacao === "ANDAMENTO" ||
                    corrida.situacao === "AGENDADA" ||
                    corrida.situacao === "CANCELADA")) ||
                ((corrida.situacao === "FINALIZADA" ||
                  corrida.situacao === "CANCELADA") &&
                  corrida.chaveEmprestada === false)
              }
              startIcon={<CancelIcon />}
            ></Button>
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
                    corrida.situacao === "CANCELADA")) ||
                ((corrida.situacao === "FINALIZADA" ||
                  corrida.situacao === "CANCELADA") &&
                  corrida.chaveEmprestada === false)
              }
            >
              Liberar Chave
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => handleAbrirModalReceberChave(corrida)}
              disabled={
                (corrida.chaveEmprestada === false &&
                  (corrida.situacao === "AGENDADA" ||
                    corrida.situacao === "ANDAMENTO" ||
                    corrida.situacao === "FINALIZADA" ||
                    corrida.situacao === "CANCELADA")) ||
                (corrida.chaveEmprestada === true &&
                  corrida.situacao === "CANCELADA")
              }
            >
              Receber Chave
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <AppLayout>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold" color="textPrimary">
          Listagem de Corridas
        </Typography>
        <Button
          onClick={() => setShowModalCadastrarCorrida(true)}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            boxShadow: theme.shadows[2],
          }}
        >
          + Nova Corrida
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
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
            variant={filtroSituacao === tab.value ? "contained" : "outlined"}
            onClick={() => setFiltroSituacao(tab.value)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              fontWeight: filtroSituacao === tab.value ? 600 : 500,
              color: filtroSituacao === tab.value ? "white" : "text.primary",
              bgcolor:
                filtroSituacao === tab.value ? tab.color : "background.paper",
              "&:hover": {
                bgcolor:
                  filtroSituacao === tab.value
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
                  filtroSituacao === tab.value
                    ? "rgba(255,255,255,0.2)"
                    : theme.palette.mode === "dark"
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                color:
                  filtroSituacao === tab.value
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

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar corridas..."
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
        initialState={{
          pagination: { paginationModel: { pageSize: 8, page: 0 } },
        }}
        pageSizeOptions={[8, 16, 24]}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 1.5,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
            fontWeight: "bold",
            borderRadius: 1,
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-row": {
            "&:hover": { backgroundColor: theme.palette.action.hover },
            "&.Mui-selected": {
              backgroundColor: theme.palette.action.selected,
            },
          },
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
          boxShadow: theme.shadows[1],
          borderRadius: 2,
          border: "none",
          backgroundColor: theme.palette.background.paper,
          height: "calc(100vh - 350px)",
        }}
        rowSelection={false}
      />

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
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle color="text.primary" sx={{ fontWeight: 600 }}>
          Liberar chave
        </DialogTitle>
        <DialogContent>
          <Typography color="text.primary" mb={2}>
            Você está entregando a chave do carro ao motorista:
            <strong> {selectedCorrida?.nomeMotorista}</strong>
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
            sx={{ borderRadius: 2 }}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleLiberarChave}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
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
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          <Typography color="text.primary">Cancelar corrida</Typography>
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
            sx={{ borderRadius: 2 }}
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

                  // Atualizar situação do carro para DISPONIVEL quando a corrida for cancelada
                  await CarroService.atualizarSituacaoCarro(
                    selectedCorrida.idCarro,
                    "DISPONIVEL",
                  );

                  const dadosAtualizados = await getCorridas();
                  setCorridas(dadosAtualizados);
                  setShowModalCancelar(false);
                } catch (error) {
                  console.error("Erro ao cancelar corrida:", error);
                }
              }
            }}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
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
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle color="text.primary" sx={{ fontWeight: 600 }}>
          Receber chave
        </DialogTitle>
        <DialogContent>
          <Typography color="text.primary">
            Você confirma que está recebendo a chave do motorista
            <strong> {selectedCorrida?.nomeMotorista}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowModalReceberChave(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (selectedCorrida) {
                try {
                  await CorridaService.confirmarReceberChave(
                    selectedCorrida.idCorrida,
                  );

                  await CarroService.atualizarSituacaoCarro(
                    selectedCorrida.idCarro,
                    "DISPONIVEL",
                  );

                  if (selectedCorrida.situacao === "ANDAMENTO") {
                    await atualizarSituacaoCorrida(
                      selectedCorrida.idCorrida,
                      "FINALIZADA",
                    );
                  }

                  const dadosAtualizados = await getCorridas();
                  setCorridas(dadosAtualizados);
                  setShowModalReceberChave(false);
                } catch (error) {
                  console.error(
                    "Erro ao processar recebimento da chave:",
                    error,
                  );
                }
              }
            }}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

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
        onSuccess={async (msg) => {
          console.log(msg);
          const dadosAtualizados = await getCorridas();
          setCorridas(dadosAtualizados);
        }}
        onError={(err) => {
          console.error(err);
        }}
      />

      {showModalCadastrarCorrida && (
        <CadastrarCorrida
          open={showModalCadastrarCorrida}
          onClose={() => setShowModalCadastrarCorrida(false)}
          onSuccess={async (msg) => {
            console.log(msg);
            await carregarCorridas();
          }}
          onError={(error) => {
            console.error("Erro ao cadastrar requisição:", error);
            if (error.response?.status === 401) {
              navigate("/");
            }
          }}
        />
      )}
    </AppLayout>
  );
}
