import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import {
  Assignment,
  DirectionsCar,
  LocalGasStation,
  Gavel,
  Report,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";

import AbastecimentoService from "../../api/abastecimentoService";
import { CarrosService } from "../../api/carrosService";
import { getCorridas } from "../../api/corridaService";
import { OcorrenciaService } from "../../api/ocorrenciasService";
import { listarMultas } from "../../api/multaService";

// PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Menu from "../Menu";

const COLORS = ["#FF9800", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"];

// Interfaces para tipagem
interface ValorMultaPorVeiculo {
  veiculo: string;
  valor: number;
}

interface ConsumoMensal {
  mes: string;
  litros: number;
  valor: number;
}

interface OcorrenciaPorData {
  data: string;
  total: number;
}

const Relatorio: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<any[]>([]);
  const [dadosGraficos, setDadosGraficos] = useState<any>(null);

  const [multas, setMultas] = useState<any[]>([]);
  const [corridas, setCorridas] = useState<any[]>([]);
  const [carros, setCarros] = useState<any[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [corridasData, carrosData, abastecData, ocorrData, multasData] =
          await Promise.all([
            getCorridas(),
            CarrosService.buscarTodos(),
            AbastecimentoService.BuscarTodosAbastecimentos({ expand: true }),
            OcorrenciaService.buscarTodos(),
            listarMultas(),
          ]);

        setCorridas(corridasData);
        setCarros(carrosData);
        setAbastecimentos(abastecData);
        setOcorrencias(ocorrData);
        setMultas(multasData); 
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
        setError("Erro ao carregar relatórios");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const tabs = [
    { label: "Corridas", icon: <Assignment />, value: 0 },
    { label: "Veículos", icon: <DirectionsCar />, value: 1 },
    { label: "Multas", icon: <Gavel />, value: 2 },
    { label: "Abastecimentos", icon: <LocalGasStation />, value: 3 },
    { label: "Ocorrências", icon: <Report />, value: 4 },
  ];

  if (loading) {
    return (
      <>
        <Menu />
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

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

  return (
    <>
      <Menu />
      <Box sx={{ p: 3 }}>
        {/* Navegação */}
        <Stack direction="row" spacing={2} mb={3}>
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              startIcon={tab.icon}
              onClick={() => setActiveTab(tab.value)}
              variant={activeTab === tab.value ? "contained" : "outlined"}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {/* -------------------- CORRIDAS -------------------- */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Corridas por Situação
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Agendada", value: corridas.filter((c) => c.situacao === "AGENDADA").length },
                      { name: "Concluídas", value: corridas.filter((c) => c.situacao === "FINALIZADA").length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${percent ? (percent * 100).toFixed(0) + '%' : '0%'}`
                    }
                  > 
                    {COLORS.map((color, index) => (
                      <Cell key={index} fill={color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Corridas por Mês
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    corridas.reduce((acc: any, corrida: any) => {
                      const mes = new Date(corrida.dataInicio).toLocaleDateString('pt-BR', { month: 'short' });
                      acc[mes] = acc[mes] || { mes, total: 0 };
                      acc[mes].total++;
                      return acc;
                    }, {})
                  )}
                >
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Performance por Motorista
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    corridas.reduce((acc: any, c: any) => {
                      acc[c.nomeMotorista] = acc[c.nomeMotorista] || { 
                        motorista: c.nomeMotorista, 
                        concluidas: 0, 
                        total: 0 
                      };
                      if (c.situacao === "FINALIZADA") acc[c.nomeMotorista].concluidas++;
                      acc[c.nomeMotorista].total++;
                      return acc;
                    }, {})
                  )}
                >
                  <XAxis dataKey="motorista" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="concluidas" fill="#4CAF50" name="Concluídas" />
                  <Bar dataKey="total" fill="#FF9800" name="Totais" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>
        )}

        {/* -------------------- VEÍCULOS -------------------- */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Veículos mais Utilizados
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    corridas.reduce((acc: any, c: any) => {
                      const carro = carros.find((car: any) => car.placa === c.placaVeiculo);
                      const modelo = carro ? carro.modelo : 'Desconhecido';
                      
                      acc[c.placaVeiculo] = acc[c.placaVeiculo] || { 
                        veiculo: c.placaVeiculo, 
                        modelo: modelo,
                        total: 0 
                      };
                      acc[c.placaVeiculo].total++;
                      return acc;
                    }, {})
                  ).filter((item: any) => item.total > 0)
                  .sort((a: any, b: any) => b.total - a.total)
                }
                >
                  <XAxis dataKey="veiculo" tickFormatter={(value) => value || 'N/A'} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} corridas`, 'Quantidade']}
                    labelFormatter={(_label, payload) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return `Placa: ${data.veiculo || 'N/A'}\nModelo: ${data.modelo || 'Desconhecido'}`;
                      }
                      return '';
                    }}
                  />
                  <Bar dataKey="total" fill="#4CAF50" name="Corridas" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Veículos por Modelo
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    corridas.reduce((acc: any, c: any) => {
                      const carro = carros.find((car: any) => car.placa === c.placaVeiculo);
                      const modelo = carro ? carro.modelo : 'Desconhecido';
                      
                      acc[modelo] = acc[modelo] || { 
                        modelo: modelo,
                        total: 0 
                      };
                      acc[modelo].total++;
                      return acc;
                    }, {})
                  ).filter((item: any) => item.total > 0)
                  .sort((a: any, b: any) => b.total - a.total)
                }
                >
                  <XAxis dataKey="modelo" tickFormatter={(value) => value || 'N/A'} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} corridas`, 'Quantidade']}
                    labelFormatter={(label) => `Modelo: ${label || 'Desconhecido'}`}
                  />
                  <Bar dataKey="total" fill="#2196F3" name="Corridas" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Situação dos Veículos
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "MANUTENÇÃO", value: carros.filter((c) => c.situacao === "MANUTENCAO").length },
                      { name: "VIAGEM", value: carros.filter((c) => c.situacao === "VIAGEM").length },
                      { name: "RESERVADO", value: carros.filter((c) => c.situacao === "RESERVADO").length },
                      { name: "DISPONÍVEL", value: carros.filter((c) => c.situacao === "DISPONIVEL").length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#a30000ff" />
                    <Cell fill="#59bab2ff" />
                    <Cell fill="#be9f00ff" />
                    <Cell fill="#07561bff" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Informações dos Veículos
              </Typography>
              <DataGrid
                rows={carros}
                columns={[
                  { field: "idCarros", headerName: "ID", width: 80 },
                  { field: "placa", headerName: "Placa", width: 120 },
                  { field: "modelo", headerName: "Modelo", width: 150 },
                  { field: "ano", headerName: "Ano", width: 100 },
                  { field: "situacao", headerName: "Situação", width: 120 },
                ]}
                getRowId={(row) => row.idCarros}
                pageSizeOptions={[5, 10, 20]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Modelo
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={Object.values(
                      carros.reduce((acc: any, carro: any) => {
                        acc[carro.modelo] = acc[carro.modelo] || { modelo: carro.modelo, total: 0 };
                        acc[carro.modelo].total++;
                        return acc;
                      }, {})
                    )}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="total"
                    label={({ modelo, total }: any) => `${modelo}: ${total}`}
                  >
                    {Object.keys(
                      carros.reduce((acc: any, carro: any) => {
                        acc[carro.modelo] = true;
                        return acc;
                      }, {})
                    ).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>
        )}

        {/* -------------------- MULTAS -------------------- */}
        {activeTab === 2 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6">Relatório de Multas</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    multas.reduce((acc: any, m: any) => {
                      acc[m.placaVeiculo] = acc[m.placaVeiculo] || { veiculo: m.placaVeiculo, total: 0 };
                      acc[m.placaVeiculo].total++;
                      return acc;
                    }, {})
                  )}
                >
                  <XAxis dataKey="veiculo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Multas por Classificação
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    multas.reduce((acc: any, multa: any) => {
                      const key = multa.classInfracao || 'Não Informado';
                      acc[key] = acc[key] || { classificacao: key, total: 0, valorTotal: 0 };
                      acc[key].total++;
                      acc[key].valorTotal += parseFloat(multa.valor || 0);
                      return acc;
                    }, {})
                  )}
                >
                  <XAxis dataKey="classificacao" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="total" fill="#F44336" name="Quantidade" />
                  <Bar yAxisId="right" dataKey="valorTotal" fill="#FF9800" name="Valor Total (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Lista de Multas
              </Typography>
              <DataGrid
                rows={multas}
                columns={[
                  { field: "idMultas", headerName: "ID", width: 80 },
                  { field: "codInfracao", headerName: "Código", width: 120 },
                  { field: "classInfracao", headerName: "Classificação", width: 150 },
                  { field: "valor", headerName: "Valor", width: 120 },
                  { field: "placaVeiculo", headerName: "Placa", width: 120 },
                  { field: "data", headerName: "Data", width: 180 },
                  { field: "numAutoInfracao", headerName: "Número do Auto", width: 150 },
                ]}
                getRowId={(row) => row.idMultas} 
                pageSizeOptions={[5, 10, 20]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
            </Paper>
          </Stack>
        )}

        {/* -------------------- ABASTECIMENTOS -------------------- */}
        {activeTab === 3 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Consumo Mensal de Combustível
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart
                  data={Object.values(
                    abastecimentos.reduce((acc: Record<string, ConsumoMensal>, abs: any) => {
                      const mes = new Date(abs.dataAbastecimento).toLocaleDateString('pt-BR', { 
                        month: 'short', 
                        year: 'numeric' 
                      });
                      acc[mes] = acc[mes] || { mes, litros: 0, valor: 0 };
                      acc[mes].litros += parseFloat(abs.litros || 0);
                      acc[mes].valor += parseFloat(abs.precoFinal || 0);
                      return acc;
                    }, {} as Record<string, ConsumoMensal>)
                  ).sort((a: ConsumoMensal, b: ConsumoMensal) => {
                    const dateA = new Date(`01 ${a.mes}`);
                    const dateB = new Date(`01 ${b.mes}`);
                    return dateA.getTime() - dateB.getTime();
                  })}
                >
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="litros" fill="#4CAF50" stroke="#4CAF50" name="Litros" />
                  <Area yAxisId="right" type="monotone" dataKey="valor" fill="#FF9800" stroke="#FF9800" name="Valor (R$)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Relação Litros vs Preço
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <ScatterChart>
                  <XAxis type="number" dataKey="litros" name="Litros" />
                  <YAxis type="number" dataKey="precoFinal" name="Preço (R$)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={abastecimentos.map((abs: any) => ({
                    litros: parseFloat(abs.litros || 0),
                    precoFinal: parseFloat(abs.precoFinal || 0)
                  }))} fill="#2196F3" />
                </ScatterChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>
        )}

        {/* -------------------- OCORRÊNCIAS -------------------- */}
        {activeTab === 4 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Ocorrências por Corrida
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    ocorrencias.reduce((acc: any, o: any) => {
                      acc[o.idCorrida] = acc[o.idCorrida] || { corrida: o.idCorrida, total: 0 };
                      acc[o.idCorrida].total++;
                      return acc;
                    }, {})
                  )}
                >
                  <XAxis dataKey="corrida" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Lista de Ocorrências
              </Typography>
              <DataGrid
                rows={ocorrencias}
                columns={[
                  { field: "idOcorrencia", headerName: "ID", width: 80 },
                  { field: "descricao", headerName: "Descrição", width: 250 },
                  { field: "idCorrida", headerName: "Corrida", width: 120 },
                ]}
                getRowId={(row) => row.idOcorrencia}
                pageSizeOptions={[5, 10, 20]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Top Ocorrências por Descrição
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  layout="vertical"
                  data={Object.values(
                    ocorrencias.reduce((acc: any, occ: any) => {
                      const descricao = occ.descricao.length > 20 
                        ? occ.descricao.substring(0, 20) + '...' 
                        : occ.descricao;
                      
                      acc[descricao] = acc[descricao] || { descricao, total: 0 };
                      acc[descricao].total++;
                      return acc;
                    }, {})
                  )
                  .sort((a: any, b: any) => b.total - a.total)
                  .slice(0, 10)}
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="descricao" width={150} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
<Paper sx={{ p: 2, height: 400 }}>
  <Typography variant="h6" gutterBottom>
    Ocorrências ao Longo do Tempo
  </Typography>
  <ResponsiveContainer width="100%" height="90%">
    <LineChart
      data={Object.values(
        ocorrencias.reduce((acc: any, occ: any) => {
          const data = new Date(occ.dataOcorrencia || occ.dataCriacao);
          if (isNaN(data.getTime())) return acc;
          
          const dataStr = data.toLocaleDateString('pt-BR');
          if (!acc[dataStr]) {
            acc[dataStr] = { dataStr, timestamp: data.getTime(), total: 0 };
          }
          acc[dataStr].total++;
          return acc;
        }, {})
      ).sort((a: any, b: any) => a.timestamp - b.timestamp)
      .map((item: any) => ({ dataStr: item.dataStr, total: item.total }))}
    >
      <XAxis dataKey="dataStr" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" stroke="#2196F3" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
</Paper>

            
          </Stack>
        )}

      </Box>
    </>
  );
};

export default Relatorio;