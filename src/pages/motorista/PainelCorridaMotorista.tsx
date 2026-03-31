import { useAuth } from '../../context/AuthContext';    
import { decodeToken } from "../../utils/jwtDecodeHelper";
import axiosConnect from '../../services/axios/axiosConnect'; 
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, ButtonBase, Tooltip, CircularProgress, Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import {
  atualizarSituacaoCorrida,
  buscarCorridaPorId,
  getCorridaById,
} from "../../services/CorridaService";
import {
  iniciarPercurso,
  finalizarPercurso,
  buscarUltimoPercursoFinalizado,
  buscarPercursoAtivo,
  PercursoBackend,
  buscarPercursosDaCorrida,
} from "../../services/PercursoService";
import ModalIniciarPercurso from "./modais/ModalIniciarPercurso";
import ModalSucesso from "./modais/ModalSucesso";
import ModalConfirmacaoUltimoPercurso from "./modais/ModalConfirmacaoUltimoPercurso";
import ModalPercursos from "./modais/ModalPercursos";
import AbastecimentoModal from "../administrador/corridas/modais/ModalCadastroAbastecimento";
import CadastrarOcorrencia from "../administrador/corridas/modais/ModalCadastroOcorrencia";
import ModalFinalizarPercurso from "./modais/ModalFinalizarPercurso";
import { CarroService } from "../../services/CarroService";
import AppLayout from "../../components/Layout";
import BemVindo from '../BemVindo';

const menuItems = [
  { label: "Iniciar Percurso", path: "/IniciarPercurso" },
  { label: "Finalizar Percurso", path: "/FinalizarPercurso" },
  { label: "Abastecimento", path: "#abrirModalAbastecimento" },
  { label: "Ocorrências", path: "#abrirModalOcorrencia" },
];

const formatDate = (dateString: string | null) => {
  if (!dateString) return "data não disponível";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Data inválida"
      : date.toLocaleString("pt-BR", { timeZone: "UTC" });
  } catch {
    return "Data inválida";
  }
};

