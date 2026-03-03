import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
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
        <Typography>
          Escolha o que deseja fazer com o comprovante desta multa.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleVisualizar}
          >
            Visualizar boleto
          </Button>

          <Button
            variant="contained"
            onClick={handleDownload}
          >
            Baixar boleto
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}