import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  ButtonBase,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { atualizarSituacaoCorrida, buscarCorridaPorId } from "../api/corridaService";
import { 
  iniciarPercurso, 
  finalizarPercurso, 
  buscarUltimoPercursoFinalizado, 
  buscarPercursoAtivo, 
  PercursoBackend,
  buscarPercursosDaCorrida 
} from "../api/percursoService";
import ModalIniciarPercurso from "./modaisMenu/ModalIniciarPercurso";
import ModalFinalizarPercurso from "./modaisMenu/ModalFinalizarPercurso";
import ModalSucesso from "./modaisMenu/ModalSucesso";
import CadastrarOcorrencia from "./cadastros/corrida/modais/ocorrenciasModal";
import AbastecimentoModal from "./cadastros/abastecimento/ModalCadastroAbastecimento";
import ModalConfirmacaoUltimoPercurso from "./modaisMenu/ModalConfirmacaoUltimoPercurso";
import ModalPercursos from "./modaisMenu/ModalPercursos";

interface Corrida {
  idCorrida: number;
  dataInicio: string;
  itinerario: string;
  placaVeiculo?: string;
  nomeMotorista?: string;
  dataTermino?: string | null;
  local_de_saida?: string;
  situacao?: string;
}

interface MenuGridProps {
  corrida: Corrida;
  onCorridaUpdate?: (corridaAtualizada: Corrida) => void;
}

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
    return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

