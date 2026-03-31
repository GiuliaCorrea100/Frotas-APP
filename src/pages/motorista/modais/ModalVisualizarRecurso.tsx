import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface Props {
  open: boolean;
  onClose: () => void;
  recurso: any;
}

export default function ModalVisualizarRecurso({
  open,
  onClose,
  recurso
}: Props) {
  const theme = useTheme();

  if (!recurso) return null;

  const fileUrl = recurso.urlArquivo;

  const handleVisualizarDocumento = () => {
    if (fileUrl) {
      window.open(`http://localhost:3000/${fileUrl}`, "_blank");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm" // 👈 menor agora
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }
      }}
    >
      <DialogTitle sx={{ color: theme.palette.text.primary }}>
        Visualizar Recurso
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              mb: 0.5
            }}
          >
            Justificativa
          </Typography>

          <Box
            sx={{
              backgroundColor: theme.palette.background.default,
              padding: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography sx={{ color: theme.palette.text.secondary }}>
              {recurso.justificativa}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} justifyContent="flex-end">
          {fileUrl && (
            <Button
              variant="contained"
              onClick={handleVisualizarDocumento}
            >
              Visualizar Documento
            </Button>
          )}

          {!fileUrl && (
            <Typography color="error">
              Nenhum documento disponível.
            </Typography>
          )}

          <Button onClick={onClose}>
            Fechar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}