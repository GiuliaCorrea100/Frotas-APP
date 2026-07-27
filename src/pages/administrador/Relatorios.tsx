// src/pages/administrador/Relatorios.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  useTheme,
  Chip,
  Tooltip as MuiTooltip,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
  Assignment,
  DirectionsCar,
  LocalGasStation,
  Gavel,
  Money,
  Speed,
  WarningAmber,
} from "@mui/icons-material";
import {
  BarChart,
  PieChart,
  AreaChart,
  Pie,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

import AppLayout from "../../components/Layout";
import axiosConnect from "../../services/axios/axiosConnect";
import ExportarRelatorioPDF from "./ExportarRelatorioPDF";

// --- Paletas de Cores Consistentes ---
const PIE_COLORS = [
  "#FF9800",
  "#4CAF50",
  "#2196F3",
  "#F44336",
  "#9C27B0",
  "#795548",
  "#607D8B",
];

const SITUACAO_VEICULO_COLORS: { [key: string]: string } = {
  DISPONIVEL: "#4CAF50",
  VIAGEM: "#2196F3",
  RESERVADO: "#FF9800",
  MANUTENCAO: "#F44336",
};

// --- Tipagem para as Props do StatCard ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down";
}

// --- Componente Reutilizável StatCard ---
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  const theme = useTheme();
  const trendColor =
    trend === "up"
      ? theme.palette.success.main
      : trend === "down"
        ? theme.palette.error.main
        : theme.palette.primary.main;

  return (
    <Paper
      sx={{
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
        borderRadius: 2,
      }}
    >
      <Box sx={{ color: trendColor }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" color="text.primary" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

// --- Componente Principal do Relatório ---
const Relatorios: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [corridasResumo, setCorridasResumo] = useState<{
    totalCorridas: number;
    porSituacao: { name: string; value: number }[];
  }>({
    totalCorridas: 0,
    porSituacao: [],
  });
  const [desempenhoMotoristas, setDesempenhoMotoristas] = useState<
    { motorista: string; Corridas: number }[]
  >([]);
  const [corridasTabela, setCorridasTabela] = useState<any[]>([]);
  const [visaoGeral, setVisaoGeral] = useState({
    totalCorridas: 0,
    totalVeiculos: 0,
    totalGastoCombustivel: 0,
    totalMultas: 0,
    totalOcorrencias: 0,
  });
  const [carrosResumo, setCarrosResumo] = useState({
    totalVeiculos: 0,
    emOperacao: 0,
    emManutencao: 0,
    ociosos: 0,
  });
  const [carrosSituacao, setCarrosSituacao] = useState<
    { situacao: string; quantidade: number }[]
  >([]);
  const [desempenhoCarros, setDesempenhoCarros] = useState<
    { veiculo: string; Corridas: number }[]
  >([]);
  const [carrosTabela, setCarrosTabela] = useState<any[]>([]);
  const [abastecimentoResumo, setAbastecimentoResumo] = useState({
    totalLitros: 0,
    totalValor: 0,
  });
  const [
    abastecimentoCustoPorCombustivel,
    setAbastecimentoCustoPorCombustivel,
  ] = useState<any[]>([]);
  const [abastecimentoConsumoMensal, setAbastecimentoConsumoMensal] = useState<
    any[]
  >([]);
  const [abastecimentoConsumoPorCampus, setAbastecimentoConsumoPorCampus] =
    useState<any[]>([]);
  const [multasResumo, setMultasResumo] = useState({
    totalMultas: 0,
    totalCustoMultas: 0,
  });
  const [multasPorClassificacao, setMultasPorClassificacao] = useState<
    { porClassificacao: string; quantidade: number }[]
  >([]);
  const [multasPorVeiculo, setMultasPorVeiculo] = useState<
    { placa: string; quantidade: number }[]
  >([]);
  const [ocorrenciasResumo, setOcorrenciasResumo] = useState({
    totalOcorrencias: 0,
  });
  const [ocorrenciasPorVeiculo, setOcorrenciasPorVeiculo] = useState<
    { placa: string; quantidade: number }[]
  >([]);

  useEffect(() => {
    const carregarTodosDados = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          carregarVisaoGeral(),
          carregarRelatorioCorridas(),
          carregarRelatorioVeiculos(),
          carregarRelatorioAbastecimentos(),
          carregarRelatorioMultas(),
          carregarRelatorioOcorrencias(),
        ]);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
    carregarTodosDados();
  }, [selectedYear]);

  const carregarVisaoGeral = async () => {
    const { data } = await axiosConnect.get("/relatorio/visao-geral", {
      params: { ano: selectedYear },
    });
    setVisaoGeral(data);
  };

  const carregarRelatorioCorridas = async () => {
    try {
      const { data } = await axiosConnect.get("/relatorio/corridas", {
        params: { ano: selectedYear },
      });

      setCorridasResumo({
        totalCorridas: data.resumo.totalCorridas,
        porSituacao: data.resumo.porSituacao.map((item: any) => ({
          name: item.situacao,
          value: item.quantidade,
        })),
      });

      setDesempenhoMotoristas(
        data.desempenhoMotoristas.map((m: any) => ({
          motorista: m.nome,
          Corridas: m.corridas,
        })),
      );

      setCorridasTabela(
        data.tabela.map((c: any) => ({
          id: c.id,
          motorista: c.motorista,
          veiculo: c.veiculo,
          situacao: c.situacao,
          dataInicio: new Date(c.dataInicio).toLocaleString("pt-BR"),
          dataTermino: c.dataTermino
            ? new Date(c.dataTermino).toLocaleString("pt-BR")
            : "—",
          localSaida: c.localSaida ?? "—",
        })),
      );
    } catch (e) {
      setError("Erro ao carregar relatório de corridas");
    }
  };

  const carregarRelatorioVeiculos = async () => {
    try {
      const { data } = await axiosConnect.get("/relatorio/veiculos", {
        params: { ano: selectedYear },
      });

      setCarrosResumo(data.resumo);

      setCarrosSituacao(
        data.situacaoFrota.map((s: any) => ({
          name: s.situacao,
          value: s.quantidade,
        })),
      );

      setDesempenhoCarros(
        data.desempenhoVeiculos.map((v: any) => ({
          veiculo: v.veiculo,
          Corridas: v.corridas,
        })),
      );

      setCarrosTabela(data.tabela);
    } catch (e) {
      setError("Erro ao carregar relatório de veículos");
    }
  };

  const carregarRelatorioAbastecimentos = async () => {
    try {
      const { data } = await axiosConnect.get("/relatorio/abastecimentos", {
        params: { ano: selectedYear },
      });

      setAbastecimentoResumo(data.resumo);
      setAbastecimentoCustoPorCombustivel(data.custoPorCombustivel);
      setAbastecimentoConsumoMensal(data.consumoMensal);
      setAbastecimentoConsumoPorCampus(
        data.consumoPorCampus.map((item: any) => ({
          name: item.campus,
          litros: item.litros,
          valor: item.valor,
        })),
      );
    } catch {
      setError("Erro ao carregar relatório de abastecimentos");
    }
  };

  const carregarRelatorioMultas = async () => {
    try {
      const { data } = await axiosConnect.get("/relatorio/multas", {
        params: { ano: selectedYear },
      });
      setMultasResumo(data.resumo);
      setMultasPorClassificacao(data.multasPorClassificacao || []);
      setMultasPorVeiculo(
        (data.multasPorVeiculo || []).map((v: any) => ({
          placa: v.placaVeiculo,
          quantidade: v.quantidade,
        })),
      );
    } catch {
      setError("Erro ao carregar relatório de multas");
    }
  };

  const carregarRelatorioOcorrencias = async () => {
    try {
      const { data } = await axiosConnect.get("/relatorio/ocorrencias", {
        params: { ano: selectedYear },
      });
      setOcorrenciasResumo(data.resumo);
      setOcorrenciasPorVeiculo(data.ocorrenciasPorVeiculo);
    } catch {
      setError("Erro ao carregar relatório de ocorrências");
    }
  };

  const tabs = [
    { label: "VISÃO GERAL", icon: <Assignment />, value: 0 },
    { label: "CORRIDAS", icon: <Speed />, value: 1 },
    { label: "VEÍCULOS", icon: <DirectionsCar />, value: 2 },
    { label: "ABASTECIMENTOS", icon: <LocalGasStation />, value: 3 },
    { label: "MULTAS", icon: <Gavel />, value: 4 },
    { label: "OCORRÊNCIAS", icon: <WarningAmber />, value: 5 },
  ];

  const rechartsTooltipStyle = {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.background.paper,
    color: theme.palette.mode === "dark" ? "white" : theme.palette.text.primary,
    border: `1px solid ${theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 12px rgba(0,0,0,0.5)"
        : "0 4px 12px rgba(0,0,0,0.08)",
  };

  const rechartsTooltipLabelStyle = {
    color: theme.palette.mode === "dark" ? "#fff" : theme.palette.text.primary,
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="80vh"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={50} />
          <Typography variant="h6" color="text.secondary">
            Carregando dados do relatório...
          </Typography>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight="bold" color="textPrimary">
            Relatórios
          </Typography>
          <ExportarRelatorioPDF
            visaoGeral={visaoGeral}
            corridasResumo={corridasResumo}
            desempenhoMotoristas={desempenhoMotoristas}
            corridasTabela={corridasTabela}
            carrosResumo={carrosResumo}
            carrosSituacao={carrosSituacao}
            desempenhoCarros={desempenhoCarros}
            carrosTabela={carrosTabela}
            abastecimentoResumo={abastecimentoResumo}
            abastecimentoCustoPorCombustivel={abastecimentoCustoPorCombustivel}
            abastecimentoConsumoMensal={abastecimentoConsumoMensal}
            abastecimentoConsumoPorCampus={abastecimentoConsumoPorCampus}
            multasResumo={multasResumo}
            multasPorClassificacao={multasPorClassificacao}
            multasPorVeiculo={multasPorVeiculo}
            ocorrenciasResumo={ocorrenciasResumo}
            ocorrenciasPorVeiculo={ocorrenciasPorVeiculo}
            selectedYear={selectedYear}
          />
        </Box>

        {/* Cabeçalho: Abas + Filtros */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            mb: 2,
            gap: 2,
          }}
        >
          {/* Abas de navegação */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              flexWrap: "wrap",
              minHeight: "40px",
            }}
          >
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "contained" : "outlined"}
                onClick={() => setActiveTab(tab.value)}
                startIcon={tab.icon}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  height: "40px",
                  fontWeight: activeTab === tab.value ? 600 : 500,
                  color: activeTab === tab.value ? "white" : "text.primary",
                  bgcolor:
                    activeTab === tab.value
                      ? theme.palette.info.main
                      : "background.paper",
                  "&:hover": {
                    bgcolor:
                      activeTab === tab.value
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                  },
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>

          {/* Filtro de Ano */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              minHeight: "40px",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120, height: "40px" }}>
              <InputLabel
                id="ano-label"
                sx={{
                  color: theme.palette.text.secondary,
                  "&.Mui-focused": {
                    color: theme.palette.text.secondary,
                  },
                }}
              >
                Ano
              </InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                label="Ano"
                sx={{
                  borderRadius: 2,
                  height: "40px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.text.secondary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.text.secondary,
                  },
                }}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* --- VISÃO GERAL --- */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" color="text.primary" mt={3} gutterBottom>
                Indicadores Principais ({selectedYear})
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <StatCard
                title="Total de Corridas"
                value={corridasResumo.totalCorridas}
                icon={<Speed fontSize="large" />}
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <StatCard
                title="Frota Ativa"
                value={visaoGeral.totalVeiculos}
                icon={<DirectionsCar fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <StatCard
                title="Gasto c/ Combustível"
                value={`R$ ${visaoGeral.totalGastoCombustivel.toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}`}
                icon={<LocalGasStation fontSize="large" />}
                trend="down"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <StatCard
                title="Multas"
                value={visaoGeral.totalMultas}
                icon={<Gavel fontSize="large" />}
                trend="down"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <StatCard
                title="Ocorrências"
                value={visaoGeral.totalOcorrencias}
                icon={<WarningAmber fontSize="large" />}
                trend="down"
              />
            </Grid>
          </Grid>
        )}

        {/* --- CORRIDAS --- */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {/* Gráfico: Situação das Corridas */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Situação das Corridas
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={corridasResumo.porSituacao}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {corridasResumo.porSituacao.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.text.primary }}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Gráfico: Corridas por Motorista */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Motoristas com maior número de corridas
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    layout="vertical"
                    data={desempenhoMotoristas}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="motorista"
                      width={200}
                      tick={{ fontSize: 12 }}
                      tickMargin={8}
                    />
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.primary.main }}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                    <Bar dataKey="Corridas" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Tabela de Corridas */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Relatório de Corridas
                </Typography>
                <DataGrid
                  autoHeight
                  rows={corridasTabela}
                  columns={[
                    // { field: "motorista", headerName: "Motorista", flex: 1 },
                    {
                      field: "motorista",
                      headerName: "Motorista",
                      flex: 1,
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
                            <MuiTooltip 
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
                                        sx={{ fontSize: 14, color: "text.primary" }}
                                      />
                                      <Typography variant="body2" color="text.primary">
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
                            </MuiTooltip>
                          </Box>
                        );
                      },
                    },
                    { field: "veiculo", headerName: "Veículo", flex: 0.6 },
                    { field: "situacao", headerName: "Situação", flex: 1 },
                    {
                      field: "dataInicio",
                      headerName: "Data/Hora Início",
                      flex: 1.5,
                    },
                    {
                      field: "dataTermino",
                      headerName: "Data/Hora Término",
                      flex: 1.5,
                    },
                    {
                      field: "localSaida",
                      headerName: "Local de Saída",
                      flex: 1.5,
                    },
                  ]}
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } },
                  }}
                  localeText={
                    ptBR.components.MuiDataGrid.defaultProps.localeText
                  }
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* --- VEÍCULOS --- */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            {/* Cards Estatísticos */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de Veículos"
                value={carrosResumo.totalVeiculos}
                icon={<DirectionsCar fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Veículos em Operação"
                value={carrosResumo.emOperacao}
                icon={<Speed fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Veículos em Manutenção"
                value={carrosResumo.emManutencao}
                icon={<WarningAmber fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Veículos Ociosos"
                value={carrosResumo.ociosos}
                icon={<Assignment fontSize="large" />}
              />
            </Grid>

            {/* Gráfico: Situação da Frota */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Situação da Frota
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={carrosSituacao}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      label
                    >
                      {carrosSituacao.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            SITUACAO_VEICULO_COLORS[entry.name] ||
                            PIE_COLORS[index]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.text.primary }}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Gráfico: Veículos Mais Utilizados */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Veículos Mais Utilizados
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    layout="vertical"
                    data={desempenhoCarros}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="veiculo"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.primary.main }}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                    <Bar
                      dataKey="Corridas"
                      fill={theme.palette.secondary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Tabela Detalhada de Veículos */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Relatório Detalhado de Veículos
                </Typography>
                <DataGrid
                  autoHeight
                  rows={carrosTabela}
                  columns={[
                    { field: "placa", headerName: "Placa", flex: 1 },
                    { field: "modelo", headerName: "Modelo", flex: 1 },
                    { field: "situacao", headerName: "Situação", flex: 1 },
                    {
                      field: "localidadeFisica",
                      headerName: "Campus",
                      flex: 1,
                    },
                    {
                      field: "totalCorridas",
                      headerName: "Total de Corridas",
                      flex: 1,
                      type: "number",
                    },
                    {
                      field: "statusUtilizacao",
                      headerName: "Status Utilização",
                      flex: 1,
                      renderCell: (params) => (
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              params.value === "Ocioso"
                                ? "warning.main"
                                : params.value === "Superutilizado"
                                  ? "error.main"
                                  : "success.main",
                            fontWeight: "bold",
                          }}
                        >
                          {params.value}
                        </Typography>
                      ),
                    },
                  ]}
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } },
                    sorting: {
                      sortModel: [{ field: "totalCorridas", sort: "desc" }],
                    },
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* --- ABASTECIMENTOS --- */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            {/* Cards */}
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Custo Total"
                value={`R$ ${abastecimentoResumo.totalValor.toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2 },
                )}`}
                icon={<Money fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Total Abastecido"
                value={`${abastecimentoResumo.totalLitros.toFixed(2)} Litros`}
                icon={<LocalGasStation fontSize="large" />}
              />
            </Grid>

            {/* Pizza: custo por tipo de combustível */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Custo por Tipo de Combustível
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={abastecimentoCustoPorCombustivel}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `R$ ${entry.value.toFixed(2)}`}
                    >
                      {abastecimentoCustoPorCombustivel.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        `R$ ${
                          typeof value === "number" ? value.toFixed(2) : value
                        }`
                      }
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.text.primary }}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Consumo mensal (litros x valor) */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Consumo Mensal
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={abastecimentoConsumoMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      labelStyle={rechartsTooltipLabelStyle}
                      formatter={(value, name, props) => {
                        const label = `${name}: ${value}`;
                        return [
                          <span style={{ color: props.color }}>{label}</span>,
                        ];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="Litros"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="Valor"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Consumo por Campus */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Consumo por Campus
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    layout="vertical"
                    data={abastecimentoConsumoPorCampus}
                    margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.primary.main }}
                      labelStyle={rechartsTooltipLabelStyle}
                      formatter={(value: number) => `${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="litros"
                      fill={theme.palette.info.main}
                      name="Litros"
                    />
                    <Bar
                      dataKey="valor"
                      fill={theme.palette.success.main}
                      name="Valor (R$)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* --- MULTAS --- */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            {/* Card: Total de Multas */}
            <Grid item xs={12} md={6}>
              <StatCard
                title="Total de Multas"
                value={multasResumo.totalMultas}
                icon={<Gavel fontSize="large" />}
                trend="down"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatCard
                title="Custo Total"
                value={`R$ ${multasResumo.totalCustoMultas.toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2 },
                )}`}
                icon={<Money fontSize="large" />}
              />
            </Grid>

            {/* Gráfico: Multas por Classificacao de Infração */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Multas por Classificação
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={multasPorClassificacao}
                      dataKey="quantidade"
                      nameKey="classificacao"
                      label={(entry) => `${entry.value}`}
                    >
                      {multasPorClassificacao.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Gráfico: Multas por Veículo */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Veículos com Mais Multas
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={multasPorVeiculo.slice(0, 10)} // top 10
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="placa"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.primary.main }}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                    <Bar
                      dataKey="quantidade"
                      name="Quantidade"
                      fill={theme.palette.secondary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* --- OCORRÊNCIAS --- */}
        {activeTab === 5 && (
          <Grid container spacing={3}>
            {/* Card: Total de Ocorrências */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de Ocorrências"
                value={ocorrenciasResumo.totalOcorrencias}
                icon={<WarningAmber fontSize="large" />}
                trend="down"
              />
            </Grid>

            {/* Gráfico: Ocorrências por Veículo */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Veículos com Mais Ocorrências
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    layout="vertical"
                    data={ocorrenciasPorVeiculo}
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="placa"
                      width={75}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={rechartsTooltipStyle}
                      itemStyle={{ color: theme.palette.primary.main }}
                      labelStyle={rechartsTooltipLabelStyle}
                    />
                    <Legend />
                    <Bar
                      dataKey="quantidade"
                      name="Quantidade"
                      fill={theme.palette.warning.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </AppLayout>
  );
};

export default Relatorios;
