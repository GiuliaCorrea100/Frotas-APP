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
import { DataGrid } from "@mui/x-data-grid";
import Menu from "../../Menu";
import { CorridaFrontend, getCorridaById } from "../../../api/corridaService";
import { OcorrenciaDto, OcorrenciaService } from "../../../api/ocorrenciasService";
import { GridColDef } from "@mui/x-data-grid";
import ModalEditarOcorrencia from "./modais/editarOcorrencias";
import { Add } from "@mui/icons-material";
import CadastrarOcorrencia from "../../cadastros/corrida/modais/ocorrenciasModal";

const DetalhesRequisicao: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [corrida, setCorrida] = useState<CorridaFrontend | null>(null);
  const [loading, setLoading] = useState(true);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDto[]>([]);

  // const [modalAberto, setModalAberto] = useState(false);
  // const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<OcorrenciaDto | null>(null);

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<OcorrenciaDto | null>(null);
  const [percursoSelecionado, setPercursoSelecionado] = useState<OcorrenciaDto | null>(null);
  const [abastecimentoSelecionado, setAbastecimentoSelecionado] = useState<OcorrenciaDto | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      if (id) {
        const [corridaData, ocorrenciasData] = await Promise.all([
          getCorridaById(Number(id)),
          OcorrenciaService.buscarPorCorrida(Number(id))
        ]);
        setCorrida(corridaData);
        if (Array.isArray(ocorrenciasData)) {
          setOcorrencias(ocorrenciasData);
        } else if (ocorrenciasData) {
          setOcorrencias([ocorrenciasData]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  const idcorridaNumber = Number(id);

  const columnsOcorrencias: GridColDef<OcorrenciaDto>[] = [
    {
      field: 'descricao',
      headerName: 'Descrição',
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      )
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const ocorrencia = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
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
      }
    }
  ]

  // const handleAbrirModalEditarOcorrencia = (ocorrencia: OcorrenciaDto) => {
  //   setOcorrenciaSelecionada(ocorrencia);
  //   setModalAberto(true);
  // };

  // const handleFecharModal = () => {
  //   setModalAberto(false);
  //   setOcorrenciaSelecionada(null);
  // };

  // const fecharModal = () => {
  //   setModalAberto(false);
  // }

  const handleAbrirModalEditarOcorrencia = (ocorrencia: OcorrenciaDto) => {
    setOcorrenciaSelecionada(ocorrencia);
    setModalEditarAberto(true);
  };

  const handleFecharModalEditar = () => {
    setModalEditarAberto(false);
    setOcorrenciaSelecionada(null);
  };

  const handleAbrirModalCadastro = () => {
    setModalCadastroAberto(true);
  };

  const handleFecharModalCadastro = () => {
    setModalCadastroAberto(false);
  }; 



  return (
    <>
      <Menu />
      
      {/*Grid superior */}
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
                    onClick={handleAbrirModalCadastro}
                    startIcon={<Add />}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: theme.shadows[2]
                    }}
                  >
                    Nova Ocorrencia
                  </Button>
                {loading ? (
                  <Typography variant="body2" color="text.secondary">
                    Carregando ocorrências...
                  </Typography>
                ) : ocorrencias.length > 0 ? (
                  <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={ocorrencias}
                      columns={columnsOcorrencias}
                      paginationModel={{ page: 0, pageSize: 5 }}
                      pageSizeOptions={[5]}
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
          <Typography variant="body2" color="text.secondary">
            {loading ? "Carregando..." : "Nenhum abastecimento cadastrado."}
          </Typography>
        </CardContent>
      </Card>

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
          <Typography variant="body2" color="text.secondary">
            {loading ? "Carregando..." : "Nenhum percurso cadastrado."}
          </Typography>
        </CardContent>
      </Card>
      
      <ModalEditarOcorrencia
        open={modalEditarAberto}
        ocorrencia={ocorrenciaSelecionada}
        onClose={handleFecharModalEditar}
        onSuccess={async (msg) => {
          console.log(msg);
          await carregarDados(); 
        }}
        onError={(err) => {
          console.error(err);
        }}
      />

      <CadastrarOcorrencia open={modalCadastroAberto} onClose={handleFecharModalCadastro} corrida={idcorridaNumber}
        onSuccess={() => {
          console.log("Ocorrência salva com sucesso!");
        }}
        onError={(erro) => {
          console.error("Erro ao salvar ocorrência:", erro);
        }}
      /> 

    </>
  );
};

export default DetalhesRequisicao;