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
  Image,
} from "@react-pdf/renderer";
import { CorridaFrontend } from "../../services/CorridaService";
import { buscarPercursosDaCorrida } from "../../services/PercursoService";
import AbastecimentoService from "../../services/AbastecimentoService";
import { OcorrenciaService } from "../../services/OcorrenciaService";
import { CorridaVistoriaService } from "../../services/CorridaVistoriaService";
import { formatDate, formatDateOnly } from "../../utils/formatDate";
import axiosConnect from "../../services/axios/axiosConnect";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
    pageBreakInside: "avoid",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 5,
  },
  card: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1976d2",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    fontSize: 10,
  },
  infoLabel: {
    width: "35%",
    fontWeight: "bold",
    color: "#666",
  },
  infoValue: {
    width: "65%",
    color: "#000",
  },
  table: {
    width: "100%",
    border: "1px solid #e0e0e0",
    marginTop: 10,
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e0e0e0",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
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
    color: "#666",
  },
  vistoriaCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    border: "1px solid #e0e0e0",
  },
  vistoriaTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1976d2",
  },
  statusOk: {
    color: "#2e7d32",
  },
  statusError: {
    color: "#d32f2f",
  },
  photoGrid: {
    flexDirection: "column",
    marginTop: 5,
    gap: 8,
  },
  photoItem: {
    alignSelf: "center",
    marginBottom: 8,
    border: "1px solid #e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  photoImage: {
    maxWidth: 320,
    maxHeight: 240,
  },
  noPhotoText: {
    fontSize: 8,
    color: "#999",
    fontStyle: "italic",
  },
  motoristaItem: {
    fontSize: 10,
    color: "#000",
    marginBottom: 2,
  },
  motoristaPrincipal: {
    fontWeight: "bold",
    color: "#1976d2",
  },
});

const safeNumber = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const safeToFixed = (val: any, decimals: number = 2): string => {
  return safeNumber(val).toFixed(decimals);
};

const formatCurrency = (val: any): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safeNumber(val));
};

// Componente para fotos da Vistoria
const VistoriaFotos = ({ fotos }: { fotos: string[] }) => {
  if (!fotos || fotos.length === 0) {
    return (
      <Text style={pdfStyles.noPhotoText}>
        Nenhuma foto registrada para esta vistoria
      </Text>
    );
  }

  return (
    <View style={pdfStyles.photoGrid}>
      {fotos.map((fotoBase64, index) => (
        <View key={index} style={pdfStyles.photoItem}>
          <Image src={fotoBase64} style={pdfStyles.photoImage} />
        </View>
      ))}
    </View>
  );
};

// Componente para fotos da Ocorrência
const OcorrenciaFotos = ({ fotos }: { fotos: string[] }) => {
  if (!fotos || fotos.length === 0) {
    return (
      <Text style={pdfStyles.noPhotoText}>
        Nenhuma foto registrada para esta ocorrência
      </Text>
    );
  }

  return (
    <View style={pdfStyles.photoGrid}>
      {fotos.map((fotoBase64, index) => (
        <View key={index} style={pdfStyles.photoItem}>
          <Image src={fotoBase64} style={pdfStyles.photoImage} />
        </View>
      ))}
    </View>
  );
};

