import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Alert,
  useTheme,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
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
  const [busca, setBusca] = useState("");

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
      setMultas(dados);
    } catch {
      setError("Erro ao carregar registros de infração.");
    } finally {
      setLoading(false);
    }
  };

  const buscar = (valor: string) => {
    const texto = valor.trim().toUpperCase();

    if (!texto) {
      carregarMultas();
      return;
    }

    const placaRegex = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;

    if (placaRegex.test(texto)) {
      carregarMultas({ placaVeiculo: texto });
    } else {
      carregarMultas({ classificacao: texto });
    }
  };

  const limparBusca = () => {
    setBusca("");
    carregarMultas();
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
    { field: "placaVeiculo", headerName: "Veículo", flex: 0.6 },
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
    { field: "autoInfracao", headerName: "Auto", flex: 0.6 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 150,
      sortable: false,
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
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
        <Box mb={2} display="flex" alignItems="center" gap={1}>
          <ReceiptIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Registros de Infração
          </Typography>
        </Box>

        <Box mb={2} width="100%" display="flex" gap={2}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por placa ou classificação"
            value={busca}
            onChange={(e) => {
              const valor = e.target.value;
              setBusca(valor);
              buscar(valor);
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon color="action" style={{ marginRight: 8 }} />
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={limparBusca}
          >
            Limpar
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

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
          sx={{ height: "calc(100vh - 320px)" }}
        />
      </Box>
    </>
  );
}