const MenuGrid: React.FC<MenuGridProps> = ({ corrida, onCorridaUpdate }) => {
  const navigate = useNavigate();

  const [modalIniciarOpen, setModalIniciarOpen] = useState(false);
  const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [finalizeSuccessModalOpen, setFinalizeSuccessModalOpen] = useState(false);

  const [modalOcorrenciaAberto, setModalOcorrenciaAberto] = useState(false);
  const [modalAbastecimentoAberto, setModalAbastecimentoAberto] = useState(false);

  const [isCorridaIniciada, setIsCorridaIniciada] = useState(false);
  const [corridaLocal, setCorridaLocal] = useState<Corrida>(corrida);
  const [percursoAtual, setPercursoAtual] = useState<PercursoBackend | null>(null);
  const [percursosAtivosCount, setPercursosAtivosCount] = useState(0);
  
  const [destino, setDestino] = useState("");
  const [odometro, setOdometro] = useState("");
  const [odometroFinal, setOdometroFinal] = useState("");
  const [ultimoDestino, setUltimoDestino] = useState("");
  const [isUltimoPercurso, setIsUltimoPercurso] = useState(false);

  const [chaveEmprestada, setChaveEmprestada] = useState(false);

  useEffect(() => {
    const fetchStatusChave = async () => {
      try {
        const corridaDetalhada = await buscarCorridaPorId(corrida.idCorrida);
        setChaveEmprestada(corridaDetalhada.chaveEmprestada || false);
      } catch (error) {
        console.error("Erro ao buscar status da chave:", error);
        setChaveEmprestada(false);
      }
    };
  
    if (corrida.situacao !== 'FINALIZADA') {
      fetchStatusChave();
    }
  }, [corrida.idCorrida, corrida.situacao]);

  useEffect(() => {
    const fetchPercursoStatus = async () => {
      try {
        const percursoAtivo = await buscarPercursoAtivo(corrida.idCorrida);
        if (percursoAtivo) {
          setIsCorridaIniciada(true);
          setPercursoAtual(percursoAtivo);
        } else {
          setIsCorridaIniciada(false);
          setPercursoAtual(null);
        }
        
        const percursos = await buscarPercursosDaCorrida(corrida.idCorrida);
        const ativosCount = percursos.filter(p => !p.chegadaHora).length;
        setPercursosAtivosCount(ativosCount);
      } catch (error) {
        console.error("Erro ao buscar percurso ativo:", error);
        setIsCorridaIniciada(false);
        setPercursoAtual(null);
        setPercursosAtivosCount(0);
      }
    };

    if (corrida.situacao !== 'FINALIZADA') {
      fetchPercursoStatus();
    }
  }, [corrida.idCorrida, corrida.situacao]);
  
  useEffect(() => {
      const fetchUltimoDestino = async () => {
          if (modalIniciarOpen) {
              try {
                  const ultimoPercurso = await buscarUltimoPercursoFinalizado(corrida.idCorrida);
                  setUltimoDestino(ultimoPercurso ? ultimoPercurso.localDestino : corrida.local_de_saida || "");
              } catch (error) {
                  console.error("Erro ao buscar último percurso finalizado:", error);
                  setUltimoDestino(corrida.local_de_saida || "");
              }
          }
      };
      
      if (corrida.situacao !== 'FINALIZADE') {
        fetchUltimoDestino();
      }
  }, [modalIniciarOpen, corrida.idCorrida, corrida.local_de_saida, corrida.situacao]);

  if (corrida.situacao === 'FINALIZADA') {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Corrida Finalizada
        </Typography>
        <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
          Esta corrida foi finalizada em {formatDate(corrida.dataTermino ?? null)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nenhuma ação disponível para corridas finalizadas.
        </Typography>
      </Box>
    );
  }

  const isIniciarDisabled = isCorridaIniciada;
  const isFinalizarDisabled = !isCorridaIniciada;

  const handleClick = (path: string, label: string) => {
    if (label === "Iniciar Percurso") {
      setModalConfirmacaoOpen(true);
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

  const handleCloseConfirmacaoModal = () => {
    setModalConfirmacaoOpen(false);
  };
  
  const handleConfirmacaoUltimoPercurso = (isUltimo: boolean) => {
    setModalConfirmacaoOpen(false);
    
    if (isUltimo) {
      setDestino(corridaLocal.local_de_saida || "");
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
      await iniciarPercurso(corridaLocal.idCorrida, { 
        localDestino: destino, 
        odometro_inicial: parseFloat(odometro),
        localOrigem: ultimoDestino
      });
      
      if (corridaLocal.situacao === 'AGENDADA') {
        await atualizarSituacaoCorrida(corridaLocal.idCorrida, 'ANDAMENTO');
        
        const corridaAtualizada = { ...corridaLocal, situacao: 'ANDAMENTO' };
        setCorridaLocal(corridaAtualizada);
        
        if (onCorridaUpdate) {
          onCorridaUpdate(corridaAtualizada);
        }
      }
      
      const percursoAtivo = await buscarPercursoAtivo(corridaLocal.idCorrida);
      setIsCorridaIniciada(true);
      setPercursoAtual(percursoAtivo);

      handleCloseIniciarModal();
      setOdometro("");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error("Erro ao iniciar percurso:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      alert(message);
    }
  };

  const handleFinalizarPercurso = async () => {
    if (!odometroFinal || !percursoAtual?.idPercurso) {
      alert("Não foi possível encontrar o percurso atual ou o odômetro não foi preenchido.");
      return;
    }

    try {
      await finalizarPercurso(percursoAtual.idPercurso, {
        chegadaOdometro: parseFloat(odometroFinal)
      });
      
      if (isUltimoPercurso && percursoAtual.localDestino === corridaLocal.local_de_saida) {
        await atualizarSituacaoCorrida(corridaLocal.idCorrida, 'FINALIZADA');
        
        const corridaAtualizada = { ...corridaLocal, situacao: 'FINALIZADA' };
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
      
      const ultimoPercurso = await buscarUltimoPercursoFinalizado(corridaLocal.idCorrida);
      if (ultimoPercurso) {
        setUltimoDestino(ultimoPercurso.localDestino);
      }

    } catch (error: unknown) {
      console.error("Erro ao finalizar percurso:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      alert(message);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Corrida:
        </Typography>
        <Typography
          variant="body2"
          color={
            corridaLocal.situacao === 'FINALIZADA' ? "success.main" :
            corridaLocal.situacao === 'ANDAMENTO' ? "warning.main" : "text.secondary"
          }
          sx={{ mb: 2, fontWeight: 'bold' }}
        >
          Situação: {corridaLocal.situacao} 
        </Typography>
        
        <ModalPercursos 
          corridaId={corridaLocal.idCorrida} 
          situacaoCorrida={corridaLocal.situacao || 'AGENDADA'} 
        />

        <Typography variant="subtitle2" color="text.secondary">
          De {formatDate(corridaLocal.dataInicio)} até{" "}
          {corridaLocal.dataTermino ? formatDate(corridaLocal.dataTermino) : "em andamento"}
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

            if (isIniciar) {
                isDisabled = isIniciarDisabled;
            } else if (isFinalizar) {
                isDisabled = isFinalizarDisabled;
            }

            if (isAbastecimento || isOcorrencia) {
                isDisabled = false;
            }

            return (
              <ButtonBase
                key={item.label}
                onClick={() => handleClick(item.path, item.label)}
                sx={{ borderRadius: 3, width: "100%" }}
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
                      cursor: isDisabled ? "not-allowed" : "pointer"
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '120px',
                    opacity: isDisabled ? 0.6 : 1,
                    backgroundColor: isDisabled ? "action.disabledBackground" : "background.paper"
                  }}
                >
                  <Typography
                    sx={{ 
                        fontWeight: "bold",
                        color: isDisabled ? "text.disabled" : "text.primary"
                    }}
                  >
                    {item.label}
                  </Typography>
                </Paper>
              </ButtonBase>
            )
        })}
      </Box>

      <CadastrarOcorrencia 
        open={modalOcorrenciaAberto} 
        onClose={fecharModalOcorrencia} 
        corrida={corridaLocal.idCorrida}
        onSuccess={() => {
          console.log("Ocorrência salva com sucesso!");
          fecharModalOcorrencia();
        }}
        onError={(erro) => {
          console.error("Erro ao salvar ocorrência:", erro);
        }}
      />

      <AbastecimentoModal
        open={modalAbastecimentoAberto}
        onClose={fecharModalAbastecimento}
        corridaId={corridaLocal.idCorrida}
        onSuccess={() => {
          console.log("Abastecimento cadastrado com sucesso!");
          fecharModalAbastecimento();
        }}
      />
      
      <ModalConfirmacaoUltimoPercurso
        open={modalConfirmacaoOpen}
        onClose={handleCloseConfirmacaoModal}
        onConfirm={handleConfirmacaoUltimoPercurso}
        localOrigem={corridaLocal.local_de_saida || ""}
      />

      <ModalIniciarPercurso
        open={modalIniciarOpen}
        onClose={handleCloseIniciarModal}
        onConfirm={handleIniciarPercurso}
        destino={destino}
        setDestino={setDestino}
        odometro={odometro}
        setOdometro={setOdometro}
        ultimoDestino={ultimoDestino}
        percursosAtivosCount={percursosAtivosCount}
        chaveEmprestada={chaveEmprestada}
      />

      <ModalFinalizarPercurso
        open={modalFinalizarOpen}
        onClose={handleCloseFinalizarModal}
        onConfirm={handleFinalizarPercurso}
        odometroFinal={odometroFinal}
        setOdometroFinal={setOdometroFinal}
        percursoAtual={percursoAtual}
      />

      <ModalSucesso
        open={successModalOpen}
        onClose={handleSuccessClose}
        title="Percurso iniciado com sucesso"
      />

      <ModalSucesso
        open={finalizeSuccessModalOpen}
        onClose={handleFinalizeSuccessClose}
        title="Percurso finalizado com sucesso"
      />
    </Box>
  );
};

export default MenuGrid;