const PainelCorridaMotorista = ({ corrida: propCorrida, onCorridaUpdate }: Props) => {

  const { idCorrida } = useParams<{ idCorrida: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [corridaLocal, setCorridaLocal] = useState(propCorrida);

  const [modalIniciarOpen, setModalIniciarOpen] = useState(false);
  const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [finalizeSuccessModalOpen, setFinalizeSuccessModalOpen] =
    useState(false);

  const [modalOcorrenciaAberto, setModalOcorrenciaAberto] = useState(false);
  const [modalAbastecimentoAberto, setModalAbastecimentoAberto] =
    useState(false);

  const [isCorridaIniciada, setIsCorridaIniciada] = useState(false);

  const [percursoAtual, setPercursoAtual] = useState<PercursoBackend | null>(
    null
  );
  const [percursosAtivosCount, setPercursosAtivosCount] = useState(0);
  const [idCarro, setIdCarro] = useState<number | null>(null);
  const [odometroAtual, setOdometroAtual] = useState<string>("0");

  const [destino, setDestino] = useState("");
  const [odometro, setOdometro] = useState("");
  const [odometroFinal, setOdometroFinal] = useState("");
  const [ultimoDestino, setUltimoDestino] = useState("");
  const [isUltimoPercurso, setIsUltimoPercurso] = useState(false);

  const [chaveEmprestada, setChaveEmprestada] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState("");

  useEffect(() => {
    if (!corridaLocal && idCorrida) {
      buscarCorridaPorId(Number(idCorrida)).then(setCorridaLocal);
    }
  }, [idCorrida]);

  useEffect(() => {
    const verificarAcesso = async () => {
      if (!token || !idCorrida) {
        navigate('/unauthorized');
        return;
      }

      try {
        const decoded = decodeToken<{ sub?: number; idUsuario?: number }>(token);
        const idUsuarioLogado = decoded.sub ?? decoded.idUsuario;

        const res = await axiosConnect.get(`/corrida/${idCorrida}`);
        const corrida = res.data;
      
        if (corrida.idMotorista !== idUsuarioLogado) {
          navigate('/unauthorized', { replace: true });
          return;
        }

      } catch (error) {
        console.error('❌ Erro verificação:', error);
        navigate('/unauthorized', { replace: true });
      }
    };

    verificarAcesso();
  }, [idCorrida, token, navigate]);

  useEffect(() => {
    const fetchStatusChave = async () => {
      if (!corridaLocal?.idCorrida) return;
      try {
        const corridaDetalhada = await buscarCorridaPorId(corridaLocal?.idCorrida);
        setChaveEmprestada(corridaDetalhada.chaveEmprestada ?? false);
      } catch (error) {
        console.error('Erro ao buscar status da chave:', error);
        setChaveEmprestada(false);
      }
    };

    if (corridaLocal?.situacao !== "FINALIZADA") {
      fetchStatusChave();
    }
  }, [corridaLocal?.idCorrida, corridaLocal?.situacao]);

  useEffect(() => {
    const fetchPercursoStatus = async () => {
      if (!corridaLocal?.idCorrida) return;
      try {
        const percursoAtivo = await buscarPercursoAtivo(corridaLocal?.idCorrida);
        if (percursoAtivo) {
          setIsCorridaIniciada(true);
          setPercursoAtual(percursoAtivo);
        } else {
          setIsCorridaIniciada(false);
          setPercursoAtual(null);
        }

        const percursos = await buscarPercursosDaCorrida(corridaLocal?.idCorrida);
        const ativosCount = percursos.filter((p) => !p.chegadaHora).length;
        setPercursosAtivosCount(ativosCount);
      } catch (error) {
        console.error("Erro ao buscar percurso ativo:", error);
        setIsCorridaIniciada(false);
        setPercursoAtual(null);
        setPercursosAtivosCount(0);
      }
    };

    if (corridaLocal?.situacao !== "FINALIZADA") {
      fetchPercursoStatus();
    }
  }, [corridaLocal?.idCorrida, corridaLocal?.situacao]);

  useEffect(() => {
    const fetchUltimoDestino = async () => {
      if (!corridaLocal?.idCorrida || !modalIniciarOpen) return;
      try {
        const ultimoPercurso = await buscarUltimoPercursoFinalizado(corridaLocal?.idCorrida);
        setUltimoDestino(ultimoPercurso ? ultimoPercurso.localDestino : corridaLocal?.localDeSaida);
      } catch {
        setUltimoDestino(corridaLocal?.localDeSaida);
      }
    };
    fetchUltimoDestino();
  }, [modalIniciarOpen, corridaLocal?.idCorrida, corridaLocal?.localDeSaida])

  useEffect(() => {
    let isMounted = true;
    const fetchDadosVeiculo = async () => {
      if (!corridaLocal?.idCorrida) return;
      try {
        const corridaDetalhada = await getCorridaById(corridaLocal?.idCorrida);
        if (!isMounted) return;
        if (corridaDetalhada.idCarro) {
          const carro = await CarroService.buscarPorId(corridaDetalhada.idCarro);
          if (!isMounted) return;
          const novoOdometro = carro?.odometro?.toString() || '0';
          setIdCarro(corridaDetalhada.idCarro);
          setOdometroAtual(novoOdometro);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do carro:', error);
      }
    };
    fetchDadosVeiculo();
    return () => { isMounted = false; };
  }, [corridaLocal?.idCorrida]);

   if (!token || !idCorrida) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Lógica de desabilitação dos botões
  const isIniciarDisabled = isCorridaIniciada;
  const isFinalizarDisabled = !isCorridaIniciada;
  const isAbastecimentoDisabled = !chaveEmprestada;
  const isOcorrenciaDisabled = !chaveEmprestada;

  if (!corridaLocal) return <CircularProgress />;

  if (corridaLocal?.situacao === "FINALIZADA") {
    return (
      <AppLayout>
        <Box sx={{ p: 4, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Corrida Finalizada
        </Typography>
        <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
          Esta corrida foi finalizada em{" "}
          {formatDate(corridaLocal.dataTermino ?? null)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nenhuma ação disponível para corridas finalizadas.
        </Typography>
      </Box>
      </AppLayout>
      
    );
  }

  const handleClick = (path: string, label: string) => {
    if (label === "Iniciar Percurso") {
      verificarSeMostrarModalConfirmacao();
    } else if (label === "Finalizar Percurso") {
      setModalFinalizarOpen(true);
    } else if (path === "#abrirModalAbastecimento") {
      setModalAbastecimentoAberto(true);
    } else if (path === "#abrirModalOcorrencia") {
      setModalOcorrenciaAberto(true);
    } else {
      navigate(path);
    }
  };

  const verificarSeMostrarModalConfirmacao = async () => {
    try {
      const percursos = await buscarPercursosDaCorrida(corridaLocal?.idCorrida);

      const percursosFinalizados = percursos.filter((p) => p.chegadaHora);

      if (percursosFinalizados.length > 0) {
        setModalConfirmacaoOpen(true);
      } else {
        setModalIniciarOpen(true);
      }
    } catch (error) {
      console.error("Erro ao verificar percursos:", error);
      setModalIniciarOpen(true);
    }
  };

  const handleCloseConfirmacaoModal = () => {
    setModalConfirmacaoOpen(false);
  };

  const handleConfirmacaoUltimoPercurso = (isUltimo: boolean) => {
    setModalConfirmacaoOpen(false);

    if (isUltimo) {
      setDestino(corridaLocal?.localDeSaida || "");
      setIsUltimoPercurso(true);
    } else {
      setIsUltimoPercurso(false);
    }

    setModalIniciarOpen(true);
  };

  const handleCloseIniciarModal = () => {
    setModalIniciarOpen(false);
    setDestino("");
  };
  const handleCloseFinalizarModal = () => {
    setModalFinalizarOpen(false);
    setOdometroFinal("");
  };
  const handleSuccessClose = () => setSuccessModalOpen(false);
  const handleFinalizeSuccessClose = () => setFinalizeSuccessModalOpen(false);
  const fecharModalOcorrencia = () => setModalOcorrenciaAberto(false);
  const fecharModalAbastecimento = () => setModalAbastecimentoAberto(false);

  const handleIniciarPercurso = async () => {
    if (!destino || !odometro) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await iniciarPercurso(corridaLocal?.idCorrida, {
        localDestino: destino,
        odometro_inicial: parseFloat(odometro),
        localOrigem: ultimoDestino,
      });

      if (idCarro) {
        CarroService.atualizarOdometro(idCarro, Number(odometro));
      }

      if (corridaLocal?.situacao === "AGENDADA") {
        await atualizarSituacaoCorrida(corridaLocal?.idCorrida, "ANDAMENTO");

        const corridaAtualizada = { ...corridaLocal, situacao: "ANDAMENTO" };
        setCorridaLocal(corridaAtualizada);

        if (onCorridaUpdate) {
          onCorridaUpdate(corridaAtualizada);
        }
      }

      const percursoAtivo = await buscarPercursoAtivo(corridaLocal?.idCorrida);
      setIsCorridaIniciada(true);
      setPercursoAtual(percursoAtivo);

      handleCloseIniciarModal();
      setOdometro("");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error("Erro ao iniciar percurso:", error);
      const message =
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      alert(message);
    }
  };

  const handleFinalizarPercurso = async () => {
    if (!odometroFinal || !percursoAtual?.idPercurso) {
      alert(
        "Não foi possível encontrar o percurso atual ou o odômetro não foi preenchido."
      );
      return;
    }

    try {
      await finalizarPercurso(percursoAtual.idPercurso, {
        chegadaOdometro: parseFloat(odometroFinal),
      });

      if (idCarro) {
        await CarroService.atualizarOdometro(idCarro, Number(odometroFinal));
      }

      setOdometroAtual(odometroFinal);

      if (
        isUltimoPercurso &&
        percursoAtual.localDestino === corridaLocal?.localDeSaida
      ) {
        await atualizarSituacaoCorrida(corridaLocal?.idCorrida, "FINALIZADA");

        const corridaAtualizada = { ...corridaLocal, situacao: "FINALIZADA" };
        setCorridaLocal(corridaAtualizada);

        if (onCorridaUpdate) {
          onCorridaUpdate(corridaAtualizada);
        }
      }

      setIsCorridaIniciada(false);
      setPercursoAtual(null);
      setIsUltimoPercurso(false);

      handleCloseFinalizarModal();
      setFinalizeSuccessModalOpen(true);

      const ultimoPercurso = await buscarUltimoPercursoFinalizado(
        corridaLocal?.idCorrida
      );
      if (ultimoPercurso) {
        setUltimoDestino(ultimoPercurso.localDestino);
      }
    } catch (error: unknown) {
      console.error("Erro ao finalizar percurso:", error);
      const message =
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      alert(message);
    }
  };

  return (
    <AppLayout>

      {mensagemSucesso && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            fontSize: "1.1rem",
            border: "1px solid",
            borderColor: "success.main",
            borderRadius: 1.5,
          }}
          onClose={() => setMensagemSucesso("")}
          >
            {mensagemSucesso}
          </Alert>
        )}

      <BemVindo />
      <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            Corrida:
          </Typography>
          {!chaveEmprestada && (
            <Typography
              variant="body2"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "red" }}
            >
              Retire a chave para liberar a corrida!
            </Typography>
          )}
          <Typography
            variant="body2"
            color={
              corridaLocal?.situacao === "FINALIZADA"
                ? "success.main"
                : corridaLocal?.situacao === "ANDAMENTO"
                  ? "warning.main"
                  : "text.secondary"
            }
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            Situação: {corridaLocal?.situacao}
          </Typography>

          <ModalPercursos
            corridaId={corridaLocal?.idCorrida}
            situacaoCorrida={corridaLocal?.situacao || "AGENDADA"}
          />

          <Typography variant="subtitle2" color="text.secondary">
            De {formatDate(corridaLocal.dataInicio)} até{" "}
            {corridaLocal.dataTermino
              ? formatDate(corridaLocal.dataTermino)
              : "em andamento"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 4,
          }}
        >
          {menuItems.map((item) => {
            const isIniciar = item.label === "Iniciar Percurso";
            const isFinalizar = item.label === "Finalizar Percurso";
            const isAbastecimento = item.label === "Abastecimento";
            const isOcorrencia = item.label === "Ocorrências";

            let isDisabled = false;
            let tooltipTitle = "";

            if (isIniciar) {
              isDisabled = isIniciarDisabled || !chaveEmprestada;
              tooltipTitle = isDisabled ? "Percurso já iniciado" : "";
            } else if (isFinalizar) {
              isDisabled = isFinalizarDisabled;
              tooltipTitle = isDisabled ? "Nenhum percurso ativo" : "";
            } else if (isAbastecimento) {
              isDisabled = isAbastecimentoDisabled;
              tooltipTitle = isDisabled ? "Chave não emprestada" : "";
            } else if (isOcorrencia) {
              isDisabled = isOcorrenciaDisabled;
              tooltipTitle = isDisabled ? "Chave não emprestada" : "";
            }

            return (
              <Tooltip key={item.label} title={tooltipTitle} placement="top">
                <span>
                  <ButtonBase
                    onClick={() => handleClick(item.path, item.label)}
                    sx={{ borderRadius: 3, width: "100%", display: 'block' }}
                    disabled={isDisabled}
                  >
                    <Paper
                      elevation={4}
                      sx={{
                        width: "100%",
                        p: 3,
                        textAlign: "center",
                        borderRadius: 3,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: isDisabled ? "none" : "scale(1.03)",
                          boxShadow: isDisabled ? 4 : 6,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "120px",
                        opacity: isDisabled ? 0.6 : 1,
                        backgroundColor: isDisabled
                          ? "action.disabledBackground"
                          : "background.paper",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: isDisabled ? "text.disabled" : "text.primary",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Paper>
                  </ButtonBase>
                </span>
              </Tooltip>
            );
          })}
        </Box>

        {modalOcorrenciaAberto && (
          <CadastrarOcorrencia
            open={modalOcorrenciaAberto}
            chaveEmprestada={chaveEmprestada}
            onClose={fecharModalOcorrencia}
            corrida={corridaLocal?.idCorrida}
            onSuccess={async (message) => {
            setMensagemSucesso(message);
            try {
              await fecharModalOcorrencia();
            } catch (error) {
              console.error(error);
            }
          }}
            onError={(erro) => {
              console.error("Erro ao salvar ocorrência:", erro);
            }}
          />
        )}

        {modalAbastecimentoAberto && (
          <AbastecimentoModal
            open={modalAbastecimentoAberto}
            onClose={fecharModalAbastecimento}
            corrida={corridaLocal}
            onSuccess={async (message) => {
              setMensagemSucesso(message);
              try {
                await fecharModalAbastecimento();
              } catch (error) {
                console.error(error);
              }
            }}
          />
        )}

        {modalConfirmacaoOpen && (
          <ModalConfirmacaoUltimoPercurso
            open={modalConfirmacaoOpen}
            onClose={handleCloseConfirmacaoModal}
            onConfirm={handleConfirmacaoUltimoPercurso}
            localOrigem={corridaLocal?.localDeSaida || ""}
          />
        )}

        {modalIniciarOpen && (
          <ModalIniciarPercurso
            open={modalIniciarOpen}
            onClose={handleCloseIniciarModal}
            onSuccess={async (message) => {setMensagemSucesso(message);}}
            onConfirm={handleIniciarPercurso}
            destino={destino}
            setDestino={setDestino}
            odometro={odometro}
            setOdometro={setOdometro}
            ultimoDestino={ultimoDestino}
            percursosAtivosCount={percursosAtivosCount}
            chaveEmprestada={chaveEmprestada}
            isUltimoPercurso={isUltimoPercurso}
            localOrigemCorrida={corridaLocal?.localDeSaida || ""}
            odometroAtual={odometroAtual}
          />
        )}

        {modalFinalizarOpen && (
          <ModalFinalizarPercurso
            open={modalFinalizarOpen}
            onClose={handleCloseFinalizarModal}
            onSuccess={async (message) => {setMensagemSucesso(message);}}
            onConfirm={handleFinalizarPercurso}
            odometroFinal={odometroFinal}
            setOdometroFinal={setOdometroFinal}
            percursoAtual={percursoAtual}
          />
        )}

        {/* {successModalOpen && (
          <ModalSucesso
            open={successModalOpen}
            onClose={handleSuccessClose}
            title="Percurso iniciado com sucesso"
          />
        )} */}

        {/* {finalizeSuccessModalOpen && (
          <ModalSucesso
            open={finalizeSuccessModalOpen}
            onClose={handleFinalizeSuccessClose}
            title="Percurso finalizado com sucesso"
          />
        )} */}
      </Box>
    </AppLayout>
  );
};

export default PainelCorridaMotorista;
