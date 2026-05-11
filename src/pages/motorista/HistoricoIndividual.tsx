import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Chip,
  Button,
  Typography,
  useTheme,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import { Warning, Visibility } from "@mui/icons-material";
import { CorridaFrontend, getCorridas } from "../../services/CorridaService";
import {
  buscarPercursosDaCorrida,
  PercursoBackend,
} from "../../services/PercursoService";
import AbastecimentoService, {
  Abastecimento,
} from "../../services/AbastecimentoService";
import { OcorrenciaDto, OcorrenciaService } from "../../services/OcorrenciaService";
import { ModalDetalhesHistorico } from "./modais/ModalDetalhesHistorico";
import { formatDate } from "../../utils/formatDate";
import { decodeToken } from "../../utils/jwtDecodeHelper";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/Layout";
import BemVindo from "../BemVindo";
import { MultaService } from "../../services/MultaService";

const situacaoMap = {
  AGENDADA: "info",
  ANDAMENTO: "warning",
  FINALIZADA: "success",
  CANCELADA: "error",
} as const;

const getSituacaoChipProps = (situacao: string | undefined) => ({
  label: situacao,
  color: situacaoMap[situacao as keyof typeof situacaoMap] || "default",
});

export default function HistoricoIndividual() {
  const theme = useTheme();
  const { token } = useAuth();
  const decodedToken = token ? decodeToken<{ sub: string }>(token) : null;
  const idUsuarioLogado = decodedToken?.sub ? Number(decodedToken.sub) : null;

  const [busca, setBusca] = useState("");
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [percursos, setPercursos] = useState<PercursoBackend[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDetails, setOpenDetails] = useState(false);
  const [selectedCorrida, setSelectedCorrida] =
    useState<CorridaFrontend | null>(null);

  useEffect(() => {
    const carregarDadosPainel = async () => {
      try {
        setError(null);
        const dadosCorridas = await getCorridas();
        setCorridas(dadosCorridas);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(
          "Falha ao carregar histórico de corridas. Tente novamente mais tarde.",
        );
      } finally {
        setLoading(false);
      }
    };
    carregarDadosPainel();
  }, []);

  const handleOpenDetails = async (corrida: CorridaFrontend) => {
    setSelectedCorrida(corrida);
    setModalLoading(true);

    try {
      const [percursosCorrida, abastecimentosCorrida, ocorrenciasCorrida, ] = await Promise.all([
        buscarPercursosDaCorrida(corrida.idCorrida),
        AbastecimentoService.buscarPorCorrida(corrida.idCorrida),
        OcorrenciaService.buscarPorCorrida(corrida.idCorrida),
    
      ]);
      setPercursos(percursosCorrida);
      setAbastecimentos(abastecimentosCorrida);
      setOcorrencias(ocorrenciasCorrida);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    } finally {
      setModalLoading(false);
      setOpenDetails(true);
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedCorrida(null);
  };

  const columns: GridColDef<CorridaFrontend>[] = [
    {
      field: "placaVeiculo",
      headerName: "Veículo",
      width: 250,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    {
      field: "dataHoraLiberacaoChave",
      headerName: "Data/Hora Início",
      width: 250,
      renderCell: (params) => (
        <Typography>{formatDate(params.value as string)}</Typography>
      ),
    },
    {
      field: "dataHoraRecebimentoChave",
      headerName: "Data/Hora Término",
      width: 250,
      renderCell: (params) => (
        <Typography>{formatDate(params.value as string)}</Typography>
      ),
    },
    {
      field: "situacao",
      headerName: "Situação",
      width: 300,
      renderCell: (params) => {
        const { label, color } = getSituacaoChipProps(params.value);
        return (
          <Chip
            label={label}
            color={color as any}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "detalhes",
      headerName: "Ações",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Ver detalhes">
          <span>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleOpenDetails(params.row)}
              startIcon={<Visibility />}
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
      ),
    },
  ];

  const dadosFiltrados = corridas
    .filter((corrida) => corrida.idMotorista === idUsuarioLogado)
    .filter(
      (corrida) =>
        Object.values(corrida).some((valor) =>
          String(valor).toLowerCase().includes(busca.toLowerCase()),
        ),
    );

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
          Histórico de Corridas
        </Typography>
      </Box>

      {/* Campo de busca + datagrid */}
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
        <Box sx={{ mb: 3, mt: 1, mx: 3 }}>
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
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "dataInicio", sort: "desc" }],
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
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
          rowSelection={false}
          rowHeight={50}
          columnHeaderHeight={60}
          autoHeight
        />
      </Box>

      {openDetails && (
        <ModalDetalhesHistorico
          open={openDetails}
          onClose={handleCloseDetails}
          corrida={selectedCorrida}
          percursos={percursos}
          abastecimentos={abastecimentos}
          ocorrencias={ocorrencias}
          modalLoading={modalLoading}
          getSituacaoChipProps={getSituacaoChipProps}
        />
      )}
    </AppLayout>
  );
}
