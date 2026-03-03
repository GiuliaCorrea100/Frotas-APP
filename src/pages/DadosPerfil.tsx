import React from 'react';
import {
  Box, 
  Modal,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';

interface DadosPerfilProps {
  open: boolean;
  onClose: () => void;
}

const DadosPerfil: React.FC<DadosPerfilProps> = ({ open, onClose }) => {
  const { nome, email, cpf } = useAuth();
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="dados-perfil-title"
    >
      <Box sx={{
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        p: 3,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Seus Dados
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* CONTEÚDO */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ minWidth: 80, color: 'text.secondary', fontWeight: 500 }}>
              Nome:
            </Typography>
            <Typography sx={{ fontWeight: 'medium', ml: 1 }}>
              {nome}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ minWidth: 80, color: 'text.secondary', fontWeight: 500 }}>
              Email:
            </Typography>
            <Typography sx={{ fontWeight: 'medium', ml: 1 }}>
              {email}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ minWidth: 80, color: 'text.secondary', fontWeight: 500 }}>
              CPF:
            </Typography>
            <Typography sx={{ fontWeight: 'medium', ml: 1 }}>
              {cpf}
            </Typography>
          </Box>
        </Box>

        {/* FOOTER */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            onClick={onClose}
            variant="contained"
            sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}
          >
            Fechar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DadosPerfil; 
