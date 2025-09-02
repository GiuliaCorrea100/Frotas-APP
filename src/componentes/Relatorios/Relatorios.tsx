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
} from "recharts";

import AbastecimentoService from "../../api/abastecimentoService";
import { CarrosService } from "../../api/carrosService";
import { getCorridas } from "../../api/corridaService";
import { OcorrenciaService } from "../../api/ocorrenciasService";
import { listarMultas } from "../../api/multaService"; // importe sua função de API

// PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


import Menu from "../Menu";

const COLORS = ["#FF9800", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"];

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
                      { name: "Concluídas", value: corridas.filter((c) => c.situacao === "CONCLUIDA").length },
                      { name: "Pendentes", value: corridas.filter((c) => c.situacao === "PENDENTE").length },
                      { name: "Canceladas", value: corridas.filter((c) => c.situacao === "CANCELADA").length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
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
                Corridas por Motorista
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={Object.values(
                    corridas.reduce((acc: any, c: any) => {
                      acc[c.nomeMotorista] = acc[c.nomeMotorista] || { motorista: c.nomeMotorista, total: 0 };
                      acc[c.nomeMotorista].total++;
                      return acc;
                    }, {})
                  )}
                >
                  <XAxis dataKey="motorista" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Lista de Corridas
              </Typography>
              <DataGrid
                rows={corridas}
                columns={[
                  { field: "idCorrida", headerName: "ID", width: 90 },
                  { field: "nomeMotorista", headerName: "Motorista", width: 150 },
                  { field: "placaVeiculo", headerName: "Veículo", width: 150 },
                  { field: "situacao", headerName: "Situação", width: 130 },
                  { field: "dataInicio", headerName: "Início", width: 180 },
                  { field: "dataTermino", headerName: "Término", width: 180 },
                ]}
                getRowId={(row) => row.idCorrida}
                pageSizeOptions={[5, 10, 20]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
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
                      acc[c.placaVeiculo] = acc[c.placaVeiculo] || { veiculo: c.placaVeiculo, total: 0 };
                      acc[c.placaVeiculo].total++;
                      return acc;
                    }, {})
                  )}
                >
                  <XAxis dataKey="veiculo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4CAF50" />
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
                      { name: "Ativos", value: carros.filter((c) => c.situacao === "ATIVO").length },
                      { name: "Inativos", value: carros.filter((c) => c.situacao === "INATIVO").length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
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
          </Stack>
        )}

        {/* -------------------- MULTAS -------------------- */}
        {activeTab === 2 && (
  <Stack spacing={3}>
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6">📊 Relatório de Multas </Typography>
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
                Consumo de Combustível ao Longo do Tempo
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={abastecimentos}>
                  <XAxis dataKey="dataAbastecimento" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="litros" stroke="#2196F3" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Registro de Abastecimentos
              </Typography>
              <DataGrid
                rows={abastecimentos}
                columns={[
                  { field: "idAbastecimento", headerName: "ID", width: 80 },
                  { field: "litros", headerName: "Litros", width: 100 },
                  { field: "precoFinal", headerName: "Preço Final", width: 150 },
                  { field: "dataAbastecimento", headerName: "Data", width: 150 },
                  {
                    field: "tipo_combustivel",
                    headerName: "Combustível",
                    width: 150,
                    valueGetter: (params: any) => params?.row?.tipo_combustivel?.nome || "-"
                  },
                ]}
                getRowId={(row) => row.idAbastecimento}
                pageSizeOptions={[5, 10, 20]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              />
            </Paper>
          </Stack>
        )}

        {/* -------------------- OCORRÊNCIAS -------------------- */}
        {activeTab === 4 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Ocorrências por Veículo
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
          </Stack>
        )}
      </Box>
    </>
  );
};

export default Relatorio;

