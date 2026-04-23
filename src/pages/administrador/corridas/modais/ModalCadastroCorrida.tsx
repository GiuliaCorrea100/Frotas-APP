import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Box,
  TextField,
  Typography,
  Modal,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Divider,
  IconButton,
  Alert,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios, { AxiosError } from "axios";
import {
  CorridaBackend,
  createCorrida,
} from "../../../../services/CorridaService";
import { CarroService } from "../../../../services/CarroService";
import axiosConnect from "../../../../services/axios/axiosConnect";
import { modalStyle } from "../../../../utils/modalStyle";
import { Close } from "@mui/icons-material";

interface MotoristaDTO {
  idUsuario: number;
  nome: string;
  cpf: string;
}

interface CadastrarCorridaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
}

const toLocalDateTimeInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const CadastrarCorrida: React.FC<CadastrarCorridaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [modeloPlaca, setModeloPlaca] = useState<string>("");
  const [carro, setCarro] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [corrida, setCorrida] = useState({
    dataInicio: "",
    dataTermino: "",
    localDeSaida: "",
    distanciaKm: "0",
    chaveEmprestada: false,
    situacao: "AGENDADA",
    motoristaId: null as number | null,
  });

  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState<
    MotoristaDTO[]
  >([]);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<any>(null);
  const [carrosDisponiveis, setCarrosDisponiveis] = useState<any[]>([]);
  const [errors, setErrors] = useState({
    carro: false,
    dataInicio: false,
    dataTermino: false,
    motorista: false,
    localDeSaida: false,
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [authMode, setAuthMode] = useState<string>("SIGAA");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  // Buscar o modo de autenticação na inicialização
  useEffect(() => {
    const fetchAuthMode = async () => {
      try {
        const response = await axiosConnect.get("/auth/mode");
        setAuthMode(response.data.mode);
      } catch (error) {
        console.error("Erro ao buscar modo de autenticação:", error);
        setAuthMode("SIGAA");
      }
    };
    fetchAuthMode();
  }, []);

  const buscarCarro = async (modeloPlaca: string) => {
    if (modeloPlaca.length < 3) {
      setCarrosDisponiveis([]);
      return;
    }
    try {
      const response = await axiosConnect.get(
        `/carro/buscar-modelo-placa/${modeloPlaca}`,
      );
      setCarrosDisponiveis(response.data);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setError("Veículo não encontrado.");
      } else {
        setError("Erro ao buscar informações do veículo");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorrida((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const buscarMotoristas = async (nome: string) => {
    if (nome.length < 3) {
      setMotoristasDisponiveis([]);
      return;
    }

    try {
      setLoading(true);

      if (authMode === "MOCK") {
        // Lista estática de motoristas no modo TEST
        const motoristasTeste: MotoristaDTO[] = [
          {
            idUsuario: 1,
            nome: "ADMINISTRADOR FROTAS",
            cpf: "11111111111",
          },
          {
            idUsuario: 2,
            nome: "MOTORISTA FROTAS",
            cpf: "22222222222",
          },
        ];
        // Filtrar motoristas com base no nome digitado
        const filteredMotoristas = motoristasTeste.filter((motorista) =>
          motorista.nome.toLowerCase().includes(nome.toLowerCase()),
        );
        setMotoristasDisponiveis(filteredMotoristas);
      } else {
        // Busca no endpoint /usuarioSigaa no modo SIGAA
        const response = await axiosConnect.get(`/usuarioSigaa?nome=${nome}`);
        const usuariosRetornados = response.data;
        const uniqueUsuariosMap = new Map();
        usuariosRetornados.forEach((user: any) => {
          uniqueUsuariosMap.set(user.idPessoaSigaa, user);
        });
        const usuariosUnicosEOrdenados = Array.from(uniqueUsuariosMap.values());

        //console.log('Motoristas: ', usuariosUnicosEOrdenados);
        setMotoristasDisponiveis(usuariosUnicosEOrdenados);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setMotoristasDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Iniciar o loading
    setIsSubmitting(true);

    let hasError = false;
    const newErrors = {
      carro: false,
      dataInicio: false,
      dataTermino: false,
      motorista: false,
      localDeSaida: false,
    };

    if (!carro) {
      newErrors.carro = true;
      hasError = true;
    }

    if (!motoristaSelecionado) {
      newErrors.motorista = true;
      hasError = true;
    }

    if (!corrida.dataInicio) {
      newErrors.dataInicio = true;
      hasError = true;
    }

    if (!corrida.dataTermino) {
      newErrors.dataTermino = true;
      hasError = true;
    }

    if (!corrida.localDeSaida) {
      newErrors.localDeSaida = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      setIsSubmitting(false); // Parar loading se houver erro
      return;
    }

    if (new Date(corrida.dataTermino) < new Date(corrida.dataInicio)) {
      showAlert("A data de término não pode ser anterior à data de início");
      setErrors((prev) => ({ ...prev, dataTermino: true }));
      setIsSubmitting(false); // Parar loading
      return;
    }

    try {
      // No modo MOCK, usar diretamente o idUsuario do motorista selecionado
      let idUsuarioMotorista: number;
      if (authMode === "MOCK") {
        idUsuarioMotorista = motoristaSelecionado.idUsuario;
      } else {
        // No modo SIGAA, consultar o endpoint /usuario/consultaCadastro
        const response = await axiosConnect.get(
          `/usuario/consultaCadastro/${motoristaSelecionado.idPessoaSigaa}`,
          {
            params: {
              nome: motoristaSelecionado.nome,
            },
          },
        );
        idUsuarioMotorista = response.data.idUsuario;
      }

      const toLocalDate = (yyyyMmDd: string): Date => {
        const [ano, mes, dia] = yyyyMmDd.split("-").map(Number);
        return new Date(ano, mes - 1, dia);
      };

      const corridaParaEnviar: Omit<CorridaBackend, "idCorrida"> = {
        dataInicio: new Date(corrida.dataInicio),
        dataTermino: new Date(corrida.dataTermino),
        localDeSaida: corrida.localDeSaida,
        distanciaKm: "",
        idMotorista: idUsuarioMotorista,
        situacao: "AGENDADA",
        chaveEmprestada: false,
        idCarro: carro.idCarro,
      };

      await CarroService.atualizarSituacaoCarro(carro.idCarro, "RESERVADO");

      await createCorrida(corridaParaEnviar);

      const mensagem = "Corrida registrada com sucesso!";
  

      setTimeout(() => {
        onSuccess(mensagem);
        onClose();
      }, 1500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          if (error.response.data.message.includes("carro")) {
            showAlert(
              "Este carro já está agendado para outra corrida nesse período.",
            );
          } else {
            showAlert("Usuário já tem corrida agendada para essa data.");
          }
        } else {
          const errorMessage =
            error.response.data?.message || "Erro ao cadastrar a corrida.";
          showAlert(errorMessage);
        }
      } else {
        console.error("Erro ao cadastrar a corrida:", error);
        onError(error);
      }
    } finally {
      // Sempre parar o loading, independente de sucesso ou erro
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              pt: 1,
            }}
          >
            <CalendarMonthIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
            Agendar corrida
          </Typography>
          <IconButton onClick={onClose} disabled={loading || isSubmitting}>
            <Close />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Veículo */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Autocomplete
            options={carrosDisponiveis}
            getOptionLabel={(option) => {
              if (option.modelo && option.placa) {
                return `${option.modelo} Placa: ${option.placa}`;
              }
              return option.modelo || option.placa || "";
            }}
            onInputChange={(_, value) => buscarCarro(value)}
            onChange={(_, newValue) => {
              setCarro(newValue);
              setErrors((prev) => ({ ...prev, carro: false }));
            }}
            isOptionEqualToValue={(option, value) =>
              option.idCarro === value.idCarro
            }
            noOptionsText="Digite pelo menos 3 caracteres para buscar (placa ou modelo do veículo)"
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Veículo"
                required
                error={errors.carro}
                helperText={
                  errors.carro
                    ? "Selecione um veículo"
                    : "Informe o veículo a ser reservado para essa corrida"
                }
              />
            )}
          />
        </Box>

        {/* Motorista */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Autocomplete
            options={motoristasDisponiveis}
            getOptionLabel={(option) => {
              if (option.nome && option.cpf) {
                return `${option.nome} (${option.cpf})`;
              }
              return option.nome || "";
            }}
            onInputChange={(_, value) => buscarMotoristas(value)}
            onChange={(_, value) => {
              setMotoristaSelecionado(value);
              setCorrida((prev) => ({
                ...prev,
                motoristaId: value?.idUsuario || null,
              }));
              setErrors((prev) => ({ ...prev, motorista: false }));
            }}
            isOptionEqualToValue={(option, value) => option.cpf === value.cpf}
            noOptionsText="Digite pelo menos 3 caracteres para buscar"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Motorista"
                required
                error={errors.motorista}
                helperText={
                  errors.motorista
                    ? "Selecione um motorista"
                    : "Informe o motorista que será responsável por essa corrida"
                }
              />
            )}
            fullWidth
          />
        </Box>

        {/* Local de Saída */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            name="localDeSaida"
            label="Local de Saída"
            value={corrida.localDeSaida}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              setCorrida((prev) => ({
                ...prev,
                localDeSaida: value,
              }));
              setErrors((prev) => ({ ...prev, localDeSaida: false }));
            }}
            fullWidth
            required
            error={errors.localDeSaida}
            helperText={
              errors.localDeSaida
                ? "Selecione um motorista"
                : "Informe o local de saída da corrida"
            }
            placeholder="Ex: Campus Porto Velho"
          />
        </Box>

        {/* Data de Início e Término */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            name="dataInicio"
            label="Data Início"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={corrida.dataInicio}
            onChange={handleChange}
            fullWidth
            required
            error={errors.dataInicio}
            helperText={errors.dataInicio ? "Informe a data de início" : ""}
            inputProps={{
              min: toLocalDateTimeInputValue(new Date())
            }}
          />

          <TextField
            name="dataTermino"
            label="Data Término"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={corrida.dataTermino}
            onChange={handleChange}
            fullWidth
            required
            error={errors.dataTermino}
            helperText={errors.dataTermino ? "Informe a data de término" : ""}
            inputProps={{
              min: corrida.dataInicio || toLocalDateTimeInputValue(new Date())
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting || !!successMessage}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || !!successMessage}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Cadastrar"
            )}
          </Button>
        </Box>

        <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
          <DialogTitle>{alertMessage}</DialogTitle>
          <DialogActions>
            <Button onClick={() => setAlertOpen(false)}>OK</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default CadastrarCorrida;
