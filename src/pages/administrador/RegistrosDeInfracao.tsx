import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Alert,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { jwtDecode } from "jwt-decode";
import Menu from "../../components/Menu";
import { MultaDto, MultaService } from "../../services/MultaService";
import { useAuth } from "../../context/AuthContext";

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

  const [multas, setMultas] = useState<MultaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    carregarMultas();
  }, [isAuthenticated, navigate]);

  const carregarMultas = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error();

      jwtDecode<JwtPayload>(token);
      const dados = await MultaService.listarMultas();
      setMultas(dados);
    } catch {
      setError("Erro ao carregar registros de infração.");
    } finally {
      setLoading(false);
    }
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

  const columns: GridColDef<MultaDto>[] = [
    {
      field: "placaVeiculo",
      headerName: "Veículo",
      flex: 0.6,
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
      field: "classificacao",
      headerName: "Classificação",
      flex: 0.6,
      renderCell: (params) => (
        <Typography fontWeight={600}>{params.value}</Typography>
      ),
    },
    {
      field: "valorInfracao",
      headerName: "Valor",
      flex: 0.6,
      renderCell: (params) => (
        <Typography fontWeight={600} color={theme.palette.error.main}>
          {formatValor(params.value as number)}
        </Typography>
      ),
    },
    {
      field: "autoInfracao",
      headerName: "Auto",
      flex: 0.6,
    },
    {
      field: "acoes",
      headerName: "Ações",
      sortable: false,
      filterable: false,
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={!params.row.urlArquivo}
          onClick={() => handleDownload(params.row)}
        >
          Boleto
        </Button>
      ),
    },
  ];

  return (
    <>
      <Menu />
      <Box
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              Registros de Infração
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={multas}
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
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              boxShadow: theme.shadows[1],
              borderRadius: 2,
              border: "none",
              backgroundColor: theme.palette.background.paper,
              height: "calc(100vh - 300px)",
            }}
          />
        </Box>
      </Box>
    </>
  );
}
