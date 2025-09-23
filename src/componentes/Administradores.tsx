import { Add, Cancel } from '@mui/icons-material';
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
} from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { AdminUserService } from '../api/AdminUserService';
import Menu from './Menu';
import axiosConnect from '../services/axiosConnect';
import React from 'react';

interface AdminUserDto {
  idUsuario: number;
  idPessoaSingu: number;
  permissao: number;
  nome: string;
  email: string;
}

export default function ListaAdministradores() {
  const theme = useTheme();
  const [admins, setAdmins] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [NomeAdmin, setNomeAdmin] = useState('');
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
        console.error('Erro ao carregar administradores:', e);
        setErro('Erro ao carregar administradores.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const handleAbriModalNovoAdmin = () => {
    setNomeAdmin('');
    setSelectedAdmin(null);
    setErroVinculo(null);
    setShowModalCadastro(true);
  };

  const handleAbrirModalConfirmar = (usuario: AdminUserDto) => {
    setSelectedUsuario(usuario);
    setShowModalConfirmar(true);
  }

  const buscarUsuario = async (nome: string) => {
    if (nome.length < 3) {
      setUsuariosDisponiveis([]);
      return;
    }

    try {
      setLoadingAdmin(true);
      const response = await axiosConnect.get(`usersingu/buscar-nome/${nome}`);
      setUsuariosDisponiveis(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
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

  const colunas: GridColDef[] = [
    { 
      field: 'nome', 
      headerName: 'Nome', 
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    { field: 'email', headerName: 'E-mail', flex: 1 },
    {
      field: 'acoes',
      headerName: 'Controle de acesso',
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box 
          display="flex" 
          justifyContent="center" 
          width="100%"
        >
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleAbrirModalConfirmar(params.row)}
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Revogar
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Menu />
      <Box sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="textPrimary">
            Administradores
          </Typography>
          
          <Button 
            variant="contained"
            onClick={handleAbriModalNovoAdmin}
            startIcon={<Add />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[2]
            }}
          >
            Novo Administrador
          </Button>
        </Box>

        <DataGrid
          rows={admins}
          columns={colunas}
          getRowId={(row) => row.idUsuario}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 20, 30, 50, 100]}
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 1.5,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.grey[100],
              fontWeight: 'bold',
              borderRadius: 1,
              borderBottom: `2px solid ${theme.palette.divider}`
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                }
              }
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            boxShadow: theme.shadows[1],
            borderRadius: 2,
            border: 'none',
            backgroundColor: theme.palette.background.paper
          }}
          rowSelection={false}
        />
      </Box>

      {/* Modal de Adicionar novo Administrador */}
      <Dialog 
        open={showModalCadastro} 
        onClose={() => setShowModalCadastro(false)}
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Novo Administrador</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={usuariosDisponiveis}
            getOptionLabel={(option) => option.nome || ''}
            isOptionEqualToValue={(option, value) => option.idPessoa === value.idPessoa}
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
                margin="normal"
                variant="outlined"
                sx={{ mt: 2 }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAdmin ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          {erroVinculo && (
            <Typography color="error" sx={{ mt: 1 }}>{erroVinculo}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setShowModalCadastro(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (SelectedAdmin) {
                try {
                  await AdminUserService.confirmarCadastro(SelectedAdmin.idPessoa);
                  const dadosAtualizados = await AdminUserService.buscarTodos();
                  setAdmins(dadosAtualizados);
                  setShowModalCadastro(false);
                  setSelectedAdmin(null);
                } catch (error) {
                  setErroVinculo("Erro ao alterar permissão. Tente novamente.");
                }
              } else {
                setErroVinculo("Selecione um usuário antes de confirmar.");
              }
            }}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de confirmar a ação de revogar permissão de admnistrador */}
      <Dialog 
        open={showModalConfirmar} 
        onClose={() => setShowModalConfirmar(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Revogar permissão</DialogTitle>
        <DialogContent>
          <Typography>
            Você está prestes a revogar a permissão de Administrador de <strong>{SelectedUsuario?.nome}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setShowModalConfirmar(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={async () => {
              if (SelectedUsuario) {
                try {
                  await AdminUserService.confirmarCadastro(SelectedUsuario.idPessoaSingu);
                  const dadosAtualizados = await AdminUserService.buscarTodos();
                  setAdmins(dadosAtualizados);
                  setShowModalConfirmar(false);
                } catch (error) {
                  console.error(error);
                }
              }
            }}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};