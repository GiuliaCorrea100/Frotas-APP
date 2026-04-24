import { Add } from '@mui/icons-material';
import CreateIcon from "@mui/icons-material/Create";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import {
  Box,
  Button,
  Chip,
  Modal,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  Alert,
  TextField,
  Paper,
  Divider,
  CircularProgress
} from "@mui/material";
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import Menu from '../../../components/Menu';
import { MultaDto, MultaService } from '../../../services/MultaService';
import { RecursoService } from '../../../services/RecursoService';
import CadastroMultaModal from './ModalCadastroMulta';
import EditarMultaModal from './ModalEdicaoMulta';
import ModalVisualizarRecurso from '../../motorista/modais/ModalVisualizarRecurso';

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 500,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  color: "text.primary",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function ListaMulta() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");
  const [multas, setMultas] = useState<MultaDto[]>([]);
  const [filtroClassificacao, setFiltroClassificacao] = useState<string>('TODOS');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [modalCadastrarAberto, setModalCadastroAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalAprovarAberto, setModalAprovarAberto] = useState(false);
  const [modalReprovarAberto, setModalReprovarAberto] = useState(false);
  const [modalAceitarRecursoAberto, setModalAceitarRecursoAberto] = useState(false);
  const [modalRejeitarRecursoAberto, setModalRejeitarRecursoAberto] = useState(false);
  const [motivoReprovacao, setMotivoReprovacao] = useState("");

  const [multaSelecionada, setMultaSelecionada] = useState<MultaDto | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"success" | "error" | "warning" | "info">("success");

  const [modalRecursoAberto, setModalRecursoAberto] = useState(false);
  const [recursoSelecionado, setRecursoSelecionado] = useState<any>(null);

  useEffect(() => {
    carregarMultas();
  }, []);

  const carregarMultas = async () => {
    setLoading(true);
    try {
      const dados = await MultaService.listarMultas();
      const multasAtivas = dados.filter((m) => m.ativa);
      setMultas(multasAtivas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarRecurso = async (multa: MultaDto) => {
    if (!multa.idMulta) return;

    try {
      const recurso = await RecursoService.buscarPorMulta(multa.idMulta);

      if (!recurso) {
        setMensagem("Nenhum recurso encontrado.");
        setTipoMensagem("warning");
        return;
      }

      setRecursoSelecionado(recurso);
      setModalRecursoAberto(true);
    } catch (error) {
      setMensagem("Erro ao buscar recurso.");
      setTipoMensagem("error");
    }
  };

  const aprovarComprovante = async () => {
    if (!multaSelecionada) return;
    setLoadingAction(true);
    try {
      await MultaService.aprovarComprovante(multaSelecionada.idMulta!);
      setMensagem("Comprovante aprovado com sucesso!");
      setTipoMensagem("success");
      setModalAprovarAberto(false);

      await carregarMultas();
    } catch (error) {
      setMensagem("Erro ao aprovar comprovante.");
      setTipoMensagem("error");
    } finally {
      setLoadingAction(false);
    }
  };

  const reprovarComprovante = async () => {
    if (!multaSelecionada) return;
    setLoadingAction(true);
    try {
      await MultaService.reprovarComprovante(multaSelecionada.idMulta!, motivoReprovacao);
      setMensagem("Comprovante reprovado com sucesso!");
      setTipoMensagem("success");
      setModalReprovarAberto(false);
      setMotivoReprovacao("");
      await carregarMultas();
    } catch (error) {
      setMensagem("Erro ao reprovar comprovante.");
      setTipoMensagem("error");
    } finally {
      setLoadingAction(false);
    }
  };

  const aceitarRecurso = async () => {
    if (!multaSelecionada) return;
    setLoadingAction(true);
    try {
      await MultaService.aceitarRecurso(multaSelecionada.idMulta!);
      setMensagem("Recurso aceito com sucesso! Multa anulada.");
      setTipoMensagem("success");
      setModalAceitarRecursoAberto(false);
      await carregarMultas();
    } catch (error) {
      setMensagem("Erro ao aceitar recurso.");
      setTipoMensagem("error");
    } finally {
      setLoadingAction(false);
    }
  };

  const rejeitarRecurso = async () => {
    if (!multaSelecionada) return;
    setLoadingAction(true);
    try {
      await MultaService.rejeitarRecurso(multaSelecionada.idMulta!);
      setMensagem("RECURSO REJEITADO. SITUAÇÃO ATUALIZADA.");
      setTipoMensagem("success");
      setModalRejeitarRecursoAberto(false);
      await carregarMultas();
    } catch (error) {
      setMensagem("Erro ao rejeitar recurso.");
      setTipoMensagem("error");
    } finally {
      setLoadingAction(false);
    }
  };

  const estatisticas = useMemo(() => ({
    LEVE: multas.filter(m => m.classificacao === 'LEVE').length,
    MEDIA: multas.filter(m => m.classificacao === 'MEDIA').length,
    GRAVE: multas.filter(m => m.classificacao === 'GRAVE').length,
    GRAVISSIMA: multas.filter(m => m.classificacao === 'GRAVISSIMA').length,
    TODOS: multas.length
  }), [multas]);

  const dadosFiltrados = useMemo(() => {
    return multas
      .filter(multa => {
        const matchesSearch =
          busca === '' ||
          Object.values(multa).some(valor =>
            String(valor).toLowerCase().includes(busca.toLowerCase())
          );

        const matchesClassificacao =
          filtroClassificacao === 'TODOS' ||
          multa.classificacao === filtroClassificacao;

        return matchesSearch && matchesClassificacao;
      })
      .sort((a, b) => {
        const dataA = a.dataInfracao ? new Date(a.dataInfracao).getTime() : 0;
        const dataB = b.dataInfracao ? new Date(b.dataInfracao).getTime() : 0;
        return dataB - dataA;
      });
  }, [multas, busca, filtroClassificacao]);

  const buttonStyle = {
    width: 42,
    height: 42,
    minWidth: 42,
    padding: 0,
    borderRadius: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& .MuiButton-startIcon": { margin: 0 },
  };

  const columns: GridColDef[] = [
    { field: 'idMulta', headerName: 'N°', flex: 0.5 },
    { field: 'codigoInfracao', headerName: 'Código Infração', flex: 1 },
    {
      field: 'placaVeiculo',
      headerName: 'Placa',
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      )
    },
    {
      field: 'motorista',
      headerName: 'Motorista',
      flex: 1.5,
      valueGetter: (params) =>
        params.row.nomeMotorista ||
        params.row.motorista?.nome ||
        (params.row.idMotorista ? `Motorista #${params.row.idMotorista}` : 'Não identificado')
    },
    {
      field: 'dataInfracao',
      headerName: 'Data da Infração',
      flex: 1,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString('pt-BR') : '-'
    },
    {
      field: 'valorInfracao',
      headerName: 'Valor',
      flex: 1,
      valueFormatter: (params) =>
        params.value
          ? `R$ ${Number(params.value).toFixed(2).replace('.', ',')}`
          : 'R$ 0,00'
    },
    {
      field: 'classificacao',
      headerName: 'Classificação',
      flex: 1.5,
      renderCell: (params) => {
        const map: any = { LEVE: 'success', MEDIA: 'warning', GRAVE: 'error', GRAVISSIMA: 'error' };
        return (
          <Chip
            label={params.value}
            color={map[params.value] || 'default'}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'situacao',
      headerName: 'Situação',
      width: 180,
      renderCell: (params) => {
        const cores: any = {
          "PAGA": "#2e7d32",
          "ANALISE PENDENTE": "#1976d2",
          "AGUARDANDO COMPROVANTE": "#6a1b9a",
          "PENDENTE DE ACAO": "#ed6c02",
          "ATRIBUIDA": "#f9a825",
          "MOTORISTA NAO IDENTIFICADO": "#616161",
          "RECURSO ACEITO - MULTA ANULADA": "#2e7d32",
          "RECURSO NEGADO - AGUARDANDO PAGAMENTO": "#d32f2f"
        };
        const color = cores[params.value] || "#d32f2f";
        return (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{
              color,
              borderColor: color,
              fontWeight: 600,
              backgroundColor: "transparent"
            }}
          />
        );
      }
    },
    { field: 'autoInfracao', headerName: 'Número do auto', flex: 1 },
    {
      field: 'comprovantePagamento',
      headerName: 'Comprovante',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        const url = params.row.urlComprovantePagamento;
        const possuiComprovante = Boolean(url);
        const jaAnalisado = params.row.situacao === "PAGA" || params.row.situacao === "PENDENTE DE ACAO";

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Visualizar comprovante">
              <Button
                variant="contained"
                size="small"
                disabled={!url}
                onClick={async () => {
                  const fileName = url.split('/').pop()!;
                  const blob = await MultaService.downloadArquivo(fileName);
                  window.open(URL.createObjectURL(blob));
                }}
                sx={buttonStyle}
              >
                <VisibilityIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Aprovar">
              <Button
                color="success"
                variant="contained"
                size="small"
                disabled={!possuiComprovante || jaAnalisado}
                onClick={() => {
                  setMultaSelecionada(params.row);
                  setModalAprovarAberto(true);
                }}
                sx={buttonStyle}
              >
                ✓
              </Button>
            </Tooltip>

            <Tooltip title="Reprovar">
              <Button
                color="error"
                variant="contained"
                size="small"
                disabled={!possuiComprovante || jaAnalisado}
                onClick={() => {
                  setMultaSelecionada(params.row);
                  setModalReprovarAberto(true);
                }}
                sx={{
                  ...buttonStyle,
                  color: theme.palette.mode === "dark" ? "rgba(0,0,0,0.87)" : undefined
                }}
              >
                ✕
              </Button>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      field: 'recurso',
      headerName: 'Recurso',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const temRecurso = !!params.row.possuiRecurso;
        const jaAnalisado =
          params.row.situacao === "RECURSO ACEITO - MULTA ANULADA" ||
          params.row.situacao === "RECURSO NEGADO - AGUARDANDO PAGAMENTO";

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={temRecurso ? "Visualizar recurso" : "Sem recurso"}>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  disabled={!temRecurso}
                  onClick={() => handleVisualizarRecurso(params.row)}
                  sx={buttonStyle}
                >
                  <VisibilityIcon />
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Aceitar recurso">
              <span>
                <Button
                  color="success"
                  variant="contained"
                  size="small"
                  disabled={!temRecurso || jaAnalisado}
                  onClick={() => {
                    setMultaSelecionada(params.row);
                    setModalAceitarRecursoAberto(true);
                  }}
                  sx={buttonStyle}
                >
                  ✓
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Rejeitar recurso">
              <span>
                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  disabled={!temRecurso || jaAnalisado}
                  onClick={() => {
                    setMultaSelecionada(params.row);
                    setModalRejeitarRecursoAberto(true);
                  }}
                  sx={{
                    ...buttonStyle,
                    color: theme.palette.mode === "dark" ? "rgba(0,0,0,0.87)" : undefined
                  }}
                >
                  ✕
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Editar">
            <Button
              color="warning"
              variant="contained"
              size="small"
              onClick={() => {
                setMultaSelecionada(params.row);
                setModalEditarAberto(true);
              }}
              sx={buttonStyle}
            >
              <CreateIcon />
            </Button>
          </Tooltip>

          <Tooltip title="Excluir">
            <Button
              color="error"
              variant="contained"
              size="small"
              onClick={() => {
                setMultaSelecionada(params.row);
                setModalExcluirAberto(true);
              }}
              sx={{
                ...buttonStyle,
                color: theme.palette.mode === "dark" ? "rgba(0,0,0,0.87)" : undefined
              }}
            >
              <CancelIcon />
            </Button>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <>
      <Menu />

      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} mx={3.5} height={56}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Listagem de Multas
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalCadastroAberto(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              boxShadow: theme.shadows[2],
              mb: 1,
              mt: 1,
            }}
          >
            Nova Multa
          </Button>
        </Box>

        {mensagem && (
          <Alert
            severity={tipoMensagem}
            onClose={() => setMensagem("")}
            sx={{
              mb: 3,
              fontSize: "1.1rem",
              border: "1px solid",
              borderColor: `${tipoMensagem}.main`,
              borderRadius: 1.5,
            }}
          >
            {mensagem}
          </Alert>
        )}

        <Box
          sx={{
            bgcolor: theme.palette.mode === "light" ? "#FFF" : theme.palette.background.paper,
            borderRadius: 2,
            py: 2,
            boxShadow: theme.palette.mode === "dark" ? "0px 4px 20px rgba(0, 0, 0, 0.3)" : "0px 8px 24px rgba(0, 0, 0, 0.08)",
            border: theme.palette.mode === "dark" ? "1px solid transparent" : "1px solid #E7E9EE",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 3, ml: 3, flexWrap: "wrap" }}>
            {[
              { label: "LEVE", value: "LEVE", count: estatisticas.LEVE, color: theme.palette.success.main },
              { label: "MÉDIA", value: "MEDIA", count: estatisticas.MEDIA, color: theme.palette.warning.main },
              { label: "GRAVE", value: "GRAVE", count: estatisticas.GRAVE, color: theme.palette.error.main },
              { label: "GRAVÍSSIMA", value: "GRAVISSIMA", count: estatisticas.GRAVISSIMA, color: theme.palette.error.dark },
              { label: "TODAS", value: "TODOS", count: estatisticas.TODOS, color: theme.palette.primary.main },
            ].map((tab) => ( 
              <Button
                key={tab.value}
                variant={filtroClassificacao === tab.value ? "contained" : "outlined"}
                onClick={() => setFiltroClassificacao(tab.value)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  fontWeight: filtroClassificacao === tab.value ? 600 : 500,
                  color: filtroClassificacao === tab.value ? "white" : "text.primary",
                  bgcolor: filtroClassificacao === tab.value ? tab.color : "background.paper",
                }}
              >
                {tab.label}
                <Box
                  sx={{
                    ml: 1,
                    fontWeight: 600,
                    px: 1,
                    borderRadius: 12,
                    backgroundColor: filtroClassificacao === tab.value ? "rgba(255,255,255,0.2)" : theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : theme.palette.grey[200],
                    color: filtroClassificacao === tab.value ? "#fff" : theme.palette.mode === "dark" ? "#fff" : "inherit",
                  }}
                >
                  {tab.count}
                </Box>
              </Button>
            ))}
          </Box>

          <Box sx={{ mb: 3, mx: 3 }}>
            <TextField
              placeholder="Buscar multa"
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
            getRowId={(row) => row.idMulta}
            pageSizeOptions={[8, 16, 24]}
            initialState={{ pagination: { paginationModel: { pageSize: 8, page: 0 } } }}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            rowSelection={false}
            rowHeight={50}
            columnHeaderHeight={60}
            autoHeight
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                "& .MuiDataGrid-columnHeader:first-child": { pl: 4 },
                "& .MuiDataGrid-columnHeader:last-child": { pr: 4 },
              },
              "& .MuiDataGrid-row": {
                "& .MuiDataGrid-cell:first-child": { pl: 4 },
                "& .MuiDataGrid-cell:last-child": { pr: 4 },
              },
            }}
          />
        </Box>
      </Box>

      <Modal open={modalAprovarAberto} onClose={() => !loadingAction && setModalAprovarAberto(false)}>
        <Paper sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ display: "flex", alignItems: "center", fontWeight: "bold", pt: 1 }}
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 24, mr: 1 }} />
              Aprovar Comprovante
            </Typography>
            <IconButton onClick={() => setModalAprovarAberto(false)} disabled={loadingAction}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" mb={4} color="inherit">
            Deseja confirmar a aprovação deste comprovante de pagamento para a multa <strong>#{multaSelecionada?.idMulta}</strong>?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setModalAprovarAberto(false)} color="inherit" disabled={loadingAction} sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button onClick={aprovarComprovante} variant="contained" color="success" disabled={loadingAction}>
              {loadingAction ? <CircularProgress size={24} color="inherit" /> : "Confirmar Aprovação"}
            </Button>
          </Box>
        </Paper>
      </Modal>

      <Modal open={modalReprovarAberto} onClose={() => !loadingAction && setModalReprovarAberto(false)}>
        <Paper sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ display: "flex", alignItems: "center", fontWeight: "bold", pt: 1 }}
            >
              <ErrorIcon color="error" sx={{ fontSize: 24, mr: 1 }} />
              Reprovar Comprovante
            </Typography>
            <IconButton onClick={() => setModalReprovarAberto(false)} disabled={loadingAction}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle2" mb={1} color="text.secondary">Motivo da Reprovação:</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Descreva o motivo para o motorista..."
            value={motivoReprovacao}
            onChange={(e) => setMotivoReprovacao(e.target.value)}
            sx={{ 
              mb: 3,
              "& .MuiInputBase-input": { color: "text.primary" }
            }}
          />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setModalReprovarAberto(false)} color="inherit" disabled={loadingAction} sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button onClick={reprovarComprovante} variant="contained" color="error" disabled={loadingAction || !motivoReprovacao.trim()}>
              {loadingAction ? <CircularProgress size={24} color="inherit" /> : "Reprovar"}
            </Button>
          </Box>
        </Paper>
      </Modal>

      <Modal open={modalAceitarRecursoAberto} onClose={() => !loadingAction && setModalAceitarRecursoAberto(false)}>
        <Paper sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ display: "flex", alignItems: "center", fontWeight: "bold", pt: 1 }}
            >
              <ThumbUpIcon color="success" sx={{ fontSize: 24, mr: 1 }} />
              Aceitar Recurso
            </Typography>
            <IconButton onClick={() => setModalAceitarRecursoAberto(false)} disabled={loadingAction}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" mb={1} color="inherit">
            Ao aceitar este recurso, a multa será <strong>ANULADA</strong> permanentemente.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>Esta ação não pode ser desfeita.</Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setModalAceitarRecursoAberto(false)} color="inherit" disabled={loadingAction} sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button onClick={aceitarRecurso} variant="contained" color="success" disabled={loadingAction}>
              {loadingAction ? <CircularProgress size={24} color="inherit" /> : "Aceitar e Anular Multa"}
            </Button>
          </Box>
        </Paper>
      </Modal>

      <Modal open={modalRejeitarRecursoAberto} onClose={() => !loadingAction && setModalRejeitarRecursoAberto(false)}>
        <Paper sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ display: "flex", alignItems: "center", fontWeight: "bold", pt: 1 }}
            >
              <ThumbDownIcon color="error" sx={{ fontSize: 24, mr: 1 }} />
              Rejeitar Recurso
            </Typography>
            <IconButton onClick={() => setModalRejeitarRecursoAberto(false)} disabled={loadingAction}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" mb={4} color="inherit">
            Deseja rejeitar o recurso da multa <strong>#{multaSelecionada?.idMulta}</strong>? O status retornará para "Aguardando Pagamento".
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setModalRejeitarRecursoAberto(false)} color="inherit" disabled={loadingAction} sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button onClick={rejeitarRecurso} variant="contained" color="error" disabled={loadingAction}>
              {loadingAction ? <CircularProgress size={24} color="inherit" /> : "Confirmar Rejeição"}
            </Button>
          </Box>
        </Paper>
      </Modal>

      <Modal open={modalExcluirAberto} onClose={() => setModalExcluirAberto(false)}>
        <Paper sx={modalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ display: "flex", alignItems: "center", fontWeight: "bold", pt: 1 }}
            >
              <CancelIcon color="error" sx={{ fontSize: 24, mr: 1 }} />
              Excluir Multa
            </Typography>
            <IconButton onClick={() => setModalExcluirAberto(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" mb={4} color="inherit">Você tem certeza que deseja excluir esta multa? Esta operação é irreversível.</Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setModalExcluirAberto(false)} color="inherit" sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (multaSelecionada) {
                  await MultaService.removerMulta(multaSelecionada.idMulta!);
                  await carregarMultas();
                  setModalExcluirAberto(false);
                }
              }}
              variant="contained"
              color="error"
            >
              Confirmar Exclusão
            </Button>
          </Box>
        </Paper>
      </Modal>

      <CadastroMultaModal
        open={modalCadastrarAberto}
        onClose={() => setModalCadastroAberto(false)}
        onSuccess={async () => {
          await carregarMultas();
          setModalCadastroAberto(false);
        }}
        onError={() => { }}
      />

      <EditarMultaModal
        open={modalEditarAberto}
        multa={multaSelecionada}
        onClose={() => setModalEditarAberto(false)}
        onSuccess={async () => {
          await carregarMultas();
          setModalEditarAberto(false);
        }}
        onError={() => { }}
      />

      <ModalVisualizarRecurso
        open={modalRecursoAberto}
        onClose={() => {
          setModalRecursoAberto(false);
          setRecursoSelecionado(null);
        }}
        recurso={recursoSelecionado}
      />

    </>
  );
}