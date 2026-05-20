import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
  Alert
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Description, Close } from "@mui/icons-material";
import { MultaService } from "../../../services/MultaService";

interface Props {
  open: boolean;
  onClose: () => void;
  recurso: any;
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

export default function ModalVisualizarRecurso({
  open,
  onClose,
  recurso
}: Props) {
  const theme = useTheme();

  if (!recurso) return null;

  const fileUrl = recurso.urlArquivo;

  const handleVisualizarDocumento = async () => {
    if (!fileUrl) return;

    try {
      const fileName = fileUrl.split("/").pop();
      if (!fileName) return;

      const blob = await MultaService.downloadArquivo(fileName);
      const blobUrl = window.URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Erro ao abrir o documento:", error);
      alert("Não foi possível carregar o arquivo.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Description color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Visualizar Recurso
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* CONTEÚDO */}
        <Box mb={3}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="text.primary"
            mb={1}
          >
            Justificativa
          </Typography>

          <Box
            sx={{
              backgroundColor: theme.palette.background.default,
              p: 2,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography color="text.secondary">
              {recurso.justificativa}
            </Typography>
          </Box>
        </Box>

        {/* AÇÕES */}
        <Box display="flex" justifyContent="space-between" alignItems="center">

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

          <Button onClick={onClose} color="inherit">
            Fechar
          </Button>
        </Box>

      </Paper>
    </Modal>
  );
}