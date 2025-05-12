import { Button } from "@mui/material";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import * as React from 'react';
import { Link } from "react-router-dom";

import Menu from "../Menu";

// Define a interface para os dados dos motoristas
interface Motorista {
  id: number;
  nome: string;
  matricula: string;
  cnh: string;
  validadeCnh: string;
  status: string;
}

const motoristasFake: Motorista[] = [
  {
    id: 1,
    nome: 'João Silva',
    matricula: '123456',
    cnh: 'AB1234567',
    validadeCnh: '2026-05-12',
    status: 'Ativo',
  },
  {
    id: 2,
    nome: 'Maria Oliveira',
    matricula: '234567',
    cnh: 'CD2345678',
    validadeCnh: '2025-11-30',
    status: 'Ativo',
  },
  {
    id: 3,
    nome: 'Carlos Souza',
    matricula: '345678',
    cnh: 'EF3456789',
    validadeCnh: '2024-07-15',
    status: 'Inativo',
  },
  {
    id: 4,
    nome: 'Ana Lima',
    matricula: '456789',
    cnh: 'GH4567890',
    validadeCnh: '2027-03-20',
    status: 'Ativo',
  },
  {
    id: 5,
    nome: 'Pedro Martins',
    matricula: '567890',
    cnh: 'IJ5678901',
    validadeCnh: '2024-12-01',
    status: 'Ativo',
  },
];

// Define as colunas com tipo explícito
const columns: GridColDef[] = [
  { field: 'nome', headerName: 'Nome', flex: 2 },
  { field: 'matricula', headerName: 'Matrícula', flex: 1 },
  { field: 'cnh', headerName: 'CNH', flex: 1 },
  { field: 'validadeCnh', headerName: 'Validade CNH', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
];

export default function ListaMotoristas(): React.JSX.Element {
  const [busca, setBusca] = React.useState<string>('');
  const [dadosFiltrados, setDadosFiltrados] = React.useState<Motorista[]>(motoristasFake);

  React.useEffect(() => {
    const resultado = motoristasFake.filter((motorista) =>
      Object.values(motorista).some((valor) =>
        String(valor).toLowerCase().includes(busca.toLowerCase())
      )
    );
    setDadosFiltrados(resultado);
  }, [busca]);

  return (
    <>
      <Menu />
      <Box className="lista-container">
        <h1>
          Listagem de Motorista
        </h1>
        <Button color='inherit' component={Link} to="/CadastroMotorista">
          + Cadastrar Motorista
        </Button>
        <TextField
          label="Buscar"
          variant="outlined"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          autoHeight
        />
      </Box>
    </>
  );
}
