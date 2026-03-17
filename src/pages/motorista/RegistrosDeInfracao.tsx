import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Alert,
  useTheme,
  TextField,
  Tooltip,
  Chip,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from '@mui/icons-material/Upload';
import GavelIcon from '@mui/icons-material/Gavel';
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from "@mui/icons-material/Clear";
import { jwtDecode } from "jwt-decode";
import Menu from "../../components/Menu";
import { MultaDto, MultaService } from "../../services/MultaService";
import { useAuth } from "../../context/AuthContext";
import { decodeToken } from "../../utils/jwtDecodeHelper";
import SolicitarRecursoModal from "./modais/ModalSolicitarRecurso";
import AppLayout from "../../components/Layout";
import BemVindo from "../BemVindo";

interface JwtPayload {
  sub: number;
  login: string;
  administrador: boolean;
  iat: number;
  exp: number;
}

const formatDate = (data: string | Date | null) => {
  if (!data) return "Não informada";
  const d = new Date(data);
  if (isNaN(d.getTime())) return "Data inválida";
  return d.toLocaleDateString("pt-BR");
};

const formatValor = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function RegistrosDeInfracao() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { token } = useAuth();
  const decodedToken = token ? decodeToken<{ sub: string }>(token) : null;
  const idUsuarioLogado = decodedToken?.sub ? Number(decodedToken.sub) : null;

  const [multas, setMultas] = useState<MultaDto[]>([]);
  const [multasFiltradas, setMultasFiltradas] = useState<MultaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [openRecursoModal, setOpenRecursoModal] = useState(false);
  const [selectedMulta, setSelectedMulta] = useState<MultaDto | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removeSuccess, setRemoveSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    carregarMultas();
  }, [isAuthenticated, navigate]);

  const carregarMultas = async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error();
      jwtDecode<JwtPayload>(token);
      
      const dados = await MultaService.listarMultas(params);
      
      const multasDoUsuario = dados.filter(
        (multa) => multa.idMotorista === idUsuarioLogado
      );
      
      setMultas(multasDoUsuario);
      setMultasFiltradas(multasDoUsuario);
    } catch {
      setError("Erro ao carregar registros de infração.");
    } finally {
      setLoading(false);
    }
  };

  const buscar = (valor: string) => {
    const texto = valor.trim().toLowerCase();
    setBusca(valor);

    if (!texto) {
      setMultasFiltradas(multas);
      return;
    }

    const filtradas = multas.filter((multa) => {
      return Object.values(multa).some((valorProp) => {
        if (valorProp === null || valorProp === undefined) return false;
        return String(valorProp).toLowerCase().includes(texto);
      });
    });

    setMultasFiltradas(filtradas);
  };

  const limparBusca = () => {
    setBusca("");
    setMultasFiltradas(multas);
  };

  const handleDownload = async (multa: MultaDto) => {
    if (!multa.urlArquivo) return;
    const fileName = multa.urlArquivo.split("/").pop() || "boleto.pdf";
    const blob = await MultaService.downloadArquivo(fileName);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `boleto_${multa.placaVeiculo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSolicitarRecurso = (multa: MultaDto) => {
    setSelectedMulta(multa);
    setOpenRecursoModal(true);
  };

  const handleRecursoSuccess = () => {
    carregarMultas();
  };

  const handleRecursoError = (error: any) => {
    console.error("Erro ao solicitar recurso:", error);
    setUploadError("Erro ao solicitar recurso. Tente novamente.");
  };

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 6000);
  };

  const handleRemoveSuccess = () => {
    setRemoveSuccess(true);
    setTimeout(() => setRemoveSuccess(false), 6000);
  };

  const handleError = (message: string) => {
    setUploadError(message);
    setTimeout(() => setUploadError(null), 6000);
  };

  const columns: GridColDef<MultaDto>[] = [
    { 
      field: "placaVeiculo", 
      headerName: "Veículo", 
      flex: 0.6,
      renderCell: (params) => (
        <Typography fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    {
      field: "dataInfracao",
      headerName: "Data",
      flex: 0.6,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value as any)}
        </Typography>
      ),
    },
    { 
      field: 'classificacao', 
      headerName: 'Classificação', 
      flex: 0.6,
      renderCell: (params) => {
        const classificacao = params.value || '';
        let color = 'default';
        
        switch(classificacao) {
          case 'LEVE': color = 'success'; break;
          case 'MEDIA': color = 'warning'; break;
          case 'GRAVE': color = 'error'; break;
          case 'GRAVISSIMA': color = 'error'; break;
          default: color = 'default';
        }
        
        return (
          <Chip 
            label={classificacao}
            color={color as any}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: "valorInfracao",
      headerName: "Valor",
      flex: 0.6,
      renderCell: (params) => (
        <Typography color={theme.palette.error.main}>
          {formatValor(params.value as number)}
        </Typography>
      ),
    },
    { field: "autoInfracao", headerName: "Auto", flex: 0.6 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 550,
      minWidth: 550,
      maxWidth: 700,
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const possuiBoleto = !!params.row.urlArquivo;
        const possuiComprovante = !!params.row.urlComprovantePagamento;
        const nomeArquivo = params.row.urlComprovantePagamento 
          ? params.row.urlComprovantePagamento.split('/').pop() || 'comprovante.pdf'
          : '';

        const podeEnviarComprovante = possuiBoleto && !possuiComprovante;
        const podePedirRecurso = possuiBoleto && !possuiComprovante;
        
        return(
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Baixar Boleto">
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                disabled={!params.row.urlArquivo}
                onClick={() => handleDownload(params.row)}
              >
                Boleto
              </Button>
            </Tooltip>

            {possuiComprovante ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Tooltip title="Excluir comprovante enviado">
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={async () => {
                      if (!params.row.urlComprovantePagamento) return;

                      if (!params.row.idMulta) {
                        console.error("ID da multa não encontrado");
                        return;
                      }
                        
                      try {
                        await MultaService.removerArquivoComprovante(params.row.idMulta);
                        await carregarMultas();
                        handleRemoveSuccess();
                      } catch (error) {
                        console.error("Erro ao excluir o comprovante:", error);
                        handleError("Erro ao excluir o comprovante. Tente novamente.");
                      }
                    }}
                  >
                    {nomeArquivo.length > 20 
                      ? `${nomeArquivo.substring(0, 17)}...` 
                      : nomeArquivo}
                  </Button>
                </Tooltip>
              </Box>
            ) : (
              <Tooltip title="Enviar comprovante de pagamento">
                <Button
                  size="small"
                  component="label"
                  variant="contained"
                  color="success"
                  startIcon={<UploadIcon />}
                  disabled={!podeEnviarComprovante}
                >
                  Comprovante
                  <input
                    type="file"
                    hidden
                    accept="application/pdf,image/*"
                    disabled={!podeEnviarComprovante}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !params.row.idMulta) return;

                      try {
                        await MultaService.uploadComprovante(
                          params.row.idMulta,
                          file
                        );
                        await carregarMultas();
                        handleUploadSuccess();
                      } catch (error) {
                        console.error("Erro ao enviar comprovante:", error);
                        handleError("Erro ao enviar comprovante. Tente novamente.");
                      } finally {
                        e.target.value = "";
                      }
                    }}
                  />
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Solicitar recurso de multa">
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<GavelIcon />}
                disabled={!podePedirRecurso}
                onClick={() => handleSolicitarRecurso(params.row)}
              >
                Solicitar Recurso
              </Button>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <AppLayout>

      <BemVindo />

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
        <Box mb={2} display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" fontWeight="bold" color="textPrimary">
            Registros de Infrações
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Buscar infrações..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => buscar(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <SearchIcon color="action" style={{ marginRight: 8 }} />
              ),
              endAdornment: busca && (
                <ClearIcon 
                  color="action" 
                  style={{ cursor: 'pointer' }} 
                  onClick={limparBusca}
                />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          {uploadSuccess && (
            <Alert 
              severity="success" 
              sx={{ mb: 1 }}
              onClose={() => setUploadSuccess(false)}
            >
              Comprovante de pagamento enviado com sucesso!
            </Alert>
          )}

          {removeSuccess && (
            <Alert 
              severity="success" 
              sx={{ mb: 1 }}
              onClose={() => setRemoveSuccess(false)}
            >
              Comprovante de pagamento removido com sucesso!
            </Alert>
          )}

          {uploadError && (
            <Alert 
              severity="error" 
              sx={{ mb: 1 }}
              onClose={() => setUploadError(null)}
            >
              {uploadError}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 1 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </Box>

        <DataGrid
          rows={multasFiltradas}
          columns={columns}
          loading={loading}
          getRowId={(row) =>
            row.idMulta ?? `${row.placaVeiculo}-${row.dataInfracao}`
          }
          initialState={{
            pagination: { paginationModel: { pageSize: 8, page: 0 } },
          }}
          pageSizeOptions={[8, 16, 24]}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rowSelection={false}
          sx={{ height: "calc(100vh - 320px)" }}
        />
      </Box>

      <SolicitarRecursoModal
        open={openRecursoModal}
        onClose={() => {
          setOpenRecursoModal(false);
          setSelectedMulta(null);
        }}
        onSuccess={handleRecursoSuccess}
        onError={handleRecursoError}
        multaId={selectedMulta?.idMulta}
      />

      
    </AppLayout>
  );
}