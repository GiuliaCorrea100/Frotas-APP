import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close } from "@mui/icons-material";
import { MultaService } from "../../../services/MultaService";

interface Props {
  open: boolean;
  onClose: () => void;
  recurso: any;
  situacao: any;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function ModalRecursoRejeitado({
  open,
  onClose,
  recurso,
  situacao,
}: Props) {
  const theme = useTheme();

  if (!recurso) return null;

  const mostrarMotivoRejeicao =
    situacao === "RECURSO NEGADO - AGUARDANDO PAGAMENTO";

  const fileUrl = recurso.urlArquivo;

  const handleVisualizarDocumento = async () => {
    if (!fileUrl) return;

    try {
      const fileName = fileUrl.split("/").pop();
      if (!fileName) return;

      const blob = await MultaService.downloadArquivo(fileName);
      const blobUrl = window.URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Erro ao abrir o documento:", error);
      alert("Não foi possível carregar o arquivo.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="text.primary"
          >
            Situação do recurso solicitado
          </Typography>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* JUSTIFICATIVA */}
        <Box mb={4}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="text.primary"
            mb={1}
          >
            Justificativa do Recurso
          </Typography>

          <Box
            sx={{
              backgroundColor: theme.palette.background.default,
              p: 2,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography color="text.secondary">
              {recurso.justificativa || "Não informada"}
            </Typography>
          </Box>

          {/* AÇÕES */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            mt={2}
            flexWrap="wrap"
          >
            {!fileUrl ? (
              <Alert severity="info">
                Nenhum documento disponível.
              </Alert>
            ) : (
              <Button
                variant="contained"
                onClick={handleVisualizarDocumento}
              >
                Visualizar Documento
              </Button>
            )}
          </Box>
        </Box>

        {/* MOTIVO REJEIÇÃO */}
        {mostrarMotivoRejeicao && (
          <Box mb={4}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="error"
              mb={1}
            >
              Motivo da Rejeição
            </Typography>

            <Box
              sx={{
                backgroundColor: theme.palette.error.light + "20",
                p: 2,
                borderRadius: 1,
                border: `1px solid ${theme.palette.error.main}`,
              }}
            >
              <Typography color="error.main">
                {recurso.justificativaRejeicao || "Não informado"}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Modal>
  );
}