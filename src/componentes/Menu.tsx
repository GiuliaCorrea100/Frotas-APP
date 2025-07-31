import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MenuGrid from "./MenuGrid";
import axiosConnect from "../services/axiosConnect";
import { jwtDecode } from 'jwt-decode';

// --- DEFINIÇÃO DOS TIPOS VINDOS DA API ---

interface JwtPayload {
  sub: number; 
  login: string;
  permissao: number;
  iat: number;
  exp: number;
}

// ✅ INTERFACE ATUALIZADA para compatibilidade com as novas colunas
interface Corrida {
  idCorrida: number;
  dataInicio: string; 
  itinerario: string;
  placaVeiculo?: string;
  // Campos adicionados para corresponder à tela de listagem
  nomeMotorista?: string;
  dataTermino?: string | null;
}

interface MotoristaDashboard {
  corridaDeHoje: Corrida | null;
  proximasCorridas: Corrida[];
}

const Menu: React.FC = () => {
  const { isAuthenticated, cpf, logout, permissao, nome, email } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [showModalDadosPerfil, setShowModalDadosPerfil] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<MotoristaDashboard | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleAbrirModalDadosPerfil = () => setShowModalDadosPerfil(true);
  const handleFecharModalDadosPerfil = () => setShowModalDadosPerfil(false);

  useEffect(() => {
    const carregarDadosDoDashboard = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const idUsuario = decodedToken?.sub;

        if (idUsuario) {
          const response = await axiosConnect.get<MotoristaDashboard>(`/corrida/motorista-dashboard/${idUsuario}`);
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosDoDashboard();
  }, [isAuthenticated]);

  // ✅ FUNÇÃO DE FORMATAÇÃO DE DATA ADICIONADA (a mesma de ListaCorridas.tsx)
  const formatDate = (dateString: string | null | undefined) => {
    // Se a data for nula ou indefinida (como em dataTermino de corridas agendadas), mostra 'Em andamento'
    if (!dateString) return 'Em andamento'; 
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  // ✅ COLUNAS ATUALIZADAS PARA CORRESPONDER À TELA DE LISTAGEM
  const columns: GridColDef<Corrida>[] = [
    { 
      field: 'nomeMotorista',
      headerName: 'Motorista', 
      flex: 1,
      // Como o nome do motorista é o do próprio usuário logado, usamos o valor do contexto de autenticação
      renderCell: (params: GridRenderCellParams) => (
        <Link to={`/corrida/${params.row.idCorrida}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {nome} 
        </Link>
      )
    },
    { 
      field: 'placaVeiculo',
      headerName: 'Veículo', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Link to={`/corrida/${params.row.idCorrida}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {params.value || 'Não especificado'}
        </Link>
      )
    },
    { 
      field: 'dataInicio', 
      headerName: 'Data/Hora Início', // Cabeçalho padronizado
      flex: 1,
      renderCell: (params) => formatDate(params.value as string)
    },
    { 
      field: 'dataTermino', 
      headerName: 'Data/Hora Término', // Cabeçalho padronizado
      flex: 1,
      // A função formatDate já trata o caso de dataTermino ser nulo para corridas agendadas
      renderCell: (params) => formatDate(params.value as string | null)
    },
  ];

  const renderContent = () => {
    if (loading) {
      return <CircularProgress />;
    }

    if (!isAuthenticated || !dashboardData) {
      return null;
    }

    if (dashboardData.corridaDeHoje) {
      return <MenuGrid />;
    }
    
    if (dashboardData.proximasCorridas.length > 0) {
      return (
        <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', maxWidth: '900px', mt: 2 }}>
          <Typography variant="h5" gutterBottom align="center">
            Suas Próximas Corridas Agendadas
          </Typography>
          <Paper sx={{ height: 450, width: '100%', mt: 2 }}>
            <DataGrid
              rows={dashboardData.proximasCorridas}
              columns={columns}
              getRowId={(row) => row.idCorrida}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              localeText={{ noRowsLabel: "Nenhuma corrida futura agendada." }}
              sx={{
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal !important',
                  wordWrap: 'break-word !important',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            />
          </Paper>
        </Box>
      );
    }
    
    return (
      <Typography variant="h6" sx={{ mt: 4 }}>
        Nenhuma corrida agendada.
      </Typography>
    );
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ 
            flexGrow: 1, 
            textDecoration: "none", 
            color: "inherit",
            fontFamily: "inherit" // Mantém a fonte padrão
          }}
          component={Link}
          to={isAuthenticated ? "/menu" : "/"}
        >
          FROTAS UNIR
        </Typography>

        {isAuthenticated && (
          <>
            {/* Botões visíveis apenas para administradores */}
            {Number(permissao) === 2 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/ListaCorrida"
                  sx={{ fontFamily: "inherit" }}
                >
                  Painel Corrida
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/ListaCarros"
                  sx={{ fontFamily: "inherit" }}
                >
                  Veículos
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/ListaMultas"
                  sx={{ fontFamily: "inherit" }}
                >
                  Multas
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/Administradores"
                  sx={{ fontFamily: "inherit" }}
                >
                  Administradores
                </Button>
              </Box>
            )}

            {/* Botão para histórico de corridas do motorista logado */}
            <Button 
                  color="inherit" 
                  component={Link} 
                  to="/HistoricoIndividual"
                  sx={{ fontFamily: "inherit" }}
                >
                  Relatórios
            </Button>

            {/* Botão do perfil do usuário */}
            {nome && (
              <>
                <Button 
                  color="inherit" 
                  onClick={handleAbrirModalDadosPerfil}
                  sx={{ fontFamily: "inherit" }}
                >
                  {nome}
                </Button>

                {/* Modal de Dados do Perfil */}
                <Dialog
                  open={showModalDadosPerfil}
                  onClose={handleFecharModalDadosPerfil}
                  fullWidth
                  maxWidth="sm"
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      p: 2
                    }
                  }}
                >
                  <DialogTitle sx={{ fontSize: '1.25rem', p: 2 }}>Seus Dados</DialogTitle>
                  <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ minWidth: 80 }}>Nome:</Typography>
                        <Typography fontWeight="medium">{nome}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ minWidth: 80 }}>Email:</Typography>
                        <Typography fontWeight="medium">{email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ minWidth: 80 }}>CPF:</Typography>
                        <Typography fontWeight="medium">{cpf}</Typography>
                      </Box>
                      
                    </Box>
                  </DialogContent>
                  <DialogActions sx={{ p: 2 }}>
                    <Button
                      onClick={handleFecharModalDadosPerfil}
                      variant="contained"
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        px: 3
                      }}
                    >
                      Fechar
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}

            {/* Botão Sair */}
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ fontFamily: "inherit" }}
            >
              Sair
            </Button>
          </>
        )}

        {!isAuthenticated && (
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            sx={{ fontFamily: "inherit" }}
          >
            FROTAS UNIR
          </Typography>
          {isAuthenticated && (
            <>
              {Number(permissao) === 2 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button color="inherit" component={Link} to="/ListaCorrida" sx={{ fontFamily: "inherit" }}>
                    Painel Corrida
                  </Button>
                  <Button color="inherit" component={Link} to="/ListaCarros" sx={{ fontFamily: "inherit" }}>
                    Lista de Carros
                  </Button>
                  <Button color="inherit" component={Link} to="/ListaMotoristas" sx={{ fontFamily: "inherit" }}>
                    Lista de Motoristas
                  </Button>
                  <Button color="inherit" component={Link} to="/ListaMultas" sx={{ fontFamily: "inherit" }}>
                    Lista de Multas
                  </Button>
                  <Button color="inherit" component={Link} to="/Administradores" sx={{ fontFamily: "inherit" }}>
                    Administradores
                  </Button>
                </Box>
              )}
              <Button color="inherit" component={Link} to="/HistoricoIndividual" sx={{ fontFamily: "inherit" }}>
                Histórico de Corridas
              </Button>
              {nome && (
                <>
                  <Button color="inherit" onClick={handleAbrirModalDadosPerfil} sx={{ fontFamily: "inherit" }}>{nome}</Button>
                  <Dialog open={showModalDadosPerfil} onClose={handleFecharModalDadosPerfil} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, p: 2 } }}>
                    <DialogTitle sx={{ fontSize: '1.25rem', p: 2 }}>Seus Dados</DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>Nome:</Typography><Typography fontWeight="medium">{nome}</Typography></Box>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>Email:</Typography><Typography fontWeight="medium">{email}</Typography></Box>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>CPF:</Typography><Typography fontWeight="medium">{cpf}</Typography></Box>
                        <Box sx={{ display: 'flex' }}><Typography sx={{ minWidth: 80 }}>Permissão:</Typography><Typography fontWeight="medium">{permissao === "1" ? "Motorista" : "Administrador"}</Typography></Box>
                      </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                      <Button onClick={handleFecharModalDadosPerfil} variant="contained" sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}>Fechar</Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
              <Button color="inherit" onClick={handleLogout} sx={{ fontFamily: "inherit" }}>Sair</Button>
            </>
          )}
          {!isAuthenticated && (
            <Button color="inherit" component={Link} to="/" sx={{ fontFamily: "inherit" }}>Login</Button>
          )}
        </Toolbar>
      </AppBar>

      {location.pathname === '/menu' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', mt: 4, p: 2 }}>
          {renderContent()}
        </Box>
      )}
    </>
  );
};

export default Menu;