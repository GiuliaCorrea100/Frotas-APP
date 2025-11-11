import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  IconButton,
} from "@mui/material";
import {
  LocalGasStation,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import { MultaService } from "../../../services/MultaService";


interface CadastrarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%", 
  maxWidth: 700, 
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const CadastroMultaModal: React.FC<CadastrarModalProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [codigoInfracao, setCodigoInfracao] = useState<number>(0);
  const [classificacao, setClassificacao] = useState("");
  const [valorInfracao, setValorInfracao] = useState<number>(0);
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [dataInfracao, setDataInfracao] = useState<string>("");
  const [autoInfracao, setAutoInfracao] = useState<number>(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Resetar os estados ao abrir o modal
      setAutoInfracao(0);
      setClassificacao("");
      setCodigoInfracao(0);
      setDataInfracao("");
      setPlacaVeiculo("");
      setValorInfracao(0);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Criar a data considerando o fuso horário de Porto Velho -4
      const dataInfracaoUTC = new Date(dataInfracao + 'T04:00:00.000Z');

      const dadosMultas = {
        codigoInfracao,
        classificacao,
        valorInfracao,
        placaVeiculo,
        dataInfracao : dataInfracaoUTC,
        autoInfracao,
      };

      await MultaService.criarMulta(dadosMultas);
      onSuccess("Multa cadastrada com sucesso");
    } catch (error) {
      console.error("Erro ao cadastrar multa: ", error);
      onError(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle}>
        {/* CABEÇALHO */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <LocalGasStation color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Cadastro de Multa
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* FORMULÁRIO */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexWrap="wrap"
          gap={2} 
        >
          
          <TextField
            label="Código da Infração"
            type="number"
            value={codigoInfracao}
            onChange={(e) => setCodigoInfracao(Number(e.target.value))}
            required
            fullWidth
            
            sx={{ flex: "1 1 calc(50% - 8px)" }} 
          />
          <TextField
            label="Classificação"
            value={classificacao}
            onChange={(e) => setClassificacao(e.target.value)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
          />
          <TextField
            label="Valor da multa (R$)"
            type="number"
            value={valorInfracao}
            onChange={(e) => setValorInfracao(Number(e.target.value))}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        R$
                    </InputAdornment>
                ),
            }}
          />
          <TextField
            label="Placa do Veículo"
            value={placaVeiculo}
            onChange={(e) => setPlacaVeiculo(e.target.value)}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
          />
          <TextField
            label="Auto da Infração"
            type="number"
            value={autoInfracao}
            onChange={(e) => setAutoInfracao(Number(e.target.value))}
            required
            fullWidth
            sx={{ flex: "1 1 calc(50% - 8px)" }}
          />

          
          <TextField
            label="Data da Infração"
            type="date"
            fullWidth
            value={dataInfracao}
            onChange={(e) => setDataInfracao(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              ),
            }}
            
            sx={{ flex: "1 1 100%", mt: 1 }}
          />

          {/* BOTÕES */}
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            gap={1} 
            mt={3} 
            sx={{ flex: "1 1 100%" }}
          >
            <Button onClick={onClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Cadastrar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default CadastroMultaModal;