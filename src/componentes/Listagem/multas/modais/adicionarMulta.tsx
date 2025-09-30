import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
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
import { cadastrarMulta } from "../../../../api/multaService";

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
  width: "80%",
  maxWidth: 800,
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
  const [dataInfracao, setDataInfracao] = useState<Date | null>(null);
  const [autoInfracao, setAutoInfracao] = useState<number>(0);

  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(open){
      setAutoInfracao(0);
      setClassificacao("");
      setCodigoInfracao(0);
      setDataInfracao(null);
      setPlacaVeiculo("");
      setValorInfracao(0);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) =>{
    event.preventDefault();
    setLoading(true);
  }






}

export default CadastroMultaModal;