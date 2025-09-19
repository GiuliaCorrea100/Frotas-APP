import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, FormControl, InputLabel, Select,
    MenuItem, Button, CircularProgress, useTheme
} from '@mui/material';

import Grid from '@mui/material/Grid';

import {
    Assignment, DirectionsCar, LocalGasStation, Gavel, Report,
    TrendingUp, TrendingDown, Money, Speed, WarningAmber
} from '@mui/icons-material';
import {
    BarChart, PieChart, LineChart, AreaChart, Pie, Bar, Line, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Importe seus serviços
import AbastecimentoService from "../../api/abastecimentoService";
import { CarrosService } from "../../api/carrosService";
import { getCorridas } from "../../api/corridaService";
import { OcorrenciaService } from "../../api/ocorrenciasService";
import { listarMultas } from "../../api/multaService";
import Menu from "../Menu";

// --- Paletas de Cores Consistentes ---
const PIE_COLORS = ['#FF9800', '#4CAF50', '#2196F3', '#F44336', '#9C27B0', '#795548', '#607D8B'];

const SITUACAO_VEICULO_COLORS: { [key: string]: string } = {
    'DISPONIVEL': '#4CAF50',
    'VIAGEM': '#2196F3',
    'RESERVADO': '#FF9800',
    'MANUTENCAO': '#F44336',
};

// --- Tipagem para as Props do StatCard ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
}

