import { Add, Cancel, CheckCircle } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CancelIcon from "@mui/icons-material/Cancel";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import FormularioVeiculos from "./ModalCadastroEdicaoVeiculo";
import { CarroDto, CarroService } from "../../../services/CarroService";
import { TipoCombustivel } from "../../../services/TipoCombustivelService";
import AppLayout from "../../../components/Layout";

export default function ListaVeiculos() {
  const theme = useTheme();
  const location = useLocation();
  const carroCadastrado = location.state?.carroCadastrado as
    | CarroDto
    | undefined;
  const [busca, setBusca] = useState("");
  const [carros, setCarros] = useState<CarroDto[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("ATIVOS");
  const [filtroSituacao, setFiltroSituacao] = useState<string>("TODOS");
  const [qtdAtivos, setQtdAtivos] = useState<number>(0);
  const [qtdInativos, setQtdInativos] = useState<number>(0);
  const [qtdDisponivel, setQtdDisponivel] = useState<number>(0);
  const [qtdViagem, setQtdViagem] = useState<number>(0);
  const [qtdManutencao, setQtdManutencao] = useState<number>(0);

  // Estado para armazenar os tipos de combustível
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>(
    [],
  );

  // Estados para o modal de confirmação (Ativar/Inativar)
  const [showModalAtivacao, setShowModalAtivacao] = useState(false);
  const [selectedCarro, setSelectedCarro] = useState<CarroDto | null>(null);

  // Estados para o FormularioVeiculos
  const [openFormulario, setOpenFormulario] = useState(false);
  const [selectedCarroForEdit, setSelectedCarroForEdit] =
    useState<CarroDto | null>(null);
  const [modoFormulario, setModoFormulario] = useState<"criar" | "editar">(
    "criar",
  );

  // Estados para situação de veiculo (Modal Editar Situação - mantido para compatibilidade)
  const [openEditModal, setOpenEditModal] = useState(false);
  const [novaSituacao, setNovaSituacao] = useState<string>("");

  // Abrir modal de criação
  const handleOpenCriar = () => {
    setModoFormulario("criar");
    setSelectedCarroForEdit(null);
    setOpenFormulario(true);
  };

  // Abrir modal de edição
  const handleOpenEditar = (carro: CarroDto) => {
    setModoFormulario("editar");
    setSelectedCarroForEdit(carro);
    setOpenFormulario(true);
  };

  // Fechar modal do formulário
  const handleCloseFormulario = () => {
    setOpenFormulario(false);
    setSelectedCarroForEdit(null);
  };

  // Sucesso no formulário
  const handleSuccessFormulario = (message: string) => {
    console.log(message);
    // Recarregar a lista de carros
    carregarCarros();
    handleCloseFormulario();
  };

  // Erro no formulário
  const handleErrorFormulario = (error: any) => {
    console.error("Erro no formulário:", error);
    alert("Erro ao salvar veículo: " + (error?.message || "Erro desconhecido"));
  };

  // Função para carregar carros
  const carregarCarros = async () => {
    try {
      const lista = await CarroService.buscarTodos();

      // Calcular contadores
      setQtdAtivos(lista.filter((c) => c.ativo).length);
      setQtdInativos(lista.filter((c) => !c.ativo).length);
      setQtdDisponivel(
        lista.filter((c) => c.situacao === "DISPONIVEL" && c.ativo).length,
      );
      setQtdViagem(
        lista.filter((c) => c.situacao === "VIAGEM" && c.ativo).length,
      );
      setQtdManutencao(
        lista.filter((c) => c.situacao === "MANUTENCAO" && c.ativo).length,
      );

      setCarros(lista);
    } catch (error) {
      console.error("Erro ao carregar carros:", error);
    }
  };

  // Carregar carros ao inicializar
  useEffect(() => {
    carregarCarros();
  }, [carroCadastrado]);

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCarroForEdit(null);
  };

  // Função de filtro (mantida)
  const filteredCarros = carros.filter((carro) => {
    const matchesSearchTerm = Object.values(carro).some((valor) =>
      String(valor).toLowerCase().includes(busca.toLowerCase()),
    );

    const matchesStatus =
      filtroStatus === "TODOS" ||
      (filtroStatus === "ATIVOS" && carro.ativo) ||
      (filtroStatus === "INATIVOS" && !carro.ativo);

    const matchesSituacao =
      filtroSituacao === "TODOS" || carro.situacao === filtroSituacao;

    return matchesSearchTerm && matchesStatus && matchesSituacao;
  });

  // Abre o modal de confirmação (Ativar/Inativar)
  const handleAbrirModalAtivacao = (carro: CarroDto) => {
    setSelectedCarro(carro);
    setShowModalAtivacao(true);
  };

  // Confirma a alteração de status (Ativar/Inativar)
  const handleConfirmarToggleAtivo = async () => {
    if (!selectedCarro || !selectedCarro.idCarro) return;

    try {
      await CarroService.inativar(selectedCarro.idCarro);
      await carregarCarros();
      setShowModalAtivacao(false);
    } catch (error) {
      console.error("Erro ao alternar status:", error);
      alert("Erro ao alternar status do veículo");
    }
  };

  // Lógica de salvamento da Situação
  const handleSaveSituacao = async () => {
    if (!selectedCarroForEdit || !selectedCarroForEdit.idCarro) return;
    try {
      await CarroService.atualizar(selectedCarroForEdit.idCarro, {
        situacao: novaSituacao,
        tombo: 0,
        qrCode: "",
        placa: "",
        odometro: "",
        modelo: "",
        ano: 0,
        localidadeFisica: "",
        ativo: false,
        idTipoCombustivel: 0,
        //tipoCombustivel: 0
      });
      await carregarCarros();
      handleCloseEditModal();
    } catch (error: any) {
      console.error("Erro ao atualizar situação:", error);
      alert(
        "Erro ao atualizar situação do veículo: " +
        (error?.response?.data?.message || error.message),
      );
    }
  };

  // Definição das colunas da DataGrid
  const colunas: GridColDef[] = [
    {
      field: "placa",
      headerName: "Placa",
      width: 120,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      ),
    },
    { field: "modelo", headerName: "Modelo", width: 250 },
    { field: "ano", headerName: "Ano", width: 100 },
    { field: "localidadeFisica", headerName: "Localidade", width: 150 },
    { field: "tombo", headerName: "Tombo", width: 100 },
    {
      field: "nomeTipoCombustivel",
      headerName: "Combustível",
      width: 150,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            {params.value || "Não definido"}
          </Typography>
        );
      },
    },
    {
      field: "situacao",
      headerName: "Situação",
      // flex: 1,
      width: 120,
      renderCell: (params) => {
        if (!params.row.ativo) {
          return (
            <Typography
              color="textSecondary"
              fontStyle="italic"
              fontWeight={500}
            >
              INATIVO
            </Typography>
          );
        }

        let color, texto;
        switch (params.value) {
          case "DISPONIVEL":
            color = theme.palette.success.main;
            texto = "Disponível";
            break;
          case "VIAGEM":
            color = theme.palette.info.main;
            texto = "Em Viagem";
            break;
          case "MANUTENCAO":
            color = theme.palette.warning.main;
            texto = "Manutenção";
            break;
          default:
            color = theme.palette.text.secondary;
            texto = "Indisponivel";
        }
        return (
          <Typography style={{ color, fontWeight: 600 }} variant="body2">
            {texto}
          </Typography>
        );
      },
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 120,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          {/* EDITAR */}
          <Tooltip title="Editar veículo">
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={() => handleOpenEditar(params.row)}
              startIcon={<CreateIcon />}
              sx={{
                width: 42,
                height: 42,
                minWidth: 42,
                padding: 0,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiButton-startIcon": {
                  margin: 0,
                },
              }}
            >
            </Button>
          </Tooltip>

          {/* INATIVAR/ATIVAR */}
          <Tooltip
            title={params.row.ativo ? "Inativar veículo" : "Ativar veículo"}
          >
            <Button
              variant="contained"
              color={params.row.ativo ? "error" : "success"}
              size="small"
              onClick={() => handleAbrirModalAtivacao(params.row)}
              sx={{
                width: 42,
                height: 42,
                minWidth: 42,
                padding: 0,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiButton-startIcon": {
                  margin: 0,
                },
                color:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.87)"
                    : undefined,
              }}
            >
              {params.row.ativo ? (
                <Cancel fontSize="small" />
              ) : (
                <CheckCircle fontSize="small" />
              )}
            </Button>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <AppLayout>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold" color="textPrimary">
          Listagem de Veículos
        </Typography>

        <Button
          variant="contained"
          onClick={handleOpenCriar}
          startIcon={<Add />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            boxShadow: theme.shadows[2],
          }}
        >
          Novo Veículo
        </Button>
      </Box>

      {/* Filtros por status (Ativos/Inativos) */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {[
          {
            label: "ATIVOS",
            value: "ATIVOS",
            count: qtdAtivos,
            color: theme.palette.success.main,
          },
          {
            label: "INATIVOS",
            value: "INATIVOS",
            count: qtdInativos,
            color: theme.palette.error.main,
          },
          {
            label: "TODOS",
            value: "TODOS",
            count: carros.length,
            color: theme.palette.primary.dark,
          },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filtroStatus === tab.value ? "contained" : "outlined"}
            onClick={() => setFiltroStatus(tab.value)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              fontWeight: filtroStatus === tab.value ? 600 : 500,
              color: filtroStatus === tab.value ? "white" : "text.primary",
              bgcolor:
                filtroStatus === tab.value ? tab.color : "background.paper",
              "&:hover": {
                bgcolor:
                  filtroStatus === tab.value
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
              },
            }}
          >
            {tab.label}
            <Box
              sx={{
                ml: 1,
                fontWeight: 600,
                backgroundColor:
                  filtroStatus === tab.value
                    ? "rgba(255,255,255,0.2)"
                    : theme.palette.mode === "dark"
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                color:
                  filtroStatus === tab.value
                    ? "white"
                    : theme.palette.mode === "dark"
                      ? theme.palette.grey[100]
                      : theme.palette.text.primary,
                px: 1,
                borderRadius: 12,
              }}
            >
              {tab.count}
            </Box>
          </Button>
        ))}
      </Box>

      {/* Busca */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar veículos..."
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        />
      </Box>

      <DataGrid
        rows={filteredCarros}
        columns={colunas}
        getRowId={(row) => row.idCarro}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 8, page: 0 },
          },
        }}
        pageSizeOptions={[8, 16, 24]}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        autoHeight
        sx={{
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 1.5,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
            fontWeight: "bold",
            borderRadius: 1,
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-row": {
            "&:hover": { backgroundColor: theme.palette.action.hover },
            "&.Mui-selected": {
              backgroundColor: theme.palette.action.selected,
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            marginBottom: 0,
            alignSelf: "center",
          },
          "& .MuiTablePagination-toolbar": {
            minHeight: "52px",
            alignItems: "center",
          },
          boxShadow: theme.shadows[1],
          borderRadius: 2,
          border: "none",
          backgroundColor: theme.palette.background.paper,
          height: "calc(100vh - 350px)",
        }}
        rowSelection={false}
      />

      {/* FormularioVeiculos para criação e edição */}
      <FormularioVeiculos
        idVeiculo={
          modoFormulario === "editar" && selectedCarroForEdit
            ? selectedCarroForEdit.idCarro || null
            : null
        }
        open={openFormulario}
        onClose={handleCloseFormulario}
        onSuccess={handleSuccessFormulario}
        onError={handleErrorFormulario}
      />

      {/* Modal de Edição de Situação (mantido para compatibilidade) */}
      <Modal
        open={openEditModal}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-situacao-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Editar Situação
          </Typography>
          <Typography variant="body1" gutterBottom>
            Veículo: {selectedCarroForEdit?.placa}
          </Typography>
          {/* Aqui você pode adicionar os controles para editar a situação se necessário */}
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button onClick={handleCloseEditModal} variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleSaveSituacao} variant="contained">
              Salvar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de Ativar/Inativar Veículo */}
      <Modal
        open={showModalAtivacao}
        onClose={() => setShowModalAtivacao(false)}
        aria-labelledby="modal-ativacao-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            id="modal-ativacao-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Alterar Status do Veículo
          </Typography>
          <Typography variant="body1" className="pb-4" gutterBottom>
            Você está prestes a {selectedCarro?.ativo ? "inativar" : "ativar"} o
            veículo {selectedCarro?.placa}.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              onClick={handleConfirmarToggleAtivo}
              variant="contained"
              color={selectedCarro?.ativo ? "error" : "success"}
            >
              {selectedCarro?.ativo ? "Inativar" : "Ativar"}
            </Button>
            <Button
              onClick={() => setShowModalAtivacao(false)}
              variant="outlined"
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>
    </AppLayout>
  );
}
