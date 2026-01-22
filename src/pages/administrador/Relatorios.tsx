// src/pages/administrador/Relatorios.tsx
import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
  Assignment,
  DirectionsCar,
  LocalGasStation,
  Gavel,
  Report,
  TrendingUp,
  TrendingDown,
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

import Menu from "../../components/Menu";
import axiosConnect from "../../services/axios/axiosConnect";

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
  const [desempenhoMotoristas, setDesempenhoMotoristas] = useState<{ motorista: string; Corridas: number }[]>([]);
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
  const [carrosSituacao, setCarrosSituacao] = useState<{ situacao: string; quantidade: number }[]>([]);
  const [desempenhoCarros, setDesempenhoCarros] = useState<{ veiculo: string; Corridas: number }[]>([]);
  const [carrosTabela, setCarrosTabela] = useState<any[]>([]);
  const [abastecimentoResumo, setAbastecimentoResumo] = useState({
	totalLitros: 0,
	totalValor: 0,
	});
	const [abastecimentoCustoPorCombustivel, setAbastecimentoCustoPorCombustivel] = useState<any[]>([]);
	const [abastecimentoConsumoMensal, setAbastecimentoConsumoMensal] = useState<any[]>([]);
	const [abastecimentoTabela, setAbastecimentoTabela] = useState<any[]>([]);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [multas, setMultas] = useState<any[]>([]);

  // Estados para o consumo por campus
  const [consumoPorCampus, setConsumoPorCampus] = useState<
    { campus: string; litrosTotal: number }[]
  >([]);
  const [loadingConsumo, setLoadingConsumo] = useState(false);

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
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };
  carregarTodosDados();
}, [selectedYear]);
  
  const carregarVisaoGeral = async () => {
	const { data } = await axiosConnect.get('/relatorio/visao-geral', {
		params: { ano: selectedYear },
	});
	setVisaoGeral(data);
	};

  const carregarRelatorioCorridas = async () => {
	try {
		const { data } = await axiosConnect.get(
			'/relatorio/corridas',
			{ params: { ano: selectedYear } },
		);

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
		}))
		);

		setCorridasTabela(
		data.tabela.map((c: any) => ({
			id: c.id,
			motorista: c.motorista,
			veiculo: c.veiculo,
			situacao: c.situacao,
			dataInicio: new Date(c.dataInicio).toLocaleString('pt-BR'),
			dataTermino: c.dataTermino
			? new Date(c.dataTermino).toLocaleString('pt-BR')
			: '—',
			localSaida: c.localSaida ?? '—',
		}))
		);
	} catch (e) {
		setError('Erro ao carregar relatório de corridas');
	}
  };

  const carregarRelatorioVeiculos = async () => {
	try {
	const { data } = await axiosConnect.get('/relatorio/veiculos', {
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
	setError('Erro ao carregar relatório de veículos');
	}
  };

const carregarRelatorioAbastecimentos = async () => {
  try {
    const { data } = await axiosConnect.get('/relatorio/abastecimentos', {
      params: { ano: selectedYear },
    });

    setAbastecimentoResumo(data.resumo);
    setAbastecimentoCustoPorCombustivel(data.custoPorCombustivel);
    setAbastecimentoConsumoMensal(data.consumoMensal);
    setAbastecimentoTabela(data.tabela);
  } catch {
    setError('Erro ao carregar relatório de abastecimentos');
  }
};

  const tabs = [
    { label: "Visão Geral", icon: <Assignment />, value: 0 },
    { label: "Corridas", icon: <Speed />, value: 1 },
    { label: "Veículos", icon: <DirectionsCar />, value: 2 },
    { label: "Abastecimentos", icon: <LocalGasStation />, value: 3 },
    { label: "Multas e Ocorrências", icon: <Gavel />, value: 4 },
  ];

  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  };

  if (loading) {
    return (
      <>
        <Menu />
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
      </>
    );
  }

  return (
    <>
      <Menu />
      <Box sx={{ p: 3 }}>
        <Paper
          sx={{ width: "100%", mb: 3, position: "relative" }}
          elevation={2}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  disableRipple
                  onClick={() => setActiveTab(tab.value)}
                  startIcon={tab.icon}
                  sx={{
                    p: 2,
                    borderRadius: 0,
                    borderBottom: activeTab === tab.value ? 3 : 0,
                    borderColor: "primary.main",
                    color:
                      activeTab === tab.value ? "primary.main" : "text.primary",
                    fontWeight: activeTab === tab.value ? "bold" : 400,
                    textTransform: "none",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Ano</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  label="Ano"
                >
                  <MenuItem value={new Date().getFullYear() - 1}>
                    {new Date().getFullYear() - 1}
                  </MenuItem>
                  <MenuItem value={new Date().getFullYear()}>
                    {new Date().getFullYear()}
                  </MenuItem>
                  <MenuItem value={new Date().getFullYear() + 1}>
                    {new Date().getFullYear() + 1}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {error && <Typography color="error">{error}</Typography>}

        {/* --- VISÃO GERAL --- */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" color="text.primary" gutterBottom>
                Indicadores Principais ({selectedYear})
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de Corridas"
                value={corridasResumo.totalCorridas}
                icon={<Speed fontSize="large" />}
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Frota Ativa"
                value={visaoGeral.totalVeiculos}
                icon={<DirectionsCar fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Gasto c/ Combustível"
                value={`R$ ${visaoGeral.totalGastoCombustivel.toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}`}
                icon={<LocalGasStation fontSize="large" />}
                trend="down"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Ocorrências e Multas"
                value={`${visaoGeral.totalOcorrencias} / ${visaoGeral.totalMultas}`}
                icon={<WarningAmber fontSize="large" />}
                trend="down"
              />
            </Grid>
          </Grid>
        )}

        {/* --- CORRIDAS --- */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" color="text.primary" gutterBottom>
                Análise de Corridas ({selectedYear})
              </Typography>
            </Grid>

            {/* Gráfico: Situação das Corridas */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Situação das Corridas
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
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
                      {corridasResumo.porSituacao.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Gráfico: Corridas por Motorista */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Motoristas com maior número de corridas
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
					layout="vertical"
					data={desempenhoMotoristas}
					margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis type="number" />
					<YAxis type="category" dataKey="motorista" width={200}  tick={{ fontSize: 12 }} tickMargin={8} />
					<Tooltip contentStyle={tooltipStyle} />
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
						{ field: 'motorista', headerName: 'Motorista', flex: 1 },
						{ field: 'veiculo', headerName: 'Veículo', flex: 1 },
						{ field: 'situacao', headerName: 'Situação', flex: 1 },
						{ field: 'dataInicio', headerName: 'Data/Hora Início', flex: 1.5 },
						{ field: 'dataTermino', headerName: 'Data/Hora Término', flex: 1.5 },
						{ field: 'localSaida', headerName: 'Local de Saída', flex: 1.5 },
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
				<Grid item xs={12}>
					<Typography variant="h5" color="text.primary" gutterBottom>Análise da Frota ({selectedYear})</Typography>
				</Grid>
                        
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
						<Typography variant="h6" color="text.primary" gutterBottom>Situação da Frota</Typography>
						<ResponsiveContainer width="100%" height="90%">
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
											fill={SITUACAO_VEICULO_COLORS[entry.name] || PIE_COLORS[index]}
											/>
									))}
								</Pie>
								<Tooltip contentStyle={tooltipStyle} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</Paper>
				</Grid>
				
				{/* Gráfico: Veículos Mais Utilizados */}
				<Grid item xs={12} md={7}>
					<Paper sx={{ p: 2, height: 400 }} elevation={3}>
						<Typography variant="h6" color="text.primary" gutterBottom>Veículos Mais Utilizados</Typography>
						<ResponsiveContainer width="100%" height="90%">
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
								<Tooltip contentStyle={tooltipStyle} />
								<Legend />
								<Bar dataKey="Corridas" fill={theme.palette.secondary.main} />
							</BarChart>
						</ResponsiveContainer>
					</Paper>
				</Grid>

				{/* Tabela Detalhada de Veículos */}
				<Grid item xs={12}>
					<Paper sx={{ p: 2 }} elevation={3}>
						<Typography variant="h6" color="text.primary" gutterBottom>Relatório Detalhado de Veículos</Typography>
						<DataGrid
							autoHeight
							rows={carrosTabela}
							columns={[
								{ field: 'placa', headerName: 'Placa', flex: 1 },
								{ field: 'modelo', headerName: 'Modelo', flex: 1 },
								{ field: 'situacao', headerName: 'Situação', flex: 1 },
								{ field: 'localidadeFisica', headerName: 'Campus', flex: 1 },
								{ field: 'totalCorridas', headerName: 'Total de Corridas', flex: 1, type: 'number' },
								 {
									field: 'statusUtilizacao',
									headerName: 'Status Utilização',
									flex: 1,
									renderCell: (params) => (
										<Typography
										variant="body2"
										sx={{
											color:
											params.value === 'Ocioso'
												? 'warning.main'
												: params.value === 'Superutilizado'
												? 'error.main'
												: 'success.main',
											fontWeight: 'bold',
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
								sortModel: [{ field: 'totalCorridas', sort: 'desc' }],
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
				<Grid item xs={12}>
				<Typography variant="h5" color="text.primary" gutterBottom>
					Análise de Abastecimentos ({selectedYear})
				</Typography>
				</Grid>

				{/* Cards */}
				<Grid item xs={12} sm={6}>
				<StatCard
					title="Custo Total"
					value={`R$ ${abastecimentoResumo.totalValor.toLocaleString(
					'pt-BR',
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
					<ResponsiveContainer width="100%" height="90%">
					<PieChart>
						<Pie
						data={abastecimentoCustoPorCombustivel}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={100}
						label
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
							`R$ ${typeof value === 'number'
							? value.toFixed(2)
							: value}`
						}
						contentStyle={tooltipStyle}
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
					<ResponsiveContainer width="100%" height="90%">
					<AreaChart data={abastecimentoConsumoMensal}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="mes" />
						<YAxis yAxisId="left" />
						<YAxis yAxisId="right" orientation="right" />
						<Tooltip contentStyle={tooltipStyle} />
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
			</Grid>
		)}

        {/* --- MULTAS E OCORRÊNCIAS --- */}
      </Box>
    </>
  );
};

export default Relatorios;