// --- Componente Reutilizável StatCard ---
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
    const theme = useTheme();
    const trendColor = trend === 'up' ? theme.palette.success.main : trend === 'down' ? theme.palette.error.main : theme.palette.primary.main;

    return (
        <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, height: '100%', borderRadius: 2 }}>
            <Box sx={{ color: trendColor }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">{title}</Typography>
                <Typography variant="h5" fontWeight="bold">{value}</Typography>
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

    // Estados para dados brutos da API
    const [corridas, setCorridas] = useState<any[]>([]);
    const [carros, setCarros] = useState<any[]>([]);
    const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [multas, setMultas] = useState<any[]>([]);

    useEffect(() => {
        const carregarTodosDados = async () => {
            setLoading(true);
            setError(null);
            try {
                const [corridasData, carrosData, abastecData, ocorrData, multasData] = await Promise.all([
                    getCorridas(),
                    CarrosService.buscarTodos(),
                    AbastecimentoService.buscarTodosAbastecimentos({ expand: true }),
                    OcorrenciaService.buscarTodos(),
                    listarMultas(),
                ]);
                
                setCorridas(corridasData);
                setCarros(carrosData);
                setAbastecimentos(abastecData);
                setOcorrencias(ocorrData);
                setMultas(multasData);
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                setError("Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        };
        carregarTodosDados();
    }, []);

    // Função para calcular consumo por campus
const calcularConsumoPorCampus = useMemo(() => {
    const consumoPorCampusMap: {[key: string]: number} = {};
    
    // Filtrar apenas abastecimentos do ano selecionado
    const abastecimentosDoAno = abastecimentos.filter(abastecimento => {
        if (!abastecimento.dataAbastecimento) return false;
        return new Date(abastecimento.dataAbastecimento).getFullYear() === selectedYear;
    });

    abastecimentosDoAno.forEach(abastecimento => {
        // Verificar se tem litros válidos
        const litros = parseFloat(abastecimento.litros) || 0;
        if (litros <= 0) return;

        let campus = 'Não especificado';
        
        if (abastecimento.carros?.localidade_fisica) {
            campus = abastecimento.carros.localidade_fisica;
        } 
        else if (abastecimento.idCorrida?.veiculo?.localidade_fisica) {
            campus = abastecimento.idCorrida.veiculo.localidade_fisica;
        }
        else if (abastecimento.localidade_fisica) {
            campus = abastecimento.localidade_fisica;
        }

        consumoPorCampusMap[campus] = (consumoPorCampusMap[campus] || 0) + litros;
    });
    
    // Converter para array e ordenar
    const resultado = Object.entries(consumoPorCampusMap)
        .map(([campus, litros]) => ({
            campus,
            litros: parseFloat(litros.toFixed(2))
        }))
        .sort((a, b) => b.litros - a.litros);

    console.log("Consumo por campus:", resultado);
    return resultado;
}, [abastecimentos, selectedYear]);


    // Otimização: Filtra e processa dados apenas quando o ano ou os dados brutos mudam
    const dadosFiltrados = useMemo(() => {
        const filtrarPorAno = (item: any, dateField: string) => {
            if (!item[dateField]) return false;
            return new Date(item[dateField]).getFullYear() === selectedYear;
        };
        return {
            corridas: corridas.filter(item => filtrarPorAno(item, 'dataInicio')),
            multas: multas.filter(item => filtrarPorAno(item, 'data')),
            abastecimentos: abastecimentos.filter(item => filtrarPorAno(item, 'dataAbastecimento')),
            ocorrencias: ocorrencias.filter(item => filtrarPorAno(item, 'dataOcorrencia') || filtrarPorAno(item, 'dataCriacao')),
            carros: carros, // Frota é um estado atual, não filtrado por ano
        };
    }, [corridas, carros, abastecimentos, ocorrencias, multas, selectedYear]);

    // Otimização: Prepara os dados para todos os gráficos
    const dadosGraficos = useMemo(() => {
        // Visão Geral
        const totalGastoCombustivel = dadosFiltrados.abastecimentos.reduce((acc, item) => acc + parseFloat(item.precoFinal || 0), 0);
        const totalMultas = dadosFiltrados.multas.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);

        // Abastecimentos
        const custoPorCombustivel = dadosFiltrados.abastecimentos.reduce((acc: { [key: string]: number }, abs) => {
            const tipo = abs.tipo_combustivel?.nome || 'Não especificado';
            acc[tipo] = (acc[tipo] || 0) + parseFloat(abs.precoFinal || 0);
            return acc;
        }, {});

        return {
            visaoGeral: {
                totalCorridas: dadosFiltrados.corridas.length,
                totalVeiculos: dadosFiltrados.carros.length,
                totalGastoCombustivel,
                totalMultas: totalMultas,
                totalOcorrencias: dadosFiltrados.ocorrencias.length,
            },
            corridas: {
                porSituacao: [
                    { name: "Agendada", value: dadosFiltrados.corridas.filter(c => c.situacao === "AGENDADA").length },
                    { name: "Finalizada", value: dadosFiltrados.corridas.filter(c => c.situacao === "FINALIZADA").length },
                    { name: "Em Andamento", value: dadosFiltrados.corridas.filter(c => c.situacao === "EM ANDAMENTO").length },
                ]
            },
            veiculos: {
                porSituacao: Object.entries(
                    dadosFiltrados.carros.reduce((acc: { [key: string]: number }, carro) => {
                        const situacao = carro.situacao || 'INDEFINIDA';
                        acc[situacao] = (acc[situacao] || 0) + 1;
                        return acc;
                    }, {})
                ).map(([name, value]) => ({ name, value }))
            },
            abastecimentos: {
                totalLitros: dadosFiltrados.abastecimentos.reduce((acc, item) => acc + parseFloat(item.litros || 0), 0),
                custoPorCombustivel: Object.entries(custoPorCombustivel).map(([name, value]) => ({ name, value })),
            },
            multas: {
                totalMultas: dadosFiltrados.multas.length,
            }
        };
    }, [dadosFiltrados]);

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
                <Box display="flex" justifyContent="center" alignItems="center" height="80vh" flexDirection="column" gap={2}>
                    <CircularProgress size={50} />
                    <Typography variant="h6" color="text.secondary">Carregando dados do relatório...</Typography>
                </Box>
            </>
        );
    }

    return (
        <>
            <Menu />
            <Box sx={{ p: 3 }}>
                <Paper sx={{ width: '100%', mb: 3, position: 'relative' }} elevation={2}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            {tabs.map((tab) => (
                                <Button key={tab.value} disableRipple onClick={() => setActiveTab(tab.value)} startIcon={tab.icon}
                                    sx={{ p: 2, borderRadius: 0, borderBottom: activeTab === tab.value ? 3 : 0, borderColor: 'primary.main', color: activeTab === tab.value ? 'primary.main' : 'text.primary', fontWeight: activeTab === tab.value ? 'bold' : 400, textTransform: 'none', '&:hover': { bgcolor: 'action.hover' } }}
                                >{tab.label}</Button>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Ano</InputLabel>
                                <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} label="Ano">
                                    <MenuItem value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</MenuItem>
                                    <MenuItem value={new Date().getFullYear()}>{new Date().getFullYear()}</MenuItem>
                                    <MenuItem value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Paper>
                
                {error && <Typography color="error">{error}</Typography>}

                {/* --- CONTEÚDO DAS ABAS --- */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}><Typography variant="h5" gutterBottom>Indicadores Principais ({selectedYear})</Typography></Grid>
                        <Grid item xs={12} sm={6} md={3}><StatCard title="Total de Corridas" value={dadosGraficos.visaoGeral.totalCorridas} icon={<Speed fontSize="large" />} trend="up" /></Grid>
                        <Grid item xs={12} sm={6} md={3}><StatCard title="Frota Ativa" value={dadosGraficos.visaoGeral.totalVeiculos} icon={<DirectionsCar fontSize="large" />} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><StatCard title="Gasto c/ Combustível" value={`R$ ${dadosGraficos.visaoGeral.totalGastoCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<LocalGasStation fontSize="large" />} trend="down" /></Grid>
                        <Grid item xs={12} sm={6} md={3}><StatCard title="Ocorrências e Multas" value={`${dadosGraficos.visaoGeral.totalOcorrencias} / ${dadosGraficos.multas.totalMultas}`} icon={<WarningAmber fontSize="large" />} trend="down" /></Grid>
                    </Grid>
                )}
                
                {/* --- CONTEÚDO DA ABA CORRIDAS --- */}
                {activeTab === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom>Análise de Corridas ({selectedYear})</Typography>
                        </Grid>
                        
                        {/* Gráfico: Situação das Corridas */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                                <Typography variant="h6" gutterBottom>Situação das Corridas</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={dadosGraficos.corridas.porSituacao}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {dadosGraficos.corridas.porSituacao.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
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
                                <Typography variant="h6" gutterBottom>Top Motoristas por Número de Corridas</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart
                                        layout="vertical"
                                        data={
                                            Object.values(
                                                dadosFiltrados.corridas.reduce((acc: any, corrida: any) => {
                                                    const motorista = corrida.motorista?.nome || corrida.nomeMotorista || 'N/A';
                                                    acc[motorista] = acc[motorista] || { motorista, Corridas: 0 };
                                                    acc[motorista].Corridas++;
                                                    return acc;
                                                }, {})
                                            )
                                            .sort((a: any, b: any) => b.Corridas - a.Corridas)
                                            .slice(0, 10)
                                        }
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="motorista" width={100} />
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
                                <Typography variant="h6" gutterBottom>Relatório de Corridas</Typography>
                                <DataGrid
                                    autoHeight
                                    rows={dadosFiltrados.corridas.map((corrida, index) => ({
                                        id: corrida.idCorrida || index + 1,
                                        motorista: corrida.motorista?.nome || corrida.nomeMotorista || "N/A",
                                        veiculo: corrida.veiculo?.placa || corrida.placaVeiculo || "N/A",
                                        situacao: corrida.situacao || "N/A",
                                        dataInicio: new Date(corrida.dataInicio).toLocaleString('pt-BR'),
                                        dataTermino: corrida.dataTermino 
                                            ? new Date(corrida.dataTermino).toLocaleString('pt-BR')
                                            : "—",
                                        localSaida: corrida.localSaida || "—"
                                    }))}
                                    columns={[
                                        { field: 'motorista', headerName: 'Motorista', flex: 1 },
                                        { field: 'veiculo', headerName: 'Veículo', flex: 1 },
                                        { field: 'situacao', headerName: 'Situação', flex: 1 },
                                        { field: 'dataInicio', headerName: 'Data/Hora Início', flex: 1.5 },
                                        { field: 'dataTermino', headerName: 'Data/Hora Término', flex: 1.5 },
                                        { field: 'localSaida', headerName: 'Local de Saída', flex: 1.5 },
                                    ]}
                                    pageSizeOptions={[5, 10, 20]}
                                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* --- CONTEÚDO DA ABA VEÍCULOS --- */}
                {activeTab === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom>Análise da Frota ({selectedYear})</Typography>
                        </Grid>
                        
                        {/* Cards Estatísticos */}
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard 
                                title="Total de Veículos" 
                                value={dadosFiltrados.carros.length} 
                                icon={<DirectionsCar fontSize="large" />} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard 
                                title="Veículos em Operação" 
                                value={dadosFiltrados.carros.filter(c => c.situacao === 'RESERVADO' || c.situacao === 'VIAGEM').length} 
                                icon={<Speed fontSize="large" />} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard 
                                title="Veículos em Manutenção" 
                                value={dadosFiltrados.carros.filter(c => c.situacao === 'MANUTENCAO').length} 
                                icon={<WarningAmber fontSize="large" />} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard 
                                title="Veículos Ociosos" 
                                value={dadosFiltrados.carros.filter(c => {
                                    const corridasVeiculo = dadosFiltrados.corridas.filter(corr => 
                                        corr.placaVeiculo === c.placa || corr.veiculo?.placa === c.placa
                                    );
                                    return corridasVeiculo.length === 0 && c.situacao === 'DISPONIVEL';
                                }).length} 
                                icon={<Assignment fontSize="large" />} 
                            />
                        </Grid>

                        {/* Gráfico: Situação da Frota */}
                        <Grid item xs={12} md={5}>
                            <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                                <Typography variant="h6" gutterBottom>Situação da Frota</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie 
                                            data={dadosGraficos.veiculos.porSituacao} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={70} 
                                            outerRadius={100} 
                                            paddingAngle={3} 
                                            label
                                        >
                                            {dadosGraficos.veiculos.porSituacao.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={SITUACAO_VEICULO_COLORS[entry.name] || PIE_COLORS[index]} />
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
                                <Typography variant="h6" gutterBottom>Veículos Mais Utilizados (Top 10)</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart 
                                        layout="vertical" 
                                        data={
                                            Object.values(dadosFiltrados.corridas.reduce((acc: any, c: any) => {
                                                const veiculo = c.placaVeiculo || c.veiculo?.placa || 'N/A';
                                                acc[veiculo] = acc[veiculo] || { veiculo, Corridas: 0 };
                                                acc[veiculo].Corridas++;
                                                return acc;
                                            }, {})).sort((a: any, b: any) => b.Corridas - a.Corridas).slice(0, 10)
                                        } 
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="veiculo" width={80} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend />
                                        <Bar dataKey="Corridas" fill={theme.palette.secondary.main} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>


                       {/* Gráfico de Consumo por Campus */}
<Grid item xs={12}>
    <Paper sx={{ p: 3, height: 450, background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)' }} elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ 
            fontWeight: 'bold', 
            color: '#2c3e50', 
            textAlign: 'center',
            fontSize: '1.1rem',
            mb: 3
        }}>
            CONSUMO POR CAMPUS ({selectedYear})
        </Typography>
        {calcularConsumoPorCampus.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={calcularConsumoPorCampus}
                    margin={{ top: 5, right: 20, left: 20, bottom: 25 }}
                    barGap={5}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis 
                        dataKey="campus" 
                        tick={{ fill: '#555', fontSize: 11, fontWeight: 500 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                    />
                    <YAxis 
                        tick={{ fill: '#555', fontSize: 11 }}
                        tickFormatter={(value) => {
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                            return value.toString();
                        }}
                    />
                    <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} litros`, '']}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#2c3e50' }}
                    />
                    <Bar 
                        dataKey="litros" 
                        name="Consumo"
                        fill="#3498db"
                        radius={[6, 6, 0, 0]}
                        background={{ fill: '#f8f9fa' }}
                    />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="text.secondary">
                    Nenhum dado de consumo disponível
                </Typography>
            </Box>
        )}
    </Paper>
</Grid>
                        {/* Tabela Detalhada de Veículos */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }} elevation={3}>
                                <Typography variant="h6" gutterBottom>Relatório Detalhado de Veículos</Typography>
                                <DataGrid
                                    autoHeight
                                    rows={dadosFiltrados.carros.map((veiculo) => {
                                        const corridasVeiculo = dadosFiltrados.corridas.filter(c => 
                                            c.placaVeiculo === veiculo.placa || c.veiculo?.placa === veiculo.placa
                                        );
                                        
                                        const tempoTotal = corridasVeiculo.reduce((total, corrida) => 
                                            total + (parseFloat(corrida.duracao) || 0), 0
                                        );
                                        const tempoMedio = corridasVeiculo.length > 0 ? (tempoTotal / corridasVeiculo.length) : 0;
                                        
                                        let statusUtilizacao = 'Normal';
                                        if (corridasVeiculo.length === 0) {
                                            statusUtilizacao = 'Ocioso';
                                        } else if (corridasVeiculo.length > 20) {
                                            statusUtilizacao = 'Superutilizado';
                                        }
                                        
                                        return {
                                            id: veiculo.idVeiculo || veiculo.placa,
                                            placa: veiculo.placa,
                                            modelo: veiculo.modelo || 'N/A',
                                            situacao: veiculo.situacao || 'N/A',
                                            localidade_fisica: veiculo.localidade_fisica || 'N/A',
                                            totalCorridas: corridasVeiculo.length,
                                            statusUtilizacao: statusUtilizacao,
                                        };
                                    })}
                                    columns={[
                                        { field: 'placa', headerName: 'Placa', flex: 1 },
                                        { field: 'modelo', headerName: 'Modelo', flex: 1 },
                                        { field: 'situacao', headerName: 'Situação', flex: 1 },
                                        { field: 'localidade_fisica', headerName: 'Campus', flex: 1 },
                                        { field: 'totalCorridas', headerName: 'Total de Corridas', flex: 1, type: 'number' },
                                        { 
                                            field: 'statusUtilizacao', 
                                            headerName: 'Status Utilização', 
                                            flex: 1,
                                            renderCell: (params) => (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: params.value === 'Ocioso' ? 'warning.main' : 
                                                            params.value === 'Superutilizado' ? 'error.main' : 
                                                            'success.main',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {params.value}
                                                </Typography>
                                            )
                                        },
                                    ]}
                                    pageSizeOptions={[5, 10, 20]}
                                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                                    initialState={{
                                        sorting: {
                                            sortModel: [{ field: 'totalCorridas', sort: 'desc' }],
                                        },
                                    }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* --- CONTEÚDO DA ABA ABASTECIMENTOS --- */}
                {activeTab === 3 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}><Typography variant="h5" gutterBottom>Análise de Abastecimentos ({selectedYear})</Typography></Grid>
                        <Grid item xs={12} sm={6}><StatCard title="Custo Total" value={`R$ ${dadosGraficos.visaoGeral.totalGastoCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Money fontSize="large" />} /></Grid>
                        <Grid item xs={12} sm={6}><StatCard title="Total Abastecido" value={`${dadosGraficos.abastecimentos.totalLitros.toFixed(2)} Litros`} icon={<LocalGasStation fontSize="large" />} /></Grid>
                        <Grid item xs={12} md={5}>
                            <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                                <Typography variant="h6" gutterBottom>Custo por Tipo de Combustível</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie data={dadosGraficos.abastecimentos.custoPorCombustivel} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {dadosGraficos.abastecimentos.custoPorCombustivel.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: ValueType) => `R$ ${typeof value === 'number' ? value.toFixed(2) : value}`} contentStyle={tooltipStyle} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                                <Typography variant="h6" gutterBottom>Consumo Mensal</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <AreaChart data={
                                        Array.from({ length: 12 }, (_, i) => {
                                            const mes = new Date(0, i).toLocaleString('pt-BR', { month: 'short' });
                                            const mesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1);
                                            let litros = 0;
                                            let valor = 0;
                                            dadosFiltrados.abastecimentos.forEach(abs => {
                                                if(new Date(abs.dataAbastecimento).getMonth() === i){
                                                    litros += parseFloat(abs.litros || 0);
                                                    valor += parseFloat(abs.precoFinal || 0);
                                                }
                                            });
                                            return { mes: mesFormatado, Litros: litros, Valor: valor };
                                        })
                                    }>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend />
                                        <Area yAxisId="left" type="monotone" dataKey="Litros" stroke="#8884d8" fill="#8884d8" />
                                        <Area yAxisId="right" type="monotone" dataKey="Valor" stroke="#82ca9d" fill="#82ca9d" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* --- CONTEÚDO DA ABA MULTAS E OCORRÊNCIAS --- */}
                {activeTab === 4 && (
                    <Grid container spacing={3}>
                        {/* --- Relatório de Ocorrências --- */}
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom> Relatório de Ocorrências ({selectedYear})</Typography>
                            <Paper sx={{ p: 2 }} elevation={3}>
                                <DataGrid
                                    autoHeight
                                    rows={dadosFiltrados.ocorrencias.map((o, index) => ({
                                        id: o.idOcorrencia || index + 1,
                                        data: new Date(o.dataOcorrencia || o.dataCriacao).toLocaleDateString('pt-BR'),
                                        veiculo: o.placaVeiculo || o.veiculo?.placa || "N/A",
                                        motorista: o.nomeMotorista || o.motorista?.nome || "N/A",
                                        descricao: o.descricao || "—",
                                        corrida: o.idCorrida || "N/A"
                                    }))}
                                    columns={[
                                        { field: 'data', headerName: 'Data', flex: 1 },
                                        { field: 'veiculo', headerName: 'Veículo', flex: 1 },
                                        { field: 'motorista', headerName: 'Motorista', flex: 1 },
                                        { field: 'descricao', headerName: 'Descrição', flex: 2 },
                                    ]}
                                    pageSizeOptions={[5, 10, 20]}
                                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                                />
                            </Paper>
                        </Grid>

                        {/* --- Relatório de Multas --- */}
                        <Grid item xs={12} md={7}>
                            <Typography variant="h5" gutterBottom>Relatório de Multas ({selectedYear})</Typography>
                            <Paper sx={{ p: 2 }} elevation={3}>
                                <DataGrid
                                    autoHeight
                                    rows={dadosFiltrados.multas.map((m, index) => ({
                                        id: index + 1,
                                        data: new Date(m.data).toLocaleDateString('pt-BR'),
                                        veiculo: m.placaVeiculo || "N/A",
                                        motorista: m.nomeMotorista || "N/A",
                                        valor: `R$ ${parseFloat(m.valor || 0).toFixed(2)}`,
                                        descricao: m.descricao || "—"
                                    }))}
                                    columns={[
                                        { field: 'data', headerName: 'Data', flex: 1 },
                                        { field: 'veiculo', headerName: 'Veículo', flex: 1 },
                                        { field: 'motorista', headerName: 'Motorista', flex: 1 },
                                        { field: 'valor', headerName: 'Valor', flex: 1 },
                                        { field: 'descricao', headerName: 'Descrição', flex: 2 },
                                    ]}
                                    pageSizeOptions={[5, 10, 20]}
                                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                                />
                            </Paper>
                        </Grid>

                        {/* --- Gráfico: Veículos mais multados --- */}
                        <Grid item xs={12} md={5}>
                            <Paper sx={{ p: 2, height: 400 }} elevation={3}>
                                <Typography variant="h6" gutterBottom>Veículos Mais Multados</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart
                                        layout="vertical"
                                        data={
                                            Object.values(
                                                dadosFiltrados.multas.reduce((acc: any, multa: any) => {
                                                    const veiculo = multa.placaVeiculo || 'N/A';
                                                    acc[veiculo] = acc[veiculo] || { veiculo, Multas: 0 };
                                                    acc[veiculo].Multas++;
                                                    return acc;
                                                }, {})
                                            )
                                            .sort((a: any, b: any) => b.Multas - a.Multas)
                                            .slice(0, 10)
                                        }
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="veiculo" width={100} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend />
                                        <Bar dataKey="Multas" fill={theme.palette.error.main} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </>
    );
};

export default Relatorios;