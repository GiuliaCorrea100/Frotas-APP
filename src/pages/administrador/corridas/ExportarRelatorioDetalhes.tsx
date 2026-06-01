import React from 'react';
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Download } from '@mui/icons-material';
import { formatDate, formatDateOnly } from '../../../utils/formatDate';

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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    fontSize: 10,
  },
  infoLabel: {
    width: '35%',
    fontWeight: 'bold',
    color: '#666',
  },
  infoValue: {
    width: '65%',
    color: '#000',
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
  card: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1976d2',
  },
  errorMessage: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});

// Funções auxiliares para conversão segura de números
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const safeToFixed = (value: any, decimals: number = 2): string => {
  return safeNumber(value).toFixed(decimals);
};

const formatCurrency = (value: any): string => {
  const num = safeNumber(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
};

// Componente principal do PDF
const RelatorioCorridaPDF = ({
  corrida,
  ocorrencias,
  abastecimentos,
  percursos,
}: {
  corrida: any;
  ocorrencias: any[];
  abastecimentos: any[];
  percursos: any[];
}) => {
  // Verificar se tem dados
  if (!corrida) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.errorMessage}>Erro: Dados da corrida não disponíveis</Text>
        </Page>
      </Document>
    );
  }

  const isAgendada = !corrida.dataHoraLiberacaoChave;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Corrida</Text>
          <Text style={styles.subtitle}>
            ID da Corrida: {corrida?.idCorrida || 'N/A'}
          </Text>
          <Text style={styles.subtitle}>
            Gerado em: {new Date().toLocaleDateString('pt-BR')} às{' '}
            {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>

        {/* Informações Básicas */}
        {corrida && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Motorista:</Text>
                <Text style={styles.infoValue}>{corrida.nomeMotorista || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Veículo (placa):</Text>
                <Text style={styles.infoValue}>{corrida.placaVeiculo || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {isAgendada ? 'Data agendada para início:' : 'Data e hora de início:'}
                </Text>
                <Text style={styles.infoValue}>
                  {isAgendada
                    ? formatDateOnly(corrida.dataInicio)
                    : formatDate(corrida.dataHoraLiberacaoChave)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {isAgendada ? 'Data agendada para término:' : 'Data e hora de término:'}
                </Text>
                <Text style={styles.infoValue}>
                  {isAgendada
                    ? formatDateOnly(corrida.dataTermino)
                    : corrida.dataHoraRecebimentoChave
                    ? formatDate(corrida.dataHoraRecebimentoChave)
                    : '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{corrida.situacao || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status da chave:</Text>
                <Text style={styles.infoValue}>
                  {corrida.chaveEmprestada ? 'Emprestada' : 'Não Emprestada'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Ocorrências */}
        {ocorrencias && ocorrencias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ocorrências ({ocorrencias.length})
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Descrição</Text>
                <Text style={styles.lastTableCell}>Data</Text>
              </View>
              {ocorrencias.map((ocorrencia, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {ocorrencia.descricao || 'N/A'}
                  </Text>
                  <Text style={styles.lastTableCell}>
                    {formatDateOnly(ocorrencia.dataOcorrencia)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Abastecimentos */}
        {abastecimentos && abastecimentos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Abastecimentos ({abastecimentos.length})
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Combustível</Text>
                <Text style={styles.tableCell}>Quantidade (L)</Text>
                <Text style={styles.tableCell}>Valor/Litro</Text>
                <Text style={styles.lastTableCell}>Valor Total</Text>
              </View>
              {abastecimentos.map((abastecimento, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {abastecimento.nomeTipoCombustivel || 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {safeToFixed(abastecimento.quantidade, 2)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(abastecimento.valorUnitario)}
                  </Text>
                  <Text style={styles.lastTableCell}>
                    {formatCurrency(abastecimento.valorTotal)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Resumo de Abastecimentos */}
            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.cardTitle}>Resumo de Abastecimentos</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total de Abastecimentos:</Text>
                <Text style={styles.infoValue}>{abastecimentos.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total de Litros:</Text>
                <Text style={styles.infoValue}>
                  {safeToFixed(
                    abastecimentos.reduce((sum, a) => sum + safeNumber(a.quantidade), 0),
                    2
                  )}{' '}
                  L
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Custo Total:</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(
                    abastecimentos.reduce((sum, a) => sum + safeNumber(a.valorTotal), 0)
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Percursos - Com colunas separadas para odômetro */}
        {percursos && percursos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Percursos ({percursos.length})
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Origem</Text>
                <Text style={styles.tableCell}>Data Saída </Text>
                <Text style={styles.tableCell}>Odômetro Saída</Text>
                <Text style={styles.tableCell}>Destino</Text>
                <Text style={styles.tableCell}>Data Chegada </Text>
                <Text style={styles.lastTableCell}>Odômetro Chegada</Text>
              </View>
              {percursos.map((percurso, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {percurso.localOrigem || 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {percurso.saidaHora ? formatDate(percurso.saidaHora) : 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {safeNumber(percurso.saidaOdometro) > 0 
                      ? `${safeNumber(percurso.saidaOdometro).toFixed(0)} km` 
                      : 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {percurso.localDestino || 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {percurso.chegadaHora ? formatDate(percurso.chegadaHora) : 'Em andamento'}
                  </Text>
                  <Text style={styles.lastTableCell}>
                    {percurso.chegadaOdometro && safeNumber(percurso.chegadaOdometro) > 0
                      ? `${safeNumber(percurso.chegadaOdometro).toFixed(0)} km`
                      : percurso.chegadaHora ? 'N/A' : 'Em andamento'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Resumo de Percursos */}
            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.cardTitle}>Resumo de Percursos</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total de Percursos:</Text>
                <Text style={styles.infoValue}>{percursos.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Distância Total Percorrida:</Text>
                <Text style={styles.infoValue}>
                  {safeToFixed(
                    percursos.reduce((sum, p) => {
                      const chegada = safeNumber(p.chegadaOdometro);
                      const saida = safeNumber(p.saidaOdometro);
                      if (chegada > 0 && saida > 0) {
                        return sum + (chegada - saida);
                      }
                      return sum;
                    }, 0),
                    2
                  )}{' '}
                  km
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Mensagem quando não há dados */}
        {(!ocorrencias || ocorrencias.length === 0) && 
         (!abastecimentos || abastecimentos.length === 0) && 
         (!percursos || percursos.length === 0) && (
          <View style={styles.section}>
            <Text style={styles.cardTitle}>Informações Adicionais</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>
              Não há ocorrências, abastecimentos ou percursos registrados para esta corrida.
            </Text>
          </View>
        )}

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Sistema de Controle de Frotas - Relatório de Corrida</Text>
        </View>
      </Page>
    </Document>
  );
};

// Componente de exportação principal
const ExportarCorridaPDF = ({
  corrida,
  ocorrencias,
  abastecimentos,
  percursos,
  disabled = false,
}: {
  corrida: any;
  ocorrencias: any[];
  abastecimentos: any[];
  percursos: any[];
  disabled?: boolean;
}) => {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleExport = async () => {
    console.log('Iniciando exportação do PDF...');
    console.log('Dados recebidos - Corrida:', corrida?.idCorrida);
    console.log('Ocorrências:', ocorrencias?.length || 0);
    console.log('Abastecimentos:', abastecimentos?.length || 0);
    console.log('Percursos:', percursos?.length || 0);
    
    setIsGenerating(true);

    try {
      // Validar dados antes de gerar
      if (!corrida) {
        console.error('Erro: Dados da corrida não disponíveis');
        alert('Não é possível gerar o relatório: dados da corrida não disponíveis.');
        return;
      }

      console.log('Criando componente do PDF...');
      
      // Criar o PDF
      const blob = await pdf(
        <RelatorioCorridaPDF
          corrida={corrida}
          ocorrencias={ocorrencias || []}
          abastecimentos={abastecimentos || []}
          percursos={percursos || []}
        />
      ).toBlob();

      console.log('PDF gerado com sucesso, tamanho:', blob.size, 'bytes');

      // Criar link para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `relatorio_corrida_${corrida?.idCorrida || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Download iniciado:', fileName);
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleExport}
      disabled={isGenerating || disabled}
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

export default ExportarCorridaPDF;