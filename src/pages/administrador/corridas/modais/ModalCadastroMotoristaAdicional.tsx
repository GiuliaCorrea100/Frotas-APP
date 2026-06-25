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
import { Cancel, Close, Warning } from "@mui/icons-material";
import { modalStyle } from "../../../../utils/modalStyle";
import { CorridaFrontend } from "../../../../services/CorridaService";
import axiosConnect from "../../../../services/axios/axiosConnect";

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

interface AdidicionarMotoristaProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: any) => void;
  corrida: CorridaFrontend;
}

const AdidicionarMotorista: React.FC<AdidicionarMotoristaProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
  corrida,
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
          console.log(motoristasIniciais);
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
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoadingMotorista(false);
      }
    };

    carregarDadosIniciais();
  }, [open, authMode]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!corrida?.idCorrida) return;

    //if (!validateForm()) return;

    if (motoristasSelecionados.length === 0) {
      setErrorMessage(
        "A corrida precisa está associada a pelo menos um motorista ",);
      return;
    }

    setErrorMessage("");
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
        };

        // POINT: criar uma função no service de corrida????
        await axiosConnect.patch(`/corrida/salvar-edicao-adm/${corrida.idCorrida}`,dadosAtualizados,);
 
        const mensagem = "Motorista editados com sucesso!";
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
            setErrorMessage("Erro ao editar informações dos motoristas",);
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0,
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
            
            Adicionar Motorista
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

        {/* POINT */}
        {/* {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )} */}

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

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            // disabled={
            //   loading ||
            //   !descricao.trim() ||
            //   !dataOcorrencia ||
            //   !!successMessage
            // }
          >
            {loading ? <CircularProgress size={24} /> : "Confirmar"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdidicionarMotorista;