// src/components/AppLayout.tsx
import { Box } from '@mui/material';
import React from 'react';
import Menu from './Menu';

// Definindo a tipagem para o componente AppLayout
interface AppLayoutProps {
  children: React.ReactNode; // O tipo 'ReactNode' é utilizado para tipos de elementos filhos em React
}

// Componente funcional tipado com React.FC e com a interface AppLayoutProps
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Menu Fixo no Topo */}
      <Menu />

      {/* Conteúdo principal */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: 'calc(100vh - 64px)', // Ajusta a altura considerando a altura do menu (64px)
          mt: 8, // Define a margem superior
          width: '100%',
        }}
      >
        <Box sx={{ p: 3, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {children} {/* Exibe o conteúdo filho */}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
