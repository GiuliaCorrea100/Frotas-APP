import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, FormControl, InputLabel, Select,
  MenuItem, Button, useTheme
} from '@mui/material';
import {
  LocalGasStation, DirectionsCar, AttachMoney, TrendingUp, 
  TrendingDown, Download, Speed
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

// Componente de card de estatística
const StatCard = ({ title, value, icon, trend, subtitle, theme }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  theme: any;
}) => {
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#FF9800';
  
  return (
    <Paper sx={{ 
      p: 2.5,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      border: theme.palette.mode === 'dark' 
                  ? '1px solid #4C5157' 
                  : '1px solid #ddd',
      borderRadius: 2,
      transition: 'all 0.3s ease',
    }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: theme.palette.mode === 'dark' ? 
          theme.palette.grey[700] : 'white',
        color: trendColor
      }}>
        {icon}
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ 
          fontWeight: 'medium',
          fontSize: '0.875rem'
        }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold',
          color: theme.palette.text.primary
        }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {trend && (
        <Box sx={{ 
          ml: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}>
          {trend === 'up' ? (
            <TrendingUp sx={{ color: trendColor, fontSize: 28 }} />
          ) : (
            <TrendingDown sx={{ color: trendColor, fontSize: 28 }} />
          )}
        </Box>
      )}
    </Paper>
  );
};

