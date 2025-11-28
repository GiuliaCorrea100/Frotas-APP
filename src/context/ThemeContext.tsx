import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return (savedTheme as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: themeMode === 'dark' ? '#90caf9' : '#1976d2',
        light: themeMode === 'dark' ? '#e3f2fd' : '#42a5f5',
        dark: themeMode === 'dark' ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: themeMode === 'dark' ? '#ce93d8' : '#9c27b0',
      },
      background: {
        default: themeMode === 'dark' ? '#121212' : '#f5f7fa',
        paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: themeMode === 'dark' ? '#ffffff' : '#212121',
        secondary: themeMode === 'dark' ? '#b0b0b0' : '#666666',
      },
      grey: {
        100: themeMode === 'dark' ? '#f5f5f5' : '#f5f5f5',
        200: themeMode === 'dark' ? '#eeeeee' : '#eeeeee',
        300: themeMode === 'dark' ? '#e0e0e0' : '#e0e0e0',
        400: themeMode === 'dark' ? '#bdbdbd' : '#bdbdbd',
        500: themeMode === 'dark' ? '#9e9e9e' : '#9e9e9e',
        600: themeMode === 'dark' ? '#757575' : '#757575',
        700: themeMode === 'dark' ? '#616161' : '#616161',
        800: themeMode === 'dark' ? '#424242' : '#424242',
        900: themeMode === 'dark' ? '#212121' : '#212121',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 500,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            textTransform: 'none' as const,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: themeMode === 'dark' 
                ? '0 4px 12px rgba(144, 202, 249, 0.3)'
                : '0 4px 12px rgba(25, 118, 210, 0.3)',
            },
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: themeMode === 'dark'
              ? '0 2px 8px rgba(144, 202, 249, 0.2)'
              : '0 2px 8px rgba(25, 118, 210, 0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: themeMode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: themeMode === 'dark' ? '#1a1a1a' : '#1976d2',
            boxShadow: 'none',
            borderBottom: themeMode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: themeMode === 'dark' ? '#1a1a1a' : '#ffffff',
            borderRight: themeMode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover fieldset': {
                borderColor: themeMode === 'dark' ? '#90caf9' : '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: themeMode === 'dark' ? '#90caf9' : '#1976d2',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: themeMode === 'dark' ? '#333' : '#e0e0e0',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: themeMode === 'dark' 
                ? '1px solid #333' 
                : '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: themeMode === 'dark' 
                ? '#1e1e1e' 
                : '#f5f5f5',
              borderBottom: themeMode === 'dark' 
                ? '2px solid #333' 
                : '2px solid #e0e0e0',
              color: themeMode === 'dark' ? '#ffffff' : '#212121',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: themeMode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.08)' 
                  : 'rgba(25, 118, 210, 0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: themeMode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.16)' 
                  : 'rgba(25, 118, 210, 0.12)',
                '&:hover': {
                  backgroundColor: themeMode === 'dark' 
                    ? 'rgba(144, 202, 249, 0.24)' 
                    : 'rgba(25, 118, 210, 0.18)',
                }
              }
            },
            '& .MuiDataGrid-cell .MuiTypography-body2': {
              color: themeMode === 'dark' ? '#FFFFFF' : '#212121', 
              fontSize: '0.875rem', 
            },
            '& .MuiDataGrid-cell .MuiTypography-body1': {
              color: themeMode === 'dark' ? '#FFFFFF' : '#212121',
            },
            '& .MuiDataGrid-cell .MuiTypography-root': {
              color: themeMode === 'dark' ? '#FFFFFF' : '#212121',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: themeMode === 'dark' 
                ? '1px solid #333' 
                : '1px solid #e0e0e0',
              backgroundColor: themeMode === 'dark' 
                ? '#1e1e1e' 
                : '#f5f5f5',
            },
            '& .MuiTablePagination-selectLabel': {
              color: themeMode === 'dark' ? '#FFFFFF' : '#212121',
              fontSize: '0.875rem',
              margin: 0,
            },
            '& .MuiTablePagination-displayedRows': {
              color: themeMode === 'dark' ? '#FFFFFF' : '#212121',
              fontSize: '0.875rem',
              margin: 0,
            },
            '& .MuiTablePagination-root': {
              color: themeMode === 'dark' ? '#ffffff' : '#212121',
            },
            '& .MuiCheckbox-root': {
              color: themeMode === 'dark' ? '#90caf9' : '#1976d2',
            },
            '& .MuiDataGrid-menuIcon button': {
              color: themeMode === 'dark' ? '#ffffff' : '#212121',
            },
            '& .MuiDataGrid-toolbarContainer': {
              backgroundColor: themeMode === 'dark' 
                ? '#1e1e1e' 
                : '#f5f5f5',
              borderBottom: themeMode === 'dark' 
                ? '1px solid #333' 
                : '1px solid #e0e0e0',
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            '& .MuiTableHead-root': {
              '& .MuiTableRow-root': {
                backgroundColor: themeMode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                '& .MuiTableCell-head': {
                  color: themeMode === 'dark' ? '#ffffff' : '#212121',
                  fontWeight: 600,
                },
              },
            },
            '& .MuiTableBody-root': {
              '& .MuiTableRow-root': {
                '& .MuiTableCell-body': {
                  color: themeMode === 'dark' ? '#e0e0e0' : '#424242',
                  borderBottom: themeMode === 'dark' 
                    ? '1px solid #333' 
                    : '1px solid #e0e0e0',
                },
                '&:hover': {
                  backgroundColor: themeMode === 'dark' 
                    ? 'rgba(144, 202, 249, 0.08)' 
                    : 'rgba(25, 118, 210, 0.04)',
                },
              },
            },
          },
        },
      },
      MuiModal: {
        styleOverrides: {
          root: {
            '& .MuiBox-root': {
              backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
              color: themeMode === 'dark' ? '#ffffff' : '#212121',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};