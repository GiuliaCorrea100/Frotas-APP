import { Add } from '@mui/icons-material';
import CreateIcon from "@mui/icons-material/Create";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
  useTheme,
  Snackbar,
  Alert,
  TextField
} from "@mui/material";
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import Menu from '../../../components/Menu';
import { MultaDto, MultaService } from '../../../services/MultaService';
import CadastroMultaModal from './ModalCadastroMulta';
import EditarMultaModal from './ModalEdicaoMulta';

export default function ListaMulta() {
  const theme = useTheme();
  const [busca, setBusca] = useState("");
  const [multas, setMultas] = useState<MultaDto[]>([]);
  const [filtroClassificacao, setFiltroClassificacao] = useState<string>('TODOS');
  const [loading, setLoading] = useState(false);

  const [modalCadastrarAberto, setModalCadastroAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalAprovarAberto, setModalAprovarAberto] = useState(false);
  const [modalReprovarAberto, setModalReprovarAberto] = useState(false);
  const [motivoReprovacao, setMotivoReprovacao] = useState("");

  const [multaSelecionada, setMultaSelecionada] = useState<MultaDto | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"success" | "error" | "warning" | "info">("success");
  const [snackbarAberto, setSnackbarAberto] = useState(false);

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

  const aprovarComprovante = async () => {
    if (!multaSelecionada) return;

    try {
      await MultaService.aprovarComprovante(multaSelecionada.idMulta!);
      setMensagem("Comprovante aprovado com sucesso!");
      setTipoMensagem("success");
      setSnackbarAberto(true);
      setModalAprovarAberto(false);
      await carregarMultas();
    } catch (error) {
      setMensagem("Erro ao aprovar comprovante.");
      setTipoMensagem("error");
      setSnackbarAberto(true);
    }
  };

  const reprovarComprovante = async () => {
    if (!multaSelecionada) return;

    try {
      await MultaService.reprovarComprovante(
        multaSelecionada.idMulta!,
        motivoReprovacao
      );
      setMensagem("Comprovante reprovado com sucesso!");
      setTipoMensagem("success");
      setSnackbarAberto(true);
      setModalReprovarAberto(false);
      setMotivoReprovacao("");
      await carregarMultas();
    } catch (error) {
      setMensagem("Erro ao reprovar comprovante.");
      setTipoMensagem("error");
      setSnackbarAberto(true);
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
        const map: any = {
          LEVE: 'success',
          MEDIA: 'warning',
          GRAVE: 'error',
          GRAVISSIMA: 'error'
        };
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
          "MOTORISTA NAO IDENTIFICADO": "#616161"
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
        const jaAnalisado =
          params.row.situacao === "PAGA" ||
          params.row.situacao === "PENDENTE DE ACAO";

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
                sx={{ width: 42, height: 42, minWidth: 42 }}
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
                sx={{ width: 42, height: 42, minWidth: 42 }}
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
                  width: 42,
                  height: 42,
                  minWidth: 42,
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
              sx={{ width: 42, height: 42, minWidth: 42 }}
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
                width: 42,
                height: 42,
                minWidth: 42,
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
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Listagem de Multas
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalCadastroAberto(true)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Nova Multa
          </Button>
        </Box>

        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.idMulta}
          initialState={{ pagination: { paginationModel: { pageSize: 8, page: 0 } } }}
          pageSizeOptions={[8, 16, 24]}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            boxShadow: theme.shadows[1],
            borderRadius: 2,
            border: 'none',
            backgroundColor: theme.palette.background.paper,
            height: 'calc(100vh - 350px)',
          }}
          rowSelection={false}
        />
      </Box>

      <Dialog open={modalAprovarAberto} onClose={() => setModalAprovarAberto(false)}>
        <DialogTitle sx={{ color: theme.palette.mode === "dark" ? "#fff" : "inherit" }}>
          Aprovar comprovante
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: theme.palette.mode === "dark" ? "#fff" : "inherit" }}>
            Deseja aprovar esse comprovante de pagamento?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ "& .MuiButton-root": { color: theme.palette.mode === "dark" ? "#fff" : "inherit" } }}>
          <Button onClick={() => setModalAprovarAberto(false)}>Não</Button>
          <Button onClick={aprovarComprovante} variant="contained" color="success">Sim</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalReprovarAberto} onClose={() => setModalReprovarAberto(false)}>
        <DialogTitle sx={{ color: theme.palette.mode === "dark" ? "#fff" : "inherit" }}>
          Motivo da reprovação
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={motivoReprovacao}
            onChange={(e) => setMotivoReprovacao(e.target.value)}
            sx={{
              "& .MuiInputBase-input": { color: theme.palette.mode === "dark" ? "#fff" : "inherit" },
              "& .MuiInputLabel-root": { color: theme.palette.mode === "dark" ? "#fff" : "inherit" }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ "& .MuiButton-root": { color: theme.palette.mode === "dark" ? "#fff" : "inherit" } }}>
          <Button onClick={() => setModalReprovarAberto(false)}>Cancelar</Button>
          <Button onClick={reprovarComprovante} variant="contained" color="error">Reprovar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalExcluirAberto} onClose={() => setModalExcluirAberto(false)}>
        <DialogTitle sx={{ color: theme.palette.mode === "dark" ? "#fff" : "inherit" }}>
          Excluir Multa
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: theme.palette.mode === "dark" ? "#fff" : "inherit" }}>
            Você tem certeza que deseja excluir esta multa?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ "& .MuiButton-root": { color: theme.palette.mode === "dark" ? "#fff" : "inherit" } }}>
          <Button onClick={() => setModalExcluirAberto(false)}>Cancelar</Button>
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
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <CadastroMultaModal
        open={modalCadastrarAberto}
        onClose={() => setModalCadastroAberto(false)}
        onSuccess={async () => {
          await carregarMultas();
          setModalCadastroAberto(false);
        }}
        onError={() => {}}
      />

      <EditarMultaModal
        open={modalEditarAberto}
        multa={multaSelecionada}
        onClose={() => setModalEditarAberto(false)}
        onSuccess={async () => {
          await carregarMultas();
          setModalEditarAberto(false);
        }}
        onError={() => {}}
      />

      <Snackbar
        open={snackbarAberto}
        autoHideDuration={4000}
        onClose={() => setSnackbarAberto(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarAberto(false)}
          severity={tipoMensagem}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </>
  );
}