const Relatorios: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para os dados das informações gerais
  const [informacoesGerais, setInformacoesGerais] = useState({
    situacaoVeiculos: [] as {name: string, value: number}[],
    consumoMensal: [] as {mes: string, litros: number}[],
    indicadores: {
      totalAbastecimentos: 0,
      custoTotal: 0,
      mediaConsumo: 0
    }
  });

  // Estado para os dados de abastecimentos
  const [abastecimentosData, setAbastecimentosData] = useState({
    mensal: [] as {mes: string, quantidade: number, valor: number}[],
    porTipoCombustivel: [] as {tipo: string, quantidade: number, valor: number}[],
    detalhado: [] as any[],
  });

  // Estado para os dados dos veículos
  const [veiculosData, setVeiculosData] = useState({
    desempenho: [] as {
      modelo: string;
      quilometragem: number;
      consumoMedio: number;
      custoTotal: number;
    }[],
    tabela: [] as {
      id: number;
      placa: string;
      modelo: string;
      status: string;
      quilometragem: number;
      consumoMedio: number;
      custoTotal: number;
    }[],
  });

  // Estado para os dados financeiros
  const [financeiroData, setFinanceiroData] = useState({
    custosMensais: [] as {mes: string, valor: number}[],
    porCategoria: [] as {categoria: string, valor: number}[],
    detalhado: [] as any[],
  });

  // Carrega os dados com base na tab ativa
  useEffect(() => {
    const carregarInformacoesGerais = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulação de dados - substitua pela chamada real à API
        const mockData = {
          situacaoVeiculos: [
            { name: 'Em uso', value: 15 },
            { name: 'Disponível', value: 8 },
            { name: 'Manutenção', value: 3 },
            { name: 'Inativo', value: 2 }
          ],
          consumoMensal: [
            { mes: 'Jan', litros: 1200 },
            { mes: 'Fev', litros: 980 },
            { mes: 'Mar', litros: 1450 },
            { mes: 'Abr', litros: 1100 },
            { mes: 'Mai', litros: 1300 },
            { mes: 'Jun', litros: 950 }
          ],
          indicadores: {
            totalAbastecimentos: 156,
            custoTotal: 28500.75,
            mediaConsumo: 8.5
          }
        };
        setInformacoesGerais(mockData);
      } catch (err) {
        console.error('Erro ao carregar informações gerais:', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    const carregarDadosAbastecimentos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulação de dados
        const mockData = {
          mensal: [
            { mes: 'Jan', quantidade: 25, valor: 4500 },
            { mes: 'Fev', quantidade: 18, valor: 3200 },
            { mes: 'Mar', quantidade: 32, valor: 5800 },
            { mes: 'Abr', quantidade: 22, valor: 3900 },
            { mes: 'Mai', quantidade: 28, valor: 5100 },
            { mes: 'Jun', quantidade: 20, valor: 3600 }
          ],
          porTipoCombustivel: [
            { tipo: 'Gasolina', quantidade: 85, valor: 15200 },
            { tipo: 'Etanol', quantidade: 45, valor: 7200 },
            { tipo: 'Diesel', quantidade: 26, valor: 6100 }
          ],
          detalhado: [
            { id: 1, data: '15/06/2023', veiculo: 'Fiat Toro', placa: 'ABC1234', combustivel: 'Gasolina', litros: 45, valorTotal: 315.00, precoLitro: 7.00, hodometro: 45230, motorista: 'João Silva', posto: 'Posto Ipiranga' },
            { id: 2, data: '10/06/2023', veiculo: 'VW Gol', placa: 'DEF5678', combustivel: 'Etanol', litros: 38, valorTotal: 190.00, precoLitro: 5.00, hodometro: 78210, motorista: 'Maria Santos', posto: 'Posto Shell' }
          ]
        };
        setAbastecimentosData(mockData);
      } catch (err) {
        console.error('Erro ao carregar dados de abastecimentos:', err);
        setError('Erro ao carregar dados de abastecimentos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    const carregarDadosVeiculos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulação de dados
        const mockData = {
          desempenho: [
            { modelo: 'Fiat Toro', quilometragem: 45230, consumoMedio: 8.2, custoTotal: 12500 },
            { modelo: 'VW Gol', quilometragem: 78210, consumoMedio: 10.5, custoTotal: 9800 },
            { modelo: 'Toyota Corolla', quilometragem: 32150, consumoMedio: 9.8, custoTotal: 11200 }
          ],
          tabela: [
            { id: 1, placa: 'ABC1234', modelo: 'Fiat Toro', status: 'Em uso', quilometragem: 45230, consumoMedio: 8.2, custoTotal: 12500 },
            { id: 2, placa: 'DEF5678', modelo: 'VW Gol', status: 'Disponível', quilometragem: 78210, consumoMedio: 10.5, custoTotal: 9800 },
            { id: 3, placa: 'GHI9012', modelo: 'Toyota Corolla', status: 'Em uso', quilometragem: 32150, consumoMedio: 9.8, custoTotal: 11200 }
          ]
        };
        setVeiculosData(mockData);
      } catch (err) {
        console.error('Erro ao carregar dados dos veículos:', err);
        setError('Erro ao carregar dados dos veículos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    const carregarDadosFinanceiros = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulação de dados
        const mockData = {
          custosMensais: [
            { mes: 'Jan', valor: 8500 },
            { mes: 'Fev', valor: 7200 },
            { mes: 'Mar', valor: 9800 },
            { mes: 'Abr', valor: 8100 },
            { mes: 'Mai', valor: 9200 },
            { mes: 'Jun', valor: 7500 }
          ],
          porCategoria: [
            { categoria: 'Abastecimento', valor: 28500 },
            { categoria: 'Manutenção', valor: 12500 },
            { categoria: 'Seguro', valor: 9800 },
            { categoria: 'Licenciamento', valor: 4500 }
          ],
          detalhado: [
            { id: 1, data: '15/06/2023', tipo: 'Abastecimento', categoria: 'Combustível', veiculo: 'Fiat Toro', descricao: 'Abastecimento gasolina', valor: 315.00, fornecedor: 'Posto Ipiranga' },
            { id: 2, data: '10/06/2023', tipo: 'Manutenção', categoria: 'Revisão', veiculo: 'VW Gol', descricao: 'Troca de óleo và filtros', valor: 450.00, fornecedor: 'Oficina Central' }
          ]
        };
        setFinanceiroData(mockData);
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
        setError('Erro ao carregar dados financeiros. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 0) {
      carregarInformacoesGerais();
    } else if (activeTab === 1) {
      carregarDadosAbastecimentos();
    } else if (activeTab === 2) {
      carregarDadosVeiculos();
    } else if (activeTab === 3) {
      carregarDadosFinanceiros();
    }
  }, [activeTab, selectedYear, selectedMonth]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho com tabs e filtros */}
      <Box sx={{ 
        width: '100%',
        mb: 3,
        borderBottom: 1,
        borderColor: 'divider',
        position: 'relative'
      }}>
        {/* Container das abas com scroll horizontal */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}>
          {[
            { 
              label: 'VISÃO GERAL', 
              value: 0,
              icon: <Speed fontSize="small" />,
              activeColor: '#1976d2'
            },
            { 
              label: 'ABASTECIMENTOS', 
              value: 1,
              icon: <LocalGasStation fontSize="small" />,
              activeColor: '#1976d2'
            },
            { 
              label: 'VEÍCULOS', 
              value: 2,
              icon: <DirectionsCar fontSize="small" />,
              activeColor: '#1976d2'
            },
            { 
              label: 'FINANCEIRO', 
              value: 3,
              icon: <AttachMoney fontSize="small" />,
              activeColor: '#1976d2'
            },
          ].map((tab) => (
            <Button
              key={tab.value}
              disableRipple
              onClick={() => setActiveTab(tab.value)}
              startIcon={tab.icon}
              sx={{
                minWidth: 'fit-content',
                px: 3,
                py: 1.5,
                borderRadius: 0,
                borderBottom: activeTab === tab.value ? 2 : 0,
                borderColor: tab.activeColor,
                color: activeTab === tab.value ? 
                  (theme.palette.mode === 'dark' ? '#90caf9' : tab.activeColor) : 
                  'text.primary',
                fontWeight: activeTab === tab.value ? 600 : 400,
                fontSize: '0.875rem',
                textTransform: 'none',
                position: 'relative',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.mode === 'dark' ? '#90caf9' : tab.activeColor
                }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Filtros e botão de exportação */}
        <Box sx={{
          position: 'absolute',
          right: 0,
          bottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Ano</InputLabel>
            <Select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              label="Ano"
            >
              <MenuItem value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</MenuItem>
              <MenuItem value={new Date().getFullYear()}>{new Date().getFullYear()}</MenuItem>
            </Select>
          </FormControl>
          
          {(activeTab === 1 || activeTab === 3) && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mês</InputLabel>
              <Select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                label="Mês"
              >
                <MenuItem value={1}>Janeiro</MenuItem>
                <MenuItem value={2}>Fevereiro</MenuItem>
                <MenuItem value={3}>Março</MenuItem>
                <MenuItem value={4}>Abril</MenuItem>
                <MenuItem value={5}>Maio</MenuItem>
                <MenuItem value={6}>Junho</MenuItem>
                <MenuItem value={7}>Julho</MenuItem>
                <MenuItem value={8}>Agosto</MenuItem>
                <MenuItem value={9}>Setembro</MenuItem>
                <MenuItem value={10}>Outubro</MenuItem>
                <MenuItem value={11}>Novembro</MenuItem>
                <MenuItem value={12}>Dezembro</MenuItem>
              </Select>
            </FormControl>
          )}
          
          <Button 
            variant="contained" 
            startIcon={<Download />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: theme.palette.mode === 'dark' ? 0 : 3,
              bgcolor: 'primary.main',
              border: '1px solid transparent', 
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'transparent' : 'primary.dark',
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid #888' 
                    : '1px solid transparent', 
                },
            }}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Conteúdo das tabs */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Typography>Carregando dados...</Typography>
        </Box>
      ) : activeTab === 0 ? (
        <Box>
          {/* Card de Indicadores */}
          <Box sx={{ mb: 3 }}>
            <Paper sx={{ 
              p: 3,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              borderRadius: 2,
            }}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: theme.palette.text.primary,
                mb: 2,
                fontWeight: 'medium',
              }}>
                Indicadores Principais
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <StatCard 
                    title="Total Abastecimentos" 
                    value={informacoesGerais.indicadores.totalAbastecimentos} 
                    icon={<LocalGasStation fontSize="medium" />}
                    trend="up"
                    theme={theme}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <StatCard 
                    title="Custo Total" 
                    value={`R$ ${informacoesGerais.indicadores.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                    icon={<AttachMoney fontSize="medium" />}
                    trend="down"
                    subtitle={`${selectedYear}`}
                    theme={theme}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <StatCard 
                    title="Consumo Médio" 
                    value={`${informacoesGerais.indicadores.mediaConsumo} km/L`} 
                    icon={<Speed fontSize="medium" />}
                    trend="up"
                    theme={theme}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
          
          {/* Tabelas */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Tabela de Situação da Frota */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Situação da Frota</Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <DataGrid
                    rows={informacoesGerais.situacaoVeiculos.map((item, index) => ({
                      id: index,
                      situacao: item.name,
                      quantidade: item.value
                    }))}
                    columns={[
                      { field: 'situacao', headerName: 'Situação', width: 150 },
                      { field: 'quantidade', headerName: 'Quantidade', width: 120 },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Tabela de Consumo Mensal */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Consumo Mensal ({selectedYear})</Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <DataGrid
                    rows={informacoesGerais.consumoMensal.map((item, index) => ({
                      id: index,
                      mes: item.mes,
                      litros: item.litros
                    }))}
                    columns={[
                      { field: 'mes', headerName: 'Mês', width: 100 },
                      { field: 'litros', headerName: 'Litros', width: 120 },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      ) : activeTab === 1 ? (
        <Box>
          {/* Tabelas de Abastecimentos */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            {/* Tabela de Abastecimentos por Mês */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Abastecimentos por Mês ({selectedYear})</Typography>
                <Box sx={{ height: 320, mt: 2 }}>
                  <DataGrid
                    rows={abastecimentosData.mensal.map((item, index) => ({
                      id: index,
                      mes: item.mes,
                      quantidade: item.quantidade,
                      valor: item.valor
                    }))}
                    columns={[
                      { field: 'mes', headerName: 'Mês', width: 100 },
                      { field: 'quantidade', headerName: 'Quantidade', width: 120 },
                      { 
                        field: 'valor', 
                        headerName: 'Valor (R$)', 
                        width: 130,
                        valueFormatter: (params: {value: number}) => 
                          `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Tabela por Tipo de Combustível */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Por Tipo de Combustível</Typography>
                <Box sx={{ height: 320, mt: 2 }}>
                  <DataGrid
                    rows={abastecimentosData.porTipoCombustivel.map((item, index) => ({
                      id: index,
                      tipo: item.tipo,
                      quantidade: item.quantidade,
                      valor: item.valor
                    }))}
                    columns={[
                      { field: 'tipo', headerName: 'Tipo', width: 120 },
                      { field: 'quantidade', headerName: 'Quantidade (L)', width: 140 },
                      { 
                        field: 'valor', 
                        headerName: 'Valor (R$)', 
                        width: 130,
                        valueFormatter: (params: {value: number}) => 
                          `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Tabela de Abastecimentos Detalhados */}
          <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Detalhamento de Abastecimentos</Typography>
              <DataGrid
                rows={abastecimentosData.detalhado}
                columns={[
                  { field: 'data', headerName: 'Data', width: 120 },
                  { field: 'veiculo', headerName: 'Veículo', width: 180 },
                  { field: 'placa', headerName: 'Placa', width: 100 },
                  { field: 'combustivel', headerName: 'Combustível', width: 120 },
                  { field: 'litros', headerName: 'Litros', width: 100 },
                  { 
                    field: 'valorTotal', 
                    headerName: 'Valor Total', 
                    width: 130,
                    valueFormatter: (params: {value: number}) => 
                      `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  },
                  { 
                    field: 'precoLitro', 
                    headerName: 'Preço/L', 
                    width: 100,
                    valueFormatter: (params: {value: number}) => 
                      `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}`
                  },
                  { field: 'hodometro', headerName: 'Hodômetro', width: 110 },
                  { field: 'motorista', headerName: 'Motorista', width: 150 },
                  { field: 'posto', headerName: 'Posto', width: 150 },
                ]}
                pageSizeOptions={[10, 25, 50, 100]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
            </Paper>
          </Box>
        </Box>
      ) : activeTab === 2 ? (
        <Box>
          {/* Tabelas de Veículos */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            {/* Tabela de Desempenho por Veículo */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Consumo por Veículo</Typography>
                <Box sx={{ height: 320, mt: 2 }}>
                  <DataGrid
                    rows={veiculosData.desempenho.map((item, index) => ({
                      id: index,
                      modelo: item.modelo,
                      consumoMedio: item.consumoMedio,
                      custoTotal: item.custoTotal
                    }))}
                    columns={[
                      { field: 'modelo', headerName: 'Modelo', width: 150 },
                      { 
                        field: 'consumoMedio', 
                        headerName: 'Consumo (km/L)', 
                        width: 130,
                        valueFormatter: (params: {value: number}) => `${params.value} km/L`
                      },
                      { 
                        field: 'custoTotal', 
                        headerName: 'Custo Total (R$)', 
                        width: 140,
                        valueFormatter: (params: {value: number}) => 
                          `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Tabela de Quilometragem por Veículo */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Quilometragem por Veículo</Typography>
                <Box sx={{ height: 320, mt: 2 }}>
                  <DataGrid
                    rows={veiculosData.desempenho.map((item, index) => ({
                      id: index,
                      modelo: item.modelo,
                      quilometragem: item.quilometragem
                    }))}
                    columns={[
                      { field: 'modelo', headerName: 'Modelo', width: 150 },
                      { 
                        field: 'quilometragem', 
                        headerName: 'Quilometragem', 
                        width: 130,
                        valueFormatter: (params: {value: number}) => 
                          `${params.value.toLocaleString('pt-BR')} km`
                      },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Tabela de Veículos */}
          <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Frota Detalhada</Typography>
              <DataGrid
                rows={veiculosData.tabela}
                columns={[
                  { field: 'placa', headerName: 'Placa', width: 100 },
                  { field: 'modelo', headerName: 'Modelo', width: 200 },
                  { field: 'status', headerName: 'Status', width: 130 },
                  { 
                    field: 'quilometragem', 
                    headerName: 'Quilometragem', 
                    width: 130,
                    valueFormatter: (params: {value: number}) => 
                      `${params.value.toLocaleString('pt-BR')} km`
                  },
                  { 
                    field: 'consumoMedio', 
                    headerName: 'Consumo Médio', 
                    width: 130,
                    valueFormatter: (params: {value: number}) => `${params.value} km/L`
                  },
                  { 
                    field: 'custoTotal', 
                    headerName: 'Custo Total', 
                    width: 130,
                    valueFormatter: (params: {value: number}) => 
                      `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  },
                ]}
                pageSizeOptions={[10, 25, 50, 100]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
            </Paper>
          </Box>
        </Box>
      ) : activeTab === 3 ? (
        <Box>
          {/* Tabelas Financeiras */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            {/* Tabela de Custos Mensais */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Custos Mensais ({selectedYear})</Typography>
                <Box sx={{ height: 320, mt: 2 }}>
                  <DataGrid
                    rows={financeiroData.custosMensais.map((item, index) => ({
                      id: index,
                      mes: item.mes,
                      valor: item.valor
                    }))}
                    columns={[
                      { field: 'mes', headerName: 'Mês', width: 100 },
                      { 
                        field: 'valor', 
                        headerName: 'Valor (R$)', 
                        width: 130,
                        valueFormatter: (params: {value: number}) => 
                          `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Tabela de Custos por Categoria */}
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Distribuição por Categoria</Typography>
                <Box sx={{ height: 320, mt: 2 }}>
                  <DataGrid
                    rows={financeiroData.porCategoria.map((item, index) => ({
                      id: index,
                      categoria: item.categoria,
                      valor: item.valor
                    }))}
                    columns={[
                      { field: 'categoria', headerName: 'Categoria', width: 150 },
                      { 
                        field: 'valor', 
                        headerName: 'Valor (R$)', 
                        width: 130,
                        valueFormatter: (params: {value: number}) => 
                          `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      },
                    ]}
                    pageSizeOptions={[5, 10]}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Tabela de Custos Detalhados */}
          <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Detalhamento de Custos</Typography>
              <DataGrid
                rows={financeiroData.detalhado}
                columns={[
                  { field: 'data', headerName: 'Data', width: 120 },
                  { field: 'tipo', headerName: 'Tipo', width: 130 },
                  { field: 'categoria', headerName: 'Categoria', width: 150 },
                  { field: 'veiculo', headerName: 'Veículo', width: 180 },
                  { field: 'descricao', headerName: 'Descrição', width: 250 },
                  { 
                    field: 'valor', 
                    headerName: 'Valor', 
                    width: 130,
                    valueFormatter: (params: {value: number}) => 
                      `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  },
                  { field: 'fornecedor', headerName: 'Fornecedor', width: 150 },
                ]}
                pageSizeOptions={[10, 25, 50, 100]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
            </Paper>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default Relatorios;