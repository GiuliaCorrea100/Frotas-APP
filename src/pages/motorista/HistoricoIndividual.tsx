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
import { OcorrenciaService } from "../../services/OcorrenciaService";
import { ModalDetalhesHistorico } from "./modais/ModalDetalhesHistorico";
import { formatDate } from "../../utils/formatDate";
import { decodeToken } from "../../utils/jwtDecodeHelper";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/Layout";
import BemVindo from "../BemVindo";

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
  const [ocorrencias, setOcorrencias] = useState<Record<number, string>>({});
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

        const ocorrenciasMap: Record<number, string> = {};
        for (const corrida of dadosCorridas) {
          try {
            const ocorrenciasList = await OcorrenciaService.buscarPorCorrida(
              corrida.idCorrida,
            );
            if (ocorrenciasList.length > 0) {
              ocorrenciasMap[corrida.idCorrida] = ocorrenciasList
                .map((occ) => occ.descricao)
                .join(", ");
            }
          } catch (error) {
            console.error(
              `Erro ao buscar ocorrência para corrida ${corrida.idCorrida}:`,
              error,
            );
          }
        }
        setOcorrencias(ocorrenciasMap);
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
      const [percursosCorrida, abastecimentosCorrida] = await Promise.all([
        buscarPercursosDaCorrida(corrida.idCorrida),
        AbastecimentoService.buscarPorCorrida(corrida.idCorrida),
      ]);
      setPercursos(percursosCorrida);
      setAbastecimentos(abastecimentosCorrida);
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
      width: 200,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    {
      field: "dataHoraLiberacaoChave",
      headerName: "Data/Hora Início",
      width: 200,
      renderCell: (params) => (
        <Typography>{formatDate(params.value as string)}</Typography>
      ),
    },
    {
      field: "dataHoraRecebimentoChave",
      headerName: "Data/Hora Término",
      width: 200,
      renderCell: (params) => (
        <Typography>{formatDate(params.value as string)}</Typography>
      ),
    },
    {
      field: "ocorrencia",
      headerName: "Ocorrência",
      width: 400,
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          style={{ whiteSpace: "normal", wordWrap: "break-word" }}
        >
          {ocorrencias[params.row.idCorrida] ? (
            <>
              <Warning sx={{ mr: 1, color: "warning.main" }} />
              {ocorrencias[params.row.idCorrida]}
            </>
          ) : (
            "Nenhuma ocorrência registrada"
          )}
        </Box>
      ),
    },
    {
      field: "situacao",
      headerName: "Situação",
      width: 200,
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
              color="success"
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
        ) ||
        (ocorrencias[corrida.idCorrida] &&
          ocorrencias[corrida.idCorrida]
            .toLowerCase()
            .includes(busca.toLowerCase())),
    );

  const situacaoProps = selectedCorrida
    ? getSituacaoChipProps(selectedCorrida.situacao)
    : { label: "", color: "default" };

  return (
    <AppLayout>
      <BemVindo />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold" color="textPrimary">
          Histórico de Corridas
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar corridas"
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
