import React, { useState } from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { Button, useTheme, CircularProgress } from "@mui/material";
import { Download } from "@mui/icons-material";
import { CorridaFrontend } from "../../services/CorridaService";
import { formatDate } from "../../utils/formatDate";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  header: { marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid #e0e0e0" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 3 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#1976d2" },
  cardSummary: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: { fontSize: 10 },
  summaryLabel: { color: "#666", fontSize: 9 },
  summaryValue: { fontWeight: "bold", fontSize: 12 },
  table: { width: "100%", border: "1px solid #e0e0e0", fontSize: 8 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e0e0e0" },
  tableHeader: { backgroundColor: "#f5f5f5", fontWeight: "bold" },
  tableCell: { padding: 6, flex: 1, borderRight: "1px solid #e0e0e0" },
  lastTableCell: { padding: 6, flex: 1 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
  },
});

interface RelatorioHistoricoProps {
  corridas: CorridaFrontend[];
}

const RelatorioHistoricoMotoristaPDFDocument: React.FC<RelatorioHistoricoProps> = ({ corridas }) => {
  const totalCorridas = corridas.length;
  const finalizadas = corridas.filter((c) => c.situacao === "FINALIZADA").length;
  const emAndamento = corridas.filter((c) => c.situacao === "ANDAMENTO").length;
  const canceladas = corridas.filter((c) => c.situacao === "CANCELADA").length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Histórico de Corridas do Motorista</Text>
          <Text style={styles.subtitle}>
            Gerado em: {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR")}
          </Text>
        </View>

        <View style={styles.cardSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total de Corridas</Text>
            <Text style={styles.summaryValue}>{totalCorridas}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Finalizadas</Text>
            <Text style={styles.summaryValue}>{finalizadas}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Em Andamento</Text>
            <Text style={styles.summaryValue}>{emAndamento}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Canceladas</Text>
            <Text style={styles.summaryValue}>{canceladas}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listagem de Corridas</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>ID / Veículo</Text>
              <Text style={styles.tableCell}>Data/Hora Início</Text>
              <Text style={styles.tableCell}>Data/Hora Término</Text>
              <Text style={styles.lastTableCell}>Situação</Text>
            </View>
            {corridas.map((corrida, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  #{corrida.idCorrida} - {corrida.placaVeiculo || "N/A"}
                </Text>
                <Text style={styles.tableCell}>
                  {corrida.dataHoraLiberacaoChave
                    ? formatDate(corrida.dataHoraLiberacaoChave)
                    : formatDate(corrida.dataInicio)}
                </Text>
                <Text style={styles.tableCell}>
                  {corrida.dataHoraRecebimentoChave
                    ? formatDate(corrida.dataHoraRecebimentoChave)
                    : corrida.dataTermino
                    ? formatDate(corrida.dataTermino)
                    : "-"}
                </Text>
                <Text style={styles.lastTableCell}>
                  {corrida.situacao || "N/A"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Sistema de Controle de Frotas - Histórico do Motorista</Text>
        </View>
      </Page>
    </Document>
  );
};

export const ExportarHistoricoMotoristaPDF: React.FC<{
  corridas: CorridaFrontend[];
  disabled?: boolean;
}> = ({ corridas, disabled = false }) => {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (!corridas || corridas.length === 0) {
      alert("Nenhuma corrida disponível para exportação.");
      return;
    }

    setIsGenerating(true);
    try {
      const doc = <RelatorioHistoricoMotoristaPDFDocument corridas={corridas} />;
      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historico_corridas_motorista_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF do histórico:", error);
      alert("Erro ao gerar o histórico em PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleExport}
      disabled={isGenerating || disabled || corridas.length === 0}
      startIcon={
        isGenerating ? <CircularProgress size={18} color="inherit" /> : <Download />
      }
      sx={{
        textTransform: "none",
        fontWeight: 600,
        boxShadow: theme.shadows[2],
        height: "38px",
      }}
    >
      {isGenerating ? "Gerando Relatório..." : "Exportar Histórico"}
    </Button>
  );
};