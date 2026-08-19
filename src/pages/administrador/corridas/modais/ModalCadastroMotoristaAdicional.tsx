import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Autocomplete,
  TextField,
  Tooltip,
} from "@mui/material";
import { Cancel, Close, PersonAdd, Warning } from "@mui/icons-material";
import { modalStyle } from "../../../../utils/modalStyle";
import { CorridaFrontend } from "../../../../services/CorridaService";
import axiosConnect from "../../../../services/axios/axiosConnect";
import { PercursoDto } from "../../../../services/PercursoService";

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

interface AdicionarMotoristaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
  corrida: CorridaFrontend;
  percursos?: PercursoDto[];
}

const AdicionarMotorista: React.FC<AdicionarMotoristaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida,
  percursos = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authMode, setAuthMode] = useState<string>("SIGAA");
  const [errorMessage, setErrorMessage] = useState("");

  const [motoristasSelecionados, setMotoristasSelecionados] = useState<any[]>([]);
  const [idMotoristaPrincipal, setIdMotoristaPrincipal] = useState<number | null>(null);
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState<any[]>([]);
  const [motoristaInput, setMotoristaInput] = useState("");
  const [loadingMotorista, setLoadingMotorista] = useState(false);

  // Função para verificar se um motorista tem percursos
  const motoristaTemPercursos = (idMotorista: number): boolean => {
    return percursos.some((percurso) => percurso.idMotorista === idMotorista);
  };

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
      if (!open) return;

      try {
        if (corrida.motoristas && corrida.motoristas.length > 0) {
          const motoristasMap = new Map<number, any>();

          corrida.motoristas.forEach((m) => {
            const id = m.idMotorista;
            if (id && !motoristasMap.has(id)) {
              motoristasMap.set(id, {
                idUsuario: id,
                idMotorista: id,
                nome: m.nome,
              });
            }
          });

          setMotoristasSelecionados(Array.from(motoristasMap.values()));
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
          setIdMotoristaPrincipal(corrida.idMotoristaPrincipal);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoadingMotorista(false);
      }
    };

    carregarDadosIniciais();
  }, [open, authMode, corrida]);

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
        setMotoristasDisponiveis(Array.from(uniqueUsuariosMap.values()));
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setMotoristasDisponiveis([]);
    } finally {
      setLoadingMotorista(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!corrida?.idCorrida) return;

    if (motoristasSelecionados.length === 0) {
      setErrorMessage(
        "A corrida precisa estar associada a pelo menos um motorista.",
      );
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const converterId = async (motorista: any): Promise<number> => {
        if (authMode === "MOCK" || motorista.idUsuario || motorista.idMotorista) {
          return motorista.idUsuario || motorista.idMotorista;
        }
        const response = await axiosConnect.get(
          `/usuario/consultaCadastro/${motorista.idPessoaSigaa}`,
          {
            params: { nome: motorista.nome },
          },
        );
        return response.data.idUsuario;
      };

      const motoristasIdsBrutos = await Promise.all(
        motoristasSelecionados.map(converterId),
      );

      const motoristasIds = Array.from(new Set(motoristasIdsBrutos.filter(Boolean)));

      const dadosAtualizados = {
        idMotoristaPrincipal: idMotoristaPrincipal || motoristasIds[0],
        motoristasIds: motoristasIds,
      };

      await axiosConnect.patch(`/corrida/salvar-edicao-adm/${corrida.idCorrida}`, dadosAtualizados);

      const mensagem = "Motoristas editados com sucesso!";
      setSuccessMessage(mensagem);

      setTimeout(() => {
        onSuccess(mensagem);
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("Erro ao editar informações dos motoristas", error);

      if (error.response?.status === 401) {
        onError("Sessão expirada. Faça login novamente.");
      } else {
        setErrorMessage(
          error.response?.data?.message || "Erro ao editar informações dos motoristas",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverMotorista = (motorista: any) => {
    const idMotorista = motorista.idUsuario || motorista.idMotorista || motorista.idPessoaSigaa;

    if (motoristaTemPercursos(idMotorista)) {
      setErrorMessage(
        `Não é possível remover ${motorista.nome} pois possui percursos cadastrados.`,
      );
      return;
    }

    if (
      idMotorista === idMotoristaPrincipal ||
      motorista.idUsuario === idMotoristaPrincipal ||
      motorista.idMotorista === idMotoristaPrincipal
    ) {
      setErrorMessage(
        `Não é possível remover ${motorista.nome} pois é o motorista principal da corrida.`,
      );
      return;
    }

    setMotoristasSelecionados((prev) => {
      return prev.filter((m) => {
        const mId = m.idUsuario || m.idMotorista || m.idPessoaSigaa;
        if (mId && idMotorista && mId === idMotorista) return false;
        if (m.cpf && motorista.cpf && m.cpf === motorista.cpf) return false;
        return true;
      });
    });

    setErrorMessage("");
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
            <PersonAdd color="primary" sx={{ fontSize: 24, mr: 1 }} />
            Editar Motoristas
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
          <Autocomplete
            options={motoristasDisponiveis.filter((option) => {
              return !motoristasSelecionados.some((sel) => {
                const selId = sel.idUsuario || sel.idMotorista || sel.idPessoaSigaa;
                const optId = option.idUsuario || option.idMotorista || option.idPessoaSigaa;

                if (selId && optId && selId === optId) return true;
                if (sel.cpf && option.cpf && sel.cpf === option.cpf) return true;
                return false;
              });
            })}
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
                const jaExiste = motoristasSelecionados.some((sel) => {
                  const selId = sel.idUsuario || sel.idMotorista || sel.idPessoaSigaa;
                  const valId = value.idUsuario || value.idMotorista || value.idPessoaSigaa;
                  return (
                    (selId && valId && selId === valId) ||
                    (sel.cpf && value.cpf && sel.cpf === value.cpf)
                  );
                });

                if (!jaExiste) {
                  setMotoristasSelecionados((prev) => [...prev, value]);
                  setErrorMessage("");
                } else {
                  setErrorMessage("Este motorista já foi adicionado à corrida.");
                }
              }
              setMotoristaInput("");
            }}
            isOptionEqualToValue={(option, value) => {
              if (option.cpf && value.cpf) return option.cpf === value.cpf;
              const optId = option.idUsuario || option.idPessoaSigaa;
              const valId = value.idUsuario || value.idPessoaSigaa;
              return optId === valId;
            }}
            noOptionsText="Digite pelo menos 3 caracteres para buscar"
            loading={loadingMotorista}
            disabled={!!successMessage || loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Motorista"
                placeholder={loadingMotorista ? "Carregando..." : "Digite para buscar"}
                helperText={"Selecione o motorista a ser adicionado à corrida"}
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
                p: 2,
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
                {motoristasSelecionados.map((motorista, index) => {
                  const idMotorista =
                    motorista.idUsuario || motorista.idMotorista || motorista.idPessoaSigaa;
                  const temPercursos = motoristaTemPercursos(idMotorista);
                  const ehMotoristaPrincipal =
                    idMotorista === idMotoristaPrincipal ||
                    motorista.idUsuario === idMotoristaPrincipal ||
                    motorista.idMotorista === idMotoristaPrincipal;
                  const naoPodeRemover = temPercursos || ehMotoristaPrincipal;

                  return (
                    <Box
                      key={idMotorista || motorista.cpf || index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 1,
                        px: 1.5,
                        backgroundColor: "background.paper",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.primary">
                        {motorista.nome} {motorista.cpf ? `(${motorista.cpf})` : ""}

                        {ehMotoristaPrincipal && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="primary"
                            sx={{ ml: 1, fontWeight: "bold" }}
                          >
                            (Principal)
                          </Typography>
                        )}
                        
                        {naoPodeRemover && (
                          <Tooltip
                            title={
                              ehMotoristaPrincipal
                                ? "Motorista principal não pode ser removido"
                                : temPercursos
                                ? "Este motorista possui percursos cadastrados e não pode ser removido"
                                : ""
                            }
                          >
                            <Warning
                              sx={{
                                ml: 1,
                                fontSize: 16,
                                color: "warning.main",
                                verticalAlign: "middle",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Typography>

                      <Tooltip
                        title={
                          naoPodeRemover
                            ? ehMotoristaPrincipal
                              ? "Motorista principal não pode ser removido"
                              : "Não é possível remover motoristas com percursos cadastrados"
                            : "Remover motorista"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoverMotorista(motorista)}
                            disabled={naoPodeRemover || loading}
                          >
                            <Cancel />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !!successMessage}
          >
            {loading ? <CircularProgress size={24} /> : "Confirmar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdicionarMotorista;