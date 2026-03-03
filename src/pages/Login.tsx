// Página de Login do Sistema Frotas
// src/pages/Login.tsx
import React, { useState } from 'react';
import { 
  useMediaQuery, 
  useTheme,
  TextField,
  Button,
  InputAdornment,
  Link,
  Box,
  Card,
  CardContent,
  Typography as MuiTypography,
  IconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Person as PersonIcon,
  Lock as LockIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  DirectionsCar as CarIcon,
  Contrast as ContrastIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axiosConnect from '../services/axios/axiosConnect';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface LoginFormValues {
  cpf: string;
  senha: string;
}

const Login: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { login } = useAuth();
  const { themeMode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<LoginFormValues>({
    cpf: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const systemVersion = import.meta.env.VITE_VERSAO_SISTEMA || '1.0.0';

  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    // Previne recarregamento se for um evento de formulário
    if (e) {
      e.preventDefault();
    }

      const cpfNumerico = formValues.cpf.replace(/\D/g, '');

      if (cpfNumerico.length !== 11) {
        setError('CPF deve ter 11 dígitos');
        return;
      }

      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA não carregado');
      }

      const recaptchaToken = await executeRecaptcha('login');

      try {
        setLoading(true);
        const response = await axiosConnect.post('/auth/login', {
        username: cpfNumerico,
        password: formValues.senha,
      }, {
        headers: {
          'recaptcha-token': recaptchaToken
        }
      });

        const { token, username, administrador, nome, email } = response.data;
        
        const { hasCorridaAtiva, corridaIdAtiva, administrador: isAdmin } = await login(token, username, administrador, nome, email);
        
        // Verifica qual será a página inicial do motorista baseado na existência ou não de corrida ativa
        if (hasCorridaAtiva && corridaIdAtiva) {
          navigate(`/PainelCorridaMotorista/${corridaIdAtiva}`);
        } else {
          navigate(isAdmin ? '/Corridas' : '/HistoricoIndividual');
        }

    } catch (error: any) { 
      let errorMessage = 'Credenciais inválidas';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Credenciais inválidas';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor';
      } else {
        errorMessage = 'Erro ao tentar fazer login';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      const formattedValue = formatCPF(value);
      if (formattedValue.length <= 14) {
        setFormValues(prev => ({
          ...prev,
          [name]: formattedValue
        }));
      }
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: `calc(100vh - 44px)`,
      backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f7fa',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        p: isMobile ? 2 : 3,
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <Card sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0px 8px 32px rgba(0, 0, 0, 0.4)'
            : '0px 8px 32px rgba(0, 0, 0, 0.1)',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: theme.palette.background.paper,
          overflow: 'visible',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {/* Botão de alternar tema discreto */}
          <Tooltip title={`Modo ${themeMode === 'dark' ? 'claro' : 'escuro'}`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                },
                transition: 'all 0.2s ease',
                width: 32,
                height: 32
              }}
            >
              <ContrastIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <CardContent sx={{
            p: isMobile ? 3 : 4,
            '&:last-child': { pb: isMobile ? 3 : 4 },
            boxSizing: 'border-box'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 1,
            }}>
              {/* Logo */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 2,
              }}>
                <Box sx={{
                  position: 'relative',
                  mb: 3,
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    background: '#FFEB3B',
                    transform: 'rotate(45deg)',
                    borderRadius: '8px',
                    border: `3px solid #333`,
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                  }}>
                    <Box sx={{
                      transform: 'rotate(-45deg)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.3,
                    }}>
                      <CarIcon 
                        sx={{ 
                          fontSize: 32,
                          color: '#333',
                        }} 
                      />
                    </Box>
                  </Box>
                </Box>

                <MuiTypography 
                  variant="h5" 
                  component="h1"
                  align="center"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? '#FFF' : '#333',
                    letterSpacing: '-0.02em',
                    mb: 0,
                  }}
                >
                  SISTEMA FROTAS
                </MuiTypography>
              </Box>

              <MuiTypography
                variant="body2"
                align="center"
                sx={{
                  color: theme.palette.text.secondary,
                  fontStyle: 'italic',
                  mb: 1
                }}
              >
                Utilize o seu CPF e senha institucional
              </MuiTypography>
            </Box>

            <form onSubmit={handleSubmit}>
              {error && (
                <Box sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.08)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.3)' : 'rgba(211, 47, 47, 0.2)'}`,
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MuiTypography 
                    variant="body2"
                    sx={{
                      color: theme.palette.error.main,
                      fontWeight: 500
                    }}
                  >
                    {error}
                  </MuiTypography>
                </Box>
              )}

              <TextField
                label="CPF"
                name="cpf"
                placeholder="000.000.000-00"
                value={formValues.cpf}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color={error ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }
                }}
              />

              <TextField
                label="Senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={formValues.senha}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={error ? "error" : "action"} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }
                }}
              />

              <Box sx={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 3,
              }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => window.open('https://sistemas.unir.br/recoverPassword/', '_blank')}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    },
                  }}
                >
                  Esqueceu a senha?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={loading || formValues.cpf.replace(/\D/g, '').length !== 11 || !formValues.senha}
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: 0.5,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Acessar Sistema'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!isMobile && (
          <Box sx={{ textAlign: 'center', pt: 3 }}>
            <MuiTypography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              opacity: 0.8
            }}>
              © {new Date().getFullYear()} Universidade Federal de Rondônia
            </MuiTypography>
            <MuiTypography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                display: 'block',
                mt: 0.5,
                opacity: 0.6
              }}
            >
              Versão {systemVersion}
            </MuiTypography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;