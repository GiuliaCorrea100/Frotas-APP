import { Add, Cancel } from "@mui/icons-material";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  Tooltip,
  Modal,
  IconButton,
} from "@mui/material";
import { Close, Person } from "@mui/icons-material";
import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import React from "react";
import { AdminUserService } from "../../services/AdministradorService";
import axiosConnect from "../../services/axios/axiosConnect";
import AppLayout from "../../components/Layout";
import { modalStyle } from "../../utils/modalStyle";

interface AdminUserDto {
  idUsuario: number;
  idPessoaSigaa: number;
  administrador: boolean;
  nome: string;
  email: string;
}

export default function ListaAdministradores() {
  const theme = useTheme();
  const [admins, setAdmins] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [NomeAdmin, setNomeAdmin] = useState("");
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<any[]>([]);
  const [showModalCadastro, setShowModalCadastro] = useState(false);
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [SelectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [SelectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [erroVinculo, setErroVinculo] = useState<string | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await AdminUserService.buscarTodos();
        setAdmins(dados);
      } catch (e) {
        console.error("Erro ao carregar administradores:", e);
        setErro("Erro ao carregar administradores.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const handleAbriModalNovoAdmin = () => {
    setNomeAdmin("");
    setSelectedAdmin(null);
    setErroVinculo(null);
    setShowModalCadastro(true);
  };

  const handleAbrirModalConfirmar = (usuario: AdminUserDto) => {
    setSelectedUsuario(usuario);
    setShowModalConfirmar(true);
  };

  const buscarUsuario = async (nome: string) => {
    if (nome.length < 3) {
      setUsuariosDisponiveis([]);
      return;
    }

    try {
      setLoadingAdmin(true);
      const response = await axiosConnect.get(`/usuarioSigaa?nome=${nome}`);

      const usuariosRetornados = response.data;
      const uniqueUsuariosMap = new Map();
      usuariosRetornados.forEach((user: any) => {
        uniqueUsuariosMap.set(user.idPessoaSigaa, user);
      });
      const usuariosUnicosEOrdenados = Array.from(uniqueUsuariosMap.values());

      setUsuariosDisponiveis(usuariosUnicosEOrdenados);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsuariosDisponiveis([]);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleSelecionarUsuario = (usuario: any) => {
    if (!usuario) {
      setSelectedAdmin(null);
      return;
    }
    setSelectedAdmin(usuario);
  };

  const handleSubmitCadastro = async () => {
    if (!SelectedAdmin) {
      setErroVinculo("Nenhum usuário selecionado.");
      return;
    }

    try {
      const response = await axiosConnect.get(
        `/usuario/consultaCadastro/${SelectedAdmin.idPessoaSigaa}`,
        {
          params: {
            nome: SelectedAdmin.nome,
          },
        },
      );

      const idUsuarioAdministrador = response.data.idUsuario;

      if (!idUsuarioAdministrador) {
        throw new Error("Não foi possível obter o ID do usuário no sistema");
      }

      // Alterar permissão de administrador
      await AdminUserService.confirmarCadastro(idUsuarioAdministrador);

      // Atualizar lista
      const dadosAtualizados = await AdminUserService.buscarTodos();
      setAdmins(dadosAtualizados);

      // 5. Fechar modais e limpar estados
      setShowModalCadastro(false);
      setSelectedAdmin(null);
      setErro("");
      setErroVinculo("");
    } catch (error) {
      console.error("Erro ao alterar permissão:", error);
      setErroVinculo("Erro ao alterar permissão do usuário. Tente novamente.");
    }
  };

  const handleSubmitRevogacao = async () => {
    if (!SelectedUsuario) {
      setErroVinculo("Nenhum usuário selecionado.");
      return;
    }

    try {
      // Alterar permissão de administrador
      await AdminUserService.confirmarCadastro(SelectedUsuario.idUsuario);

      // Atualizar lista
      const dadosAtualizados = await AdminUserService.buscarTodos();
      setAdmins(dadosAtualizados);

      // 5. Fechar modais e limpar estados
      setShowModalConfirmar(false);
      setSelectedUsuario(null);
      setErro("");
      setErroVinculo("");
    } catch (error) {
      console.error("Erro ao alterar permissão:", error);
      setErroVinculo("Erro ao alterar permissão do usuário. Tente novamente.");
    }
  };

  const colunas: GridColDef[] = [
    {
      field: "nome",
      headerName: "Nome",
      width: 450,
      renderCell: (params) => <Typography>{params.value}</Typography>,
    },
    // { field: 'email', headerName: 'E-mail', flex: 1 },
    {
      field: "acoes",
      headerName: "Controle de acesso",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-between" width="100%">
          <Tooltip title="Revogar permissão de administrador do sistema">
            <Button
              variant="contained"
              size="small"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleAbrirModalConfirmar(params.row)}
              sx={{
                width: 180,
                minWidth: 180,
                height: 42,
                padding: "0 12px",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiButton-startIcon": {
                  margin: 0,
                  marginRight: theme.spacing(0.5),
                },
                gap: 0.5,
                color:
                  theme.palette.mode === "dark"
                    ? "rgba(0, 0, 0, 0.87)"
                    : undefined,
              }}
            >
              Revogar permissão
            </Button>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const dadosFiltrados = admins.filter((admin) =>
    Object.values(admin).some((valor) =>
      String(valor).toLowerCase().includes(busca.toLowerCase()),
    ),
  );

  return (
    <AppLayout>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
        mt={0}
        mx={3.5}
        height={56}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="text.primary"
          display="flex"
          pb={0}
        >
          Administradores
        </Typography>

        <Button
          variant="contained"
          onClick={handleAbriModalNovoAdmin}
          startIcon={<Add />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            boxShadow: theme.shadows[2],
            mb: 1,
            mt: 1,
          }}
        >
          Novo Administrador
        </Button>
      </Box>

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
        <Box sx={{ mb: 3, mt: 1, mx: 3 }}>
          <TextField
            placeholder="Buscar administrador"
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
          rows={dadosFiltrados}
          columns={colunas}
          getRowId={(row) => row.idUsuario}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rowHeight={50}
          columnHeaderHeight={60}
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
        />
      </Box>

      {/* Modal de cadastro de Administrador */}
      <Modal
        open={showModalCadastro}
        onClose={() => setShowModalCadastro(false)}
      >
        <Box sx={modalStyle}>
          <Box
            component="form"
            onSubmit={handleSubmitCadastro}
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
              <Person color="primary" sx={{ mr: 1 }} />
              Novo Administrador
            </Typography>
            <IconButton
              onClick={() => setShowModalCadastro(false)}
              disabled={loadingAdmin}
            >
              <Close />
            </IconButton>
          </Box>

          <Autocomplete
            options={usuariosDisponiveis}
            getOptionLabel={(option) => {
              if (option.nome && option.cpf) {
                return `${option.nome} (${option.cpf})`;
              }
              return option.nome || "";
            }}
            isOptionEqualToValue={(option, value) => option.cpf === value.cpf}
            loading={loadingAdmin}
            onInputChange={(_, value) => {
              setNomeAdmin(value);
              buscarUsuario(value);
            }}
            onChange={(_, value) => handleSelecionarUsuario(value)}
            filterOptions={(x) => x}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Usuário"
                placeholder="Digite pelo menos 3 caracteres"
                fullWidth
                sx={{ mt: 2 }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAdmin ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {erroVinculo && (
            <Typography color="error" sx={{ mt: 1 }}>
              {erroVinculo}
            </Typography>
          )}

          {/* Botões */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
          >
            <Button
              onClick={() => setShowModalCadastro(false)}
              variant="outlined"
              disabled={loadingAdmin}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitCadastro}
              variant="contained"
              disabled={loadingAdmin}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de confirmar a ação de revogar permissão de admnistrador */}
      <Dialog
        open={showModalConfirmar}
        onClose={() => setShowModalConfirmar(false)}
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
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            Revogar permissão
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Você está prestes a revogar a permissão de Administrador de{" "}
            <strong>{SelectedUsuario?.nome}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setShowModalConfirmar(false)}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitRevogacao}
            variant="contained"
            color="error"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
