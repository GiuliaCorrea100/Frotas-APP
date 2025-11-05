import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import { OcorrenciaDto } from "../../../../services/OcorrenciaService";
import axiosConnect from "../../../../services/axios/axiosConnect";


interface ModalEditarOcorrenciaProps {
  open: boolean;
  ocorrencia: OcorrenciaDto | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const ModalEditarOcorrencia: React.FC<ModalEditarOcorrenciaProps> = ({
  open,
  ocorrencia,
  onClose,
  onSuccess,
  onError,
}) => {
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ocorrencia) {
      setDescricao(ocorrencia.descricao || "");
    }
  }, [ocorrencia]);

  const handleSalvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ocorrencia) return;

    setLoading(true);
    try {
      await axiosConnect.patch(`/ocorrencia/${ocorrencia.idOcorrencia}/descricao`, {
        descricao,
      });

      onSuccess("Ocorrência atualizada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar ocorrência:", error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Ocorrência</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSalvar} sx={{ mt: 1 }}>
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            margin="dense"
            multiline
            rows={3}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSalvar} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEditarOcorrencia;