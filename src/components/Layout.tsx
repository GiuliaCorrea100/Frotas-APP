// src/components/AppLayout.tsx
import { Box } from "@mui/material";
import React from "react";
import Menu from "./Menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <Menu />

      {/* Conteúdo principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          // mt: 2,
        }}
      >
        <Box
          sx={{
            pt: 3,
            pb: 0,
            px: 3,
            width: "100%",
            // maxWidth: "1920px",
            margin: "0 auto",
            flex: 1,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
