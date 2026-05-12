import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close } from "@mui/icons-material";

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

export default function ModalRecursoRejeitado({
  open,
  onClose,
  recurso,
}: Props) {
  const theme = useTheme();

  if (!recurso) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle} onClick={(e) => e.stopPropagation()}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Recurso Rejeitado
          </Typography>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

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
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography color="text.secondary">
              {recurso.justificativa || "Não informada"}
            </Typography>
          </Box>
        </Box>

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
              border: `1px solid ${theme.palette.error.main}`
            }}
          >
            <Typography color="error.main">
              {recurso.justificativaRejeicao || "Não informado"}
            </Typography>
          </Box>
        </Box>

        {/* <Divider sx={{ my: 2 }} /> */}

        
        {/* <Box display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="contained" color="primary">
            Fechar
          </Button>
        </Box> */}
      </Paper>
    </Modal>
  );
}