import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  InputAdornment,
  CircularProgress,
  Paper,
  IconButton,
} from "@mui/material";
import {
  LocalGasStation,
  AttachMoney,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import { Abastecimento } from "../../../../api/abastecimentoService";
import abastecimentoService from "../../../../api/abastecimentoService";
import { TipoCombustivel } from "../../../../api/CarroService";
import { CorridaFrontend, getCorridas } from "../../../../api/corridaService";
import { TipoCombustivelService } from "../../../../api/tipoCombustivelService";

interface EdicaoAbastecimentoModalProps {
  open: boolean;
  abastecimento: Abastecimento | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 800,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// Função auxiliar para formatar a data
const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const EdicaoAbastecimentoModal: React.FC<EdicaoAbastecimentoModalProps> = ({
  open,
  abastecimento,
  onClose,
  onSuccess,
  onError,
}) => {
  const [quantidade, setQuantidade] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [tipoCombustivel, setTipoCombustivel] = useState<number | "">("");
  const [valorUnitario, setValorUnitario] = useState<number>(0);
  const [dataAbastecimento, setdataAbastecimento] = useState<string>("");

  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  const [corridas, setCorridas] = useState<CorridaFrontend[]>([]);
  const [loading, setLoading] = useState(false);

  // Preenche campos ao abrir
  useEffect(() => {
    if (abastecimento) {
      setQuantidade(abastecimento.quantidade ?? 0);
      setValorTotal(abastecimento.valorTotal ?? 0);
      setTipoCombustivel(abastecimento.tipoCombustivel?.idTipoCombustivel ?? "");
      setValorUnitario(abastecimento.valorUnitario ?? 0);
      setdataAbastecimento(
        abastecimento.dataAbastecimento
          ? formatDate(new Date(abastecimento.dataAbastecimento)) 
          : ""
      );
    }
  }, [abastecimento]);

  // Busca listas auxiliares
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipos, corridasRes] = await Promise.all([
          TipoCombustivelService.listar(),
          getCorridas(),
        ]);
        setTiposCombustivel(tipos.data);
        setCorridas(corridasRes);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };
    if (open) fetchData();
  }, [open]);

  // Calcula preço final automaticamente
  useEffect(() => {
    if (quantidade >= 0 && valorUnitario >= 0) {
      setValorTotal(Number((quantidade * valorUnitario).toFixed(2)));
    }
  }, [quantidade, valorUnitario]);

  const handleSalvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!abastecimento) return;

    setLoading(true);
    try {
      const dadosAtualizados = {
        quantidade,
        valorTotal,
        valorUnitario,
        dataAbastecimento: new Date(dataAbastecimento), // Converte de volta para Date
        idTipoCombustivel: tipoCombustivel === "" ? undefined : Number(tipoCombustivel),
      };

      await abastecimentoService.atualizarAbastecimentoPatch(
        abastecimento.idAbastecimento!,
        dadosAtualizados
      );

      console.log(dadosAtualizados);
      onSuccess("Abastecimento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar abastecimento:", error);
      onError(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle}>
        {/* Cabeçalho */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <LocalGasStation color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Edição de Abastecimento</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Conteúdo */}
        <Box component="form" onSubmit={handleSalvar}>
          {/* Informações Básicas */}
          <Typography variant="subtitle1" gutterBottom>
            Informações Básicas
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField
              label="Litros"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              required
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">L</InputAdornment>
                ),
              }}
            />
            <TextField
              label="Valor Unitário"
              type="number"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(Number(e.target.value))}
              sx={{ flex: "1 1 200px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
            />
            <TextField
              label="Preço Final"
              type="number"
              value={valorTotal}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
                readOnly: true,
              }}
              sx={{ flex: "1 1 200px" }}
            />
          </Box>

          <TextField
            label="Data de Abastecimento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dataAbastecimento} 
            onChange={(e) => setdataAbastecimento(e.target.value)} // Atualiza o estado com a string
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          {/* Tipo de Combustível */}
          <Typography variant="subtitle1" gutterBottom>
            Tipo de Combustível
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipoCombustivel}
              onChange={(e) => setTipoCombustivel(Number(e.target.value))}
              label="Tipo"
            >
              {tiposCombustivel.map((tipo) => (
                <MenuItem
                  key={tipo.idTipoCombustivel}
                  value={tipo.idTipoCombustivel}
                >
                  {tipo.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botões */}
          <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
            <Button onClick={onClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={!loading && <AttachMoney />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Atualizar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default EdicaoAbastecimentoModal;