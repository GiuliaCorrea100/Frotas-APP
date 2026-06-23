import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
  IconButton,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axiosConnect from "../../../../services/axios/axiosConnect";
import { modalStyle } from "../../../../utils/modalStyle";
import { Close, Cancel } from "@mui/icons-material";

interface CorridaDto {
  idCorrida?: number;
  dataInicio: Date;
  dataTermino: Date;
  distanciaKm?: string;
  idMotoristaPrincipal: number;
  chaveEmprestada: boolean;
  idCarro: number;
  nomeMotoristaPrincipal?: string;
  placaVeiculo?: string;
  situacao?: string;
  motoristas?: { idMotorista: number; nome: string }[];
  motoristasIds?: number[];
}

interface EditarInfoCorridaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  corrida: CorridaDto | null;
}

interface Usuario {
  idUsuario: number;
  idPessoaSigaa: number;
  nome: string;
  cpf: string;
}

interface Veiculo {
  idCarro: number;
  modelo: string;
  placa: string;
}

const toLocalDateInputValue = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function EditarInfoCorrida({
  open,
  onClose,
  onSuccess,
  corrida,
}: EditarInfoCorridaProps) {
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [motoristasSelecionados, setMotoristasSelecionados] = useState<any[]>([]);
  const [idMotoristaPrincipal, setIdMotoristaPrincipal] = useState<number | null>(null);
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState<any[]>([]);
  const [motoristaInput, setMotoristaInput] = useState("");
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [carrosDisponiveis, setCarrosDisponiveis] = useState<Veiculo[]>([]);
  const [loadingMotorista, setLoadingMotorista] = useState(false);
  const [loadingVeiculo, setLoadingVeiculo] = useState(false);
  const [authMode, setAuthMode] = useState<string>("SIGAA");
  const [successMessage, setSuccessMessage] = useState("");

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

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      if (!open || !corrida) return;

      try {
        if (corrida.motoristas && corrida.motoristas.length > 0) {
          const principal = corrida.motoristas.find(
            (m) => m.idMotorista === corrida.idMotoristaPrincipal,
          );
          const outros = corrida.motoristas.filter(
            (m) => m.idMotorista !== corrida.idMotoristaPrincipal,
          );
          const motoristasIniciais = [
            ...(principal
              ? [{ idUsuario: principal.idMotorista, nome: principal.nome }]
              : []),
            ...outros.map((m) => ({
              idUsuario: m.idMotorista,
              nome: m.nome,
            })),
          ];
          setMotoristasSelecionados(motoristasIniciais);
          setIdMotoristaPrincipal(corrida.idMotoristaPrincipal);
        } else if (corrida.idMotoristaPrincipal) {
          if (authMode === "MOCK") {
            const motoristasTeste = [
              { idUsuario: 1, idPessoaSigaa: 999998, nome: "ADMINISTRADOR FROTAS", cpf: "11111111111" },
              { idUsuario: 2, idPessoaSigaa: 999999, nome: "MOTORISTA FROTAS", cpf: "22222222222" },
            ];
            const motorista = motoristasTeste.find(
              (m) => m.idUsuario === corrida.idMotoristaPrincipal,
            );
            if (motorista) {
              setMotoristasSelecionados([motorista]);
            }
          } else {
            const response = await axiosConnect.get(
              `/usuario/buscar-usuario/${corrida.idMotoristaPrincipal}`,
            );
            if (response.data) {
              setMotoristasSelecionados([response.data]);
            }
          }
        }

        if (corrida.idCarro) {
          setLoadingVeiculo(true);
          const response = await axiosConnect.get(`/carro/${corrida.idCarro}`);
          if (response.data) {
            setSelectedVeiculo(response.data);
          }
        }

        if (corrida.dataInicio) {
          if (typeof corrida.dataInicio === "string") {
            const dateString = corrida.dataInicio.includes("T")
              ? corrida.dataInicio.split("T")[0] + "T00:00:00"
              : corrida.dataInicio + "T00:00:00";
            setDataInicio(new Date(dateString));
          } else {
            setDataInicio(corrida.dataInicio);
          }
        } else {
          setDataInicio(null);
        }

        if (corrida.dataTermino) {
          if (typeof corrida.dataTermino === "string") {
            const dateString = corrida.dataTermino.includes("T")
              ? corrida.dataTermino.split("T")[0] + "T00:00:00"
              : corrida.dataTermino + "T00:00:00";
            setDataTermino(new Date(dateString));
          } else {
            setDataTermino(corrida.dataTermino);
          }
        } else {
          setDataTermino(null);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoadingMotorista(false);
      }
    };

    carregarDadosIniciais();
  }, [open, corrida, authMode]);

  const formatarDataParaEnvio = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString();
  };

  const buscarUsuario = async (nome: string) => {
    if (nome.length < 3) {
      setMotoristasDisponiveis([]);
      return;
    }

    try {
      setLoadingMotorista(true);
      if (authMode === "MOCK") {
        const motoristasTeste = [
          { idUsuario: 1, idPessoaSigaa: 999998, nome: "ADMINISTRADOR FROTAS", cpf: "11111111111" },
          { idUsuario: 2, idPessoaSigaa: 999999, nome: "MOTORISTA FROTAS", cpf: "22222222222" },
        ];
        const filteredMotoristas = motoristasTeste.filter((motorista) =>
          motorista.nome.toLowerCase().includes(nome.toLowerCase()),
        );
        setMotoristasDisponiveis(filteredMotoristas);
      } else {
        const response = await axiosConnect.get(`/usuarioSigaa?nome=${nome}`);
        const usuariosRetornados = response.data;
        const uniqueUsuariosMap = new Map<number, any>();
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
      setLoadingMotorista(false);
    }
  };

  const buscarVeiculo = async (modeloPlaca: string) => {
    if (modeloPlaca.length < 3) {
      setCarrosDisponiveis([]);
      return;
    }
    try {
      setLoadingVeiculo(true);
      const response = await axiosConnect.get(
        `/carro/buscar-modelo-placa/${modeloPlaca}`,
      );
      setCarrosDisponiveis(response.data);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
      setCarrosDisponiveis([]);
    } finally {
      setLoadingVeiculo(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!corrida?.idCorrida) return;

    if (motoristasSelecionados.length === 0 || !selectedVeiculo || !dataInicio) {
      setError(
        "Por favor, preencha todos os campos obrigatórios: Motorista, Veículo e Data de Início.",
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const converterId = async (motorista: any): Promise<number> => {
        if (authMode === "MOCK" || motorista.idUsuario) {
          return motorista.idUsuario;
        }
        const response = await axiosConnect.get(
          `/usuario/consultaCadastro/${motorista.idPessoaSigaa}`,
          {
            params: { nome: motorista.nome },
          },
        );
        return response.data.idUsuario;
      };

      const motoristasIds = await Promise.all(
        motoristasSelecionados.map(converterId)
      );

      const dadosAtualizados = {
        idMotoristaPrincipal: idMotoristaPrincipal || motoristasIds[0],
        motoristasIds: motoristasIds,
        idCarro: selectedVeiculo.idCarro,
        dataInicio: formatarDataParaEnvio(dataInicio),
        dataTermino: dataTermino ? formatarDataParaEnvio(dataTermino) : corrida.dataTermino,
        chaveEmprestada: corrida.chaveEmprestada,
      };

      await axiosConnect.patch(
        `/corrida/salvar-edicao-adm/${corrida.idCorrida}`,
        dadosAtualizados,
      );

      const mensagem = "Corrida editada com sucesso!";
      onSuccess(mensagem);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Erro ao salvar edições.",
      );
    } finally {
      setLoading(false);
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
            <CalendarMonthIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
            Editar corrida agendada
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Autocomplete
              options={carrosDisponiveis}
              value={selectedVeiculo}
              getOptionLabel={(option) =>
                `${option.modelo} Placa: ${option.placa}`
              }
              isOptionEqualToValue={(option, value) =>
                option.idCarro === value?.idCarro
              }
              onInputChange={(_, value) => {
                buscarVeiculo(value);
              }}
              onChange={(_, novoValor) => {
                setSelectedVeiculo(novoValor);
              }}
              loading={loadingVeiculo}
              noOptionsText="Digite pelo menos 3 caracteres para buscar (placa ou modelo do veículo)"
              disabled={!!successMessage || loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Veículo"
                  required
                  placeholder={
                    loadingVeiculo ? "Carregando..." : "Digite para buscar"
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingVeiculo && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  disabled={!!successMessage || loading}
                />
              )}
              fullWidth
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
            <Autocomplete
              options={motoristasDisponiveis.filter(
                (option) =>
                  !motoristasSelecionados.some(
                    (sel) =>
                      (sel.idUsuario && sel.idUsuario === option.idUsuario) ||
                      (sel.idPessoaSigaa && sel.idPessoaSigaa === option.idPessoaSigaa),
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
                  buscarUsuario(value);
                }
              }}
              onChange={(_, value) => {
                if (value) {
                  setMotoristasSelecionados((prev) => [...prev, value]);
                }
                setMotoristaInput("");
              }}
              isOptionEqualToValue={(option, value) => option.cpf === value.cpf}
              noOptionsText="Digite pelo menos 3 caracteres para buscar"
              loading={loadingMotorista}
              disabled={!!successMessage || loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Motorista"
                  required
                  placeholder={
                    loadingMotorista ? "Carregando..." : "Digite para buscar"
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingMotorista && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  disabled={!!successMessage || loading}
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
                        {idMotoristaPrincipal && motorista.idUsuario === idMotoristaPrincipal && (
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
                            const isRemovingPrincipal = motorista.idUsuario === idMotoristaPrincipal;
                            setMotoristasSelecionados((prev) => {
                              const novaLista = prev.filter(
                                (m) =>
                                  !(
                                    (m.idUsuario && m.idUsuario === motorista.idUsuario) ||
                                    (m.idPessoaSigaa && m.idPessoaSigaa === motorista.idPessoaSigaa) ||
                                    (m.cpf && m.cpf === motorista.cpf)
                                  ),
                              );
                              if (isRemovingPrincipal && novaLista.length > 0) {
                                setIdMotoristaPrincipal(novaLista[0].idUsuario);
                              }
                              return novaLista;
                            });
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
              fullWidth
              label="Data Início"
              type="date"
              value={dataInicio ? toLocalDateInputValue(dataInicio) : ""}
              onChange={(e) => {
                const selectedDate = e.target.value;
                if (selectedDate) {
                  const date = new Date(selectedDate + "T00:00:00");
                  setDataInicio(date);
                } else {
                  setDataInicio(null);
                }
              }}
              required
              InputLabelProps={{ shrink: true }}
              disabled={!!successMessage || loading}
            />

            <TextField
              fullWidth
              label="Data Fim"
              type="date"
              value={dataTermino ? toLocalDateInputValue(dataTermino) : ""}
              onChange={(e) => {
                const selectedDate = e.target.value;
                if (selectedDate) {
                  const date = new Date(selectedDate + "T00:00:00");
                  setDataTermino(date);
                } else {
                  setDataTermino(null);
                }
              }}
              InputLabelProps={{ shrink: true }}
              disabled={!!successMessage || loading}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ textTransform: "none" }}
              disabled={loading || !!successMessage}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                loading || 
                !!successMessage || 
                motoristasSelecionados.length === 0 || 
                !selectedVeiculo || 
                !dataInicio
              }
            >
              {loading ? <CircularProgress size={24} /> : "Confirmar"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
