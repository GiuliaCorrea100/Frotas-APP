import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Box,
  Stack,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Menu from "../../Menu";
import { CorridaFrontend, getCorridaById } from "../../../api/corridaService";
import { OcorrenciaDto, OcorrenciaService } from "../../../api/ocorrenciasService";
import { buscarPercursosDaCorrida, PercursoDto } from "../../../api/percursoService";

import ModalEditarOcorrencia from "./modais/editarOcorrencias";
import { Add } from "@mui/icons-material";
import CadastrarOcorrencia from "../../cadastros/corrida/modais/ocorrenciasModal";
import AbastecimentoModal from "../../cadastros/abastecimento/ModalCadastroAbastecimento";
import { Abastecimento } from "../../../api/abastecimentoService";
import AbastecimentoService from "../../../api/abastecimentoService";
import EdicaoAbastecimentoModal from "./modais/editarAbastecimento";
import EdicaoPercursosModal from "./modais/editarPercursos";
import CadastrarPercursosModal from "./modais/cadastrarPercursos";

const DetalhesRequisicao: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [corrida, setCorrida] = useState<CorridaFrontend | null>(null);
  const [loading, setLoading] = useState(true);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDto[]>([]);
  const [abastecimentos, setAbastecimento] = useState<Abastecimento[]>([]);
  const [percursos, setPercursos] = useState<PercursoDto[]>([]);

  const [modalEditarOcorrenciaAberto, setModalEditarOcorrenciaAberto] = useState(false);
  const [modalCadastroOcorrenciaAberto, setModalCadastroOcorrenciaAberto] = useState(false);
  const [modalCadastroAbertoAbastecimento, setModalCadastroAbertoAbastecimento] = useState(false);
  const [modalEditarAbastecimentoAberto, setModalEditarAbastecimento] = useState(false);
  const [modalCadastrarPercursoAberto, setModalCadastrarPercusoAberto] = useState(false);
  const [modalEditarPercursoAberto, setModalEditarPercursoAberto] = useState(false);


  const [abastecimentoSelecionado, setAbastecimentoSelecionado] = useState<Abastecimento | null>(null);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<OcorrenciaDto | null>(null);
  const [percursoSelecionado, setPercursoSelecionado] = useState<PercursoDto | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      if (id) {
        const [corridaData, ocorrenciasData, abastecimentosData, percursosData, ] = await Promise.all([
          getCorridaById(Number(id)),
          OcorrenciaService.buscarPorCorrida(Number(id)),
          AbastecimentoService.buscarPorCorrida(Number(id)),
          buscarPercursosDaCorrida(Number(id)),
        ]);

        setCorrida(corridaData);

        if (Array.isArray(ocorrenciasData)) {
          setOcorrencias(ocorrenciasData);
        } else if (ocorrenciasData) {
          setOcorrencias([ocorrenciasData]);
        }

        if (Array.isArray(abastecimentosData)) {
          setAbastecimento(abastecimentosData);
        } else if (abastecimentosData) {
          setAbastecimento([abastecimentosData]);
        }

        if(Array.isArray(percursosData)){
          setPercursos(percursosData);
        } else if(percursosData) {
          setPercursos([percursosData]);
        }
        console.log(percursosData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const idcorridaNumber = Number(id);

  // Função para formatar valores como moeda
  const formatCurrency = (value: number) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const columnsOcorrencias: GridColDef<OcorrenciaDto>[] = [
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 1,
      renderCell: (params) => <Typography fontWeight="bold">{params.value}</Typography>,
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const ocorrencia = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalEditarOcorrencia(ocorrencia)}
            >
              Editar
            </Button>
          </Box>
        );
      },
    },
  ];

  const columnsAbastecimentos: GridColDef<Abastecimento>[] = [
    {
      field: "tipoCombustivel",
      headerName: "Combustível",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "litros",
      headerName: "Quantidade de Litros",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value?.toFixed(2)} L</Typography>
      ),
    },
    {
      field: "valorUnitario",
      headerName: "Valor do Litro",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{formatCurrency(params.value)}</Typography>
      ),
    },
    {
      field: "precoFinal",
      headerName: "Preço Final",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{formatCurrency(params.value)}</Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const abastecimento = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalEditarAbastecimento(abastecimento)}
            >
              Editar
            </Button>
          </Box>
        );
      },
    },
  ];

  const colunsPercursos: GridColDef<PercursoDto>[] = [
    {
      field: "localOrigem",
      headerName: "Local origem",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "saidaHora",
      headerName: "Hora de saída",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "saidaOdometro",
      headerName: "Odometro saída",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "localDestino",
      headerName: "Local destino",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "chegadaHora",
      headerName: "Hora da chegada",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "chegadaodometro",
      headerName: "Odometro chegada",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const percurso = params.row;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleAbrirModalEditarPercuso(percurso)}
            >
              Editar
            </Button>
          </Box>
        );
      },
    },
  ];

  const handleAbrirModalEditarOcorrencia = (ocorrencia: OcorrenciaDto) => {
    setOcorrenciaSelecionada(ocorrencia);
    setModalEditarOcorrenciaAberto(true);
  };
  const handleFecharModalEditarOcorrencia = () => {
    setModalEditarOcorrenciaAberto(false);
    setOcorrenciaSelecionada(null);
  };

  const handleAbrirModalCadastroOcorrencia = () => {
    setModalCadastroOcorrenciaAberto(true);
  };
  const handleFecharModalCadastroOcorrencia = () => {
    setModalCadastroOcorrenciaAberto(false);
  };

  const handleAbrirModalCadastroAbastecimento = () => {
    setModalCadastroAbertoAbastecimento(true);
  };
  const handleFecharModalCadastroAbastecimento = () => {
    setModalCadastroAbertoAbastecimento(false);
  };

  const handleAbrirModalEditarAbastecimento = (abastecimento: Abastecimento) =>{
    setAbastecimentoSelecionado(abastecimento);
    setModalEditarAbastecimento(true);
  }
  const handleFecharModalEditarAbastecimento = () =>{
    setModalEditarAbastecimento(false);
  }

  const handleAbrirModalCadastroPercurso = () => {
    setModalCadastrarPercusoAberto(true);
  }
  const handleFecharModalCadastroPercurso = () => {
    setModalCadastrarPercusoAberto(false);
  }

  const handleAbrirModalEditarPercuso = (percurso: PercursoDto) =>{
    setPercursoSelecionado(percurso);
    setModalEditarPercursoAberto(true);
  }
  const handleFecharModalEditarPercurso = () => {
    setModalEditarPercursoAberto(false);
  }

  const handleSucesso = () => {
    console.log("atualizações cadastradas com sucesso!");
    carregarDados();
  };

  return (
    <>
      <Menu />

      {/* Card de Informações Básicas */}
      <Card
        sx={{
          margin: 2,
          boxShadow: theme.shadows[1],
          border: "1px solid",
          borderColor: "divider",
          background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
        }}
      >
        <CardHeader
          title="Informações Básicas"
          sx={{
            pb: 0,
            "& .MuiCardHeader-title": {
              fontSize: "1.25rem",
              fontWeight: 600,
            },
          }}
        />
        <CardContent>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Carregando informações da corrida...
            </Typography>
          ) : corrida ? (
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Motorista:
                </Typography>
                <Typography variant="body1">{corrida.nomeMotorista}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Carro:
                </Typography>
                <Typography variant="body1">{corrida.placaVeiculo}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Data do início:
                </Typography>
                <Typography variant="body1">
                  {new Date(corrida.dataInicio).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Data do término:
                </Typography>
                <Typography variant="body1">
                  {corrida.dataTermino
                    ? new Date(corrida.dataTermino).toLocaleString()
                    : "Em andamento"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Typography variant="body1">{corrida.situacao}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status da chave:
                </Typography>
                <Typography variant="body1">
                  {corrida.chaveEmprestada ? "Emprestada" : "Não Emprestada"}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="error">
              Corrida não encontrada.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Card de Ocorrências */}
      <Card
        sx={{
          margin: 2,
          boxShadow: theme.shadows[1],
          border: "1px solid",
          borderColor: "divider",
          background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
        }}
      >
        <CardHeader
          title="Ocorrências cadastradas na corrida"
          sx={{
            pb: 0,
            "& .MuiCardHeader-title": {
              fontSize: "1.25rem",
              fontWeight: 600,
            },
          }}
        />
        <CardContent>
          <Button
            variant="contained"
            onClick={handleAbrirModalCadastroOcorrencia}
            startIcon={<Add />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              boxShadow: theme.shadows[2],
            }}
          >
            Nova Ocorrencia
          </Button>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Carregando ocorrências...
            </Typography>
          ) : ocorrencias.length > 0 ? (
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={ocorrencias}
                columns={columnsOcorrencias}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                getRowId={(row) => row.idOcorrencia}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma ocorrência cadastrada para esta corrida.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Card de Abastecimento */}
      <Card
        sx={{
          margin: 2,
          boxShadow: theme.shadows[1],
          border: "1px solid",
          borderColor: "divider",
          background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
        }}
      >
        <CardHeader
          title="Abastecimentos cadastrados na corrida"
          sx={{
            pb: 0,
            "& .MuiCardHeader-title": {
              fontSize: "1.25rem",
              fontWeight: 600,
            },
          }}
        />
        <CardContent>
          <Button
            variant="contained"
            onClick={handleAbrirModalCadastroAbastecimento}
            startIcon={<Add />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              boxShadow: theme.shadows[2],
            }}
          >
            Novo Abastecimento
          </Button>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Carregando Abastecimentos...
            </Typography>
          ) : abastecimentos.length > 0 ? (
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={abastecimentos}
                columns={columnsAbastecimentos}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                getRowId={(row) => row.idAbastecimento!}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum abastecimento cadastrado para esta corrida.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Card de Percusos */}
      <Card
        sx={{
          margin: 2,
          boxShadow: theme.shadows[1],
          border: "1px solid",
          borderColor: "divider",
          background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
        }}
      >
        <CardHeader
          title="Percursos cadastrados na corrida"
          sx={{
            pb: 0,
            "& .MuiCardHeader-title": {
              fontSize: "1.25rem",
              fontWeight: 600,
            },
          }}
        />
        <CardContent>
          <Button
            variant="contained"
            onClick={handleAbrirModalCadastroPercurso}
            startIcon={<Add />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              boxShadow: theme.shadows[2],
            }}
          >
            Novo Percurso
          </Button>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Carregando Percursos...
            </Typography>
          ) : percursos.length > 0 ? (
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={percursos}
                columns={colunsPercursos}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                getRowId={(row) => row.idPercurso!}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum percurso cadastrado para esta corrida.
            </Typography>
          )}
        </CardContent>
      </Card>

      <ModalEditarOcorrencia
        open={modalEditarOcorrenciaAberto}
        ocorrencia={ocorrenciaSelecionada}
        onClose={handleFecharModalEditarOcorrencia}
        onSuccess={async (msg) => {
          console.log(msg);
          await carregarDados();
        }}
        onError={(err) => {
          console.error(err);
        }}
      />

      <CadastrarOcorrencia
        open={modalCadastroOcorrenciaAberto}
        onClose={handleFecharModalCadastroOcorrencia}
        corrida={idcorridaNumber}
        onSuccess={async () => {
          console.log("Ocorrência salva com sucesso!");
          await carregarDados();
        }}
        onError={(erro) => {
          console.error("Erro ao salvar ocorrência:", erro);
        }}
      />

      {/* Cadastrar Nova Ocorrencia */}
      <AbastecimentoModal
        open={modalCadastroAbertoAbastecimento}
        onClose={handleFecharModalCadastroAbastecimento}
        corridaId={idcorridaNumber}
        onSuccess={async () => {
          console.log("Abastecimento cadastrado com sucesso!");
          await carregarDados();
        }}
      />

      <EdicaoAbastecimentoModal 
        open={modalEditarAbastecimentoAberto} 
        abastecimento={abastecimentoSelecionado} 
        onClose={handleFecharModalEditarAbastecimento}
        onSuccess={async (msg) => {
          console.log(msg);
          await carregarDados();
        }}
        onError={(err) => {
          console.error(err);
        }}
        />

        <EdicaoPercursosModal
        open={modalEditarPercursoAberto}
        percurso={percursoSelecionado}
        onClose={handleFecharModalEditarPercurso}
        onSuccess={async (msg) => {
          console.log(msg);
          await carregarDados();
        }}
        onError={(err) => {
          console.error(err);
        }}
        />

        <CadastrarPercursosModal
        open={modalCadastrarPercursoAberto}
        onClose={handleFecharModalCadastroPercurso}
        onSuccess={async (msg) => {
          console.log(msg);
          await carregarDados();
        } }
        onError={(err) => {
          console.error(err);
        } }
        corrida={idcorridaNumber}        />
    </>
  );
};

export default DetalhesRequisicao;