import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider
} from "@mui/material";
import { MultaDto, MultaService } from "../../../services/MultaService";

interface Props {
  open: boolean;
  onClose: () => void;
  multa: MultaDto | null;
}

export default function ModalComprovanteMulta({ open, onClose, multa }: Props) {
  if (!multa?.urlComprovantePagamento) return null;

  const fileName = multa.urlComprovantePagamento.split("/").pop()!;

  const handleDownload = async () => {
    const blob = await MultaService.downloadArquivo(fileName);

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `comprovante_${multa.autoInfracao}.pdf`;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleVisualizar = async () => {
    const blob = await MultaService.downloadArquivo(fileName);
    const fileURL = window.URL.createObjectURL(blob);
    window.open(fileURL, "_blank");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Comprovante de Pagamento</DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Escolha o que deseja fazer com o comprovante desta multa.
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleVisualizar}
          >
            Visualizar boleto
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={handleDownload}
          >
            Baixar boleto
          </Button>
        </Box>
      </DialogContent>

      <Divider sx={{ my: 1 }} />

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => {}}
          >
            Aprovar comprovante
          </Button>

          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => {}}
          >
            Reprovar comprovante
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}