import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { AdminUserService } from '../api/AdminUserService';
import Menu from './Menu';
import axiosConnect from '../services/axiosConnect';

interface AdminUserDto {
  idUsuario: number;
  idPessoaSingu: number;
  permissao: number;
  nome: string;
  email: string;
}

const ListaAdministradores: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [NomeAdmin, setNomeAdmin] = useState('');
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<any[]>([]);
  const [showModalCadastro, setShowModalCadastro] = useState(false);
  const [showModalConfirmar, setShowModalConfirmar ] = useState (false);
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
    { field: 'nome', headerName: 'Nome', flex: 1 },
    { field: 'email', headerName: 'E-mail', flex: 1 },
    {
      field: 'acoes',
      headerName: 'Controle de acesso',
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => handleAbrirModalConfirmar(params.row)}>
          Revogar
        </Button>
      ),
    },
  ];

  return (
    <>
      <Menu />
      <Box className="lista-administradores" sx={{ padding: 4 }}>
        <h1 style={{ marginTop: '32px', marginBottom: '16px' }}>
          Administradores
        </h1>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="outlined" onClick={handleAbriModalNovoAdmin}>
            + Novo Administrador
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
        />
      </Box>

      {/* Modal de Adicionar novo Administrador */}
      <Dialog open={showModalCadastro} onClose={() => setShowModalCadastro(false)}
        fullWidth maxWidth="md">
        <DialogTitle>Novo Administrador</DialogTitle>
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
                margin="dense"
                inputProps={{
                  ...params.inputProps,
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
            <Box sx={{ color: 'red', mt: 1 }}>{erroVinculo}</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModalCadastro(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (SelectedAdmin) {
                try {
                  //chamando a função de alterar permissão
                  await AdminUserService.confirmarCadastro(SelectedAdmin.idPessoa);
                  alert("Permissão alterada para 2 com sucesso!");

                  //atualizando a lista
                  const dadosAtualizados = await AdminUserService.buscarTodos();
                  setAdmins(dadosAtualizados);

                  //fechando o modal
                  setShowModalCadastro(false);
                  setSelectedAdmin(null);
                  
                } catch (error) {
                  alert("Erro ao alterar permissão. Tente novamente.");
                }
              } else {
                setErroVinculo("Selecione um usuário antes de confirmar.");
              }
            }}
            color="secondary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de confirmar a ação de revogar permissão de admnistrador */}
      <Dialog open={showModalConfirmar} onClose={() => setShowModalConfirmar(false)} fullWidth maxWidth="xs">
        <DialogTitle>Revogar permissão</DialogTitle>
        <DialogContent>
          <Typography>
            Você está prestes a revogar a permissão de Administrador de {SelectedUsuario?.nome}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModalConfirmar(false)} color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={async () => {
              if (SelectedUsuario) {
                try {
                  await AdminUserService.confirmarCadastro(SelectedUsuario.idPessoaSingu);
                  alert(`Permissão de ${SelectedUsuario.nome} revogada com sucesso!`);
                  
                  // Atualizar a lista
                  const dadosAtualizados = await AdminUserService.buscarTodos();
                  setAdmins(dadosAtualizados);
                  
                  setShowModalConfirmar(false);
                } catch (error) {
                  alert("Erro ao revogar permissão. Tente novamente.");
                  console.error(error);
                }
              }
            }} 
            color="error"
          >
            Confirmar 
          </Button>
        </DialogActions>
      </Dialog>


    </>
  );
};

export default ListaAdministradores;
