import React, { useState } from "react";
import { Button, Tooltip, CircularProgress } from "@mui/material";
import { Download } from "@mui/icons-material";
import { pdf } from "@react-pdf/renderer";
import { CorridaFrontend } from "../../services/CorridaService";
import { buscarPercursosDaCorrida } from "../../services/PercursoService";
import AbastecimentoService from "../../services/AbastecimentoService";
import { OcorrenciaService } from "../../services/OcorrenciaService";
import { CorridaVistoriaService } from "../../services/CorridaVistoriaService";
import RelatorioCorridaPDF from "../administrador/corridas/ExportarRelatorioDetalhes"; // ou import do componente RelatorioCorridaPDF

export const BotaoExportarCorridaIndividual: React.FC<{
  corrida: CorridaFrontend;
}> = ({ corrida }) => {
  const [loading, setLoading] = useState(false);

  const handleExportIndividual = async () => {
    setLoading(true);
    try {
      const [percursosData, abastecimentosData, ocorrenciasData, vistoriasData] =
        await Promise.all([
          buscarPercursosDaCorrida(corrida.idCorrida).catch(() => []),
          AbastecimentoService.buscarPorCorrida(corrida.idCorrida).catch(() => []),
          OcorrenciaService.buscarPorCorrida(corrida.idCorrida).catch(() => []),
          CorridaVistoriaService.buscarVistoria(corrida.idCorrida).catch(() => []),
        ]);

      const blob = await pdf(
        <RelatorioCorridaPDF
          corrida={corrida}
          ocorrencias={Array.isArray(ocorrenciasData) ? ocorrenciasData : [ocorrenciasData]}
          abastecimentos={Array.isArray(abastecimentosData) ? abastecimentosData : [abastecimentosData]}
          percursos={Array.isArray(percursosData) ? percursosData : [percursosData]}
          vistorias={Array.isArray(vistoriasData) ? vistoriasData : [vistoriasData]}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_corrida_${corrida.idCorrida}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar PDF individual:", error);
      alert("Erro ao gerar o PDF da corrida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Exportar PDF da corrida">
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
    </Tooltip>
  );
};