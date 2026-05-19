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
} from "@mui/material";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import GavelIcon from "@mui/icons-material/Gavel";
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from "@mui/icons-material/Clear";
import { jwtDecode } from "jwt-decode";
import { MultaDto, MultaService } from "../../services/MultaService";
import { useAuth } from "../../context/AuthContext";
import { decodeToken } from "../../utils/jwtDecodeHelper";
import SolicitarRecursoModal from "./modais/ModalSolicitarRecurso";
import AppLayout from "../../components/Layout";
import BemVindo from "../BemVindo";
import ModalRecursoRejeitado from "./modais/ModalDetalheRecurso";
import { RecursoService } from "../../services/RecursoService";
import VisibilityIcon from "@mui/icons-material/Visibility";

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

  const [modalRecursoAberto, setModalRecursoAberto] = useState(false);
  const [recursoSelecionado, setRecursoSelecionado] = useState<any>(null);
  const [situacaoAtual, setSituacaoAtual] = useState<string | null>(null);
  
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

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
        (multa) => ((multa.idMotorista === idUsuarioLogado)),
      );
      console.log(multasDoUsuario);
      const multasOrdenadas = [...multasDoUsuario].sort((a, b) => b.idMulta - a.idMulta);


      setMultas(multasOrdenadas);
      setMultasFiltradas(multasOrdenadas);
    } catch {
      setError("Erro ao carregar registros de infração.");
    } finally {
      setLoading(false);
    }
  };

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
    link.download = `boleto_${multa.placaVeiculo}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSolicitarRecurso = (multa: MultaDto) => {
    setSelectedMulta(multa);
    setOpenRecursoModal(true);
  };

  const handleRecursoError = (error: any) => {
    console.error("Erro ao solicitar recurso:", error);
    setMensagemErro("Erro ao solicitar recurso. Tente novamente.");

    setOpenRecursoModal(false);
    setSelectedMulta(null);
  };

  const handleUploadSuccess = () => {
    setMensagemSucesso("Comprovante de pagamento enviado com sucesso!");
  };

  const handleRemoveSuccess = () => {
    setMensagemSucesso("Comprovante de pagamento removido com sucesso!");
  };

  const handleError = (message: string) => {
    setMensagemErro(message);
  };

  const handleVisualizarRecurso = async (idMulta: number | undefined, situacao: string | undefined) => {
    if (!idMulta) {
      console.error("ID da multa não encontrado");
      setMensagemErro("Não foi possível carregar os detalhes do recurso");
      return;
    }

    try {
      const recursoEncontrado = await RecursoService.buscarPorMulta(idMulta);
      console.log("Recurso encontrado:", recursoEncontrado);
      
      if (recursoEncontrado) {
        setRecursoSelecionado(recursoEncontrado);
        setSituacaoAtual(situacao);
        setModalRecursoAberto(true);
      } else {
        setMensagemErro("Recurso não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar recurso:", error);
      setMensagemErro("Erro ao carregar detalhes do recurso");
    }
  };

  const columns: GridColDef<MultaDto>[] = [
    {
      field: "placaVeiculo",
      headerName: "Veículo",
      width: 120,
      minWidth: 100,
      renderCell: (params) => (
        <Typography >
          {params.value}
        </Typography>
      )
    },
    {
      field: "modeloVeiculo",
      headerName: "Modelo Veículo",
      width: 320,
      minWidth: 300,
      renderCell: (params) => (
        <Typography >
          {params.value}
        </Typography>
      )
    },
    {
      field: "dataInfracao",
      headerName: "Data",
      width: 120,
      minWidth: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value as any)}
        </Typography>
      ),
    },
    {
      field: "classificacao",
      headerName: "Classificação",
      width: 150,
      minWidth: 130,
      renderCell: (params) => {
        const classificacao = params.value || "";
        let color = "default";

        switch (classificacao) {
          case "LEVE":
            color = "success";
            break;
          case "MEDIA":
            color = "warning";
            break;
          case "GRAVE":
            color = "error";
            break;
          case "GRAVISSIMA":
            color = "error";
            break;
          default:
            color = "default";
        }

        return (
          <Chip
            label={classificacao}
            color={color as any}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "valorInfracao",
      headerName: "Valor",
      width: 130,
      minWidth: 120,
      renderCell: (params) => (
        <Typography color={theme.palette.error.main}>
          {formatValor(params.value as number)}
        </Typography>
      ),
    },
    { field: "autoInfracao", headerName: "Auto", width: 130, minWidth: 110,},
    {
      field: 'situacao',
      headerName: 'Situação',
      width: 300,
      minWidth: 260,
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
    {
      field: "acoes",
      headerName: "Pagamento",
      width: 320,
      minWidth: 280,
      maxWidth: 400,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const possuiBoleto = !!params.row.urlArquivo;
        const possuiComprovante = !!params.row.urlComprovantePagamento;
        const nomeArquivo = params.row.urlComprovantePagamento 
          ? params.row.urlComprovantePagamento.split('/').pop() || 'comprovante.pdf'
          : '';
        const multaAnulada = params.row.situacao == "RECURSO ACEITO - MULTA ANULADA";
        const podeEnviarComprovante = possuiBoleto && !possuiComprovante && !multaAnulada;
        const multaPaga = params.row.situacao == "PAGA";
        return(
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Baixar Boleto">
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                disabled={!params.row.urlArquivo || multaAnulada}
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
                    disabled = {multaPaga}
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
          </Box>
        );
      },
    },
    {
      field: "recursos",
      headerName: "Recurso",
      width: 220,
      minWidth: 180,
      maxWidth: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const possuiBoleto = !!params.row.urlArquivo;
        const possuiComprovante = !!params.row.urlComprovantePagamento;
        const recursoSolicitado = params.row.situacao == "RECURSO SOLICITADO";
        const recursoRejeitado = params.row.situacao == "RECURSO NEGADO - AGUARDANDO PAGAMENTO";
        const multaAnulada = params.row.situacao == "RECURSO ACEITO - MULTA ANULADA";
        const podePedirRecurso = possuiBoleto && !possuiComprovante && !recursoSolicitado && !multaAnulada;
        const recurso = recursoSolicitado || recursoRejeitado;
        
        return(
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Solicitar recurso de multa">
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<GavelIcon />}
                disabled={!podePedirRecurso || recursoRejeitado}
                onClick={() => handleSolicitarRecurso(params.row)}
                sx={buttonStyle}
              >
              </Button>
            </Tooltip>

            <Tooltip title="Detalhes Recurso">
              <Button
                variant="contained"
                size="small"
                disabled={!recurso}
                onClick={() => handleVisualizarRecurso(params.row.idMulta, params.row.situacao)}
                sx={buttonStyle}
              >
                <VisibilityIcon />
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
          Registros de Infrações
        </Typography> 
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
            onClose={() => setMensagemSucesso("")}
          >
            {mensagemSucesso}
          </Alert>
      )}

      {mensagemErro && (
          <Alert
            severity = "error"
            sx={{
              mb: 3,
              fontSize: "1.1rem",
              border: "1px solid",
              borderColor: "error.main",
              borderRadius: 1.5,
            }}
            onClose={() => setMensagemErro("")}
          >
            {mensagemErro}
          </Alert>
      )}

      <Box
          sx={{
            bgcolor: theme.palette.mode === "light" ? "#FFF" : theme.palette.background.paper,
            borderRadius: 2,
            py: 2,
            mb: 0,
            boxShadow: theme.palette.mode === "dark"
              ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
              : "0px 8px 24px rgba(0, 0, 0, 0.08)",
            border: theme.palette.mode === "dark"
              ? "1px solid transparent"
              : "1px solid #E7E9EE",
          }}
        >
          <Box sx={{ mb: 3, mx: 3 }}>
            <TextField
              placeholder="Buscar infrações..."
              variant="outlined"
              size="small"
              value={busca}
              onChange={(e) => buscar(e.target.value)}
              fullWidth
              InputProps={{  
                endAdornment: busca && (
                  <ClearIcon
                    color="action"
                    style={{ cursor: "pointer" }}
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
      

      <SolicitarRecursoModal
        open={openRecursoModal}
        onClose={() => {
          setOpenRecursoModal(false);
          setSelectedMulta(null);
        }}
        onSuccess={async (message) => {
          setMensagemSucesso(message);
          await carregarMultas();
          setOpenRecursoModal(false);
          setSelectedMulta(null);
        }}
        onError={handleRecursoError}
        multaId={selectedMulta?.idMulta}
      />

      <ModalRecursoRejeitado 
        open={modalRecursoAberto}
        onClose={() => {
          setModalRecursoAberto(false);
          setRecursoSelecionado(null);
          setSituacaoAtual(null);
        } }
        recurso={recursoSelecionado} 
        situacao={situacaoAtual}/>
    </AppLayout>
  );
}