// Componente para seção da Vistoria
const VistoriaSection = ({
  vistoria,
  titulo,
}: {
  vistoria: any;
  titulo: string;
}) => {
  if (!vistoria) return null;

  const temAvarias = !vistoria.veiculoRecebidoSemAvarias;
  const statusText = vistoria.veiculoRecebidoSemAvarias
    ? "✅ Sem avarias"
    : "⚠️ Com avarias";
  const statusStyle = vistoria.veiculoRecebidoSemAvarias
    ? pdfStyles.statusOk
    : pdfStyles.statusError;

  return (
    <View style={pdfStyles.vistoriaCard}>
      <Text style={pdfStyles.vistoriaTitle}>{titulo}</Text>

      <View style={pdfStyles.infoRow}>
        <Text style={pdfStyles.infoLabel}>Registrado por:</Text>
        <Text style={pdfStyles.infoValue}>
          {vistoria.usuarioRegistrou?.nome || "Usuário não identificado"}
        </Text>
      </View>

      <View style={pdfStyles.infoRow}>
        <Text style={pdfStyles.infoLabel}>Situação:</Text>
        <Text style={[pdfStyles.infoValue, statusStyle]}>{statusText}</Text>
      </View>

      {temAvarias && vistoria.observacoes && (
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Observações:</Text>
          <Text style={pdfStyles.infoValue}>{vistoria.observacoes}</Text>
        </View>
      )}

      {temAvarias && vistoria.fotos && vistoria.fotos.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 9,
              fontWeight: "bold",
              marginTop: 5,
              marginBottom: 5,
            }}
          >
            Fotos das avarias:
          </Text>
          <VistoriaFotos fotos={vistoria.fotos} />
        </>
      )}
    </View>
  );
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

  // Motoristas na ordem correta
  const motoristasList = corrida.motoristas || [];
  const motoristaPrincipal = motoristasList.find(
    (m: any) => m.idMotorista === corrida.idMotoristaPrincipal
  );
  const motoristasSecundarios = motoristasList.filter(
    (m: any) => m.idMotorista !== corrida.idMotoristaPrincipal
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Cabeçalho */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Relatório de Corrida</Text>
          <Text style={pdfStyles.subtitle}>
            ID da Corrida: {corrida?.idCorrida || "N/A"}
          </Text>
          <Text style={pdfStyles.subtitle}>
            Gerado em: {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR")}
          </Text>
        </View>

        {/* Informações Básicas */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Informações Básicas</Text>
          <View style={pdfStyles.card}>
            {/* Motoristas */}
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Motoristas:</Text>
              <View style={{ width: "65%" }}>
                {motoristaPrincipal && (
                  <Text
                    style={[
                      pdfStyles.motoristaItem,
                      pdfStyles.motoristaPrincipal,
                    ]}
                  >
                    {motoristaPrincipal.nome} (Principal)
                  </Text>
                )}
                {motoristasSecundarios.map((m: any, index: number) => (
                  <Text key={index} style={pdfStyles.motoristaItem}>
                    {m.nome}
                  </Text>
                ))}
                {motoristasList.length === 0 && (
                  <Text style={pdfStyles.motoristaItem}>
                    Nenhum motorista associado
                  </Text>
                )}
              </View>
            </View>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Veículo (placa):</Text>
              <Text style={pdfStyles.infoValue}>
                {corrida.placaVeiculo || "N/A"}
              </Text>
            </View>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>
                {isAgendada
                  ? "Data agendada para início:"
                  : "Data e hora de início:"}
              </Text>
              <Text style={pdfStyles.infoValue}>
                {isAgendada
                  ? formatDateOnly(corrida.dataInicio)
                  : formatDate(corrida.dataHoraLiberacaoChave)}
              </Text>
            </View>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>
                {isAgendada
                  ? "Data agendada para término:"
                  : "Data e hora de término:"}
              </Text>
              <Text style={pdfStyles.infoValue}>
                {isAgendada
                  ? formatDateOnly(corrida.dataTermino)
                  : corrida.dataHoraRecebimentoChave
                  ? formatDate(corrida.dataHoraRecebimentoChave)
                  : "-"}
              </Text>
            </View>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Status:</Text>
              <Text style={pdfStyles.infoValue}>{corrida.situacao || "N/A"}</Text>
            </View>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Status da chave:</Text>
              <Text style={pdfStyles.infoValue}>
                {corrida.chaveEmprestada ? "Emprestada" : "Não Emprestada"}
              </Text>
            </View>
          </View>
        </View>

        {/* Vistoria de Retirada */}
        {vistoriaRetirada && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Vistoria de Retirada</Text>
            <VistoriaSection
              vistoria={vistoriaRetirada}
              titulo="Vistoria Motorista"
            />
          </View>
        )}

        {/* Vistoria de Devolução */}
        {vistoriaDevolucao && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Vistoria de Devolução</Text>
            <VistoriaSection
              vistoria={vistoriaDevolucao}
              titulo="Vistoria Administrador"
            />
          </View>
        )}

        {/* Ocorrências com Cards e Fotos */}
        {ocorrencias && ocorrencias.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>
              Ocorrências ({ocorrencias.length})
            </Text>

            {ocorrencias.map((item: any, idx: number) => (
              <View key={idx} style={pdfStyles.card}>
                <Text style={pdfStyles.cardTitle}>
                  Ocorrência {idx + 1}
                </Text>

                <View style={pdfStyles.infoRow}>
                  <Text style={pdfStyles.infoLabel}>
                    Motorista Responsável:
                  </Text>
                  <Text style={pdfStyles.infoValue}>
                    {item.nomeMotorista || "N/A"}
                  </Text>
                </View>

                <View style={pdfStyles.infoRow}>
                  <Text style={pdfStyles.infoLabel}>
                    Data:
                  </Text>
                  <Text style={pdfStyles.infoValue}>
                    {item.dataOcorrencia
                      ? formatDateOnly(item.dataOcorrencia)
                      : "N/A"}
                  </Text>
                </View>

                <View style={pdfStyles.infoRow}>
                  <Text style={pdfStyles.infoLabel}>
                    Descrição:
                  </Text>
                  <Text style={pdfStyles.infoValue}>
                    {item.descricao || "N/A"}
                  </Text>
                </View>

                {/* Fotos da ocorrência */}
                {item.fotos && item.fotos.length > 0 ? (
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "bold",
                        marginBottom: 5,
                      }}
                    >
                      Fotos da ocorrência:
                    </Text>
                    <OcorrenciaFotos fotos={item.fotos} />
                  </View>
                ) : (
                  <Text style={pdfStyles.noPhotoText}>
                    Nenhuma foto registrada para esta ocorrência
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Abastecimentos */}
        {abastecimentos && abastecimentos.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>
              Abastecimentos ({abastecimentos.length})
            </Text>
            <View style={pdfStyles.table}>
              <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                <Text style={pdfStyles.tableCell}>Motorista Responsável</Text>
                <Text style={pdfStyles.tableCell}>Combustível</Text>
                <Text style={pdfStyles.tableCell}>Quantidade (L)</Text>
                <Text style={pdfStyles.tableCell}>Valor/Litro</Text>
                <Text style={pdfStyles.lastTableCell}>Valor Total</Text>
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
                    {safeToFixed(item.quantidade, 2)}
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

            {/* Resumo com Total de Abastecimentos */}
            <View style={[pdfStyles.card, { marginTop: 10 }]}>
              <Text style={pdfStyles.cardTitle}>Resumo de Abastecimentos</Text>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>Total de Abastecimentos:</Text>
                <Text style={pdfStyles.infoValue}>{abastecimentos.length}</Text>
              </View>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>Total de Litros:</Text>
                <Text style={pdfStyles.infoValue}>
                  {safeToFixed(
                    abastecimentos.reduce(
                      (sum, a) => sum + safeNumber(a.quantidade),
                      0
                    ),
                    2
                  )}{" "}
                  L
                </Text>
              </View>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>Custo Total:</Text>
                <Text style={pdfStyles.infoValue}>
                  {formatCurrency(
                    abastecimentos.reduce(
                      (sum, a) => sum + safeNumber(a.valorTotal),
                      0
                    )
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Percursos */}
        {percursos && percursos.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>
              Percursos ({percursos.length})
            </Text>
            <View style={pdfStyles.table}>
              <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                <Text style={pdfStyles.tableCell}>Motorista Responsável</Text>
                <Text style={pdfStyles.tableCell}>Origem</Text>
                <Text style={pdfStyles.tableCell}>Data Saída</Text>
                <Text style={pdfStyles.tableCell}>Odômetro Saída</Text>
                <Text style={pdfStyles.tableCell}>Destino</Text>
                <Text style={pdfStyles.tableCell}>Data Chegada</Text>
                <Text style={pdfStyles.lastTableCell}>Odômetro Chegada</Text>
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
                    {item.saidaHora ? formatDate(item.saidaHora) : "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {safeNumber(item.saidaOdometro) > 0
                      ? `${safeNumber(item.saidaOdometro).toFixed(0)} km`
                      : "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {item.localDestino || "N/A"}
                  </Text>
                  <Text style={pdfStyles.tableCell}>
                    {item.chegadaHora
                      ? formatDate(item.chegadaHora)
                      : "Em andamento"}
                  </Text>
                  <Text style={pdfStyles.lastTableCell}>
                    {item.chegadaOdometro && safeNumber(item.chegadaOdometro) > 0
                      ? `${safeNumber(item.chegadaOdometro).toFixed(0)} km`
                      : item.chegadaHora
                      ? "N/A"
                      : "Em andamento"}
                  </Text>
                </View>
              ))}
            </View>

            {/* Resumo com Total de Percursos */}
            <View style={[pdfStyles.card, { marginTop: 10 }]}>
              <Text style={pdfStyles.cardTitle}>Resumo de Percursos</Text>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>Total de Percursos:</Text>
                <Text style={pdfStyles.infoValue}>{percursos.length}</Text>
              </View>
              <View style={pdfStyles.infoRow}>
                <Text style={pdfStyles.infoLabel}>Distância Total Percorrida:</Text>
                <Text style={pdfStyles.infoValue}>
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
                  )}{" "}
                  km
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={pdfStyles.footer}>
          <Text>Sistema de Controle de Frotas - Relatório de Corrida</Text>
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

      const ocorrenciasComFotos = await Promise.all(
        ocorrencias
          .filter(Boolean)
          .map(async (ocorrencia) => {
            try {
              const arquivos =
                await OcorrenciaService.buscarArquivosOcorrencia(
                  ocorrencia.idOcorrencia
                );

              const fotosBase64 = await Promise.all(
                (arquivos || []).map(async (arquivo: any) => {
                  try {
                    const relativePath = arquivo.urlArquivo.replace(
                      /^https?:\/\/[^/]+/,
                      ""
                    );

                    const { data } = await axiosConnect.get(
                      "/anexo/converter-png",
                      {
                        params: {
                          path: relativePath,
                        },
                      }
                    );

                    return data.url;
                  } catch (error) {
                    console.error(
                      `Erro ao converter foto da ocorrência ${ocorrencia.idOcorrencia}:`,
                      error
                    );
                    return null;
                  }
                })
              );

              return {
                ...ocorrencia,
                fotos: fotosBase64.filter(Boolean),
              };
            } catch (error) {
              console.error(
                `Erro ao buscar fotos da ocorrência ${ocorrencia.idOcorrencia}:`,
                error
              );
              return {
                ...ocorrencia,
                fotos: [],
              };
            }
          })
      );

      const abastecimentos = Array.isArray(abastecimentosData)
        ? abastecimentosData
        : [abastecimentosData];
      const percursos = Array.isArray(percursosData)
        ? percursosData
        : [percursosData];
      let vistoriasComFotos = Array.isArray(vistoriasData)
        ? vistoriasData
        : [vistoriasData];

      vistoriasComFotos = vistoriasComFotos.filter(Boolean);

      // Buscar imagens das vistorias que contenham avarias
      for (const vistoria of vistoriasComFotos) {
        if (!vistoria.veiculoRecebidoSemAvarias && vistoria.idCorridaVistoria) {
          try {
            const fotos = await CorridaVistoriaService.buscarFotosVistoria(
              vistoria.idCorridaVistoria
            );
            const fotosBase64 = await Promise.all(
              fotos.map(async (f) => {
                const relativePath = f.urlArquivo.replace(
                  /^https?:\/\/[^/]+/,
                  ""
                );
                const { data } = await axiosConnect.get(
                  "/anexo/converter-png",
                  {
                    params: { path: relativePath },
                  }
                );
                return data.url;
              })
            );
            (vistoria as any).fotos = fotosBase64;
          } catch (error) {
            console.error("Erro ao buscar fotos da vistoria:", error);
          }
        }
      }

      const doc = (
        <RelatorioCorridaDocumento
          corrida={corrida}
          ocorrencias={ocorrenciasComFotos}
          abastecimentos={abastecimentos.filter(Boolean)}
          percursos={percursos.filter(Boolean)}
          vistorias={vistoriasComFotos}
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