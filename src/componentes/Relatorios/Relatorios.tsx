import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button,
  useTheme, CircularProgress, Alert,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  LocalGasStation, DirectionsCar, AttachMoney,
  Download, PictureAsPdf, Analytics
} from '@mui/icons-material';

// Gráficos
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Serviços
import AbastecimentoService from '../../api/abastecimentoService';
import { CarrosService } from '../../api/carrosService';
import { listarMultas } from '../../api/multaService';

// Menu
import Menu from "../Menu";

// Registrar componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Relatorios: React.FC = () => {
  const theme = useTheme();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('abastecimentos');
  const [dados, setDados] = useState<any[]>([]);
  const [dadosGraficos, setDadosGraficos] = useState<any>(null);

  // Dados mockados para gráficos
  const mockDataGraficos = {
    abastecimentos: {
      porCombustivel: {
        labels: ['Gasolina', 'Etanol', 'Diesel'],
        datasets: [
          {
            data: [65, 25, 10],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          }
        ]
      },
      mensal: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Litros',
            data: [1200, 1900, 1500, 2100, 1800, 2400],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          }
        ]
      }
    },
    veiculos: {
      porStatus: {
        labels: ['Disponível', 'Em uso', 'Manutenção', 'Inativo'],
        datasets: [
          {
            data: [8, 12, 3, 2],
            backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9E9E9E'],
          }
        ]
      }
    }
  };

  const colunasAbastecimentos = [
    { field: 'data', headerName: 'Data', width: 120 },
    { field: 'veiculo', headerName: 'Veículo', width: 150 },
    { field: 'litros', headerName: 'Litros', width: 100 },
    { field: 'precoLitro', headerName: 'Preço/L', width: 100 },
    { field: 'valorTotal', headerName: 'Valor Total', width: 120 },
    { field: 'combustivel', headerName: 'Combustível', width: 120 },
    { field: 'motorista', headerName: 'Motorista', width: 150 },
  ];

  const colunasVeiculos = [
    { field: 'placa', headerName: 'Placa', width: 100 },
    { field: 'modelo', headerName: 'Modelo', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'quilometragem', headerName: 'Quilometragem', width: 120 },
    { field: 'consumoMedio', headerName: 'Consumo Médio', width: 130 },
    { field: 'custoTotal', headerName: 'Custo Total', width: 130 },
  ];

  const colunasFinanceiro = [
    { field: 'data', headerName: 'Data', width: 120 },
    { field: 'tipo', headerName: 'Tipo', width: 120 },
    { field: 'categoria', headerName: 'Categoria', width: 150 },
    { field: 'valor', headerName: 'Valor', width: 120 },
    { field: 'descricao', headerName: 'Descrição', width: 200 },
    { field: 'veiculo', headerName: 'Veículo', width: 150 },
  ];

  // Função para gerar PDF
  const gerarPDF = async () => {
    if (!pdfRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`relatorio-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  // Função para exportar CSV
  const exportarCSV = () => {
    if (dados.length === 0) return;
    
    const headers = Object.keys(dados[0]).join(',');
    const rows = dados.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${activeTab}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const carregarDados = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let dadosApi: any[] = [];
      
      switch (activeTab) {
        case 'abastecimentos':
          const abastecimentos = await AbastecimentoService.buscarTodosAbastecimentos({ expand: true });
          dadosApi = abastecimentos.map((abast: any) => ({
            id: abast.idAbastecimento,
            data: new Date(abast.dataAbastecimento).toLocaleDateString('pt-BR'),
            veiculo: abast.corrida?.idCarros || 'N/A',
            litros: abast.litros,
            precoLitro: `R$ ${abast.valorUnitarioLitro?.toFixed(2)}`,
            valorTotal: `R$ ${abast.precoFinal?.toFixed(2)}`,
            combustivel: abast.tipo_combustivel?.nome || 'Não informado',
            motorista: abast.corrida?.idMotorista || 'N/A'
          }));
          break;
        
        case 'veiculos':
          const veiculos = await CarrosService.buscarTodos();
          dadosApi = veiculos.map((veiculo: any) => ({
            id: veiculo.idCarros,
            placa: veiculo.placa,
            modelo: veiculo.modelo,
            status: veiculo.situacao,
            quilometragem: `${veiculo.odometro} km`,
            consumoMedio: '8.5 km/L',
            custoTotal: `R$ ${(Math.random() * 10000).toFixed(2)}`
          }));
          break;
        
        case 'financeiro':
          const [abastecimentosFin, multas] = await Promise.all([
            AbastecimentoService.buscarTodosAbastecimentos({ expand: true }),
            listarMultas()
          ]);
          
          const dadosAbast = abastecimentosFin.map((abast: any) => ({
            id: `abast-${abast.idAbastecimento}`,
            data: new Date(abast.dataAbastecimento).toLocaleDateString('pt-BR'),
            tipo: 'Abastecimento',
            categoria: 'Combustível',
            valor: `R$ ${abast.precoFinal?.toFixed(2)}`,
            descricao: `${abast.litros}L - ${abast.tipo_combustivel?.nome}`,
            veiculo: abast.corrida?.idCarros || 'N/A'
          }));
          
          const dadosMultas = Array.isArray(multas) ? multas.map((multa: any) => ({
            id: `multa-${multa.idMulta}`,
            data: new Date(multa.data).toLocaleDateString('pt-BR'),
            tipo: 'Multa',
            categoria: 'Infração',
            valor: `R$ ${multa.valor}`,
            descricao: `Multa ${multa.codInfracao}`,
            veiculo: multa.placaVeiculo
          })) : [];
          
          dadosApi = [...dadosAbast, ...dadosMultas];
          break;
      }
      
      setDados(dadosApi);
      setDadosGraficos(mockDataGraficos);
      
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da API');
      // Dados mockados em caso de erro
      setDados(activeTab === 'abastecimentos' ? [
        { id: 1, data: '15/01/2023', veiculo: 'Fiat Toro', litros: 45, precoLitro: 'R$ 7,00', valorTotal: 'R$ 315,00', combustivel: 'Gasolina', motorista: 'João Silva' },
        { id: 2, data: '20/01/2023', veiculo: 'VW Gol', litros: 38, precoLitro: 'R$ 5,00', valorTotal: 'R$ 190,00', combustivel: 'Etanol', motorista: 'Maria Santos' }
      ] : activeTab === 'veiculos' ? [
        { id: 1, placa: 'ABC1234', modelo: 'Fiat Toro', status: 'Disponível', quilometragem: '45.230 km', consumoMedio: '8.2 km/L', custoTotal: 'R$ 12.500,00' },
        { id: 2, placa: 'DEF5678', modelo: 'VW Gol', status: 'Em uso', quilometragem: '78.210 km', consumoMedio: '10.5 km/L', custoTotal: 'R$ 9.800,00' }
      ] : [
        { id: 1, data: '15/01/2023', tipo: 'Abastecimento', categoria: 'Combustível', valor: 'R$ 315,00', descricao: '45L - Gasolina', veiculo: 'Fiat Toro' },
        { id: 2, data: '20/01/2023', tipo: 'Manutenção', categoria: 'Revisão', valor: 'R$ 450,00', descricao: 'Troca de óleo', veiculo: 'VW Gol' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [activeTab]);

  const getColunas = () => {
    switch (activeTab) {
      case 'abastecimentos': return colunasAbastecimentos;
      case 'veiculos': return colunasVeiculos;
      case 'financeiro': return colunasFinanceiro;
      default: return colunasAbastecimentos;
    }
  };

  const getTitulo = () => {
    switch (activeTab) {
      case 'abastecimentos': return 'Relatório de Abastecimentos';
      case 'veiculos': return 'Relatório de Veículos';
      case 'financeiro': return 'Relatório Financeiro';
      default: return 'Relatórios';
    }
  };

  const renderGraficos = () => {
    if (!dadosGraficos) return null;

    switch (activeTab) {
      case 'abastecimentos':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Paper sx={{ p: 2, flex: '1 1 400px', minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Tipo de Combustível
              </Typography>
              <Doughnut data={dadosGraficos.abastecimentos.porCombustivel} />
            </Paper>
            <Paper sx={{ p: 2, flex: '1 1 400px', minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                Consumo Mensal (Litros)
              </Typography>
              <Bar data={dadosGraficos.abastecimentos.mensal} />
            </Paper>
          </Box>
        );
      
      case 'veiculos':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Paper sx={{ p: 2, flex: '1 1 400px', minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                Situação da Frota
              </Typography>
              <Doughnut data={dadosGraficos.veiculos.porStatus} />
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Menu />
      <Box sx={{ p: 3 }} ref={pdfRef}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {getTitulo()}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportarCSV}
              disabled={dados.length === 0}
            >
              CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={gerarPDF}
              disabled={dados.length === 0}
            >
              PDF
            </Button>
          </Box>
        </Box>

        {/* Navegação */}
        <Paper sx={{ mb: 3, p: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { key: 'abastecimentos', label: 'Abastecimentos', icon: <LocalGasStation /> },
              { key: 'veiculos', label: 'Veículos', icon: <DirectionsCar /> },
              { key: 'financeiro', label: 'Financeiro', icon: <AttachMoney /> },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'contained' : 'outlined'}
                startIcon={tab.icon}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        </Paper>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Gráficos */}
        {renderGraficos()}

        {/* Tabela */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Analytics /> Dados Detalhados
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Carregando dados...</Typography>
            </Box>
          ) : dados.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Typography color="text.secondary">Nenhum dado encontrado</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={dados}
              columns={getColunas()}
              pageSizeOptions={[5, 10, 25]}
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
              }}
            />
          )}
        </Paper>

        {/* Resumo */}
        {!loading && dados.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumo
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="body2" color="text.secondary">Total de Registros</Typography>
                <Typography variant="h6">{dados.length}</Typography>
              </Box>
              {activeTab === 'abastecimentos' && (
                <Box sx={{ minWidth: 120 }}>
                  <Typography variant="body2" color="text.secondary">Total Litros</Typography>
                  <Typography variant="h6">
                    {dados.reduce((sum, item) => sum + (item.litros || 0), 0)} L
                  </Typography>
                </Box>
              )}
              {(activeTab === 'abastecimentos' || activeTab === 'financeiro') && (
                <Box sx={{ minWidth: 120 }}>
                  <Typography variant="body2" color="text.secondary">Valor Total</Typography>
                  <Typography variant="h6">
                    R$ {dados.reduce((sum, item) => {
                      const valor = parseFloat(item.valor?.replace('R$ ', '').replace('.', '').replace(',', '.') || 0);
                      return sum + valor;
                    }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default Relatorios;