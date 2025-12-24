import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Download,
  Receipt,
  Warning,
  CheckCircle,
  AttachFile,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { MultaService, MultaDto } from "../services/MultaService";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface JwtPayload {
  sub: number; 
  login: string;
  administrador: boolean;
  iat: number;
  exp: number;
}

const Boletos: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [multas, setMultas] = useState<MultaDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    carregarMultasDoMotorista();
  }, [isAuthenticated, navigate]);

  const carregarMultasDoMotorista = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token não encontrado");
      }

      const decodedToken = jwtDecode<JwtPayload>(token);
      const idUsuario = decodedToken?.sub;

      if (!idUsuario) {
        throw new Error("ID do usuário não encontrado no token");
      }

      // Primeiro, busque todas as multas
      const todasMultas = await MultaService.listarMultas();
      
      // Filtre apenas as multas onde idMotorista corresponde ao usuário logado
      const multasDoMotorista = todasMultas.filter(multa => 
        multa.idMotorista === idUsuario && multa.ativa !== false
      );
      
      setMultas(multasDoMotorista);
    } catch (error) {
      console.error("Erro ao carregar multas:", error);
      setError("Erro ao carregar suas multas. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBoleto = async (multa: MultaDto) => {
    if (!multa.urlArquivo) {
      setError("Nenhum boleto disponível para esta multa");
      return;
    }

    try {
      // Extrair nome do arquivo da URL
      const fileName = multa.urlArquivo.split('/').pop() || 'boleto.pdf';
      
      // Baixar o arquivo
      const blob = await MultaService.downloadArquivo(fileName);
      
      // Criar URL para o blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar link e simular clique para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `boleto_${multa.placaVeiculo}_${multa.dataInfracao ? new Date(multa.dataInfracao).toISOString().split('T')[0] : 'semdata'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar memória
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar boleto:", error);
      setError("Erro ao baixar o boleto. Tente novamente.");
    }
  };

  const formatarData = (data: Date | string | null) => {
    if (!data) return "Não informada";
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao.toUpperCase()) {
      case 'LEVE':
        return 'success';
      case 'MEDIA':
        return 'warning';
      case 'GRAVE':
        return 'error';
      case 'GRAVISSIMA':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Receipt sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          Meus Boletos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize e baixe os boletos das multas associadas ao seu cadastro
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {multas.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Warning sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" gutterBottom color="text.secondary">
            Nenhuma multa encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Você não possui multas cadastradas em seu nome.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              Total de multas: <strong>{multas.length}</strong>
            </Typography>
            <Button
              variant="outlined"
              onClick={carregarMultasDoMotorista}
            >
              Atualizar lista
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell><strong>Placa do Veículo</strong></TableCell>
                  <TableCell><strong>Data da Infração</strong></TableCell>
                  <TableCell><strong>Classificação</strong></TableCell>
                  <TableCell><strong>Valor (R$)</strong></TableCell>
                  <TableCell><strong>Auto da Infração</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {multas.map((multa) => (
                  <TableRow key={multa.idMulta} hover>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {multa.placaVeiculo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatarData(multa.dataInfracao)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={multa.classificacao}
                        color={getClassificacaoColor(multa.classificacao) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color={theme.palette.error.main}>
                        {formatarValor(multa.valorInfracao)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {multa.autoInfracao}
                    </TableCell>
                    <TableCell>
                      {multa.ativa === false ? (
                        <Chip label="Cancelada" color="default" size="small" />
                      ) : multa.urlArquivo ? (
                        <Chip 
                          label="Boleto Disponível" 
                          color="success" 
                          size="small"
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip label="Sem Boleto" color="default" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {multa.urlArquivo ? (
                        <Tooltip title="Baixar Boleto">
                          <IconButton
                            color="primary"
                            onClick={() => handleDownloadBoleto(multa)}
                            sx={{
                              '&:hover': {
                                backgroundColor: theme.palette.primary.light,
                              }
                            }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Nenhum boleto disponível">
                          <span>
                            <IconButton disabled>
                              <AttachFile color="disabled" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Observações:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Em caso de dúvidas sobre uma multa, entre em contato com a administração.
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Boletos;