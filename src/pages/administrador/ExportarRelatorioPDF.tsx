import React from 'react';
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Download } from '@mui/icons-material';

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
    pageBreakInside: 'avoid',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 5,
  },
  table: {
    width: '100%',
    border: '1px solid #e0e0e0',
    marginTop: 10,
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e0e0e0',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    padding: 5,
  },
  tableCell: {
    padding: 5,
    flex: 1,
    borderRight: '1px solid #e0e0e0',
  },
  lastTableCell: {
    padding: 5,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  statCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderLeft: '3px solid #1976d2',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

// Componente para renderizar cards de estatísticas
const StatCardPDF = ({ title, value }: { title: string; value: string | number }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// Componente principal do PDF
const RelatorioPDF = ({
  data,
  selectedYear,
}: {
  data: any;
  selectedYear: number;
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Controle de Frotas</Text>
          <Text style={styles.subtitle}>
            Ano: {selectedYear}
          </Text>
          <Text style={styles.subtitle}>
            Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>

        {/* Visão Geral - Indicadores Principais */}
        {data.visaoGeral && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indicadores Principais</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Total de Corridas"
                  value={data.visaoGeral.totalCorridas || 0}
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Frota Ativa"
                  value={data.visaoGeral.totalVeiculos || 0}
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Gasto c/ Combustível"
                  value={`R$ ${(data.visaoGeral.totalGastoCombustivel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Ocorrências / Multas"
                  value={`${data.visaoGeral.totalOcorrencias || 0} / ${data.visaoGeral.totalMultas || 0}`}
                />
              </View>
            </View>
          </View>
        )}

        {/* Análise de Corridas */}
        {data.corridasResumo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo de Corridas</Text>
            <StatCardPDF
              title="Total de Corridas"
              value={data.corridasResumo.totalCorridas || 0}
            />
            {data.corridasResumo.porSituacao && data.corridasResumo.porSituacao.length > 0 && (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Situação</Text>
                  <Text style={styles.lastTableCell}>Quantidade</Text>
                </View>
                {data.corridasResumo.porSituacao.map((item: any, index: number) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.name || 'N/A'}</Text>
                    <Text style={styles.lastTableCell}>{item.value || 0}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Desempenho de Motoristas */}
        {data.desempenhoMotoristas && data.desempenhoMotoristas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Motoristas com Maior Número de Corridas</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Motorista</Text>
                <Text style={styles.lastTableCell}>Corridas</Text>
              </View>
              {data.desempenhoMotoristas.slice(0, 10).map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.motorista || 'N/A'}</Text>
                  <Text style={styles.lastTableCell}>{item.Corridas || 0}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Relatório Detalhado de Corridas */}
        {data.corridasTabela && data.corridasTabela.length > 0 && (
          <View style={[styles.section, { pageBreakBefore: 'auto' }]}>
            <Text style={styles.sectionTitle}>Detalhes das Corridas</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={{ ...styles.tableCell, flex: 1.2 }}>Motorista</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>Veículo</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>Situação</Text>
                <Text style={{ ...styles.tableCell, flex: 1.5 }}>Data Início</Text>
                <Text style={{ ...styles.tableCell, flex: 1.5 }}>Data Término</Text>
                <Text style={{ ...styles.lastTableCell, flex: 1.5 }}>Local Saída</Text>
              </View>
              {data.corridasTabela.slice(0, 20).map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, flex: 1.2 }}>{item.motorista || 'N/A'}</Text>
                  <Text style={{ ...styles.tableCell, flex: 1 }}>{item.veiculo || 'N/A'}</Text>
                  <Text style={{ ...styles.tableCell, flex: 1 }}>{item.situacao || 'N/A'}</Text>
                  <Text style={{ ...styles.tableCell, flex: 1.5 }}>{item.dataInicio || 'N/A'}</Text>
                  <Text style={{ ...styles.tableCell, flex: 1.5 }}>{item.dataTermino || '—'}</Text>
                  <Text style={{ ...styles.lastTableCell, flex: 1.5 }}>{item.localSaida || '—'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Análise da Frota */}
        {data.carrosResumo && (
          <View style={[styles.section, { pageBreakBefore: 'auto' }]}>
            <Text style={styles.sectionTitle}>Resumo da Frota</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Total de Veículos"
                  value={data.carrosResumo.totalVeiculos || 0}
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Em Operação"
                  value={data.carrosResumo.emOperacao || 0}
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Em Manutenção"
                  value={data.carrosResumo.emManutencao || 0}
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Ociosos"
                  value={data.carrosResumo.ociosos || 0}
                />
              </View>
            </View>
          </View>
        )}

        {/* Situação da Frota */}
        {data.carrosSituacao && data.carrosSituacao.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribuição da Frota por Situação</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Situação</Text>
                <Text style={styles.lastTableCell}>Quantidade</Text>
              </View>
              {data.carrosSituacao.map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.name || 'N/A'}</Text>
                  <Text style={styles.lastTableCell}>{item.value || 0}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Veículos Mais Utilizados */}
        {data.desempenhoCarros && data.desempenhoCarros.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veículos Mais Utilizados</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Veículo</Text>
                <Text style={styles.lastTableCell}>Corridas</Text>
              </View>
              {data.desempenhoCarros.slice(0, 10).map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.veiculo || 'N/A'}</Text>
                  <Text style={styles.lastTableCell}>{item.Corridas || 0}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Relatório Detalhado de Veículos */}
        {data.carrosTabela && data.carrosTabela.length > 0 && (
          <View style={[styles.section, { pageBreakBefore: 'auto' }]}>
            <Text style={styles.sectionTitle}>Detalhes dos Veículos</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Placa</Text>
                <Text style={styles.tableCell}>Modelo</Text>
                <Text style={styles.tableCell}>Situação</Text>
                <Text style={styles.tableCell}>Campus</Text>
                <Text style={styles.tableCell}>Corridas</Text>
                <Text style={styles.lastTableCell}>Status</Text>
              </View>
              {data.carrosTabela.slice(0, 20).map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.placa || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{item.modelo || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{item.situacao || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{item.localidadeFisica || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{item.totalCorridas || 0}</Text>
                  <Text style={styles.lastTableCell}>{item.statusUtilizacao || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Análise de Abastecimentos */}
        {data.abastecimentoResumo && (
          <View style={[styles.section, { pageBreakBefore: 'auto' }]}>
            <Text style={styles.sectionTitle}>Resumo de Abastecimentos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Total Abastecido"
                  value={`${(data.abastecimentoResumo.totalLitros || 0).toFixed(2)} L`}
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCardPDF
                  title="Custo Total"
                  value={`R$ ${(data.abastecimentoResumo.totalValor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </View>
            </View>
          </View>
        )}

        {/* Custo por Tipo de Combustível */}
        {data.abastecimentoCustoPorCombustivel && data.abastecimentoCustoPorCombustivel.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custo por Tipo de Combustível</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Combustível</Text>
                <Text style={styles.lastTableCell}>Valor (R$)</Text>
              </View>
              {data.abastecimentoCustoPorCombustivel.map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.name || 'N/A'}</Text>
                  <Text style={styles.lastTableCell}>
                    {(item.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Consumo por Campus */}
        {data.abastecimentoConsumoPorCampus && data.abastecimentoConsumoPorCampus.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consumo por Campus</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Campus</Text>
                <Text style={styles.tableCell}>Litros</Text>
                <Text style={styles.lastTableCell}>Valor (R$)</Text>
              </View>
              {data.abastecimentoConsumoPorCampus.map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.name || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{(item.litros || 0).toFixed(2)}</Text>
                  <Text style={styles.lastTableCell}>
                    {(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Análise de Ocorrências */}
        {data.ocorrenciasResumo && (
          <View style={[styles.section, { pageBreakBefore: 'auto' }]}>
            <Text style={styles.sectionTitle}>Resumo de Ocorrências</Text>
            <StatCardPDF
              title="Total de Ocorrências"
              value={data.ocorrenciasResumo.totalOcorrencias || 0}
            />
          </View>
        )}

        {/* Ocorrências por Veículo */}
        {data.ocorrenciasPorVeiculo && data.ocorrenciasPorVeiculo.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veículos com Mais Ocorrências</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Placa</Text>
                <Text style={styles.lastTableCell}>Quantidade</Text>
              </View>
              {data.ocorrenciasPorVeiculo.slice(0, 15).map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.placa || 'N/A'}</Text>
                  <Text style={styles.lastTableCell}>{item.quantidade || 0}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Sistema de Controle de Frotas</Text>
        </View>
      </Page>
    </Document>
  );
};

// Componente de exportação principal
const ExportarRelatorioPDF = ({
  visaoGeral,
  corridasResumo,
  desempenhoMotoristas,
  corridasTabela,
  carrosResumo,
  carrosSituacao,
  desempenhoCarros,
  carrosTabela,
  abastecimentoResumo,
  abastecimentoCustoPorCombustivel,
  abastecimentoConsumoMensal,
  abastecimentoConsumoPorCampus,
  ocorrenciasResumo,
  ocorrenciasPorVeiculo,
  selectedYear,
}: {
  visaoGeral: any;
  corridasResumo: any;
  desempenhoMotoristas: any;
  corridasTabela: any;
  carrosResumo: any;
  carrosSituacao: any;
  desempenhoCarros: any;
  carrosTabela: any;
  abastecimentoResumo: any;
  abastecimentoCustoPorCombustivel: any;
  abastecimentoConsumoMensal: any;
  abastecimentoConsumoPorCampus: any;
  ocorrenciasResumo: any;
  ocorrenciasPorVeiculo: any;
  selectedYear: number;
}) => {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Consolidar todos os dados para o PDF
  const allData = {
    visaoGeral: visaoGeral || {},
    corridasResumo: corridasResumo || { totalCorridas: 0, porSituacao: [] },
    desempenhoMotoristas: desempenhoMotoristas || [],
    corridasTabela: corridasTabela || [],
    carrosResumo: carrosResumo || { totalVeiculos: 0, emOperacao: 0, emManutencao: 0, ociosos: 0 },
    carrosSituacao: carrosSituacao || [],
    desempenhoCarros: desempenhoCarros || [],
    carrosTabela: carrosTabela || [],
    abastecimentoResumo: abastecimentoResumo || { totalLitros: 0, totalValor: 0 },
    abastecimentoCustoPorCombustivel: abastecimentoCustoPorCombustivel || [],
    abastecimentoConsumoMensal: abastecimentoConsumoMensal || [],
    abastecimentoConsumoPorCampus: abastecimentoConsumoPorCampus || [],
    ocorrenciasResumo: ocorrenciasResumo || { totalOcorrencias: 0 },
    ocorrenciasPorVeiculo: ocorrenciasPorVeiculo || [],
  };

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      // Criar o PDF
      const blob = await pdf(
        <RelatorioPDF
          data={allData}
          selectedYear={selectedYear}
        />
      ).toBlob();

      // Criar link para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_frotas_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleExport}
      disabled={isGenerating}
      startIcon={<Download />}
      sx={{
        textTransform: 'none', 
        fontWeight: 600, 
        boxShadow: theme.shadows[2],
        height: '35px',
        }}
    >
      {isGenerating ? 'Gerando PDF...' : 'Exportar Relatório'}
    </Button>
  );
};

export default ExportarRelatorioPDF;
