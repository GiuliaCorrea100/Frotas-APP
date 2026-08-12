import React, { useState } from "react";
import { Button, Tooltip, CircularProgress } from "@mui/material";
import { Download } from "@mui/icons-material";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { CorridaFrontend } from "../../services/CorridaService";
import { buscarPercursosDaCorrida } from "../../services/PercursoService";
import AbastecimentoService from "../../services/AbastecimentoService";
import { OcorrenciaService } from "../../services/OcorrenciaService";
import { CorridaVistoriaService } from "../../services/CorridaVistoriaService";
import { formatDate, formatDateOnly } from "../../utils/formatDate";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 15,
    paddingBottom: 8,
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1976d2",
    borderBottom: "1px solid #eee",
    paddingBottom: 3,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    border: "1px solid #e0e0e0",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 9,
  },
  label: {
    width: "35%",
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    width: "65%",
    color: "#000",
  },
  table: {
    width: "100%",
    border: "1px solid #e0e0e0",
    fontSize: 8,
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e0e0e0",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 5,
    flex: 1,
    borderRight: "1px solid #e0e0e0",
  },
  lastTableCell: {
    padding: 5,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#888",
  },
});

const safeNumber = (val: any): number => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (val: any): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safeNumber(val));
};

const RelatorioCorridaDocumento: React.FC<{
  corrida: CorridaFrontend;
  ocorrencias: any[];
  abastecimentos: any[];
  percursos: any[];
  vistorias: any[];
}> = ({ corrida, ocorrencias, abastecimentos, percursos, vistorias }) => {
  const isAgendada = !corrida.dataHoraLiberacaoChave;

  const vistoriaRetirada = vistorias.find((v) => v.tipo === "RETIRADA");
  const vistoriaDevolucao = vistorias.find((v) => v.tipo === "DEVOLUCAO");

  const totalLitros = abastecimentos.reduce(
    (sum, a) => sum + safeNumber(a.quantidade),
    0
  );
  const totalCustoAbastecimento = abastecimentos.reduce(
    (sum, a) => sum + safeNumber(a.valorTotal),
    0
  );

  const totalKm = percursos.reduce((sum, p) => {
    const chegada = safeNumber(p.chegadaOdometro);
    const saida = safeNumber(p.saidaOdometro);
    return chegada > 0 && saida > 0 ? sum + (chegada - saida) : sum;
  }, 0);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>
            Relatório Detalhado da Corrida #{corrida.idCorrida}
          </Text>
          <Text style={pdfStyles.subtitle}>
            Gerado em: {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR")}
          </Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Informações Básicas</Text>
          <View style={pdfStyles.card}>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Veículo (Placa):</Text>
              <Text style={pdfStyles.value}>{corrida.placaVeiculo || "N/A"}</Text>
            </View>

            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Motoristas:</Text>
              <Text style={pdfStyles.value}>
                {corrida.motoristas && corrida.motoristas.length > 0
                  ? corrida.motoristas
                      .map(
                        (m) =>
                          `${m.nome}${
                            m.idMotorista === corrida.idMotoristaPrincipal
                              ? " (Principal)"
                              : ""
                          }`
                      )
                      .join(", ")
                  : "Nenhum motorista registrado"}
              </Text>
            </View>

            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>
                {isAgendada ? "Início Agendado:" : "Data/Hora Início:"}
              </Text>
              <Text style={pdfStyles.value}>
                {isAgendada
                  ? formatDateOnly(corrida.dataInicio)
                  : formatDate(corrida.dataHoraLiberacaoChave)}
              </Text>
            </View>

            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>
                {isAgendada ? "Término Agendado:" : "Data/Hora Término:"}
              </Text>
              <Text style={pdfStyles.value}>
                {isAgendada
                  ? formatDateOnly(corrida.dataTermino)
                  : corrida.dataHoraRecebimentoChave
                  ? formatDate(corrida.dataHoraRecebimentoChave)
                  : "-"}
              </Text>
            </View>

            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Situação:</Text>
              <Text style={pdfStyles.value}>{corrida.situacao || "N/A"}</Text>
            </View>

            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Status da Chave:</Text>
              <Text style={pdfStyles.value}>
                {corrida.chaveEmprestada ? "Emprestada" : "Não Emprestada"}
              </Text>
            </View>
          </View>
        </View>

        {(vistoriaRetirada || vistoriaDevolucao) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Vistorias</Text>
            {vistoriaRetirada && (
              <View style={pdfStyles.card}>
                <Text style={{ fontWeight: "bold", fontSize: 10, marginBottom: 4 }}>
                  Vistoria Motorista (Retirada)
                </Text>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Registrado por:</Text>
                  <Text style={pdfStyles.value}>
                    {vistoriaRetirada.usuarioRegistrou?.nome || "N/A"}
                  </Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Situação:</Text>
                  <Text style={pdfStyles.value}>
                    {vistoriaRetirada.veiculoRecebidoSemAvarias
                      ? "Sem avarias"
                      : "Com avarias"}
                  </Text>
                </View>
                {vistoriaRetirada.observacoes && (
                  <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Observações:</Text>
                    <Text style={pdfStyles.value}>{vistoriaRetirada.observacoes}</Text>
                  </View>
                )}
              </View>
            )}

            {vistoriaDevolucao && (
              <View style={pdfStyles.card}>
                <Text style={{ fontWeight: "bold", fontSize: 10, marginBottom: 4 }}>
                  Vistoria Administrador (Devolução)
                </Text>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Registrado por:</Text>
                  <Text style={pdfStyles.value}>
                    {vistoriaDevolucao.usuarioRegistrou?.nome || "N/A"}
                  </Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Situação:</Text>
                  <Text style={pdfStyles.value}>
                    {vistoriaDevolucao.veiculoRecebidoSemAvarias
                      ? "Sem avarias"
                      : "Com avarias"}
                  </Text>
                </View>
                {vistoriaDevolucao.observacoes && (
                  <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Observações:</Text>
                    <Text style={pdfStyles.value}>{vistoriaDevolucao.observacoes}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {ocorrencias && ocorrencias.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>
              Ocorrências ({ocorrencias.length})
            </Text>
            <View style={pdfStyles.table}>
              <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                <Text style={pdfStyles.tableCell}>Motorista Responsável</Text>
                <Text style={pdfStyles.tableCell}>Descrição</Text>
                <Text style={pdfStyles.lastTableCell}>Data</Text>
              </View>
              {ocorrencias.map((item, idx) => (
                <View key={idx} style={pdfStyles.tableRow}>
                  <Text style={pdfStyles.tableCell}>
                    {item.nomeMotorista || "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {item.descricao || "N/A"}
                  </Text>
                  <Text style={pdfStyles.lastTableCell}>
                    {formatDateOnly(item.dataOcorrencia)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {abastecimentos && abastecimentos.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>
              Abastecimentos ({abastecimentos.length})
            </Text>
            <View style={pdfStyles.table}>
              <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                <Text style={pdfStyles.tableCell}>Motorista</Text>
                <Text style={pdfStyles.tableCell}>Combustível</Text>
                <Text style={pdfStyles.tableCell}>Qtd (L)</Text>
                <Text style={pdfStyles.tableCell}>Valor Litro</Text>
                <Text style={pdfStyles.lastTableCell}>Total</Text>
              </View>
              {abastecimentos.map((item, idx) => (
                <View key={idx} style={pdfStyles.tableRow}>
                  <Text style={pdfStyles.tableCell}>
                    {item.nomeMotorista || "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {item.nomeTipoCombustivel || "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {safeNumber(item.quantidade).toFixed(2)}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {formatCurrency(item.valorUnitario)}
                  </Text>
                  <Text style={pdfStyles.lastTableCell}>
                    {formatCurrency(item.valorTotal)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[pdfStyles.card, { marginTop: 6 }]}>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Total de Litros:</Text>
                <Text style={pdfStyles.value}>{totalLitros.toFixed(2)} L</Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Custo Total de Abastecimento:</Text>
                <Text style={pdfStyles.value}>
                  {formatCurrency(totalCustoAbastecimento)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {percursos && percursos.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>
              Percursos ({percursos.length})
            </Text>
            <View style={pdfStyles.table}>
              <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                <Text style={pdfStyles.tableCell}>Motorista</Text>
                <Text style={pdfStyles.tableCell}>Origem</Text>
                <Text style={pdfStyles.tableCell}>Saída (Km)</Text>
                <Text style={pdfStyles.tableCell}>Destino</Text>
                <Text style={pdfStyles.lastTableCell}>Chegada (Km)</Text>
              </View>
              {percursos.map((item, idx) => (
                <View key={idx} style={pdfStyles.tableRow}>
                  <Text style={pdfStyles.tableCell}>
                    {item.nomeMotorista || "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {item.localOrigem || "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {safeNumber(item.saidaOdometro)} km
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {item.localDestino || "N/A"}
                  </Text>
                  <Text style={pdfStyles.lastTableCell}>
                    {item.chegadaOdometro
                      ? `${safeNumber(item.chegadaOdometro)} km`
                      : "Em andamento"}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[pdfStyles.card, { marginTop: 6 }]}>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Distância Total Percorrida:</Text>
                <Text style={pdfStyles.value}>{totalKm.toFixed(0)} km</Text>
              </View>
            </View>
          </View>
        )}

        <View style={pdfStyles.footer}>
          <Text>Sistema de Controle de Frotas - Relatório Individual de Corrida</Text>
        </View>
      </Page>
    </Document>
  );
};

interface BotaoExportarCorridaIndividualProps {
  corrida: CorridaFrontend;
}

export const BotaoExportarCorridaIndividual: React.FC<
  BotaoExportarCorridaIndividualProps
> = ({ corrida }) => {
  const [loading, setLoading] = useState(false);

  const handleExportIndividual = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    try {
      const [percursosData, abastecimentosData, ocorrenciasData, vistoriasData] =
        await Promise.all([
          buscarPercursosDaCorrida(corrida.idCorrida).catch(() => []),
          AbastecimentoService.buscarPorCorrida(corrida.idCorrida).catch(() => []),
          OcorrenciaService.buscarPorCorrida(corrida.idCorrida).catch(() => []),
          CorridaVistoriaService.buscarVistoria(corrida.idCorrida).catch(() => []),
        ]);

      const ocorrencias = Array.isArray(ocorrenciasData)
        ? ocorrenciasData
        : [ocorrenciasData];
      const abastecimentos = Array.isArray(abastecimentosData)
        ? abastecimentosData
        : [abastecimentosData];
      const percursos = Array.isArray(percursosData)
        ? percursosData
        : [percursosData];
      const vistorias = Array.isArray(vistoriasData)
        ? vistoriasData
        : [vistoriasData];

      const doc = (
        <RelatorioCorridaDocumento
          corrida={corrida}
          ocorrencias={ocorrencias.filter(Boolean)}
          abastecimentos={abastecimentos.filter(Boolean)}
          percursos={percursos.filter(Boolean)}
          vistorias={vistorias.filter(Boolean)}
        />
      );

      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_corrida_${corrida.idCorrida}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF individual:", error);
      alert("Ocorreu um erro ao gerar o PDF da corrida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Exportar Relatório">
      <span>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={handleExportIndividual}
          disabled={loading}
          sx={{
            width: 42,
            height: 42,
            minWidth: 42,
            padding: 0,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Download sx={{ fontSize: 20 }} />
          )}
        </Button>
      </span>
    </Tooltip>
  );
};