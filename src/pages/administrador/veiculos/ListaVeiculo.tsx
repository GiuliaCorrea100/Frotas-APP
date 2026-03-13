import { Add, Cancel, CheckCircle } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ModalCadastroEdicaoVeiculo from "./ModalCadastroEdicaoVeiculo";
import { CarroDto, CarroService } from "../../../services/CarroService";
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

  // Estados para o modal de confirmação (Ativar/Inativar)
  const [showModalAtivacao, setShowModalAtivacao] = useState(false);
  const [selectedCarro, setSelectedCarro] = useState<CarroDto | null>(null);

  // Estados para o FormularioVeiculos
  const [openModalCadastroEdicao, setopenModalCadastroEdicao] = useState(false);
  const [selectedCarroForEdit, setSelectedCarroForEdit] =
    useState<CarroDto | null>(null);
  const [modoFormulario, setModoFormulario] = useState<"criar" | "editar">(
    "criar",
  );

  // Abrir modal de criação
  const handleOpenCriar = () => {
    setModoFormulario("criar");
    setSelectedCarroForEdit(null);
    setopenModalCadastroEdicao(true);
  };

  // Abrir modal de edição
  const handleOpenEditar = (carro: CarroDto) => {
    setModoFormulario("editar");
    setSelectedCarroForEdit(carro);
    setopenModalCadastroEdicao(true);
  };

  // Fechar modal do formulário
  const handleCloseFormulario = () => {
    setopenModalCadastroEdicao(false);
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

  // Definição das colunas da DataGrid
  const colunas: GridColDef[] = [
    {
      field: "placa",
      headerName: "Placa",
      width: 150,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    { field: "modelo", headerName: "Modelo", width: 350 },
    { field: "ano", headerName: "Ano", width: 150 },
    { field: "localidadeFisica", headerName: "Localidade", width: 250 },
    { field: "tombo", headerName: "Tombo", width: 150 },
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
      width: 120,
      renderCell: (params) => {
        if (!params.row.ativo) {
          return (
            <Chip
              label="Inativo"
              color={"error"}
              size="small"
              variant="outlined"
            ></Chip>
          );
        }

        let color, texto;
        switch (params.value) {
          case "DISPONIVEL":
            color = "success";
            texto = "Disponível";
            break;
          case "VIAGEM":
            color = "warning";
            texto = "Em Viagem";
            break;
          case "MANUTENCAO":
            color = "error";
            texto = "Manutenção";
            break;
          case "RESERVADO":
            color = "info";
            texto = "Reservado";
            break;
          default:
            color = "error";
            texto = "Indisponivel";
        }
        return (
          <Chip
            label={texto}
            color={color as any}
            size="small"
            variant="outlined"
          />
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
            ></Button>
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
        mb={1.5}
        mx={3}
        height={56}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="text.primary"
          display="flex"
          pb={0}
        >
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
            mb: 1,
            mt: 1,
          }}
        >
          Novo Veículo
        </Button>
      </Box>

      {/* Filtros por status (Ativos/Inativos) */}
      <Box
        sx={{
          bgcolor:
            theme.palette.mode === "light"
              ? "#FFF"
              : theme.palette.background.paper,
          borderRadius: 2,
          py: 2,
          mb: 0,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
              : "0px 8px 24px rgba(0, 0, 0, 0.08)",
          border:
            theme.palette.mode === "dark"
              ? "1px solid transparent"
              : "1px solid #E7E9EE",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1,
            mb: 3,
            ml: 3,
            flexWrap: "wrap",
          }}
        >
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
        <Box sx={{ mb: 3, mx: 3 }}>
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
            "& .MuiDataGrid-columnHeaders": {
              "& .MuiDataGrid-columnHeader:first-child": {
                pl: 4,
              },
              "& .MuiDataGrid-columnHeader:last-child": {
                pr: 4,
              },
            },
            "& .MuiDataGrid-row": {
              "& .MuiDataGrid-cell:first-child": {
                pl: 4,
              },
              "& .MuiDataGrid-cell:last-child": {
                pr: 4,
              },
            },
          }}
          rowSelection={false}
          rowHeight={50}
          columnHeaderHeight={60}
        />
      </Box>

      {/* Modal de cadastro e edição */}
      {openModalCadastroEdicao && (
        <ModalCadastroEdicaoVeiculo
          idVeiculo={
            modoFormulario === "editar" && selectedCarroForEdit
              ? selectedCarroForEdit.idCarro || null
              : null
          }
          open={openModalCadastroEdicao}
          onClose={handleCloseFormulario}
          onSuccess={handleSuccessFormulario}
          onError={handleErrorFormulario}
        />
      )}

      {/* Modal de Ativar/Inativar Veículo */}
      <Dialog
        open={showModalAtivacao}
        onClose={() => setShowModalAtivacao(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Alterar Status do Veículo
        </DialogTitle>
        <DialogContent>
          <Typography>
            Você está prestes a{" "}
            <strong>{selectedCarro?.ativo ? "inativar" : "ativar"}</strong> o
            veículo <strong>{selectedCarro?.placa}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setShowModalAtivacao(false)}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarToggleAtivo}
            variant="contained"
            color={selectedCarro?.ativo ? "error" : "success"}
          >
            {selectedCarro?.ativo ? "Inativar" : "Ativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
