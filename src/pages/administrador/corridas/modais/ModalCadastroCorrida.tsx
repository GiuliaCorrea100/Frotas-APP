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
  Chip,
  Tooltip,
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
import { Close, Cancel } from "@mui/icons-material";

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
  const [motoristasSelecionados, setMotoristasSelecionados] = useState<any[]>([]);
  const [motoristaInput, setMotoristaInput] = useState<string>("");
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
      setError(null);
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
        const filteredMotoristas = motoristasTeste.filter((motorista) =>
          motorista.nome.toLowerCase().includes(nome.toLowerCase()),
        );
        setMotoristasDisponiveis(filteredMotoristas);
      } else {
        const response = await axiosConnect.get(`/usuarioSigaa?nome=${nome}`);
        const usuariosRetornados = response.data;
        const uniqueUsuariosMap = new Map();
        usuariosRetornados.forEach((user: any) => {
          uniqueUsuariosMap.set(user.idPessoaSigaa, user);
        });
        const usuariosUnicosEOrdenados = Array.from(uniqueUsuariosMap.values());

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

    if (motoristasSelecionados.length === 0) {
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
      setIsSubmitting(false);
      return;
    }

    if (new Date(corrida.dataTermino) < new Date(corrida.dataInicio)) {
      showAlert("A data de término não pode ser anterior à data de início");
      setErrors((prev) => ({ ...prev, dataTermino: true }));
      setIsSubmitting(false);
      return;
    }

    try {
      const converterId = async (motorista: any): Promise<number> => {
        if (authMode === "MOCK" || motorista.idUsuario) {
          return motorista.idUsuario;
        }
        const response = await axiosConnect.get(
          `/usuario/consultaCadastro/${motorista.idPessoaSigaa}`,
          {
            params: {
              nome: motorista.nome,
            },
          },
        );
        return response.data.idUsuario;
      };

      const motoristasIds = await Promise.all(
        motoristasSelecionados.map(converterId)
      );

      const toLocalDate = (yyyyMmDd: string): Date => {
        const [ano, mes, dia] = yyyyMmDd.split("-").map(Number);
        return new Date(ano, mes - 1, dia);
      };

      const corridaParaEnviar: Omit<CorridaBackend, "idCorrida"> = {
        dataInicio: toLocalDate(corrida.dataInicio),
        dataTermino: toLocalDate(corrida.dataTermino),
        localDeSaida: corrida.localDeSaida,
        distanciaKm: "",
        idMotoristaPrincipal: motoristasIds[0],
        motoristasIds: motoristasIds,
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

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Autocomplete
            options={carrosDisponiveis}
            getOptionLabel={(option) => {
              if (option.modelo && option.placa) {
                return `${option.modelo} Placa: ${option.placa}`;
              }
              return option.modelo || option.placa || "";
            }}
            onInputChange={(_, value, reason) => {
              if (reason === "input") {
                buscarCarro(value);
              }
            }}
            onChange={(_, newValue) => {
              setCarro(newValue);
              setErrors((prev) => ({ ...prev, carro: false }));
              setError(null);
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          <Autocomplete
            options={motoristasDisponiveis.filter(
              (option) =>
                !motoristasSelecionados.some(
                  (sel) =>
                    (sel.idUsuario && sel.idUsuario === option.idUsuario) ||
                    (sel.idPessoaSigaa && sel.cpf === option.cpf),
                ),
            )}
            getOptionLabel={(option) => {
              if (option.nome && option.cpf) {
                return `${option.nome} (${option.cpf})`;
              }
              return option.nome || "";
            }}
            value={null}
            inputValue={motoristaInput}
            onInputChange={(_, value, reason) => {
              setMotoristaInput(value);
              if (reason === "input") {
                buscarMotoristas(value);
              }
            }}
            onChange={(_, value) => {
              if (value) {
                setMotoristasSelecionados((prev) => [...prev, value]);
                setErrors((prev) => ({ ...prev, motorista: false }));
              }
              setMotoristaInput("");
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
                    ? "Selecione pelo menos um motorista"
                    : "Informe o motorista que será responsável por essa corrida"
                }
              />
            )}
            fullWidth
          />
          {motoristasSelecionados.length > 0 && (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "action.hover",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", fontWeight: "bold", mb: 1 }}
              >
                Motoristas Selecionados:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {motoristasSelecionados.map((motorista, index) => (
                  <Box
                    key={motorista.idUsuario || motorista.idPessoaSigaa || motorista.cpf}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 0.5,
                      px: 1,
                      backgroundColor: "background.paper",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" color="text.primary">
                      {motorista.nome} {motorista.cpf ? `(${motorista.cpf})` : ""}
                      {index === 0 && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="primary"
                          sx={{ ml: 1, fontWeight: "bold" }}
                        >
                          (Principal)
                        </Typography>
                      )}
                    </Typography>
                    <Tooltip title="Remover motorista">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setMotoristasSelecionados((prev) =>
                            prev.filter(
                              (m) =>
                                !(
                                  (m.idUsuario && m.idUsuario === motorista.idUsuario) ||
                                  (m.idPessoaSigaa && m.idPessoaSigaa === motorista.idPessoaSigaa) ||
                                  (m.cpf && m.cpf === motorista.cpf)
                                ),
                            ),
                          );
                        }}
                      >
                        <Cancel />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

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

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            name="dataInicio"
            label="Data Início"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={corrida.dataInicio}
            onChange={handleChange}
            fullWidth
            required
            error={errors.dataInicio}
            helperText={errors.dataInicio ? "Informe a data de início" : ""}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
          />

          <TextField
            name="dataTermino"
            label="Data Término"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={corrida.dataTermino}
            onChange={handleChange}
            fullWidth
            required
            error={errors.dataTermino}
            helperText={errors.dataTermino ? "Informe a data de término" : ""}
            inputProps={{
              min: corrida.dataInicio || new Date().toISOString().split("T")[0],
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
